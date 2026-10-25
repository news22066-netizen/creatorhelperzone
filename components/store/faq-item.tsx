import type { StoreFaq } from "@/types/store";

/** Native <details>: no client JS, keyboard accessible. */
export function FaqItem({ faq }: { faq: StoreFaq }) {
  return (
    <details className="group border-b border-store-text/10 py-2 last:border-b-0">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold marker:content-none [&::-webkit-details-marker]:hidden">
        {faq.question}
        <span aria-hidden="true" className="text-lg leading-none transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="whitespace-pre-line pb-1 text-sm leading-relaxed text-store-text/80">{faq.answer}</p>
    </details>
  );
}
