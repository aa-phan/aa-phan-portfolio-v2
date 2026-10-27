import type { ComponentType } from 'react'
import { DownloadIcon } from '@/components/ui/icons/DownloadIcon'
import { GitHubIcon } from '@/components/ui/icons/GitHubIcon'
import { InstagramIcon } from '@/components/ui/icons/InstagramIcon'
import { LinkedInIcon } from '@/components/ui/icons/LinkedInIcon'
import { useCopyEmail } from '@/components/ui/useCopyEmail'
import { Section } from '@/layout/Section'

interface ContactLinkItem {
  kind: 'email' | 'github' | 'linkedin' | 'instagram'
  label: string
  href: string
  external: boolean
  ariaLabel?: string
}

interface ContactProps {
  email: string
  links: readonly ContactLinkItem[]
}

const GLYPHS: Record<ContactLinkItem['kind'], ComponentType<{ className?: string }> | undefined> = {
  email: undefined,
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  instagram: InstagramIcon,
}

const LINK_CLASS = 'contact-link inline-flex min-h-11 items-center gap-2 text-s font-medium'

/**
 * Contact Me is the finale (D-12). The address is the button: one tap copies it and the toast
 * confirms (NAV-03). The button's accessible name is 'Copy email address aaron.phan240@gmail.com'
 * (the address comes from the contacts content). The four channel links are utility links (color and underline thickness
 * only, D-05). Its minimum height plus the footer's fills one viewport, so the wordmark below
 * is the last frame of the page.
 */
export function Contact({ email, links }: ContactProps) {
  const copyEmail = useCopyEmail(email)
  return (
    <Section id="contact" title="Contact Me" mood="tight" className="contact-section">
      <div className="poster-grid mt-12 md:mt-16">
        <p className="col-span-full text-body text-muted">The fastest way to reach me is email.</p>
        <button
          type="button"
          onClick={copyEmail}
          aria-label={`Copy email address ${email}`}
          className="cta relative isolate col-span-full cursor-pointer justify-self-start overflow-hidden rounded-pill px-4 py-2 text-start text-text md:col-span-7"
        >
          <span className="cta-flood" aria-hidden="true" />
          <span className="cta-label block">
            <span className="contact-copy-hint block text-s">Copy email</span>
            <span className="contact-address block whitespace-nowrap underline decoration-2 underline-offset-4">
              {email}
            </span>
          </span>
        </button>
        <ul className="col-span-full flex flex-col md:col-span-5 md:col-start-8 md:flex-row md:flex-wrap md:justify-end md:gap-x-6">
          {links.map((link) => {
            const Glyph = GLYPHS[link.kind]
            const describedBy = link.ariaLabel && link.external ? `${link.kind}-new-tab` : undefined
            return (
              <li key={link.kind}>
                <a
                  href={link.href}
                  className={LINK_CLASS}
                  aria-label={link.ariaLabel}
                  aria-describedby={describedBy}
                  {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {Glyph ? <Glyph /> : null}
                  <span>{link.label}</span>
                  {link.external && !link.ariaLabel ? (
                    <span className="sr-only"> (opens in a new tab)</span>
                  ) : null}
                </a>
                {describedBy ? (
                  <span id={describedBy} className="sr-only">
                    (opens in a new tab)
                  </span>
                ) : null}
              </li>
            )
          })}
          <li>
            <a href={`${import.meta.env.BASE_URL}resume.pdf`} download className={LINK_CLASS}>
              <DownloadIcon />
              <span>Resume</span>
            </a>
          </li>
        </ul>
      </div>
    </Section>
  )
}
