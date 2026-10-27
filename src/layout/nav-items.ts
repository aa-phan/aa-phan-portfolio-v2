/** Every anchored section of the page, in DOM order. The hero has an anchor but no nav link. */
export const SECTION_IDS = [
  'hero',
  'experience',
  'projects',
  'about',
  'skills',
  'education',
  'contact',
] as const

export type SectionId = (typeof SECTION_IDS)[number]

export interface NavItem {
  id: Exclude<SectionId, 'hero'>
  /** Short label for the desktop bar. */
  label: string
  /** Full label for the phone menu panel. */
  panelLabel: string
}

export const NAV_ITEMS = [
  { id: 'experience', label: 'Experience', panelLabel: 'Experience' },
  { id: 'projects', label: 'Projects', panelLabel: 'Projects' },
  { id: 'about', label: 'About', panelLabel: 'About Me' },
  { id: 'skills', label: 'Skills', panelLabel: 'Skills' },
  { id: 'education', label: 'Education', panelLabel: 'Education' },
  { id: 'contact', label: 'Contact', panelLabel: 'Contact Me' },
] as const satisfies readonly NavItem[]
