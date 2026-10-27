import { contacts } from './contacts'
import { experience } from './experience'
import { profile } from './profile'
import { projects } from './projects'

export type {
  ContactLink,
  DateRange,
  EducationEntry,
  ExperienceEntry,
  ImageAsset,
  Profile,
  Project,
  SkillGroup,
  Writeup,
} from './schema'

export const siteContent = { profile, contacts, experience, projects }
