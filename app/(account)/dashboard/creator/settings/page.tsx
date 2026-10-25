import Link from "next/link";
import { requireCreator } from "@/lib/auth/creator-access";
import { getUserAccess } from "@/lib/auth/user-access";
import { absoluteUrl } from "@/lib/site-url";
import { ShareButton } from "@/components/store/share-button";

export const metadata = { title: "Creator settings" };

export default async function CreatorSettingsPage() {
  const { profile } = await requireCreator();
  const access = await getUserAccess(); // cached for this request; only used for the sign-in e-mail
  const email = access.status === "member" ? access.email : "";
  const pageUrl = absoluteUrl(`/${profile.username}`);

  const row = "flex flex-col gap-0.5 border-b border-brand-light/50 py-3 last:border-b-0";
  const label = "text-xs font-bold uppercase tracking-wide text-gray-500";
  const lnk = "font-semibold text-brand-deep underline";

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-extrabold">Settings</h1>

      <section className="rounded-2xl border border-brand-light/70 bg-white px-4">
        <div className={row}>
          <span className={label}>Username</span>
          <span className="text-sm font-semibold">@{profile.username}</span>
          <span className="text-xs text-gray-500">Your username is your page address and cannot be changed.</span>
        </div>
        {email && (
          <div className={row}>
            <span className={label}>Sign-in email</span>
            <span className="break-all text-sm font-semibold">{email}</span>
          </div>
        )}
        <div className={row}>
          <span className={label}>Account type</span>
          <span className="text-sm font-semibold">Creator</span>
        </div>
        <div className={row}>
          <span className={label}>Your public page</span>
          <Link href={`/${profile.username}`} target="_blank" className="break-all text-sm font-semibold text-brand-deep underline">
            {pageUrl.replace(/^https?:\/\//, "")}
          </Link>
          <div className="mt-2">
            <ShareButton
              url={pageUrl}
              title={profile.full_name ?? `@${profile.username}`}
              className="inline-flex h-11 items-center gap-2 rounded-xl border-2 border-brand-light bg-white px-5 text-sm font-bold hover:bg-brand-light/25"
            >
              Share my page
            </ShareButton>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-light/70 bg-white p-4 text-sm text-gray-700">
        <h2 className="text-base font-extrabold text-brand-ink">Where to change things</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <Link href="/dashboard/creator/profile" className={lnk}>Profile</Link>: name, bio, avatar, WhatsApp, About, contact, social links, videos
          </li>
          <li>
            <Link href="/dashboard/creator/appearance" className={lnk}>Appearance</Link>: page colors and gradients
          </li>
          <li>
            <Link href="/dashboard/creator/works" className={lnk}>Works</Link> and{" "}
            <Link href="/dashboard/creator/pricing" className={lnk}>Pricing</Link>: what visitors see in those tabs
          </li>
        </ul>
      </section>
    </div>
  );
}
