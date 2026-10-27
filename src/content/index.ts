import { contacts } from './contacts'
import { profile } from './profile'

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

export const siteContent = { profile, contacts }
