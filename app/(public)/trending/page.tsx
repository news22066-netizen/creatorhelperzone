import type { Metadata } from "next";
import { getTrending } from "@/lib/data/public";
import { TrendingView } from "@/components/public/trending-view";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Trending this week",
  description: "Top trending YouTube contents, keywords and thumbnail ideas in Bangladesh this week.",
};

export default async function TrendingPage() {
  const items = await getTrending();

  // Show only the most recent week (admins manage week_label).
  const latestWeek = items[0]?.week_label ?? null;
  const weekItems = items.filter((i) => i.week_label === latestWeek);
  const pick = (kind: string) =>
    weekItems
      .filter((i) => i.kind === kind)
      .map((i) => ({ id: i.id, title: i.title, youtube_url: i.youtube_url }));

  return (
    <TrendingView
      week={latestWeek}
      videos={pick("video")}
      keywords={pick("keyword")}
      thumbnails={pick("thumbnail_idea")}
    />
  );
}
