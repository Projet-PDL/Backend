import axios from 'axios';
import {
  scrapeLinkedInProfile,
  mockScrapeLinkedInProfile,
} from '../app/services/linkedInScraperService';
import {
  MissingBrightDataKeyError,
  BrightDataApiError,
  ProfileNotFoundError,
  LinkedInScrapingError,
} from '../app/errors/linkedin';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('linkedInScraperService', () => {
  const mockLinkedInUrl = 'https://www.linkedin.com/in/test-profile/';
  const originalEnv = process.env.BRIGHTDATA_API_KEY;

  afterEach(() => {
    jest.clearAllMocks();
    process.env.BRIGHTDATA_API_KEY = originalEnv;
  });

  describe('scrapeLinkedInProfile', () => {

    it('should successfully scrape a LinkedIn profile', async () => {
      const mockProfile = {
        id: 'test-123',
        name: 'John Doe',
        first_name: 'John',
        last_name: 'Doe',
        position: 'Software Engineer',
        about: 'Passionate developer',
        city: 'San Francisco',
        country_code: 'US',
        location: 'San Francisco, CA',
        experience: [
          {
            title: 'Senior Developer',
            company: 'Tech Corp',
            location: 'San Francisco',
            start_date: 'Jan 2020',
            end_date: 'Present',
            description: 'Building awesome software',
          },
        ],
        education: [
          {
            title: 'Stanford University',
            degree: 'BS',
            field: 'Computer Science',
            start_year: '2016',
            end_year: '2020',
          },
        ],
        skills: [
          { title: 'JavaScript' },
          { title: 'TypeScript' },
          { title: 'React' },
        ],
        languages: [
          { title: 'English', subtitle: 'Native' },
          { title: 'Spanish', subtitle: 'Professional' },
        ],
        certifications: [
          {
            title: 'AWS Certified Developer',
            subtitle: 'Amazon Web Services',
            meta: 'Issued Jan 2023',
            credential_url: 'https://aws.amazon.com/cert/123',
          },
        ],
        url: mockLinkedInUrl,
      };

      mockedAxios.post.mockResolvedValue({
        data: { profile: mockProfile },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await scrapeLinkedInProfile(mockLinkedInUrl);

      expect(result).toEqual(mockProfile);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('brightdata.com'),
        { input: [{ url: mockLinkedInUrl }] },
        {
          headers: {
            Authorization: 'Bearer test-api-key-12345',
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );
    });

    it('should find profile in nested response structure', async () => {
      const mockProfile = {
        id: 'test-456',
        name: 'Jane Smith',
        position: 'Product Manager',
        experience: [],
      };

      mockedAxios.post.mockResolvedValue({
        data: {
          results: [
            {
              data: mockProfile,
            },
          ],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await scrapeLinkedInProfile(mockLinkedInUrl);

      expect(result).toEqual(mockProfile);
    });

    it('should throw BrightDataApiError on API error response', async () => {
      const errorResponse = {
        response: {
          status: 429,
          data: { error: 'Rate limit exceeded' },
        },
      };

      mockedAxios.post.mockRejectedValue(errorResponse);

      await expect(scrapeLinkedInProfile(mockLinkedInUrl)).rejects.toThrow(
        BrightDataApiError
      );
    });

    it('should throw LinkedInScrapingError on network error', async () => {
      const networkError = new Error('Network timeout');
      mockedAxios.post.mockRejectedValue(networkError);

      await expect(scrapeLinkedInProfile(mockLinkedInUrl)).rejects.toThrow(
        LinkedInScrapingError
      );
    });

    it('should handle profile at root level of response', async () => {
      const mockProfile = {
        id: 'test-789',
        name: 'Bob Johnson',
        position: 'Designer',
        experience: [],
      };

      mockedAxios.post.mockResolvedValue({
        data: mockProfile,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await scrapeLinkedInProfile(mockLinkedInUrl);

      expect(result).toEqual(mockProfile);
    });
  });

  describe('mockScrapeLinkedInProfile', () => {
    it('should return mock profile data', async () => {
      const result = await mockScrapeLinkedInProfile(mockLinkedInUrl);

      expect(result).toBeDefined();
      expect(result.id).toBe('mock-profile');
      expect(result.name).toBe('Mock User');
      expect(result.first_name).toBe('Mock');
      expect(result.last_name).toBe('User');
      expect(result.position).toBe('Mock Position');
      expect(result.url).toBe(mockLinkedInUrl);
      expect(result.experience).toEqual([]);
      expect(result.education).toEqual([]);
      expect(result.languages).toEqual([]);
      expect(result.certifications).toEqual([]);
    });

    it('should return consistent structure across calls', async () => {
      const result1 = await mockScrapeLinkedInProfile('https://linkedin.com/in/user1');
      const result2 = await mockScrapeLinkedInProfile('https://linkedin.com/in/user2');

      expect(result1.id).toBe(result2.id);
      expect(result1.name).toBe(result2.name);
      expect(result1.url).not.toBe(result2.url);
    });
  });
});
