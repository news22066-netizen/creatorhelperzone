import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { blogPosts } from "@/lib/data/blog";
import { getGuides, getTools } from "@/lib/data/public";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tools, guides] = await Promise.all([getTools(), getGuides()]);

  return [
    { url: SITE_URL },
    { url: `${SITE_URL}/tools` },
    { url: `${SITE_URL}/trending` },
    { url: `${SITE_URL}/guides` },
    { url: `${SITE_URL}/faq` },
    ...["about", "contact", "help", "blog", "privacy", "terms", "cookies"].map((p) => ({
      url: `${SITE_URL}/${p}`,
    })),
    ...blogPosts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: new Date(p.date) })),
    ...tools
      .filter((t) => t.slug)
      .map((t) => ({ url: `${SITE_URL}/tools/${t.slug}`, lastModified: new Date(t.created_at) })),
    ...guides.map((g) => ({
      url: `${SITE_URL}/guides/${g.slug}`,
      lastModified: new Date(g.updated_at),
    })),
  ];
}
