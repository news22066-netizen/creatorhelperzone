-- ============================================================
-- BFEED — 0004 creator/business accounts, public profile, links
-- Run in the Supabase SQL Editor AFTER 0003_tools_seo.sql. Safe to re-run.
--
-- Adds:
--  1. profiles.username / bio / whatsapp (+ validation + unique index)
--  2. Reserved-username list (mirror of lib/utils/username.ts)
--  3. Signup trigger now reads username from signup metadata
--  4. Privileged-column guard updated (role choosable only BEFORE a username
--     is claimed, username permanent afterwards, never 'admin')
--  5. check_username() RPC for live availability checks
--  6. public_profiles VIEW (safe public columns only — no email/blocked flag)
--  7. profile_links table with RLS
--
-- Why a view and not a public SELECT policy on profiles: RLS works per row, not
-- per column, so such a policy would expose every user's email and flags to
-- anyone holding the public anon key. The view exposes only public fields.
-- ============================================================

-- ---------- 1. Reserved usernames ----------
-- Keep in sync with RESERVED_USERNAMES in lib/utils/username.ts.
create or replace function public.is_reserved_username(p_username text)
returns boolean
language sql
immutable
as $$
  select lower(coalesce(p_username, '')) = any (array[
    'admin','login','signup','register','logout','dashboard','api','tools','guides','guide',
    'trending','faq','faqs','store','collaboration','notifications','c','b','app','www',
    'static','_next','menu','settings','auth','profile','support','help','about','contact',
    'privacy','terms','blog','news','search','explore','reels','video','home','index',
    'root','null','undefined','test','robots','sitemap','favicon'
  ]);
$$;

-- ---------- 2. Profile columns + constraints ----------
alter table public.profiles
  add column if not exists username text,
  add column if not exists bio      text,
  add column if not exists whatsapp text;

alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles
  add constraint profiles_username_format
  check (
    username is null
    or (username ~ '^[a-z0-9_]{3,30}$' and not public.is_reserved_username(username))
  );

create unique index if not exists profiles_username_key on public.profiles (username);

alter table public.profiles drop constraint if exists profiles_bio_length;
alter table public.profiles
  add constraint profiles_bio_length check (bio is null or char_length(bio) <= 280);

-- Digits only, international format without "+" (works directly in wa.me links).
alter table public.profiles drop constraint if exists profiles_whatsapp_format;
alter table public.profiles
  add constraint profiles_whatsapp_format
  check (whatsapp is null or whatsapp ~ '^[0-9]{8,15}$');

-- NOT VALID: applies to new writes only, so old rows can never block this migration.
alter table public.profiles drop constraint if exists profiles_avatar_url_http;
alter table public.profiles
  add constraint profiles_avatar_url_http
  check (avatar_url is null or (avatar_url ~* '^https?://' and char_length(avatar_url) <= 500))
  not valid;

-- ---------- 3. Signup trigger: read role + username from signup metadata ----------
-- Role: only 'creator' or 'business' is ever accepted from the client (never 'admin').
-- Username: validated here too, so a hand-crafted API call cannot bypass the form.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text := new.raw_user_meta_data->>'role';
  requested_username text := lower(btrim(coalesce(new.raw_user_meta_data->>'username', '')));
  final_username text := null;
begin
  if requested_username <> '' then
    if requested_username !~ '^[a-z0-9_]{3,30}$' then
      raise exception 'invalid_username' using errcode = '22023';
    end if;
    if public.is_reserved_username(requested_username) then
      raise exception 'reserved_username' using errcode = '22023';
    end if;
    if exists (select 1 from public.profiles where username = requested_username) then
      raise exception 'username_taken' using errcode = '23505';
    end if;
    final_username := requested_username;
  end if;

  insert into public.profiles (id, email, full_name, role, username)
  values (
    new.id,
    new.email,
    nullif(left(btrim(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')), 60), ''),
    case
      when requested_role in ('creator', 'business') then requested_role::public.user_role
      else 'creator'::public.user_role
    end,
    final_username
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ---------- 4. Guard privileged columns (replaces the 0002 version) ----------
create or replace function public.protect_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  other_admins integer;
begin
  -- Trusted contexts: SQL editor, migrations, service role (no JWT user).
  if auth.uid() is null then
    new.updated_at := now();
    return new;
  end if;

  if new.id is distinct from old.id then
    raise exception 'profiles.id cannot be changed' using errcode = '42501';
  end if;

  if not public.is_admin() then
    -- Regular users: status flags and email are read-only.
    if new.is_blocked  is distinct from old.is_blocked
       or new.is_verified is distinct from old.is_verified
       or new.email       is distinct from old.email then
      raise exception 'Not allowed to change status, verification or email'
        using errcode = '42501';
    end if;

    -- Role: a user may pick creator/business only until a username is claimed
    -- (Google sign-ups choose it during onboarding). 'admin' is never reachable.
    if new.role is distinct from old.role then
      if not (
        old.username is null
        and old.role in ('creator', 'business')
        and new.role in ('creator', 'business')
      ) then
        raise exception 'Not allowed to change role' using errcode = '42501';
      end if;
    end if;

    -- Username is permanent once set (links and shared URLs depend on it).
    if old.username is not null and new.username is distinct from old.username then
      raise exception 'Username cannot be changed' using errcode = '42501';
    end if;
  else
    -- Admins: cannot lock themselves out.
    if auth.uid() = old.id then
      if new.role <> 'admin' then
        raise exception 'Admins cannot demote themselves' using errcode = '42501';
      end if;
      if new.is_blocked and not old.is_blocked then
        raise exception 'Admins cannot block themselves' using errcode = '42501';
      end if;
    end if;

    -- Never leave the platform without an active admin.
    if old.role = 'admin' and (new.role <> 'admin' or new.is_blocked) then
      select count(*) into other_admins
      from public.profiles
      where role = 'admin' and is_blocked = false and id <> old.id;
      if other_admins = 0 then
        raise exception 'Cannot remove the last active admin' using errcode = '42501';
      end if;
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists protect_profile_columns on public.profiles;
create trigger protect_profile_columns
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_columns();

-- ---------- 5. Live username check (used by the signup form) ----------
-- Returns: 'available' | 'taken' | 'reserved' | 'invalid'
create or replace function public.check_username(p_username text)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  u text := lower(btrim(coalesce(p_username, '')));
begin
  if u !~ '^[a-z0-9_]{3,30}$' then return 'invalid'; end if;
  if public.is_reserved_username(u) then return 'reserved'; end if;
  if exists (select 1 from public.profiles where username = u) then return 'taken'; end if;
  return 'available';
end;
$$;

revoke all on function public.check_username(text) from public;
grant execute on function public.check_username(text) to anon, authenticated;

-- ---------- 6. Public profile view (safe columns only) ----------
-- Runs with the view owner's rights on purpose (bypasses profiles RLS) but only
-- exposes public fields, only for non-blocked creator/business accounts that
-- have claimed a username.
drop view if exists public.public_profiles;
create view public.public_profiles as
  select id, username, full_name, bio, avatar_url, whatsapp, role
  from public.profiles
  where username is not null
    and is_blocked = false
    and role in ('creator', 'business');

revoke all on public.public_profiles from public, anon, authenticated;
grant select on public.public_profiles to anon, authenticated;

-- ---------- 7. Links ----------
create table if not exists public.profile_links (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  title      text not null check (char_length(btrim(title)) between 1 and 80),
  url        text not null check (char_length(url) <= 2000 and url ~* '^https?://'),
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists profile_links_user_idx
  on public.profile_links (user_id, sort_order);

-- Helpers are SECURITY DEFINER so RLS on profiles does not hide the answer.
create or replace function public.is_public_profile(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = p_user
      and username is not null
      and is_blocked = false
      and role in ('creator', 'business')
  );
$$;

create or replace function public.is_active_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and is_blocked = false
      and role in ('creator', 'business')
  );
$$;

alter table public.profile_links enable row level security;

drop policy if exists "links_public_read" on public.profile_links;
create policy "links_public_read" on public.profile_links
  for select using (is_active = true and public.is_public_profile(user_id));

drop policy if exists "links_owner_all" on public.profile_links;
create policy "links_owner_all" on public.profile_links
  for all
  using (user_id = auth.uid() and public.is_active_member())
  with check (user_id = auth.uid() and public.is_active_member());

drop policy if exists "links_admin_all" on public.profile_links;
create policy "links_admin_all" on public.profile_links
  for all using (public.is_admin()) with check (public.is_admin());

-- Cap links per profile (keeps pages sane and prevents abuse).
create or replace function public.limit_profile_links()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.profile_links where user_id = new.user_id) >= 20 then
    raise exception 'Link limit reached (20)' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists limit_profile_links on public.profile_links;
create trigger limit_profile_links
  before insert on public.profile_links
  for each row execute function public.limit_profile_links();

grant select on public.profile_links to anon;
grant select, insert, update, delete on public.profile_links to authenticated;
