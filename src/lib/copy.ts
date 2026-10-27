/** Shown in the live region and the toast when the address reached the clipboard. */
export const COPY_SUCCESS = 'Email copied to clipboard'

/** Shown when nothing could be copied and the mail app is opened instead (U+2019 apostrophe). */
export const COPY_FALLBACK = 'Couldn’t copy the address. Opening your mail app instead.'

/** Last-resort copy through a read-only off-screen textarea. */
function execCommandCopy(text: string): boolean {
  if (typeof document === 'undefined' || typeof document.execCommand !== 'function') return false
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.setAttribute('aria-hidden', 'true')
  area.style.position = 'fixed'
  area.style.top = '0'
  area.style.left = '-9999px'
  area.style.opacity = '0'
  document.body.appendChild(area)
  try {
    area.select()
    return document.execCommand('copy') === true
  } catch {
    // execCommand missing or blocked: report failure so the caller can open mail instead.
    return false
  } finally {
    area.remove()
  }
}

/**
 * Write `text` to the clipboard. The Clipboard API goes first, the execCommand fallback second,
 * and the result is false when both fail. The site only writes the public address from a click
 * handler and never reads the clipboard.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Permission denied or insecure context: fall through to the legacy path.
  }
  return execCommandCopy(text)
}

/** Open the visitor's mail app. */
export function openMail(href: string): void {
  window.location.href = href
}
