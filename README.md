# CreatorHub BD — MVP 1

Free platform for Bangladeshi content creators and small businesses.
Single Next.js 15 app serving two subdomains via middleware routing.

| URL                                   | Served content                                   |
| ------------------------------------- | ------------------------------------------------ |
| `eg.com`                              | Public website (`app/(public)/*`)                |
| `eg.com/admin` (path-based, primary)  | Admin panel (`app/(admin)/admin/*`)              |
| `admin.eg.com` (optional subdomain)   | Same admin panel; bare paths rewritten to /admin |
| `app.eg.com`                          | _(future — creator dashboard)_                   |

## Tech stack

Next.js 15 (App Router) · TypeScript · Supabase (Auth + Postgres) ·
Tailwind CSS · shadcn/ui-style components · Vercel · Cloudflare DNS.
Images: external links only (imgbb). Video: YouTube embeds only.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase keys
npm run dev
```

- Public site:  http://localhost:3000
- Admin login:  http://localhost:3000/admin/login  (dashboard: /admin)
- Optional subdomain: http://admin.localhost:3000 (rewritten to /admin/*; cookies are
  per-host, so you sign in separately from localhost:3000)

## 1. Create the Supabase project

1. Create a project at https://supabase.com
2. Open **SQL Editor** and run, in order:
   1. `supabase/migrations/0001_init.sql` (tables, enums, RLS, signup trigger, seed data)
   2. `supabase/migrations/0002_security.sql` (**required** — closes privilege-escalation
      holes; safe to re-run). Its last query lists current admins: review it, and demote
      any account you do not recognise.
   3. `supabase/migrations/0003_tools_seo.sql` (tool slugs, article content and meta tags for
      `/tools/<slug>` pages; backfills slugs from existing names; safe to re-run)
   4. `supabase/migrations/0004_profiles_links.sql` (creator/business accounts: username, bio,
      WhatsApp, public profile view, links table, signup trigger; safe to re-run)

## 2. Auth configuration

- **Authentication → Providers**: enable **Email** and **Google**.
- Google OAuth: create credentials in Google Cloud Console, then set the
  Client ID/Secret in Supabase.
- **Authentication → URL Configuration**
  - Site URL: `http://localhost:3000` (development) / `https://eg.com` (production)
  - Redirect URLs (add every origin you use; the path must be exactly `/auth/callback`):

    ```
    http://localhost:3000/auth/callback
    https://eg.com/auth/callback
    http://admin.localhost:3000/auth/callback   (optional, subdomain dev)
    https://admin.eg.com/auth/callback          (optional, subdomain prod)
    ```

## 3. Create the first admin user

1. In Supabase **Authentication → Users**, add a user (email + password),
   or sign up through Google.
2. Promote to admin in SQL Editor:

   ```sql
   update profiles set role = 'admin' where email = 'you@example.com';
   ```

3. Sign in at `/admin/login` (e.g. `http://localhost:3000/admin/login`).

## Security model

- Every admin server action re-verifies on the server that the caller is a signed-in,
  non-blocked admin (`lib/auth/require-admin.ts`). UI guards are UX only.
- RLS + a DB trigger (`protect_profile_columns`) stop non-admins from changing
  `role`, `is_blocked`, `is_verified` or `email`, and stop admins from demoting/blocking
  themselves or removing the last active admin.
- Signup metadata can never grant `admin`; the first admin is promoted via SQL (step 3).
- Public pages read through a cookie-less anon client (`lib/supabase/public.ts`) so ISR works.
- Optional hardening until creator signup exists: in Supabase **Authentication → Sign In /
  Providers**, disable "Allow new users to sign up" after creating your admin account.

## Scripts

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # next lint (ESLint 8 + eslint-config-next)
npm run build
```

## 4. Deploy to Vercel + Cloudflare

1. Push this repo to GitHub and import into Vercel.
2. Add env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `NEXT_PUBLIC_SITE_URL=https://eg.com`).
3. In Vercel → Settings → Domains: add `eg.com` (and `admin.eg.com` if you want the subdomain).
4. In Cloudflare (DNS for eg.com): point both hosts to Vercel
   (CNAME to `cname.vercel-dns.com`, proxied).

## What's inside (MVP scope)

**Public site (eg.com):** Home · Tools (gradient cards) · Trending
(YouTube auto-embeds + keywords + thumbnail ideas) · Guides (SEO, ISR,
`generateStaticParams`) · FAQ (red accordion) · Store / Collaboration
(Coming Soon, admin-toggleable) · Notifications placeholder ·
site-wide announcement banner · bilingual EN/BN toggle.

**Admin panel (admin.eg.com):** Dashboard (counts + recent signups) ·
Tools CRUD · Trending CRUD (URL → ID → thumbnail preview) ·
Guides CMS (draft/published/unpublished, auto-slug) · FAQ CRUD ·
Users (search, block/unblock, verify) · Settings (Coming Soon toggles +
announcements).

## Notes

- All content tables are protected by RLS: public can only read
  published/active rows; writes require `role = 'admin'`.
- Public pages use ISR (`revalidate`) to stay fast and free-tier friendly.
- `lib/utils/youtube.ts` handles `youtube.com/watch`, `youtu.be`,
  `/shorts/`, `/embed/`, `/live/` and bare 11-char IDs.
- `lib/utils/username.ts` already contains the reserved-username list for
  the future `app.eg.com` onboarding.


## Creator / business accounts (`/signup`, `/login`, `/dashboard`, `/<username>`)

- Run migration `0004` first. Without it signup, the dashboard and profile pages cannot work.
- Supabase → Authentication → URL Configuration: `https://YOUR-DOMAIN/auth/callback` must be in
  the Redirect URLs allow-list (already needed for Google). If "Confirm email" is on, new users
  see "Check your email" and land on `/dashboard` after clicking the link.
- Usernames: 3–30 chars, `a-z 0-9 _`, stored lowercase, permanent. The reserved list lives in
  BOTH `lib/utils/username.ts` and `public.is_reserved_username()` — keep them in sync when a new
  top-level route is added.
- `/<username>` is a dynamic route; Next.js always prefers static routes (`/tools`, `/guides`,
  `/login`, …), so it cannot shadow them.
- Public profile data is read from the `public_profiles` view (no email / flags exposed).

## Business store: migrations and routes

Run in the Supabase SQL Editor, in order, after 0005: `0006_business_store.sql`, `0007_store_merge_deltas.sql`,
`0008_store_slugs_sections_contact.sql` (all safe to re-run).

0008 adds: `store_products.slug` (unique per store, backfilled), `store_settings.sections` (show/hide flags) and
`store_settings.contact_*` (phone, email, facebook, instagram, tiktok, youtube, website, address).

Public store routes: `/[username]` (Home), `/[username]/shop`, `/[username]/shop/[productSlug]`,
`/[username]/contact`, `/[username]/privacy`. Media rules: image URLs (https) only, YouTube links only, orders on WhatsApp only.
