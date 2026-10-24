export const CURRENCIES = ["BDT", "USD"] as const;

const SYMBOL: Record<string, string> = { BDT: "৳", USD: "$" };

/**
 * "৳1,200" / "$12.50". Done by hand instead of Intl currency style, because the Bangla-locale symbol
 * differs between runtimes (some print "BDT 1,200" with a non-breaking space), and this text is also
 * copied into the WhatsApp order message, where it must be the same everywhere.
 */
export function formatPrice(price: number, currency: string): string {
  const n = Number.isFinite(price) ? price : 0;
  const body = n.toLocaleString("en-US", {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  const symbol = SYMBOL[currency];
  return symbol ? `${symbol}${body}` : `${body} ${currency}`;
}
