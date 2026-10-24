import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProsePage } from "@/components/public/prose-page";
import { blogPosts, getPost } from "@/lib/data/blog";
import { formatDate } from "@/lib/utils/format";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <ProsePage title={post.title} intro={`${formatDate(post.date)} · ${post.readingMinutes} min read`}>
      {post.body.map((para, i) => (
        <p key={i}>{para}</p>
      ))}
      <p>
        <Link href="/blog">Back to all posts</Link>
      </p>
    </ProsePage>
  );
}
