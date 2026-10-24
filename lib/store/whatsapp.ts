// Builds the wa.me order link. No payments: WhatsApp CTA only.
export function buildOrderUrl(opts: {
  whatsapp: string; // digits only, from profiles.whatsapp
  storeName: string;
  productName?: string;
  price?: string;
  link?: string; // product page URL, so the seller sees exactly which product it is
}): string {
  const lines = [`Hello ${opts.storeName}!`];
  if (opts.productName) {
    lines.push(`I want to order: ${opts.productName}`);
    if (opts.price) lines.push(`Price: ${opts.price}`);
    if (opts.link) lines.push(`Link: ${opts.link}`);
  } else {
    lines.push("I have a question about your store.");
  }
  const digits = opts.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(lines.join("\n"))}`;
}
