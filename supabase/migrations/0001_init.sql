-- ============================================================
-- BFEED — initial schema (MVP 1)
-- Public read / admin-only write via RLS.
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Enums ----------
create type public.user_role as enum ('admin', 'creator', 'business');
create type public.publish_status as enum ('draft', 'published', 'unpublished');
create type public.trending_kind as enum ('video', 'keyword', 'thumbnail_idea');

-- ---------- Helper: is the current user an admin? ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- Profiles (extends auth.users) ----------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  role        public.user_role not null default 'creator',
  avatar_url  text,                       -- external link only (imgbb)
  is_blocked  boolean not null default false,
  is_verified boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- Auto-create a profile row for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'creator')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Tools ----------
create table public.tools (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  url         text not null,
  icon        text not null default '🔧',  -- emoji or imgbb link
  gradient    text not null default 'from-blue-500 to-indigo-500',
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.tools enable row level security;
create policy "tools_public_read" on public.tools
  for select using (is_active = true);
create policy "tools_admin_all" on public.tools
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Trending (weekly curated) ----------
create table public.trending_items (
  id          uuid primary key default gen_random_uuid(),
  kind        public.trending_kind not null,
  title       text not null default '',
  youtube_url text,
  youtube_id  text,
  week_label  text not null,              -- e.g. '2026-W43'
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  constraint video_needs_id check (kind <> 'video' or youtube_id is not null)
);

alter table public.trending_items enable row level security;
create policy "trending_public_read" on public.trending_items
  for select using (is_active = true);
create policy "trending_admin_all" on public.trending_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Guides / Articles ----------
create table public.guides (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  excerpt      text not null default '',
  content      text not null,             -- plain text / light markdown
  cover_url    text,                      -- external imgbb link
  status       public.publish_status not null default 'draft',
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.guides enable row level security;
create policy "guides_public_read" on public.guides
  for select using (status = 'published');
create policy "guides_admin_all" on public.guides
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- FAQs ----------
create table public.faqs (
  id         uuid primary key default gen_random_uuid(),
  question   text not null,
  answer     text not null,
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.faqs enable row level security;
create policy "faqs_public_read" on public.faqs
  for select using (is_active = true);
create policy "faqs_admin_all" on public.faqs
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Announcements (site-wide banner) ----------
create table public.announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;
create policy "announcements_public_read" on public.announcements
  for select using (is_active = true);
create policy "announcements_admin_all" on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Site settings (Coming Soon toggles etc.) ----------
create table public.site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
create policy "settings_public_read" on public.site_settings
  for select using (true);
create policy "settings_admin_all" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Seed data ----------
insert into public.site_settings (key, value) values
  ('store_enabled', 'false'),
  ('collaboration_enabled', 'false'),
  ('site_name', '"BFEED"');

insert into public.faqs (question, answer, sort_order) values
  ('What is BFEED?', 'BFEED is a free platform where Bangladeshi content creators and small businesses get their own public page with links, products and free classes. Free for the first 6 months.', 1),
  ('Is it really free?', 'Yes. For the first 6 months everything is 100% free while we build the community.', 2),
  ('Who can join?', 'YouTube, Facebook, TikTok and Instagram creators, plus small businesses, course sellers and digital product sellers from Bangladesh.', 3),
  ('How do I get my page?', 'Sign up as a Creator or Business, choose your username, add your links — your public page is ready at eg.com/yourusername.', 4),
  ('How do buyers contact me?', 'Every product has a Buy button that opens WhatsApp with a pre-filled message. No payment gateway needed.', 5);

insert into public.tools (name, description, url, icon, gradient, sort_order) values
  ('YouTube Studio', 'Analytics and channel management for creators.', 'https://studio.youtube.com', '🎬', 'from-red-500 to-orange-500', 1),
  ('Canva', 'Design thumbnails, covers and posts for free.', 'https://www.canva.com', '🎨', 'from-purple-500 to-pink-500', 2),
  ('CapCut', 'Free video editing for reels and shorts.', 'https://www.capcut.com', '✂️', 'from-blue-500 to-cyan-500', 3),
  ('Google Trends', 'See what Bangladesh is searching right now.', 'https://trends.google.com', '📈', 'from-green-500 to-emerald-500', 4),
  ('imgbb', 'Free image hosting — paste your image links here.', 'https://imgbb.com', '🖼️', 'from-amber-500 to-yellow-500', 5),
  ('Meta Business Suite', 'Manage Facebook and Instagram pages.', 'https://business.facebook.com', '💼', 'from-indigo-500 to-blue-500', 6);
