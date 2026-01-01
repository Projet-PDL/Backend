import { CVMappingError } from '../errors/linkedin';

type ISODateString = string;

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
  skills?: LinkedInSkill[];
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

interface LinkedInSkill {
  title?: string;
  name?: string;
  [key: string]: any;
}

function parseLinkedInDate(dateStr: string | undefined | null): ISODateString | null {
  if (!dateStr) return null;
  if (dateStr.toLowerCase() === 'present') return null;
  
  const yearMatch = dateStr.match(/\d{4}/);
  if (!yearMatch) return null;
  const year = yearMatch[0];
  
  const monthMap: { [key: string]: string } = {
    jan: '01', feb: '02', mar: '03', apr: '04',
    may: '05', jun: '06', jul: '07', aug: '08',
    sep: '09', oct: '10', nov: '11', dec: '12'
  };
  
  const lowerDate = dateStr.toLowerCase();
  let month = '01';
  
  for (const [abbr, num] of Object.entries(monthMap)) {
    if (lowerDate.includes(abbr)) {
      month = num;
      break;
    }
  }
  
  return `${year}-${month}-01T00:00:00.000Z`;
}

function extractCertificationDate(meta: string | undefined): ISODateString | null {
  if (!meta) return null;
  const issuedMatch = meta.match(/Issued\s+(.+)/i);
  if (issuedMatch) {
    return parseLinkedInDate(issuedMatch[1]);
  }
  return null;
}

function generateId(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export interface CVData {
  title: string | null;
  profileInfo: {
    firstName: string | null;
    lastName: string | null;
    headline: string | null;
    professionalSummary: string | null;
    email: string | null;
    phone: string | null;
    street: string | null;
    city: string | null;
    postalCode: string | null;
    region: string | null;
    country: string | null;
    websiteUrl: string | null;
  };
  experiences: Array<{
    title: string | null;
    company: string | null;
    location: string | null;
    startDate: ISODateString | null;
    endDate: ISODateString | null;
    isCurrent: boolean | null;
    description: string | null;
    position: number | null;
  }>;
  skills: Array<{
    skillName: string;
    position: number | null;
  }>;
  certifications: Array<{
    name: string;
    issuer: string | null;
    issueDate: ISODateString | null;
    expirationDate: ISODateString | null;
    credentialUrl: string | null;
    position: number | null;
  }>;
  interests: Array<{
    name: string;
    category: string | null;
    source: string | null;
    position: number | null;
  }>;
  languages: Array<{
    languageName: string;
    proficiencyLevel: string | null;
    position: number | null;
  }>;
  educations: Array<{
    school: string | null;
    degree: string | null;
    fieldOfStudy: string | null;
    startDate: ISODateString | null;
    endDate: ISODateString | null;
    description: string | null;
    position: number | null;
  }>;
}

export function mapLinkedInToCV(linkedInData: LinkedInProfile): CVData {
  try {
    if (!linkedInData) {
      throw new CVMappingError('LinkedIn data is null or undefined');
    }

  const profileInfo = {
    firstName: linkedInData.first_name ?? null,
    lastName: linkedInData.last_name ?? null,
    headline: linkedInData.position ?? null,
    professionalSummary: linkedInData.about ?? null,
    email: null,
    phone: null,
    street: null,
    city: linkedInData.city ?? linkedInData.location ?? null,
    postalCode: null,
    region: null,
    country: linkedInData.country_code ?? null,
    websiteUrl: linkedInData.bio_links?.[0]?.link ?? linkedInData.url ?? null,
  };
  
  const experiences: CVData['experiences'] = [];
  let expPosition = 0;
  
  if (linkedInData.experience) {
    for (const exp of linkedInData.experience) {
      if (exp.positions && exp.positions.length > 0) {
        for (const position of exp.positions) {
          experiences.push({
            title: position.title ?? null,
            company: exp.company ?? null,
            location: position.location ?? exp.location ?? null,
            startDate: parseLinkedInDate(position.start_date),
            endDate: parseLinkedInDate(position.end_date),
            isCurrent: position.end_date?.toLowerCase() === 'present',
            description: position.description ?? position.description_html ?? null,
            position: expPosition++,
          });
        }
      } else {
        experiences.push({
          title: exp.title ?? null,
          company: exp.company ?? null,
          location: exp.location ?? null,
          startDate: parseLinkedInDate(exp.start_date),
          endDate: parseLinkedInDate(exp.end_date),
          isCurrent: exp.end_date?.toLowerCase() === 'present',
          description: exp.description ?? exp.description_html ?? null,
          position: expPosition++,
        });
      }
    }
  }
  
  const skills: CVData['skills'] = [];
  if (linkedInData.skills && Array.isArray(linkedInData.skills)) {
    linkedInData.skills.forEach((skill, index) => {
      const skillName = skill.title || skill.name || 'Unnamed Skill';
      skills.push({
        skillName: skillName,
        position: index,
      });
    });
  }
  
  const certifications: CVData['certifications'] = [];
  if (linkedInData.certifications) {
    linkedInData.certifications.forEach((cert, index) => {
      certifications.push({
        name: cert.title ?? 'Unnamed Certification',
        issuer: cert.subtitle ?? null,
        issueDate: extractCertificationDate(cert.meta),
        expirationDate: null,
        credentialUrl: cert.credential_url ?? null,
        position: index,
      });
    });
  }
  
  const interests: CVData['interests'] = [];
  let interestPosition = 0;
  
  if (linkedInData.volunteer_experience) {
    linkedInData.volunteer_experience.forEach((vol) => {
      interests.push({
        name: vol.title ?? 'Volunteer Work',
        category: vol.cause ?? 'Volunteer',
        source: 'volunteer',
        position: interestPosition++,
      });
    });
  }
  
  if (linkedInData.publications) {
    linkedInData.publications.forEach((pub) => {
      interests.push({
        name: pub.title ?? 'Publication',
        category: 'Research',
        source: 'publication',
        position: interestPosition++,
      });
    });
  }
  
  if (linkedInData.projects) {
    linkedInData.projects.forEach((proj) => {
      interests.push({
        name: proj.title ?? 'Project',
        category: 'Project',
        source: 'project',
        position: interestPosition++,
      });
    });
  }
  
  const languages: CVData['languages'] = [];
  if (linkedInData.languages) {
    linkedInData.languages.forEach((lang, index) => {
      languages.push({
        languageName: lang.title ?? 'Unknown Language',
        proficiencyLevel: lang.subtitle ?? null,
        position: index,
      });
    });
  }
  
  const educations: CVData['educations'] = [];
  if (linkedInData.education) {
    linkedInData.education.forEach((edu, index) => {
      educations.push({
        school: edu.title ?? null,
        degree: edu.degree ?? null,
        fieldOfStudy: edu.field ?? null,
        startDate: parseLinkedInDate(edu.start_year),
        endDate: parseLinkedInDate(edu.end_year),
        description: edu.description ?? null,
        position: index,
      });
    });
  }
  
  const cv: CVData = {
    title: `${linkedInData.first_name ?? ''} ${linkedInData.last_name ?? ''}`.trim() || null,
    profileInfo,
    experiences,
    skills,
    certifications,
    interests,
    languages,
    educations,
  };
  
  return cv;
  } catch (error: any) {
    if (error instanceof CVMappingError) {
      throw error;
    }
    throw new CVMappingError(
      `Failed to map LinkedIn data: ${error.message}`,
      { originalError: error.message, dataKeys: Object.keys(linkedInData || {}) }
    );
  }
}

export const mockCV: CVData = {
  title: "Software Engineer & Full-Stack Developer",
  profileInfo: {
    firstName: "Manel",
    lastName: "Goudjil",
    headline: "Computer Science Student | Full-Stack Developer | Open Source Contributor",
    professionalSummary: "Passionate Computer Science student with 3+ years of hands-on experience in full-stack development. Specialized in building scalable web applications using modern JavaScript frameworks and cloud technologies. Strong problem-solving skills with a focus on clean code and user-centric design. Actively contributing to open-source projects and seeking opportunities to apply cutting-edge technologies in real-world solutions.",
    email: "manel.goudjil@email.com",
    phone: "+33 6 12 34 56 78",
    street: "15 Rue de la République",
    city: "Rennes",
    postalCode: "35000",
    region: "Brittany",
    country: "France",
    websiteUrl: "https://manel-dev.portfolio.com"
  },
  experiences: [
    {
      title: "Full-Stack Developer Intern",
      company: "TechVision Solutions",
      location: "Rennes, France",
      startDate: "2024-06-01T00:00:00.000Z",
      endDate: null,
      isCurrent: true,
      description: "Developing and maintaining web applications using React, Node.js, and PostgreSQL. Implemented RESTful APIs serving 10,000+ daily users. Collaborated with cross-functional teams in an Agile environment. Reduced application load time by 40% through code optimization and caching strategies.",
      position: 1
    },
    {
      title: "Junior Web Developer",
      company: "Digital Innovations Lab",
      location: "Remote",
      startDate: "2023-01-15T00:00:00.000Z",
      endDate: "2024-05-31T00:00:00.000Z",
      isCurrent: false,
      description: "Built responsive web interfaces using Vue.js and Tailwind CSS. Integrated third-party APIs including payment gateways and authentication services. Participated in code reviews and implemented unit testing with Jest. Maintained documentation for development workflows and API endpoints.",
      position: 2
    },
    {
      title: "Teaching Assistant - Introduction to Programming",
      company: "University of Rennes",
      location: "Rennes, France",
      startDate: "2022-09-01T00:00:00.000Z",
      endDate: "2023-06-30T00:00:00.000Z",
      isCurrent: false,
      description: "Assisted professor in teaching Python programming fundamentals to 80+ first-year students. Conducted weekly lab sessions and office hours. Graded assignments and provided constructive feedback. Developed supplementary learning materials and coding exercises.",
      position: 3
    },
    {
      title: "Freelance Web Developer",
      company: "Self-Employed",
      location: "Remote",
      startDate: "2021-06-01T00:00:00.000Z",
      endDate: "2022-12-31T00:00:00.000Z",
      isCurrent: false,
      description: "Designed and developed custom websites for local businesses and startups. Managed client relationships from initial consultation to project delivery. Implemented SEO best practices resulting in 60% increase in organic traffic for clients. Technologies used: WordPress, HTML/CSS, JavaScript, and PHP.",
      position: 4
    }
  ],
  skills: [
    { skillName: "JavaScript", position: 1 },
    { skillName: "TypeScript", position: 2 },
    { skillName: "React", position: 3 },
    { skillName: "Node.js", position: 4 },
    { skillName: "Vue.js", position: 5 },
    { skillName: "Python", position: 6 },
    { skillName: "Java", position: 7 },
    { skillName: "C++", position: 8 },
    { skillName: "SQL", position: 9 },
    { skillName: "PostgreSQL", position: 10 },
    { skillName: "MongoDB", position: 11 },
    { skillName: "Git", position: 12 },
    { skillName: "Docker", position: 13 },
    { skillName: "AWS", position: 14 },
    { skillName: "REST API", position: 15 },
    { skillName: "GraphQL", position: 16 },
    { skillName: "Tailwind CSS", position: 17 },
    { skillName: "Jest", position: 18 },
    { skillName: "Agile/Scrum", position: 19 },
    { skillName: "CI/CD", position: 20 }
  ],
  certifications: [
    {
      name: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services",
      issueDate: "2024-03-15T00:00:00.000Z",
      expirationDate: "2027-03-15T00:00:00.000Z",
      credentialUrl: "https://aws.amazon.com/verification/ABC123XYZ",
      position: 1
    },
    {
      name: "Professional Scrum Master I (PSM I)",
      issuer: "Scrum.org",
      issueDate: "2023-11-20T00:00:00.000Z",
      expirationDate: null,
      credentialUrl: "https://scrum.org/certificates/PSM789456",
      position: 2
    },
    {
      name: "MongoDB Certified Developer Associate",
      issuer: "MongoDB University",
      issueDate: "2023-08-10T00:00:00.000Z",
      expirationDate: "2026-08-10T00:00:00.000Z",
      credentialUrl: "https://university.mongodb.com/cert/MDB123456",
      position: 3
    },
    {
      name: "Meta Front-End Developer Professional Certificate",
      issuer: "Meta (via Coursera)",
      issueDate: "2022-12-05T00:00:00.000Z",
      expirationDate: null,
      credentialUrl: "https://coursera.org/verify/PROF789XYZ",
      position: 4
    }
  ],
  interests: [
    {
      name: "Open Source Contribution",
      category: "Technology",
      source: "GitHub",
      position: 1
    },
    {
      name: "Machine Learning",
      category: "Technology",
      source: "Personal",
      position: 2
    },
    {
      name: "Cybersecurity",
      category: "Technology",
      source: "Courses & Workshops",
      position: 3
    },
    {
      name: "Hackathons",
      category: "Events",
      source: "Community",
      position: 4
    },
    {
      name: "Tech Blogging",
      category: "Content Creation",
      source: "Medium",
      position: 5
    },
    {
      name: "Rock Climbing",
      category: "Sports",
      source: "Personal",
      position: 6
    },
    {
      name: "Photography",
      category: "Creative",
      source: "Hobby",
      position: 7
    },
    {
      name: "Cooking International Cuisine",
      category: "Lifestyle",
      source: "Personal",
      position: 8
    }
  ],
  languages: [
    {
      languageName: "French",
      proficiencyLevel: "Native",
      position: 1
    },
    {
      languageName: "English",
      proficiencyLevel: "Fluent (C1)",
      position: 2
    },
    {
      languageName: "Arabic",
      proficiencyLevel: "Native",
      position: 3
    },
    {
      languageName: "Spanish",
      proficiencyLevel: "Intermediate (B1)",
      position: 4
    }
  ],
  educations: [
    {
      school: "University of Rennes",
      degree: "Master of Science",
      fieldOfStudy: "Computer Science - Software Engineering",
      startDate: "2023-09-01T00:00:00.000Z",
      endDate: "2025-06-30T00:00:00.000Z",
      description: "Specialized in distributed systems, cloud computing, and software architecture. Key coursework: Advanced Algorithms, Cloud Computing, Machine Learning, DevOps, Software Design Patterns. Currently maintaining a 3.8/4.0 GPA. Master's thesis focuses on optimizing microservices performance in containerized environments.",
      position: 1
    },
    {
      school: "University of Rennes",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      startDate: "2020-09-01T00:00:00.000Z",
      endDate: "2023-06-30T00:00:00.000Z",
      description: "Graduated with honors (3.7/4.0 GPA). Relevant coursework: Data Structures & Algorithms, Database Systems, Web Development, Operating Systems, Computer Networks, Object-Oriented Programming. Capstone project: Built a task management application using MERN stack serving 200+ campus users.",
      position: 2
    },
    {
      school: "Lycée Victor Hugo",
      degree: "Scientific Baccalauréat",
      fieldOfStudy: "Mathematics & Computer Science",
      startDate: "2017-09-01T00:00:00.000Z",
      endDate: "2020-06-30T00:00:00.000Z",
      description: "Graduated with honors (mention Bien). Specialized in mathematics, physics, and computer science. Participated in regional programming competitions and mathematics olympiads.",
      position: 3
    }
  ]
};

export async function getMockCV(linkedInUrl: string): Promise<CVData> {
  return {
    ...mockCV,
    profileInfo: {
      ...mockCV.profileInfo,
      websiteUrl: linkedInUrl || mockCV.profileInfo.websiteUrl,
    },
    experiences: mockCV.experiences.map((exp) => ({ ...exp })),
    skills: mockCV.skills.map((skill) => ({ ...skill })),
    certifications: mockCV.certifications.map((cert) => ({ ...cert })),
    interests: mockCV.interests.map((interest) => ({ ...interest })),
    languages: mockCV.languages.map((language) => ({ ...language })),
    educations: mockCV.educations.map((education) => ({ ...education })),
  };
}

export default { mapLinkedInToCV, getMockCV, mockCV };
