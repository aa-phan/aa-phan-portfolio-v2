import type { EducationEntry } from './schema'

/** EDU-01 and EDU-02 from 01-CONTENT-INVENTORY.md, current study first. */
export const education = [
  {
    id: 'ut-austin',
    degree: 'Bachelor of Science in Electrical & Computer Engineering',
    school: 'The University of Texas at Austin',
    location: 'Austin, TX',
    dates: { start: '2022-08', end: '2026-12', label: 'August 2022 – December 2026' },
    gpa: '3.2',
    track: 'Data Science',
  },
  {
    id: 'dawson-high',
    degree: 'High School Diploma',
    school: 'Glenda Dawson High School',
    location: 'Pearland, TX',
    dates: { start: '2022-05', end: '2022-05', label: 'May 2022' },
    gpa: '3.911',
  },
] as const satisfies readonly EducationEntry[]
