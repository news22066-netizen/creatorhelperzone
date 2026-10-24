import type { ReactNode } from "react";
import { isHttpUrl } from "@/lib/utils/validate";

/**
 * Tiny, dependency-free markdown subset for admin-written tool articles.
 * Supported: `## h2`, `### h3`, paragraphs, `- ` / `* ` bullet lists,
 * `1. ` numbered lists, **bold**, and [text](https://link).
 *
 * Output is plain React elements (no dangerouslySetInnerHTML), and links are
 * limited to http(s), so admin-authored content cannot inject script.
 *
 * FAQ convention: a `## FAQ` (or `## Frequently Asked Questions`) section whose
 * `### Question` headings are followed by the answer text is pulled out of the
 * article and returned separately so the page can render it as an FAQ block
 * (and emit FAQPage structured data).
 */

type Block =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "p"; text: string };

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface ParsedToolContent {
  body: Block[];
  faqs: FaqEntry[];
}

const FAQ_HEADING_RE = /^(faq|faqs|frequently asked questions)\??$/i;
const UL_RE = /^[-*]\s+/;
const OL_RE = /^\d+[.)]\s+/;

function tokenize(content: string): Block[] {
  const blocks: Block[] = [];
  const chunks = content.replace(/\r\n?/g, "\n").split(/\n{2,}/);

  for (const raw of chunks) {
    const chunk = raw.trim();
    if (!chunk) continue;
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);

    // Headings can sit directly above text without a blank line; peel them off.
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (line.startsWith("### ")) {
        blocks.push({ type: "h3", text: line.slice(4).trim() });
        i++;
      } else if (line.startsWith("## ")) {
        blocks.push({ type: "h2", text: line.slice(3).trim() });
        i++;
      } else if (UL_RE.test(line) || OL_RE.test(line)) {
        const ordered = OL_RE.test(line);
        const re = ordered ? OL_RE : UL_RE;
        const items: string[] = [];
        while (i < lines.length && re.test(lines[i])) {
          items.push(lines[i].replace(re, ""));
          i++;
        }
        blocks.push({ type: ordered ? "ol" : "ul", items });
      } else {
        const para: string[] = [];
        while (
          i < lines.length &&
          !lines[i].startsWith("## ") &&
          !lines[i].startsWith("### ") &&
          !UL_RE.test(lines[i]) &&
          !OL_RE.test(lines[i])
        ) {
          para.push(lines[i]);
          i++;
        }
        blocks.push({ type: "p", text: para.join(" ") });
      }
    }
  }
  return blocks;
}

function blockToPlain(b: Block): string {
  if (b.type === "ul" || b.type === "ol") return b.items.map(stripInline).join("; ");
  return stripInline(b.text);
}

function stripInline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, "$1");
}

export function parseToolContent(content: string): ParsedToolContent {
  const blocks = tokenize(content);
  const body: Block[] = [];
  const faqs: FaqEntry[] = [];

  let inFaq = false;
  let current: { question: string; parts: string[] } | null = null;
  const flush = () => {
    if (current && current.parts.length) {
      faqs.push({ question: current.question, answer: current.parts.join(" ") });
    }
    current = null;
  };

  for (const b of blocks) {
    if (b.type === "h2") {
      flush();
      inFaq = FAQ_HEADING_RE.test(b.text);
      if (!inFaq) body.push(b);
      continue;
    }
    if (!inFaq) {
      body.push(b);
      continue;
    }
    if (b.type === "h3") {
      flush();
      current = { question: stripInline(b.text), parts: [] };
    } else if (current) {
      (current as { parts: string[] }).parts.push(blockToPlain(b));
    }
  }
  flush();

  return { body, faqs };
}

function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(<strong key={key++}>{m[1]}</strong>);
    } else if (isHttpUrl(m[3])) {
      out.push(
        <a
          key={key++}
          href={m[3]}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="font-semibold text-brand-deep underline decoration-brand-light decoration-2 underline-offset-2 hover:decoration-brand"
        >
          {m[2]}
        </a>
      );
    } else {
      out.push(m[0]);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function renderBlocks(blocks: Block[]): ReactNode[] {
  return blocks.map((b, i) => {
    switch (b.type) {
      case "h2":
        return (
          <h2 key={i} className="mt-5 font-sans text-xl font-extrabold leading-snug text-brand-ink">
            {renderInline(b.text)}
          </h2>
        );
      case "h3":
        return (
          <h3 key={i} className="mt-3 font-sans text-lg font-bold text-brand-ink">
            {renderInline(b.text)}
          </h3>
        );
      case "ul":
        return (
          <ul key={i} className="list-disc space-y-1.5 pl-5 text-gray-800 marker:text-brand">
            {b.items.map((it, j) => (
              <li key={j}>{renderInline(it)}</li>
            ))}
          </ul>
        );
      case "ol":
        return (
          <ol key={i} className="list-decimal space-y-1.5 pl-5 text-gray-800 marker:text-brand">
            {b.items.map((it, j) => (
              <li key={j}>{renderInline(it)}</li>
            ))}
          </ol>
        );
      default:
        return (
          <p key={i} className="text-gray-800">
            {renderInline(b.text)}
          </p>
        );
    }
  });
}
