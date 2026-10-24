import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-less anonymous Supabase client for PUBLIC, cacheable reads.
 *
 * The cookie-based client in ./server.ts calls cookies(), which forces
 * every page that touches it into dynamic rendering — so `revalidate`
 * and `generateStaticParams` would not give real static/ISR pages.
 * Public content is readable by the anon role via RLS, so no session is needed.
 *
 * Never use this client for anything user- or admin-specific.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
