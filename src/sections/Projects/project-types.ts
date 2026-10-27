/** The structural shape the Projects section reads; only Page.tsx imports the content module. */
export interface ProjectRow {
  id: string
  title: string
  context: { kind: 'personal' | 'employer' | 'course' | 'hackathon'; label: string }
  dates: { label: string }
  stack: readonly string[]
  bullets: readonly string[]
  links?: { code?: string }
  writeup?: { problem: string; approach: string; outcome: string }
}
