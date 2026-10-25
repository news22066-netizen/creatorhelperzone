import { absoluteUrl } from "@/lib/site-url";

/**
 * Every WhatsApp link on the site is built here. Commerce is WhatsApp only: no checkout, no payments.
 * Page links inside a message are made with absoluteUrl(), so they always use NEXT_PUBLIC_SITE_URL
 * (see lib/site-url.ts), never window.location or a hardcoded host.
 */
export function waLink(whatsapp: string, lines: string[]): string {
  const digits = whatsapp.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(lines.join("\n"))}`;
}

/** Business store: general question, or an order for one product (path = "/alice/shop/red-shirt"). */
export function buildOrderUrl(opts: {
  whatsapp: string;
  storeName: string;
  productName?: string;
  price?: string;
  path?: string;
}): string {
  const lines = [`Hello ${opts.storeName}!`];
  if (opts.productName) {
    lines.push(`I want to order: ${opts.productName}`);
    if (opts.price) lines.push(`Price: ${opts.price}`);
    if (opts.path) lines.push(`Link: ${absoluteUrl(opts.path)}`);
  } else {
    lines.push("I have a question about your store.");
  }
  return waLink(opts.whatsapp, lines);
}

/** Creator page: say hello, or ask about one pricing plan. */
export function buildCreatorUrl(opts: {
  whatsapp: string;
  name: string;
  planName?: string;
  planPrice?: string;
  workTitle?: string;
  path?: string;
}): string {
  const lines = [`Hi ${opts.name}!`];
  if (opts.planName) {
    lines.push(`I am interested in your plan: ${opts.planName}`);
    if (opts.planPrice) lines.push(`Price: ${opts.planPrice}`);
  } else if (opts.workTitle) {
    lines.push(`I saw your work "${opts.workTitle}" and would like to talk about it.`);
  } else {
    lines.push("I found you on CreatorHub BD.");
  }
  if (opts.path) lines.push(`Link: ${absoluteUrl(opts.path)}`);
  return waLink(opts.whatsapp, lines);
}
