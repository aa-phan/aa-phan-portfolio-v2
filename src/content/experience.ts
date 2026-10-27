import { capitalOneLogo, spectrumLogo, symboticLogo } from './images'
import type { ExperienceEntry } from './schema'

/** EXP-01 to EXP-05 from 01-CONTENT-INVENTORY.md, newest first, transcribed verbatim. */
export const experience = [
  {
    id: 'capital-one',
    role: 'Software Engineer Intern',
    org: 'Capital One',
    logo: capitalOneLogo,
    location: 'Plano, TX',
    dates: { start: '2026-06', end: '2026-08', label: 'June 2026 – August 2026' },
    bullets: [
      'Engineered a real-time event-processing pipeline in Go using Kafka, Amazon SQS, and AWS Lambda to process 100K+ Auto Finance events daily within a production distributed system.',
      'Built and deployed cloud-native serverless infrastructure with AWS CloudFormation and CloudWatch, ensuring reliability and observability across critical Auto Finance services.',
      'Developed production backend microservices in Go within an Agile team, leveraging Docker, GitHub, Jenkins, and CI/CD pipelines to deliver scalable cloud applications.',
    ],
  },
  {
    id: 'spectrum',
    role: 'Network Engineer Intern',
    org: 'Spectrum',
    logo: spectrumLogo,
    location: 'Austin, TX',
    dates: { start: '2025-05', end: '2025-08', label: 'May 2025 – August 2025' },
    bullets: [
      'Coordinated installation of 8+ off-net Layer 2 devices per week with ≤ 1 hour turnaround times.',
      'Developed a Python application to standardize post-installation records, improving team efficiency by 30%.',
      'Validated Layer 2 circuit designs against customer-defined acceptance criteria before handoff to installation team.',
    ],
  },
  {
    id: 'symbotic',
    role: 'System Engineer Intern',
    org: 'Symbotic',
    logo: symboticLogo,
    location: 'Raymond, NH',
    dates: { start: '2025-01', end: '2025-05', label: 'January 2025 – May 2025' },
    bullets: [
      'Monitored automated conveyors, vertical lifts, and robotic palletizers for 8+ production lines, troubleshooting disruptions to maintain production flow.',
      'Investigated production-critical system issues and coordinated escalations with engineering and operations teams to restore equipment functionality.',
      'Developed a Python application to flag potentially unusable shipping freight, helping operations teams identify problematic SKUs for further investigation.',
    ],
  },
  {
    id: 'oddertech',
    role: 'Software Engineer Intern',
    org: 'OdderTech IT',
    dates: { start: '2023-06', end: '2023-08', label: 'June 2023 – August 2023' },
    bullets: [
      'Developed a Python application to read Wi-Fi camera feeds.',
      'Interacted with Wi-Fi camera documentation to develop cross-platform software interfaces.',
      'Utilized Linux to integrate a network-attached storage rack into business infrastructure.',
    ],
    monogram: 'OT',
  },
  {
    id: 'ut-austin',
    role: 'ITS Student Consultant I',
    org: 'The University of Texas at Austin',
    dates: { start: '2022-08', end: '2023-10', label: 'August 2022 – October 2023' },
    bullets: [
      'Assessed client needs to provide solutions and resolve technical problems.',
      'Utilized new systems and software to provide training and support to clients.',
      'Possessed a strong background in IT, excellent communication, problem-solving skills, and the ability to work independently and as part of a team.',
    ],
    monogram: 'UT',
  },
] as const satisfies readonly ExperienceEntry[]
