import { siteContent } from '@/content'
import { useActiveSection } from '@/hooks/useActiveSection'
import { SECTION_IDS } from '@/layout/nav-items'
import { PillNav } from '@/layout/PillNav'
import { SiteHeader } from '@/layout/SiteHeader'
import { About } from '@/sections/About/About'
import { Experience } from '@/sections/Experience/Experience'
import { Hero } from '@/sections/Hero/Hero'
import { Projects } from '@/sections/Projects/Projects'
import { SectionStubs } from '@/sections/Stubs/SectionStubs'

const MAILTO = 'mailto:'

export function Page() {
  const { profile, contacts } = siteContent
  const emailLink = contacts.find((link) => link.kind === 'email')
  const email = emailLink ? emailLink.href.slice(MAILTO.length) : ''
  // The one scroll-spy. It feeds the desktop nav and the phone pill.
  const { activeId, lockTo } = useActiveSection(SECTION_IDS)
  return (
    <>
      <SiteHeader activeId={activeId} onNavigate={lockTo} />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero profile={profile} email={email} />
        <Experience entries={siteContent.experience} />
        <Projects projects={siteContent.projects} />
        <About profile={profile} />
        <SectionStubs />
      </main>
      <PillNav activeId={activeId} onNavigate={lockTo} />
    </>
  )
}
