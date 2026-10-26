-- ============================================================
-- BFEED — 0006 business store
-- Run in the Supabase SQL Editor AFTER 0005_reserve_cookies.sql.
-- Safe to re-run (idempotent guards throughout).
--
-- What this adds:
--   store_settings       1:1 with profiles — display name + theme colors
--   store_categories     optional product categories per store
--   store_products       products with price / description / active flag
--   store_product_images multiple images per product (separate table, not
--                        an array — lets RLS stay row-based and images sort)
--   store_faqs           short FAQ shown on store Home (optional)
--   store_privacy        1:1 per store — text for /[username]/privacy
--
-- Reuses existing helpers from 0004: is_admin(), is_active_member(),
-- is_public_profile(). No payments anywhere — orders go via WhatsApp.
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- 1. Store settings (1:1 with profiles) ----------
create table if not exists public.store_settings (
  profile_id   uuid primary key references public.profiles(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  -- Theme is applied client-side as CSS variables. Defaults: white bg,
  -- near-black primary, gray-800 text (black/white/gray defaults).
  theme        jsonb not null default '{"background":"#ffffff","primary":"#111827","text":"#1f2937"}'::jsonb,
  updated_at   timestamptz not null default now(),
  constraint store_theme_keys check (theme ?& array['background','primary','text'])
);

alter table public.store_settings enable row level security;

-- Public: anyone can read theme/display name of a public store profile.
drop policy if exists "store_settings_public_read" on public.store_settings;
create policy "store_settings_public_read" on public.store_settings
  for select using (public.is_public_profile(profile_id));

drop policy if exists "store_settings_owner_all" on public.store_settings;
create policy "store_settings_owner_all" on public.store_settings
  for all
  using (profile_id = auth.uid() and public.is_active_member())
  with check (profile_id = auth.uid() and public.is_active_member());

drop policy if exists "store_settings_admin_all" on public.store_settings;
create policy "store_settings_admin_all" on public.store_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- Auto-create a settings row whenever a business claims a username for the
-- first time (covers accounts created before this migration too — see
-- backfill below).
create or replace function public.ensure_store_settings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'business' and old.role is distinct from 'business' then
    insert into public.store_settings (profile_id)
    values (new.id)
    on conflict (profile_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists ensure_store_settings on public.profiles;
create trigger ensure_store_settings
  after update of role on public.profiles
  for each row execute function public.ensure_store_settings();

-- Backfill: settings rows for existing business profiles.
insert into public.store_settings (profile_id)
select id from public.profiles where role = 'business'
on conflict (profile_id) do nothing;

-- ---------- 2. Categories (optional) ----------
create table if not exists public.store_categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  name       text not null check (char_length(btrim(name)) between 1 and 60),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.store_categories enable row level security;

drop policy if exists "categories_public_read" on public.store_categories;
create policy "categories_public_read" on public.store_categories
  for select using (public.is_public_profile(user_id));

drop policy if exists "categories_owner_all" on public.store_categories;
create policy "categories_owner_all" on public.store_categories
  for all
  using (user_id = auth.uid() and public.is_active_member())
  with check (user_id = auth.uid() and public.is_active_member());

drop policy if exists "categories_admin_all" on public.store_categories;
create policy "categories_admin_all" on public.store_categories
  for all using (public.is_admin()) with check (public.is_admin());

-- Cap categories per store (keeps the categories entry row sane).
create or replace function public.limit_store_categories()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.store_categories where user_id = new.user_id) >= 12 then
    raise exception 'Category limit reached (12)' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists limit_store_categories on public.store_categories;
create trigger limit_store_categories
  before insert on public.store_categories
  for each row execute function public.limit_store_categories();

-- ---------- 3. Products ----------
create table if not exists public.store_products (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.store_categories(id) on delete set null,
  name        text not null check (char_length(btrim(name)) between 1 and 120),
  price       numeric(12,2) not null check (price >= 0),
  currency    text not null default 'BDT' check (currency ~ '^[A-Z]{3}$'),
  description text not null default '' check (char_length(description) <= 2000),
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists store_products_user_idx
  on public.store_products (user_id, sort_order, created_at desc);
create index if not exists store_products_category_idx
  on public.store_products (category_id);

alter table public.store_products enable row level security;

-- Public: active products of public (unblocked, username-claimed) stores only.
drop policy if exists "products_public_read" on public.store_products;
create policy "products_public_read" on public.store_products
  for select using (is_active = true and public.is_public_profile(user_id));

drop policy if exists "products_owner_all" on public.store_products;
create policy "products_owner_all" on public.store_products
  for all
  using (user_id = auth.uid() and public.is_active_member())
  with check (user_id = auth.uid() and public.is_active_member());

drop policy if exists "products_admin_all" on public.store_products;
create policy "products_admin_all" on public.store_products
  for all using (public.is_admin()) with check (public.is_admin());

-- Products may only be placed in the owner's OWN categories.
create or replace function public.product_category_is_own()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.category_id is not null and not exists (
    select 1 from public.store_categories
    where id = new.category_id and user_id = new.user_id
  ) then
    raise exception 'Category does not belong to this store' using errcode = '23503';
  end if;
  return new;
end;
$$;

drop trigger if exists product_category_is_own on public.store_products;
create trigger product_category_is_own
  before insert or update of category_id on public.store_products
  for each row execute function public.product_category_is_own();

-- Cap products per store.
create or replace function public.limit_store_products()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.store_products where user_id = new.user_id) >= 100 then
    raise exception 'Product limit reached (100)' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists limit_store_products on public.store_products;
create trigger limit_store_products
  before insert on public.store_products
  for each row execute function public.limit_store_products();

-- updated_at maintenance.
create or replace function public.touch_store_product()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists touch_store_product on public.store_products;
create trigger touch_store_product
  before update on public.store_products
  for each row execute function public.touch_store_product();

-- ---------- 4. Product images (separate table, ordered) ----------
create table if not exists public.store_product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.store_products(id) on delete cascade,
  url        text not null check (url ~* '^https?://' and char_length(url) <= 1000),
  alt        text not null default '' check (char_length(alt) <= 120),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists store_product_images_product_idx
  on public.store_product_images (product_id, sort_order);

alter table public.store_product_images enable row level security;

-- Public: images of active products on public stores.
drop policy if exists "product_images_public_read" on public.store_product_images;
create policy "product_images_public_read" on public.store_product_images
  for select using (exists (
    select 1 from public.store_products p
    where p.id = product_id
      and p.is_active = true
      and public.is_public_profile(p.user_id)
  ));

-- Owner: via the parent product.
drop policy if exists "product_images_owner_all" on public.store_product_images;
create policy "product_images_owner_all" on public.store_product_images
  for all
  using (exists (
      select 1 from public.store_products p
      where p.id = product_id and p.user_id = auth.uid()
    ) and public.is_active_member())
  with check (exists (
      select 1 from public.store_products p
      where p.id = product_id and p.user_id = auth.uid()
    ) and public.is_active_member());

drop policy if exists "product_images_admin_all" on public.store_product_images;
create policy "product_images_admin_all" on public.store_product_images
  for all using (public.is_admin()) with check (public.is_admin());

-- Cap images per product.
create or replace function public.limit_product_images()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.store_product_images where product_id = new.product_id) >= 8 then
    raise exception 'Image limit reached (8 per product)' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists limit_product_images on public.store_product_images;
create trigger limit_product_images
  before insert on public.store_product_images
  for each row execute function public.limit_product_images();

-- ---------- 5. Store FAQs (short FAQ on store Home) ----------
create table if not exists public.store_faqs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  question   text not null check (char_length(btrim(question)) between 1 and 160),
  answer     text not null check (char_length(btrim(answer)) between 1 and 1000),
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.store_faqs enable row level security;

drop policy if exists "store_faqs_public_read" on public.store_faqs;
create policy "store_faqs_public_read" on public.store_faqs
  for select using (is_active = true and public.is_public_profile(user_id));

drop policy if exists "store_faqs_owner_all" on public.store_faqs;
create policy "store_faqs_owner_all" on public.store_faqs
  for all
  using (user_id = auth.uid() and public.is_active_member())
  with check (user_id = auth.uid() and public.is_active_member());

drop policy if exists "store_faqs_admin_all" on public.store_faqs;
create policy "store_faqs_admin_all" on public.store_faqs
  for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.limit_store_faqs()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.store_faqs where user_id = new.user_id) >= 12 then
    raise exception 'FAQ limit reached (12)' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists limit_store_faqs on public.store_faqs;
create trigger limit_store_faqs
  before insert on public.store_faqs
  for each row execute function public.limit_store_faqs();

-- ---------- 6. Privacy policy (1:1 per store) ----------
create table if not exists public.store_privacy (
  user_id    uuid primary key references public.profiles(id) on delete cascade,
  content    text not null default '' check (char_length(content) <= 20000),
  updated_at timestamptz not null default now()
);

alter table public.store_privacy enable row level security;

-- Public: a store's privacy page is world-readable (only if the store is public).
drop policy if exists "store_privacy_public_read" on public.store_privacy;
create policy "store_privacy_public_read" on public.store_privacy
  for select using (public.is_public_profile(user_id));

drop policy if exists "store_privacy_owner_all" on public.store_privacy;
create policy "store_privacy_owner_all" on public.store_privacy
  for all
  using (user_id = auth.uid() and public.is_active_member())
  with check (user_id = auth.uid() and public.is_active_member());

drop policy if exists "store_privacy_admin_all" on public.store_privacy;
create policy "store_privacy_admin_all" on public.store_privacy
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 7. Grants ----------
-- Public (anon) reads only the public-read tables; authenticated users manage
-- their own rows through the owner policies above.
grant select on public.store_settings       to anon, authenticated;
grant select on public.store_categories     to anon, authenticated;
grant select on public.store_products       to anon, authenticated;
grant select on public.store_product_images to anon, authenticated;
grant select on public.store_faqs           to anon, authenticated;
grant select on public.store_privacy        to anon, authenticated;

grant insert, update, delete on public.store_settings       to authenticated;
grant insert, update, delete on public.store_categories     to authenticated;
grant insert, update, delete on public.store_products       to authenticated;
grant insert, update, delete on public.store_product_images to authenticated;
grant insert, update, delete on public.store_faqs           to authenticated;
grant insert, update, delete on public.store_privacy        to authenticated;
