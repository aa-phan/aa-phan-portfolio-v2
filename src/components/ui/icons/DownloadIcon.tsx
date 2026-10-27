/** Arrow-to-tray glyph for the Resume download link. Decorative: a text label sits beside it. */
export function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />
    </svg>
  )
}
