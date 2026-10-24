import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStorePrivacy, getStoreView } from "@/lib/store/data";
import { StoreFooter } from "@/components/store/store-home";

export const revalidate = 30;

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const view = await getStoreView(username);
  if (!view) return { title: "Page not found", robots: { index: false } };
  return { title: `Privacy Policy · ${view.displayName}` };
}

export default async function StorePrivacyPage({ params }: Props) {
  const { username } = await params;
  const view = await getStoreView(username);
  if (!view) notFound();

  const content = await getStorePrivacy(view.profile.id);
  // Owner-written text: rendered as escaped plain paragraphs (no HTML, no markdown, no links to inject).
  const paragraphs = content ? content.replace(/\r\n?/g, "\n").split(/\n{2,}/).filter(Boolean) : [];

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-extrabold">Privacy Policy</h1>
      {paragraphs.length > 0 ? (
        <article className="flex flex-col gap-3 text-[15px] leading-relaxed text-store-text/85">
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </article>
      ) : (
        <p className="rounded-2xl border border-dashed border-store-text/25 px-5 py-10 text-center text-sm text-store-text/65">
          {view.displayName} has not published a privacy policy yet.
        </p>
      )}
      <StoreFooter username={username} />
    </div>
  );
}
