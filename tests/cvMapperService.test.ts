import { mapLinkedInToCV, getMockCV } from '../app/services/cvMapperService';
import { CVMappingError } from '../app/errors/linkedin';

describe('cvMapperService', () => {
  describe('mapLinkedInToCV', () => {
    it('should map basic LinkedIn profile to CV format', () => {
      const linkedInProfile = {
        id: 'test-123',
        name: 'John Doe',
        first_name: 'John',
        last_name: 'Doe',
        position: 'Software Engineer',
        about: 'Passionate about coding',
        city: 'New York',
        country_code: 'US',
        location: 'New York, NY',
        url: 'https://linkedin.com/in/johndoe',
      };

      const result = mapLinkedInToCV(linkedInProfile);

      expect(result).toBeDefined();
      expect(result.title).toBe('John Doe');
      expect(result.profileInfo).toBeDefined();
      expect(result.profileInfo?.firstName).toBe('John');
      expect(result.profileInfo?.lastName).toBe('Doe');
      expect(result.profileInfo?.email).toBeNull();
      expect(result.profileInfo?.phone).toBeNull();
      expect(result.profileInfo?.city).toBe('New York');
      expect(result.profileInfo?.country).toBe('US');
      expect(result.profileInfo?.professionalSummary).toBe('Passionate about coding');
    });

    it('should map experiences correctly', () => {
      const linkedInProfile = {
        id: 'test-123',
        name: 'Jane Smith',
        position: 'Product Manager',
        experience: [
          {
            title: 'Senior Product Manager',
            company: 'Tech Corp',
            location: 'San Francisco',
            start_date: 'Jan 2020',
            end_date: 'Present',
            description: 'Leading product development',
          },
          {
            title: 'Product Manager',
            company: 'StartUp Inc',
            location: 'Remote',
            start_date: 'Mar 2018',
            end_date: 'Dec 2019',
            description: 'Managed product roadmap',
          },
        ],
      };

      const result = mapLinkedInToCV(linkedInProfile);

      expect(result.experiences).toHaveLength(2);
      expect(result.experiences[0].title).toBe('Senior Product Manager');
      expect(result.experiences[0].company).toBe('Tech Corp');
      expect(result.experiences[0].location).toBe('San Francisco');
      expect(result.experiences[0].isCurrent).toBe(true);
      expect(result.experiences[0].startDate).toBe('2020-01-01T00:00:00.000Z');
      expect(result.experiences[0].endDate).toBeNull();
      expect(result.experiences[0].description).toBe('Leading product development');
      expect(result.experiences[0].position).toBe(0);

      expect(result.experiences[1].title).toBe('Product Manager');
      expect(result.experiences[1].isCurrent).toBe(false);
      expect(result.experiences[1].startDate).toBe('2018-03-01T00:00:00.000Z');
      expect(result.experiences[1].endDate).toBe('2019-12-01T00:00:00.000Z');
      expect(result.experiences[1].position).toBe(1);
    });

    it('should map nested experience positions correctly', () => {
      const linkedInProfile = {
        id: 'test-456',
        name: 'Bob Wilson',
        position: 'Engineering Manager',
        experience: [
          {
            title: 'Engineering Manager',
            company: 'Big Tech',
            positions: [
              {
                title: 'Senior Engineering Manager',
                company: 'Big Tech',
                start_date: 'Jan 2022',
                end_date: 'Present',
                description: 'Managing 20+ engineers',
              },
              {
                title: 'Engineering Manager',
                company: 'Big Tech',
                start_date: 'Jun 2020',
                end_date: 'Dec 2021',
                description: 'Managing 10 engineers',
              },
            ],
          },
        ],
      };

      const result = mapLinkedInToCV(linkedInProfile);

      expect(result.experiences).toHaveLength(2);
      expect(result.experiences[0].title).toBe('Senior Engineering Manager');
      expect(result.experiences[0].position).toBe(0);
      expect(result.experiences[1].title).toBe('Engineering Manager');
      expect(result.experiences[1].position).toBe(1);
    });

    it('should map education correctly', () => {
      const linkedInProfile = {
        id: 'test-789',
        name: 'Alice Brown',
        position: 'Data Scientist',
        education: [
          {
            title: 'Stanford University',
            degree: 'Master of Science',
            field: 'Computer Science',
            start_year: '2018',
            end_year: '2020',
            description: 'Focus on Machine Learning',
          },
          {
            title: 'MIT',
            degree: 'Bachelor of Science',
            field: 'Mathematics',
            start_year: '2014',
            end_year: '2018',
          },
        ],
      };

      const result = mapLinkedInToCV(linkedInProfile);

      expect(result.educations).toHaveLength(2);
      expect(result.educations[0].school).toBe('Stanford University');
      expect(result.educations[0].degree).toBe('Master of Science');
      expect(result.educations[0].fieldOfStudy).toBe('Computer Science');
      expect(result.educations[0].startDate).toBe('2018-01-01T00:00:00.000Z');
      expect(result.educations[0].endDate).toBe('2020-01-01T00:00:00.000Z');
      expect(result.educations[0].description).toBe('Focus on Machine Learning');
      expect(result.educations[0].position).toBe(0);

      expect(result.educations[1].school).toBe('MIT');
      expect(result.educations[1].degree).toBe('Bachelor of Science');
      expect(result.educations[1].fieldOfStudy).toBe('Mathematics');
      expect(result.educations[1].position).toBe(1);
    });

    it('should map skills correctly', () => {
      const linkedInProfile = {
        id: 'test-101',
        name: 'Charlie Davis',
        position: 'Full Stack Developer',
        skills: [
          { title: 'JavaScript' },
          { name: 'Python' },
          { title: 'React' },
          { name: 'Node.js' },
        ],
      };

      const result = mapLinkedInToCV(linkedInProfile);

      expect(result.skills).toHaveLength(4);
      expect(result.skills[0].skillName).toBe('JavaScript');
      expect(result.skills[0].position).toBe(0);
      expect(result.skills[1].skillName).toBe('Python');
      expect(result.skills[1].position).toBe(1);
      expect(result.skills[2].skillName).toBe('React');
      expect(result.skills[3].skillName).toBe('Node.js');
    });

    it('should handle missing skills gracefully', () => {
      const linkedInProfile = {
        id: 'test-102',
        name: 'Test User',
        position: 'Developer',
      };

      const result = mapLinkedInToCV(linkedInProfile);

      expect(result.skills).toEqual([]);
    });

    it('should map certifications correctly', () => {
      const linkedInProfile = {
        id: 'test-103',
        name: 'David Lee',
        position: 'Cloud Architect',
        certifications: [
          {
            title: 'AWS Solutions Architect',
            subtitle: 'Amazon Web Services',
            meta: 'Issued Jan 2023 · Expires Jan 2026',
            credential_url: 'https://aws.amazon.com/cert/123',
          },
          {
            title: 'Google Cloud Professional',
            subtitle: 'Google Cloud',
            credential_url: 'https://cloud.google.com/cert/456',
          },
        ],
      };

      const result = mapLinkedInToCV(linkedInProfile);

      expect(result.certifications).toHaveLength(2);
      expect(result.certifications[0].name).toBe('AWS Solutions Architect');
      expect(result.certifications[0].issuer).toBe('Amazon Web Services');
      expect(result.certifications[0].issueDate).toBe('2023-01-01T00:00:00.000Z');
      expect(result.certifications[0].credentialUrl).toBe('https://aws.amazon.com/cert/123');
      expect(result.certifications[0].position).toBe(0);

      expect(result.certifications[1].name).toBe('Google Cloud Professional');
      expect(result.certifications[1].issuer).toBe('Google Cloud');
      expect(result.certifications[1].position).toBe(1);
    });

    it('should map languages correctly', () => {
      const linkedInProfile = {
        id: 'test-104',
        name: 'Emma Garcia',
        position: 'Translator',
        languages: [
          { title: 'English', subtitle: 'Native or Bilingual' },
          { title: 'Spanish', subtitle: 'Professional Working Proficiency' },
          { title: 'French', subtitle: 'Limited Working Proficiency' },
        ],
      };

      const result = mapLinkedInToCV(linkedInProfile);

      expect(result.languages).toHaveLength(3);
      expect(result.languages[0].languageName).toBe('English');
      expect(result.languages[0].proficiencyLevel).toBe('Native or Bilingual');
      expect(result.languages[0].position).toBe(0);

      expect(result.languages[1].languageName).toBe('Spanish');
      expect(result.languages[1].proficiencyLevel).toBe('Professional Working Proficiency');
      expect(result.languages[1].position).toBe(1);
    });

    it('should map interests from volunteer experience', () => {
      const linkedInProfile = {
        id: 'test-105',
        name: 'Frank Miller',
        position: 'Developer',
        volunteer_experience: [
          {
            title: 'Code Mentor',
            subtitle: 'Local Coding Bootcamp',
            cause: 'Education',
          },
          {
            title: 'Open Source Contributor',
            cause: 'Technology',
          },
        ],
      };

      const result = mapLinkedInToCV(linkedInProfile);

      expect(result.interests.length).toBeGreaterThanOrEqual(2);
      const volunteerInterests = result.interests.filter((i) => i.source === 'volunteer');
      expect(volunteerInterests).toHaveLength(2);
      expect(volunteerInterests[0].name).toBe('Code Mentor');
      expect(volunteerInterests[0].category).toBe('Education');
    });

    it('should map interests from publications', () => {
      const linkedInProfile = {
        id: 'test-106',
        name: 'Grace Chen',
        position: 'Researcher',
        publications: [
          { title: 'Machine Learning in Healthcare' },
          { title: 'Deep Learning Applications' },
        ],
      };

      const result = mapLinkedInToCV(linkedInProfile);

      const publicationInterests = result.interests.filter((i) => i.source === 'publication');
      expect(publicationInterests).toHaveLength(2);
      expect(publicationInterests[0].name).toBe('Machine Learning in Healthcare');
      expect(publicationInterests[0].category).toBe('Research');
    });

    it('should map interests from projects', () => {
      const linkedInProfile = {
        id: 'test-107',
        name: 'Henry Park',
        position: 'Developer',
        projects: [
          { title: 'E-commerce Platform' },
          { title: 'Mobile App Development' },
        ],
      };

      const result = mapLinkedInToCV(linkedInProfile);

      const projectInterests = result.interests.filter((i) => i.source === 'project');
      expect(projectInterests).toHaveLength(2);
      expect(projectInterests[0].name).toBe('E-commerce Platform');
      expect(projectInterests[0].category).toBe('Project');
    });

    it('should handle missing optional fields gracefully', () => {
      const linkedInProfile = {
        id: 'test-minimal',
        name: 'Minimal User',
      };

      const result = mapLinkedInToCV(linkedInProfile);

      expect(result).toBeDefined();
      expect(result.title).toBeNull();
      expect(result.experiences).toEqual([]);
      expect(result.educations).toEqual([]);
      expect(result.skills).toEqual([]);
      expect(result.certifications).toEqual([]);
      expect(result.interests).toEqual([]);
      expect(result.languages).toEqual([]);
    });

    it('should parse LinkedIn dates correctly', () => {
      const linkedInProfile = {
        id: 'test-dates',
        name: 'Date Test',
        position: 'Tester',
        experience: [
          {
            title: 'Job 1',
            company: 'Company A',
            start_date: 'Jan 2020',
            end_date: 'Dec 2021',
          },
          {
            title: 'Job 2',
            company: 'Company B',
            start_date: 'March 2022',
            end_date: 'Present',
          },
          {
            title: 'Job 3',
            company: 'Company C',
            start_date: '2019',
            end_date: '2020',
          },
        ],
      };

      const result = mapLinkedInToCV(linkedInProfile);

      expect(result.experiences[0].startDate).toBe('2020-01-01T00:00:00.000Z');
      expect(result.experiences[0].endDate).toBe('2021-12-01T00:00:00.000Z');
      expect(result.experiences[1].startDate).toBe('2022-03-01T00:00:00.000Z');
      expect(result.experiences[1].endDate).toBeNull();
      expect(result.experiences[1].isCurrent).toBe(true);
      expect(result.experiences[2].startDate).toBe('2019-01-01T00:00:00.000Z');
      expect(result.experiences[2].endDate).toBe('2020-01-01T00:00:00.000Z');
    });

    it('should throw CVMappingError for invalid input', () => {
      expect(() => mapLinkedInToCV(null as any)).toThrow(CVMappingError);
      expect(() => mapLinkedInToCV(undefined as any)).toThrow(CVMappingError);
      // Empty object is valid, just returns minimal CV data
      const result = mapLinkedInToCV({} as any);
      expect(result).toBeDefined();
    });
  });

  describe('getMockCV', () => {
    it('should return mock CV data', async () => {
      const linkedInUrl = 'https://linkedin.com/in/test';
      const result = await getMockCV(linkedInUrl);

      expect(result).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.profileInfo).toBeDefined();
      expect(result.experiences.length).toBeGreaterThan(0);
      expect(result.educations.length).toBeGreaterThan(0);
      expect(result.skills.length).toBeGreaterThan(0);
      expect(result.certifications.length).toBeGreaterThan(0);
      expect(result.languages.length).toBeGreaterThan(0);
      expect(result.interests.length).toBeGreaterThan(0);
    });

    it('should return consistent mock data structure', async () => {
      const result1 = await getMockCV('https://linkedin.com/in/user1');
      const result2 = await getMockCV('https://linkedin.com/in/user2');

      expect(result1.profileInfo?.firstName).toBe(result2.profileInfo?.firstName);
      expect(result1.experiences.length).toBe(result2.experiences.length);
      expect(result1.skills.length).toBe(result2.skills.length);
    });

    it('should have properly formatted dates in mock data', async () => {
      const result = await getMockCV('https://linkedin.com/in/test');

      result.experiences.forEach((exp) => {
        if (exp.startDate) {
          expect(exp.startDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        }
        if (exp.endDate) {
          expect(exp.endDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        }
      });

      result.educations.forEach((edu) => {
        if (edu.startDate) {
          expect(edu.startDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        }
        if (edu.endDate) {
          expect(edu.endDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        }
      });
    });
  });
});
