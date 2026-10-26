-- ============================================================
-- BFEED — 0008 product slugs, store section toggles, contact links
-- Run in the Supabase SQL Editor AFTER 0007_store_merge_deltas.sql. Safe to re-run.
--
--  1. store_products.slug     unique per store (user_id, slug), auto-filled from the name
--  2. store_settings.sections jsonb of show/hide flags for the public store blocks
--  3. store_settings.contact_* optional phone / email / social / website / address
--
-- No new tables, so the existing RLS policies (public read of public stores, owner write) still apply.
-- ============================================================

-- ---------- 1. Product slugs ----------
alter table public.store_products add column if not exists slug text;

-- Name -> url slug (a-z 0-9 and single hyphens). Non-latin names fall back to "product".
-- Appends -2, -3 ... until it is unique inside the store. p_exclude = the row being updated.
create or replace function public.make_product_slug(p_user uuid, p_name text, p_exclude uuid default null)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  base text;
  candidate text;
  n integer := 1;
begin
  base := lower(coalesce(p_name, ''));
  base := regexp_replace(base, '[^a-z0-9]+', '-', 'g');
  base := regexp_replace(base, '^-+|-+$', '', 'g');
  base := left(base, 70);
  base := regexp_replace(base, '-+$', '', 'g');
  if base = '' then base := 'product'; end if;

  candidate := base;
  while exists (
    select 1 from public.store_products
    where user_id = p_user and slug = candidate and (p_exclude is null or id <> p_exclude)
  ) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  return candidate;
end;
$$;

-- Backfill existing products (oldest first, so the oldest keeps the plain slug).
do $$
declare
  r record;
begin
  for r in
    select id, user_id, name from public.store_products
    where slug is null or btrim(slug) = ''
    order by created_at
  loop
    update public.store_products
       set slug = public.make_product_slug(r.user_id, r.name, r.id)
     where id = r.id;
  end loop;
end;
$$;

-- Safety net: a blank slug (hand-made API call, old client) is generated instead of rejected.
create or replace function public.set_product_slug()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.slug is null or btrim(new.slug) = '' then
    if tg_op = 'UPDATE' and old.slug is not null then
      new.slug := old.slug;
    else
      new.slug := public.make_product_slug(new.user_id, new.name, new.id);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists set_product_slug on public.store_products;
create trigger set_product_slug
  before insert or update on public.store_products
  for each row execute function public.set_product_slug();

alter table public.store_products alter column slug set not null;

alter table public.store_products drop constraint if exists store_products_slug_format;
alter table public.store_products
  add constraint store_products_slug_format
  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80);

create unique index if not exists store_products_user_slug_key
  on public.store_products (user_id, slug);

-- ---------- 2. Section visibility flags ----------
alter table public.store_settings
  add column if not exists sections jsonb not null default
    '{"show_featured_products":true,"show_photo_row":true,"show_categories":true,"show_youtube":true,"show_faq":true,"show_search_on_shop":true}'::jsonb;

alter table public.store_settings drop constraint if exists store_sections_object;
alter table public.store_settings
  add constraint store_sections_object check (jsonb_typeof(sections) = 'object');

-- ---------- 3. Contact links (all optional, shown on /[username]/contact) ----------
alter table public.store_settings
  add column if not exists contact_phone     text,
  add column if not exists contact_email     text,
  add column if not exists contact_facebook  text,
  add column if not exists contact_instagram text,
  add column if not exists contact_tiktok    text,
  add column if not exists contact_youtube   text,
  add column if not exists contact_website   text,
  add column if not exists contact_address   text;

alter table public.store_settings drop constraint if exists store_contact_formats;
alter table public.store_settings
  add constraint store_contact_formats check (
    (contact_phone     is null or contact_phone ~ '^\+?[0-9]{6,15}$')
    and (contact_email is null or (char_length(contact_email) <= 120 and contact_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'))
    and (contact_facebook  is null or (char_length(contact_facebook)  <= 300 and contact_facebook  ~* '^https://'))
    and (contact_instagram is null or (char_length(contact_instagram) <= 300 and contact_instagram ~* '^https://'))
    and (contact_tiktok    is null or (char_length(contact_tiktok)    <= 300 and contact_tiktok    ~* '^https://'))
    and (contact_youtube   is null or (char_length(contact_youtube)   <= 300 and contact_youtube   ~* '^https://'))
    and (contact_website   is null or (char_length(contact_website)   <= 300 and contact_website   ~* '^https://'))
    and (contact_address   is null or char_length(contact_address) <= 200)
  );
