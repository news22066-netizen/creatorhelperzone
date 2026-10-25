import { createClient } from "@/lib/supabase/server";
import { BrandingForm } from "@/components/admin/branding-form";
import { parseSettings } from "@/lib/data/settings";

export const metadata = { title: "Logo & social links" };

export default async function AdminBrandingPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("key, value");
  const settings = parseSettings(data);

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <h1 className="text-xl font-bold">Logo &amp; social links</h1>
      <BrandingForm settings={settings} envLogoSet={Boolean(process.env.NEXT_PUBLIC_LOGO_URL)} />
    </div>
  );
}
