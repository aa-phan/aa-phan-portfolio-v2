import { siteContent } from '@/content'
import { Hero } from '@/sections/Hero/Hero'
import { SectionStubs } from '@/sections/Stubs/SectionStubs'

const MAILTO = 'mailto:'

export function Page() {
  const { profile, contacts } = siteContent
  const emailLink = contacts.find((link) => link.kind === 'email')
  const email = emailLink ? emailLink.href.slice(MAILTO.length) : ''
  return (
    <main id="main">
      <Hero profile={profile} email={email} />
      <SectionStubs />
    </main>
  )
}
