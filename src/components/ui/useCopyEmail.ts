import { useCallback } from 'react'
import { COPY_FALLBACK, COPY_SUCCESS, copyText, openMail } from '@/lib/copy'
import { useToast } from '@/components/ui/useToast'

/**
 * Click handler for the hero Copy email link. It copies the address and confirms it, or says it
 * could not and opens the mail app. The link keeps its mailto href, so without JavaScript the
 * default action still works.
 */
export function useCopyEmail(address: string) {
  const { show } = useToast()
  return useCallback(
    async (event?: { preventDefault(): void }) => {
      event?.preventDefault()
      if (await copyText(address)) {
        show(COPY_SUCCESS)
      } else {
        show(COPY_FALLBACK)
        openMail(`mailto:${address}`)
      }
    },
    [address, show],
  )
}
