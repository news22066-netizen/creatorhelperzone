/**
 * Blog posts. Static for now: add an entry here to publish a post.
 * Later this can be swapped for a Supabase query without touching the pages.
 */
export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO yyyy-mm-dd
  readingMinutes: number;
  sample?: boolean;
  body: string[]; // paragraphs
};

export const blogPosts: BlogPost[] = [
  {
    slug: "welcome-to-creatorhub-bd",
    title: "Welcome to BFEED",
    excerpt: "Why we are building one free place for Bangladeshi creators, and what is coming next.",
    date: "2026-10-01",
    readingMinutes: 2,
    sample: true,
    body: [
      "BFEED is a free home for Bangladeshi creators and small businesses: free tools, practical guides, and your own public page where your links, products and classes live together.",
      "This is a sample post so the blog structure is ready. Real posts will cover growing an audience, selling online in Bangladesh, and new features as we ship them.",
    ],
  },
  {
    slug: "how-to-set-up-your-public-page",
    title: "How to set up your public page in 5 minutes",
    excerpt: "A quick walkthrough: pick a username, add your links, and share your page.",
    date: "2026-10-08",
    readingMinutes: 3,
    sample: true,
    body: [
      "Create an account, choose a username, and add the links you want people to see: your YouTube channel, Facebook page, WhatsApp, or a shop.",
      "This is a sample post. A full step-by-step guide with screenshots will replace it.",
    ],
  },
];

export function getPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}
