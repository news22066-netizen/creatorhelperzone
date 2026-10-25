import type { Metadata } from "next";
import { getTools } from "@/lib/data/public";
import { ToolDirectory } from "@/components/public/tool-directory";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Free Tools for Creators",
  description: "Hand-picked free tools for Bangladeshi content creators and small businesses.",
};

export default async function ToolsPage() {
  const tools = await getTools();
  return <ToolDirectory tools={tools} />;
}
