import type { ContactLink } from './schema'

export const contacts = [
  {
    kind: 'email',
    label: 'Email',
    href: 'mailto:aaron.phan240@gmail.com',
    external: false,
  },
  {
    kind: 'github',
    label: 'GitHub',
    href: 'https://github.com/aa-phan',
    external: true,
  },
  {
    kind: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/aa-phan/',
    external: true,
  },
  {
    kind: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/phvntm_',
    external: true,
    ariaLabel: 'Instagram, PHVNTM',
  },
] as const satisfies readonly ContactLink[]
