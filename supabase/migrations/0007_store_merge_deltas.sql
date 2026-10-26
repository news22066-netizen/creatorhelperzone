-- ============================================================
-- BFEED — 0007 store merge deltas (run AFTER 0006_business_store.sql). Safe to re-run.
--
-- Helper names in 0006 (is_admin, is_active_member, is_public_profile) already match our
-- 0001/0004 migrations, so 0006 runs unchanged. This file only closes three small gaps:
--
--  1. ensure_store_settings() fired on UPDATE of role only, but handle_new_user() creates business
--     profiles with an INSERT, so brand-new business signups got no settings row. Now also on INSERT.
--  2. store_settings.youtube_url: optional YouTube link for the store Home (YouTube embed only).
--  3. replace_product_images(): replaces a product's ordered image URLs atomically (one transaction),
--     so a failed save can never leave a product with half its images. SECURITY INVOKER: RLS and the
--     8-image trigger from 0006 still apply.
-- ============================================================

-- 1) settings row on INSERT as well as role change
create or replace function public.ensure_store_settings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'business' and (tg_op = 'INSERT' or old.role is distinct from 'business') then
    insert into public.store_settings (profile_id)
    values (new.id)
    on conflict (profile_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists ensure_store_settings on public.profiles;
create trigger ensure_store_settings
  after insert or update of role on public.profiles
  for each row execute function public.ensure_store_settings();

-- 2) optional YouTube link for the store Home
alter table public.store_settings
  add column if not exists youtube_url text
  check (youtube_url is null or (char_length(youtube_url) <= 300 and youtube_url ~* '^https://'));

-- 3) atomic, ordered image replacement (URL strings only, no file storage)
create or replace function public.replace_product_images(p_product uuid, p_urls text[])
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if coalesce(array_length(p_urls, 1), 0) > 8 then
    raise exception 'Image limit reached (8 per product)' using errcode = '23514';
  end if;

  if not exists (
    select 1 from public.store_products where id = p_product and user_id = auth.uid()
  ) then
    raise exception 'Product not found' using errcode = '42501';
  end if;

  delete from public.store_product_images where product_id = p_product;

  insert into public.store_product_images (product_id, url, sort_order)
  select p_product, u, (ord - 1)::int
  from unnest(coalesce(p_urls, '{}'::text[])) with ordinality as t(u, ord);
end;
$$;

revoke all on function public.replace_product_images(uuid, text[]) from public, anon;
grant execute on function public.replace_product_images(uuid, text[]) to authenticated;
