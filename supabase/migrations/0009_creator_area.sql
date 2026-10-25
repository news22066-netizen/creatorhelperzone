-- ============================================================
-- CreatorHub BD — 0009 creator area (works, pricing, videos, appearance, contact)
-- Run in the Supabase SQL Editor AFTER 0008_store_slugs_sections_contact.sql. Safe to re-run.
--
--   creator_settings      1:1 with profiles — appearance preset, About text, contact + social links
--   creator_works         portfolio items (title, description, optional YouTube / link)
--   creator_work_images   image URLs per work (imgbb / https only, no file uploads)
--   creator_plans         pricing plans the creator defines (CTA = WhatsApp, never a checkout)
--   creator_videos        "Latest YouTube videos" list on the creator Home
--
-- STRICT ROLE SEPARATION in RLS: the 0004/0006 helpers (is_active_member / is_public_profile) accept
-- creators AND businesses. The creator tables use two NEW helpers that require role = 'creator', so a
-- business account cannot read-write creator data through the API even with a hand-made request.
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- 0. Role-specific helpers ----------
create or replace function public.is_active_creator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_blocked = false and role = 'creator'
  );
$$;

create or replace function public.is_public_creator(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = p_user and username is not null and is_blocked = false and role = 'creator'
  );
$$;

-- profile_links (the custom link buttons) belong to creators only: tighten the 0004 owner policy.
drop policy if exists "links_owner_all" on public.profile_links;
create policy "links_owner_all" on public.profile_links
  for all
  using (user_id = auth.uid() and public.is_active_creator())
  with check (user_id = auth.uid() and public.is_active_creator());

drop policy if exists "links_public_read" on public.profile_links;
create policy "links_public_read" on public.profile_links
  for select using (is_active = true and public.is_public_creator(user_id));

-- ---------- 1. creator_settings (1:1) ----------
create table if not exists public.creator_settings (
  profile_id       uuid primary key references public.profiles(id) on delete cascade,
  -- Preset id from lib/creator/appearance.ts: "solid-<name>" (20 colours) or "grad-<name>" (5 gradients).
  -- Only an id is stored, never raw CSS, so nothing can be injected into the public page's styles.
  appearance       text not null default 'solid-white' check (appearance ~ '^(solid|grad)-[a-z0-9-]{2,30}$'),
  about            text not null default '' check (char_length(about) <= 1500),
  contact_email    text,
  contact_phone    text,
  social_instagram text,
  social_facebook  text,
  social_tiktok    text,
  social_youtube   text,
  social_x         text,
  social_linkedin  text,
  social_telegram  text,
  social_website   text,
  updated_at       timestamptz not null default now(),
  constraint creator_contact_formats check (
    (contact_phone is null or contact_phone ~ '^\+?[0-9]{6,15}$')
    and (contact_email is null or (char_length(contact_email) <= 120 and contact_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'))
    and (social_instagram is null or (char_length(social_instagram) <= 300 and social_instagram ~* '^https://'))
    and (social_facebook  is null or (char_length(social_facebook)  <= 300 and social_facebook  ~* '^https://'))
    and (social_tiktok    is null or (char_length(social_tiktok)    <= 300 and social_tiktok    ~* '^https://'))
    and (social_youtube   is null or (char_length(social_youtube)   <= 300 and social_youtube   ~* '^https://'))
    and (social_x         is null or (char_length(social_x)         <= 300 and social_x         ~* '^https://'))
    and (social_linkedin  is null or (char_length(social_linkedin)  <= 300 and social_linkedin  ~* '^https://'))
    and (social_telegram  is null or (char_length(social_telegram)  <= 300 and social_telegram  ~* '^https://'))
    and (social_website   is null or (char_length(social_website)   <= 300 and social_website   ~* '^https://'))
  )
);

alter table public.creator_settings enable row level security;

drop policy if exists "creator_settings_public_read" on public.creator_settings;
create policy "creator_settings_public_read" on public.creator_settings
  for select using (public.is_public_creator(profile_id));

drop policy if exists "creator_settings_owner_all" on public.creator_settings;
create policy "creator_settings_owner_all" on public.creator_settings
  for all
  using (profile_id = auth.uid() and public.is_active_creator())
  with check (profile_id = auth.uid() and public.is_active_creator());

drop policy if exists "creator_settings_admin_all" on public.creator_settings;
create policy "creator_settings_admin_all" on public.creator_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 2. Works ----------
create table if not exists public.creator_works (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null check (char_length(btrim(title)) between 1 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  youtube_url text check (youtube_url is null or (char_length(youtube_url) <= 300 and youtube_url ~* '^https://')),
  link_url    text check (link_url is null or (char_length(link_url) <= 500 and link_url ~* '^https://')),
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists creator_works_user_idx on public.creator_works (user_id, sort_order, created_at desc);

alter table public.creator_works enable row level security;

drop policy if exists "creator_works_public_read" on public.creator_works;
create policy "creator_works_public_read" on public.creator_works
  for select using (is_active = true and public.is_public_creator(user_id));

drop policy if exists "creator_works_owner_all" on public.creator_works;
create policy "creator_works_owner_all" on public.creator_works
  for all
  using (user_id = auth.uid() and public.is_active_creator())
  with check (user_id = auth.uid() and public.is_active_creator());

drop policy if exists "creator_works_admin_all" on public.creator_works;
create policy "creator_works_admin_all" on public.creator_works
  for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.limit_creator_works()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.creator_works where user_id = new.user_id) >= 30 then
    raise exception 'Works limit reached (30)' using errcode = '23514';
  end if;
  return new;
end;
$$;
drop trigger if exists limit_creator_works on public.creator_works;
create trigger limit_creator_works before insert on public.creator_works
  for each row execute function public.limit_creator_works();

create or replace function public.touch_creator_work()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists touch_creator_work on public.creator_works;
create trigger touch_creator_work before update on public.creator_works
  for each row execute function public.touch_creator_work();

-- ---------- 3. Work images ----------
create table if not exists public.creator_work_images (
  id         uuid primary key default gen_random_uuid(),
  work_id    uuid not null references public.creator_works(id) on delete cascade,
  url        text not null check (url ~* '^https://' and char_length(url) <= 1000),
  alt        text not null default '' check (char_length(alt) <= 120),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists creator_work_images_work_idx on public.creator_work_images (work_id, sort_order);

alter table public.creator_work_images enable row level security;

drop policy if exists "creator_work_images_public_read" on public.creator_work_images;
create policy "creator_work_images_public_read" on public.creator_work_images
  for select using (exists (
    select 1 from public.creator_works w
    where w.id = work_id and w.is_active = true and public.is_public_creator(w.user_id)
  ));

drop policy if exists "creator_work_images_owner_all" on public.creator_work_images;
create policy "creator_work_images_owner_all" on public.creator_work_images
  for all
  using (exists (select 1 from public.creator_works w where w.id = work_id and w.user_id = auth.uid())
         and public.is_active_creator())
  with check (exists (select 1 from public.creator_works w where w.id = work_id and w.user_id = auth.uid())
              and public.is_active_creator());

drop policy if exists "creator_work_images_admin_all" on public.creator_work_images;
create policy "creator_work_images_admin_all" on public.creator_work_images
  for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.limit_creator_work_images()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.creator_work_images where work_id = new.work_id) >= 8 then
    raise exception 'Image limit reached (8 per work)' using errcode = '23514';
  end if;
  return new;
end;
$$;
drop trigger if exists limit_creator_work_images on public.creator_work_images;
create trigger limit_creator_work_images before insert on public.creator_work_images
  for each row execute function public.limit_creator_work_images();

-- Atomic, ordered replacement of a work's image URLs (one transaction), like replace_product_images in 0007.
-- SECURITY INVOKER: RLS and the 8-image trigger still apply; ownership is checked explicitly too.
create or replace function public.replace_creator_work_images(p_work uuid, p_urls text[])
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if coalesce(array_length(p_urls, 1), 0) > 8 then
    raise exception 'Image limit reached (8 per work)' using errcode = '23514';
  end if;
  if not exists (select 1 from public.creator_works where id = p_work and user_id = auth.uid()) then
    raise exception 'Work not found' using errcode = '42501';
  end if;

  delete from public.creator_work_images where work_id = p_work;

  insert into public.creator_work_images (work_id, url, sort_order)
  select p_work, u, (ord - 1)::int
  from unnest(coalesce(p_urls, '{}'::text[])) with ordinality as t(u, ord);
end;
$$;

revoke all on function public.replace_creator_work_images(uuid, text[]) from public, anon;
grant execute on function public.replace_creator_work_images(uuid, text[]) to authenticated;

-- ---------- 4. Pricing plans (CTA = WhatsApp only) ----------
create table if not exists public.creator_plans (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null check (char_length(btrim(name)) between 1 and 60),
  price_text  text not null default '' check (char_length(price_text) <= 40),   -- free text: "Free", "৳500 / month"
  tagline     text not null default '' check (char_length(tagline) <= 200),
  features    text not null default '' check (char_length(features) <= 1200),   -- one feature per line
  cta_label   text not null default 'Get started' check (char_length(btrim(cta_label)) between 1 and 30),
  is_featured boolean not null default false,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists creator_plans_user_idx on public.creator_plans (user_id, sort_order);

alter table public.creator_plans enable row level security;

drop policy if exists "creator_plans_public_read" on public.creator_plans;
create policy "creator_plans_public_read" on public.creator_plans
  for select using (is_active = true and public.is_public_creator(user_id));

drop policy if exists "creator_plans_owner_all" on public.creator_plans;
create policy "creator_plans_owner_all" on public.creator_plans
  for all
  using (user_id = auth.uid() and public.is_active_creator())
  with check (user_id = auth.uid() and public.is_active_creator());

drop policy if exists "creator_plans_admin_all" on public.creator_plans;
create policy "creator_plans_admin_all" on public.creator_plans
  for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.limit_creator_plans()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.creator_plans where user_id = new.user_id) >= 6 then
    raise exception 'Plan limit reached (6)' using errcode = '23514';
  end if;
  return new;
end;
$$;
drop trigger if exists limit_creator_plans on public.creator_plans;
create trigger limit_creator_plans before insert on public.creator_plans
  for each row execute function public.limit_creator_plans();

-- ---------- 5. Latest YouTube videos ----------
create table if not exists public.creator_videos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  url        text not null check (char_length(url) <= 300
                                   and url ~* '^https://((www|m)\.)?(youtube\.com|youtu\.be)/'),
  title      text not null default '' check (char_length(title) <= 100),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists creator_videos_user_idx on public.creator_videos (user_id, sort_order);

alter table public.creator_videos enable row level security;

drop policy if exists "creator_videos_public_read" on public.creator_videos;
create policy "creator_videos_public_read" on public.creator_videos
  for select using (public.is_public_creator(user_id));

drop policy if exists "creator_videos_owner_all" on public.creator_videos;
create policy "creator_videos_owner_all" on public.creator_videos
  for all
  using (user_id = auth.uid() and public.is_active_creator())
  with check (user_id = auth.uid() and public.is_active_creator());

drop policy if exists "creator_videos_admin_all" on public.creator_videos;
create policy "creator_videos_admin_all" on public.creator_videos
  for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.limit_creator_videos()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.creator_videos where user_id = new.user_id) >= 12 then
    raise exception 'Video limit reached (12)' using errcode = '23514';
  end if;
  return new;
end;
$$;
drop trigger if exists limit_creator_videos on public.creator_videos;
create trigger limit_creator_videos before insert on public.creator_videos
  for each row execute function public.limit_creator_videos();

-- ---------- 6. Grants (anon reads public rows through the policies above; owners write) ----------
grant select on public.creator_settings, public.creator_works, public.creator_work_images,
                public.creator_plans, public.creator_videos to anon, authenticated;
grant insert, update, delete on public.creator_settings, public.creator_works, public.creator_work_images,
                public.creator_plans, public.creator_videos to authenticated;
