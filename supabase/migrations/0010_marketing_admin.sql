-- 0010_marketing_admin.sql
-- 1) Reserve "pricing" (new public /pricing route). Keep in sync with RESERVED_USERNAMES in lib/utils/username.ts.
-- 2) dashboard_guides: admin-managed lessons shown in /dashboard/creator/guide and /dashboard/business/guide.
-- Branding + social links need NO new table: they live in public.site_settings as the keys
-- "logo_url" (text) and "social_links" (json object), written from /admin/branding. Safe to re-run.

-- ---------- 1. Reserved usernames ----------
create or replace function public.is_reserved_username(p_username text)
returns boolean
language sql
immutable
as $$
  select lower(coalesce(p_username, '')) = any (array[
    'admin','login','signup','register','logout','dashboard','api','tools','guides','guide',
    'trending','faq','faqs','store','collaboration','notifications','c','b','app','www',
    'static','_next','menu','settings','auth','profile','support','help','about','contact',
    'privacy','terms','cookies','blog','news','search','explore','reels','video','home','index',
    'root','null','undefined','test','robots','sitemap','favicon','pricing'
  ]);
$$;

-- Heads-up: if this returns a row, someone already owns /pricing as a username. Rename that account.
-- select id, email, username from public.profiles where lower(username) = 'pricing';

-- ---------- 2. Dashboard guides ----------
create table if not exists public.dashboard_guides (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 120),
  description text not null default '' check (char_length(description) <= 400),
  youtube_url text check (youtube_url is null or (char_length(youtube_url) <= 300
                          and youtube_url ~* '^https://((www|m)\.)?(youtube\.com|youtu\.be)/')),
  audience    text not null default 'both' check (audience in ('creator', 'business', 'both')),
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists dashboard_guides_list_idx
  on public.dashboard_guides (is_active, audience, sort_order);

alter table public.dashboard_guides enable row level security;

-- Signed-in members read active lessons only; admins manage everything.
drop policy if exists "dashboard_guides_member_read" on public.dashboard_guides;
create policy "dashboard_guides_member_read" on public.dashboard_guides
  for select to authenticated using (is_active = true);

drop policy if exists "dashboard_guides_admin_all" on public.dashboard_guides;
create policy "dashboard_guides_admin_all" on public.dashboard_guides
  for all using (public.is_admin()) with check (public.is_admin());

grant select on public.dashboard_guides to authenticated;
grant insert, update, delete on public.dashboard_guides to authenticated; -- RLS limits writes to admins

create or replace function public.touch_dashboard_guides()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists touch_dashboard_guides on public.dashboard_guides;
create trigger touch_dashboard_guides before update on public.dashboard_guides
  for each row execute function public.touch_dashboard_guides();
