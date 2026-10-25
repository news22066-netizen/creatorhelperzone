import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageCircleOff } from "lucide-react";
import { getStoreView } from "@/lib/store/data";
import { hasAnyContact } from "@/lib/store/contact";
import { SafeImg } from "@/components/store/safe-img";
import { ContactRows } from "@/components/store/contact-rows";
import { StoreFooter } from "@/components/store/store-home";

export const revalidate = 30;

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const view = await getStoreView(username);
  if (!view) return { title: "Page not found", robots: { index: false } };
  return { title: `Contact · ${view.displayName}`, description: view.profile.bio || `Contact ${view.displayName}.` };
}

export default async function StoreContactPage({ params }: Props) {
  const { username } = await params;
  const view = await getStoreView(username);
  if (!view) notFound();

  const { profile, displayName, contact } = view;
  const initial = displayName.replace(/^@/, "").charAt(0).toUpperCase() || "S";
  const fallback = (
    <span className="flex h-24 w-24 items-center justify-center rounded-full bg-store-primary text-4xl font-extrabold text-store-on-primary">
      {initial}
    </span>
  );
  const anything = Boolean(profile.whatsapp) || hasAnyContact(contact);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        {profile.avatar_url ? (
          <SafeImg
            src={profile.avatar_url}
            alt={displayName}
            eager
            className="h-24 w-24 rounded-full border-2 border-store-text/10 object-cover"
            fallback={fallback}
          />
        ) : (
          fallback
        )}
        <h1 className="text-xl font-extrabold">{displayName}</h1>
        <p className="text-sm text-store-text/70">@{profile.username}</p>
        {profile.bio && (
          <p className="max-w-sm whitespace-pre-line text-[15px] leading-relaxed text-store-text/80">{profile.bio}</p>
        )}
      </div>

      {anything ? (
        <ContactRows contact={contact} whatsapp={profile.whatsapp} storeName={displayName} />
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-store-text/30 px-5 py-10 text-center">
          <MessageCircleOff className="h-8 w-8 text-store-text/50" />
          <p className="font-bold">No contact details yet</p>
          <p className="max-w-xs text-sm text-store-text/75">This store has not added a way to contact them yet.</p>
        </div>
      )}

      <StoreFooter username={username} />
    </div>
  );
}
