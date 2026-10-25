-- ============================================================
-- CreatorHub BD — 0003 SEO tool detail pages
-- Run in the Supabase SQL Editor AFTER 0002_security.sql. Safe to re-run.
--
-- Adds per-tool slug / long-form content / meta tags so each tool can have
-- its own indexable URL: /tools/<slug>.
-- RLS is intentionally untouched: public still reads active tools only,
-- admins still have full access (policies from 0001).
-- ============================================================

-- ---------- 1. Columns ----------
alter table public.tools
  add column if not exists slug             text,
  add column if not exists content          text not null default '',
  add column if not exists meta_title       text,
  add column if not exists meta_description text;

-- ---------- 2. Backfill slugs from names ----------
-- slugify: lowercase, non [a-z0-9] runs -> '-', trim hyphens, max 60 chars.
-- Names with no latin characters (e.g. Bangla only) fall back to 'tool'.
-- Collisions (and clashes with already-set slugs) get a short id suffix.
with base as (
  select
    id,
    created_at,
    left(
      coalesce(
        nullif(
          trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g')),
          ''
        ),
        'tool'
      ),
      60
    ) as s
  from public.tools
  where slug is null
),
ranked as (
  select id, s,
         row_number() over (partition by s order by created_at, id) as rn
  from base
)
update public.tools t
set slug = case
  when r.rn = 1
       and not exists (select 1 from public.tools x where x.slug = r.s)
    then r.s
  else left(r.s, 53) || '-' || substr(t.id::text, 1, 6)
end
from ranked r
where t.id = r.id;

-- ---------- 3. Constraints ----------
create unique index if not exists tools_slug_key on public.tools (slug);

alter table public.tools drop constraint if exists tools_slug_format;
alter table public.tools
  add constraint tools_slug_format
  check (slug is null or slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

-- Active (publicly visible) tools must have a slug.
alter table public.tools drop constraint if exists tools_active_needs_slug;
alter table public.tools
  add constraint tools_active_needs_slug
  check (is_active = false or slug is not null);
