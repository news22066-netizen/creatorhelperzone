/** Brand icons lucide does not ship (TikTok, X). currentColor, so they follow the surrounding text colour. */
export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.6 3c.3 2.3 1.7 3.9 3.9 4.1v3.1c-1.4.1-2.7-.3-3.9-1.1v6.2c0 3.4-2.4 5.7-5.5 5.7A5.4 5.4 0 0 1 5.7 15c0-3.3 2.8-5.8 6.2-5.3v3.2c-1.6-.5-3 .6-3 2.1 0 1.2.9 2.2 2.2 2.2 1.4 0 2.3-.9 2.3-2.5V3h3.2Z" />
    </svg>
  );
}

export function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.7 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.7 3Zm-1.1 16.2h1.7L7.5 4.7H5.7l10.9 14.5Z" />
    </svg>
  );
}
