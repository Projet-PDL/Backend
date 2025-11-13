import axios from 'axios';
import {
  MissingBrightDataKeyError,
  BrightDataApiError,
  ProfileNotFoundError,
  LinkedInScrapingError,
} from '../errors/linkedin';

const BRIGHTDATA_API_TOKEN = process.env.BRIGHTDATA_API_KEY;
const BRIGHTDATA_ENDPOINT = 'https://api.brightdata.com/datasets/v3/scrape?dataset_id=gd_l1viktl72bvl7bjuj0&notify=false&include_errors=true';

interface LinkedInProfile {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  about?: string;
  city?: string;
  country_code?: string;
  location?: string;
  experience?: LinkedInExperience[];
  education?: LinkedInEducation[];
  languages?: LinkedInLanguage[];
  certifications?: LinkedInCertification[];
  volunteer_experience?: LinkedInVolunteerExperience[];
  publications?: LinkedInPublication[];
  projects?: LinkedInProject[];
  bio_links?: LinkedInBioLink[];
  url?: string;
  [key: string]: any;
}

interface LinkedInExperience {
  title?: string;
  company?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  description_html?: string;
  positions?: LinkedInExperience[];
  [key: string]: any;
}

interface LinkedInEducation {
  title?: string;
  degree?: string;
  field?: string;
  start_year?: string;
  end_year?: string;
  description?: string;
  [key: string]: any;
}

interface LinkedInLanguage {
  title?: string;
  subtitle?: string;
  [key: string]: any;
}

interface LinkedInCertification {
  title?: string;
  subtitle?: string;
  meta?: string;
  credential_url?: string;
  credential_id?: string;
  [key: string]: any;
}

interface LinkedInVolunteerExperience {
  title?: string;
  subtitle?: string;
  cause?: string;
  [key: string]: any;
}

interface LinkedInPublication {
  title?: string;
  [key: string]: any;
}

interface LinkedInProject {
  title?: string;
  [key: string]: any;
}

interface LinkedInBioLink {
  title?: string;
  link?: string;
  [key: string]: any;
}

function looksLikeProfile(o: any): boolean {
  if (!o || typeof o !== 'object') return false;
  return Boolean(o.id || o.name || o.first_name || o.last_name || o.position || o.experience || o.education);
}

function findLinkedInProfile(obj: any): LinkedInProfile | null {
  if (!obj) return null;
  if (looksLikeProfile(obj)) return obj;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findLinkedInProfile(item);
      if (found) return found;
    }
    return null;
  }
  const containerKeys = ['data', 'result', 'results', 'profile', 'profiles', 'items', 'output', 'response', 'body'];
  for (const k of containerKeys) {
    if (obj[k]) {
      const found = findLinkedInProfile(obj[k]);
      if (found) return found;
    }
  }
  for (const val of Object.values(obj)) {
    const found = findLinkedInProfile(val);
    if (found) return found;
  }
  return null;
}

export async function scrapeLinkedInProfile(linkedInUrl: string): Promise<LinkedInProfile> {
  if (!BRIGHTDATA_API_TOKEN) {
    throw new MissingBrightDataKeyError();
  }

  const payload = {
    input: [{ url: linkedInUrl }]
  };

  try {
    const response = await axios.post(BRIGHTDATA_ENDPOINT, payload, {
      headers: {
        'Authorization': `Bearer ${BRIGHTDATA_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });

    const profile = findLinkedInProfile(response.data);
    if (!profile) {
      throw new ProfileNotFoundError(linkedInUrl);
    }

    return profile;
  } catch (err: any) {
    if (err instanceof MissingBrightDataKeyError || err instanceof ProfileNotFoundError) {
      throw err;
    }
    if (err.response) {
      throw new BrightDataApiError(err.response.status, err.response.data);
    }
    throw new LinkedInScrapingError(
      `Failed to scrape LinkedIn profile: ${err.message}`,
      { originalError: err.message, url: linkedInUrl }
    );
  }
}

export async function mockScrapeLinkedInProfile(linkedInUrl: string): Promise<LinkedInProfile> {
  return {
    id: 'mock-profile',
    name: 'Mock User',
    first_name: 'Mock',
    last_name: 'User',
    position: 'Mock Position',
    about: 'This is mock LinkedIn data used for local development.',
    city: 'Mock City',
    country_code: 'MC',
    location: 'Mock City, Wonderland',
    experience: [],
    education: [],
    languages: [],
    certifications: [],
    volunteer_experience: [],
    publications: [],
    projects: [],
    bio_links: [],
    url: linkedInUrl,
  };
}

export default { scrapeLinkedInProfile , mockScrapeLinkedInProfile };
