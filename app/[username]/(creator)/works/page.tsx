import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Briefcase } from "lucide-react";
import { getCreatorView, getCreatorWorks } from "@/lib/creator/data";
import { WorksGrid } from "@/components/creator/works-grid";

export const revalidate = 30;
type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const view = await getCreatorView(username);
  if (!view) return { title: "Page not found", robots: { index: false } };
  return { title: `Works · ${view.displayName}`, description: `Projects by ${view.displayName}.` };
}

export default async function CreatorWorksPublicPage({ params }: Props) {
  const { username } = await params;
  const view = await getCreatorView(username);
  if (!view) notFound();
  const works = await getCreatorWorks(view.profile.id);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-extrabold">Works</h1>
      {works.length === 0 ? (
        <div className="cp-card flex flex-col items-center gap-2 rounded-2xl border-dashed px-5 py-12 text-center">
          <Briefcase className="h-8 w-8 opacity-70" />
          <p className="font-bold">No works yet</p>
          <p className="cp-muted max-w-xs text-sm">This creator has not added projects yet.</p>
        </div>
      ) : (
        <WorksGrid
          name={view.displayName}
          whatsapp={view.profile.whatsapp}
          works={works.map((w) => ({
            id: w.id, title: w.title, description: w.description, youtube_url: w.youtube_url, link_url: w.link_url,
            images: w.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt })),
          }))}
        />
      )}
    </div>
  );
}
