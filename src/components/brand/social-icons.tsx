import type { SVGProps } from "react";

/** Instagram glyph in lucide's stroke style (brand icons were removed from lucide-react v1). */
export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
    </svg>
  );
}

/** WhatsApp glyph in lucide's stroke style. */
export function WhatsappIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M3 21l1.7-5A8 8 0 1 1 8 19.3z" />
      <path d="M8.5 8.5c-.3.8 0 1.8.7 2.8a8 8 0 0 0 3.5 3c1 .5 2 .7 2.7.3.4-.2.7-.7.8-1.2.1-.3 0-.5-.2-.6l-1.8-.9c-.2-.1-.5 0-.6.2l-.4.6c-.1.2-.3.2-.5.1a6 6 0 0 1-2.5-2.5c-.1-.2 0-.4.1-.5l.6-.5c.2-.1.2-.4.1-.6l-.8-1.7c-.1-.3-.4-.3-.6-.3-.5 0-1 .3-1.4.8z" />
    </svg>
  );
}
