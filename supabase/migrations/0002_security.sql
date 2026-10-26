-- ============================================================
-- BFEED — 0002 security hardening
-- Run in the Supabase SQL Editor AFTER 0001_init.sql. Safe to re-run.
--
-- Fixes:
--  1. Anyone could sign up with metadata {"role":"admin"} and become admin.
--  2. Any signed-in user could UPDATE their own role / is_blocked / is_verified.
--  3. Blocked admins still passed is_admin(); blocked users could still edit.
--  4. Admins could demote/block themselves or remove the last admin.
--
-- NOTE: statements run from the SQL Editor / service role have auth.uid() = null.
-- Those are trusted (that is how you promote the first admin) and bypass the guard.
-- ============================================================

-- ---------- 1. Signup trigger: never accept 'admin' from client metadata ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested text := new.raw_user_meta_data->>'role';
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    case
      when requested in ('creator', 'business') then requested::public.user_role
      else 'creator'::public.user_role
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ---------- 2. is_admin(): blocked admins are not admins ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and is_blocked = false
  );
$$;

-- ---------- 3. Own-profile update policy: blocked users cannot edit ----------
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update
  using (auth.uid() = id and is_blocked = false)
  with check (auth.uid() = id);

-- ---------- 4. Guard privileged columns ----------
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

  -- Immutable for everyone coming through the API.
  if new.id is distinct from old.id then
    raise exception 'profiles.id cannot be changed' using errcode = '42501';
  end if;

  if not public.is_admin() then
    -- Regular users: privileged columns are read-only.
    if new.role        is distinct from old.role
       or new.is_blocked  is distinct from old.is_blocked
       or new.is_verified is distinct from old.is_verified
       or new.email       is distinct from old.email then
      raise exception 'Not allowed to change role, status, verification or email'
        using errcode = '42501';
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

-- ---------- 5. Audit: who is an admin right now? ----------
-- Review this result. If you see an account you do not recognise, demote it:
--   update public.profiles set role = 'creator' where email = 'suspicious@example.com';
select id, email, created_at
from public.profiles
where role = 'admin'
order by created_at;
