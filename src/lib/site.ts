import TOML from 'smol-toml'
import siteRaw from '../../website.toml?raw'
import type { PublicationsData } from './pure'

export interface SiteLink {
  label?: string
  url?: string
}

export interface ProfileData {
  name?: string
  image?: string
  contact?: string
  affiliation?: string
  section?: string
  role?: string
  headline?: string
  affiliationLong?: string
  bio?: { en?: string }
  links?: SiteLink[]
}

export interface ResearchArea {
  discipline?: string
  field?: string
  keywords?: string
}

export interface ResearchData {
  interests?: string[]
  areas?: ResearchArea[]
}

export interface CvEntry {
  title?: string
  detail?: string
  organization?: string
  range?: string
  year?: string
  date?: string
  field?: string
  degree?: string
  school?: string
  department?: string
  affiliation?: string
  section?: string
  role?: string
  system?: string
  category?: string
  amount?: string
  url?: string
  name?: string
}

export interface TeachingItem {
  course?: string
  period?: string
}

export interface TeachingEntry {
  role?: string
  institution?: string
  items?: TeachingItem[]
}

export interface CvData {
  supervisors?: string[]
  financialSupport?: CvEntry[]
  physicalSkills?: CvEntry[]
  certifications?: CvEntry[]
  socialContributions?: CvEntry[]
  acknowledgements?: CvEntry[]
  academicWork?: CvEntry[]
  nonAcademicWork?: CvEntry[]
  teaching?: TeachingEntry[]
  education?: CvEntry[]
  experience?: CvEntry[]
  projects?: CvEntry[]
  awards?: CvEntry[]
}

export interface SiteData {
  title?: string
  profile?: ProfileData
  research?: ResearchData
  cv?: CvData
  publications?: PublicationsData
}

export type {
  PublicationItem,
  PublicationsData,
  PreparedPublicationItem,
  PreparedPublications,
  PublicationGroup,
} from './pure'
export { slugify, preparePublications } from './pure'

export const site = TOML.parse(siteRaw) as unknown as SiteData
