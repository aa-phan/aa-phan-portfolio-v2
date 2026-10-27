/** One responsive image. An empty alt string marks the image as decorative. */
export interface ImageAsset {
  src: string
  alt: string
  width: number
  height: number
  sources?: { avif?: string; webp?: string }
}

/** ISO year-month strings. `end` may be the literal 'present'. `label` is the display form. */
export interface DateRange {
  start: string
  end: string
  label: string
}

export interface ContactLink {
  kind: 'email' | 'github' | 'linkedin' | 'instagram'
  label: string
  href: string
  external: boolean
  ariaLabel?: string
}

export interface Profile {
  name: string
  tagline: string
  heroFacts: readonly [string, string]
  bio: readonly string[]
  quote?: string
  photo?: ImageAsset
}

export interface ExperienceEntry {
  id: string
  role: string
  org: string
  location?: string
  dates: DateRange
  bullets: readonly string[]
  logo?: ImageAsset
  monogram?: string
}

export interface Writeup {
  problem: string
  approach: string
  outcome: string
}

export interface Project {
  id: string
  title: string
  context: { kind: 'personal' | 'employer' | 'course' | 'hackathon'; label: string }
  dates: DateRange
  stack: readonly string[]
  bullets: readonly string[]
  relatedExperienceId?: string
  featured: boolean
  links?: { code?: string }
  writeup?: Writeup
}

export interface EducationEntry {
  id: string
  degree: string
  school: string
  location: string
  dates: DateRange
  gpa: string
  track?: string
}

export interface SkillGroup {
  id: string
  label: string
  items: readonly string[]
}
