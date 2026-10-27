import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// The poster type ladder and radius rule use custom utility names (text-mega, text-l, text-body,
// rounded-hold ...). Teach tailwind-merge that they are sizes and radii, otherwise it reads
// `text-l` as a text color and drops it when `text-muted` is merged in.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['mega', 'xl', 'l', 'm', 'body', 's', 'xs'] }],
      rounded: [{ rounded: ['hold', 'panel', 'pill'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
