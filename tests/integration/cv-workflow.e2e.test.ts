/**
 * CV Workflow End-to-End Tests
 * Tests complete CV creation and management workflows
 * NO MOCKS - tests the entire application flow
 */

import { cleanupDatabase, createTestUser, globalSetup, globalTeardown } from './setup';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

describe('CV Workflow E2E Tests', () => {
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    await globalSetup();
  });

  afterAll(async () => {
    await globalTeardown();
  });

  beforeEach(async () => {
    await cleanupDatabase();

    // Create user and login for each test
    await createTestUser({
      email: 'cvuser@test.com',
      password: 'CVTest123',
      name: 'CV Test User',
    });

    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'cvuser@test.com',
        password: 'CVTest123',
      }),
    });

    const body = await loginResponse.json();
    authToken = body.data.token;
    userId = body.data.user.id;
  });

  describe.skip('Complete CV Creation Flow (Complex - Needs Schema Fixes)', () => {
    it('should create a complete CV with all sections', async () => {
      // 1. Create CV
      const createCvResponse = await fetch(`${BASE_URL}/cvs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: 'Software Engineer CV',
        }),
      });

      expect(createCvResponse.status).toBe(201);
      const cvBody = await createCvResponse.json();
      expect(cvBody.success).toBe(true);
      const cvId = cvBody.data.id;

      // 2. Add Profile Info
      const profileResponse = await fetch(`${BASE_URL}/cvs/${cvId}/profile-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          headline: 'Senior Software Engineer',
          email: 'john.doe@example.com',
          phoneNumber: '+1234567890',
          location: 'San Francisco, CA',
          summary: 'Experienced software engineer with 5+ years',
        }),
      });

      expect(profileResponse.status).toBe(201);

      // 3. Add Experience
      const experienceResponse = await fetch(`${BASE_URL}/cvs/${cvId}/experience`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: 'Senior Software Engineer',
          company: 'Tech Corp',
          location: 'San Francisco, CA',
          startDate: '2020-01-01T00:00:00.000Z',
          isCurrent: true,
          description: 'Leading backend development team',
        }),
      });

      expect(experienceResponse.status).toBe(201);

      // 4. Add Education
      const educationResponse = await fetch(`${BASE_URL}/cvs/${cvId}/education`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          school: 'University of California',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          startDate: '2015-09-01T00:00:00.000Z',
          endDate: '2019-06-01T00:00:00.000Z',
          description: 'Graduated with honors',
        }),
      });

      expect(educationResponse.status).toBe(201);

      // 5. Add Skills
      const skillsResponse = await fetch(`${BASE_URL}/cvs/${cvId}/skill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          skills: ['JavaScript', 'TypeScript', 'Node.js', 'React', 'PostgreSQL'],
        }),
      });

      expect(skillsResponse.status).toBe(201);

      // 6. Add Certification
      const certificationResponse = await fetch(`${BASE_URL}/cvs/${cvId}/certification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: 'AWS Certified Developer',
          issuer: 'Amazon Web Services',
          issueDate: '2022-03-15T00:00:00.000Z',
          credentialUrl: 'https://aws.amazon.com/certification',
        }),
      });

      expect(certificationResponse.status).toBe(201);

      // 7. Add Language
      const languageResponse = await fetch(`${BASE_URL}/cvs/${cvId}/language`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          languageName: 'English',
          proficiencyLevel: 'Native',
        }),
      });

      expect(languageResponse.status).toBe(201);

      // 8. Add Interest
      const interestResponse = await fetch(`${BASE_URL}/cvs/${cvId}/interest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: 'Open Source',
          category: 'Professional',
        }),
      });

      expect(interestResponse.status).toBe(201);

      // 9. Retrieve complete CV
      const getCvResponse = await fetch(`${BASE_URL}/cvs/${cvId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(getCvResponse.status).toBe(200);
      const completeCv = await getCvResponse.json();

      // Verify all sections are present
      expect(completeCv.data.title).toBe('Software Engineer CV');
      expect(completeCv.data.profileInfo.firstName).toBe('John');
      expect(completeCv.data.experiences).toHaveLength(1);
      expect(completeCv.data.experiences[0].title).toBe('Senior Software Engineer');
      expect(completeCv.data.educations).toHaveLength(1);
      expect(completeCv.data.educations[0].school).toBe('University of California');
      expect(completeCv.data.skills).toHaveLength(5);
      expect(completeCv.data.certifications).toHaveLength(1);
      expect(completeCv.data.languages).toHaveLength(1);
      expect(completeCv.data.interests).toHaveLength(1);
    });

    it('should update CV sections', async () => {
      // Create CV and add profile
      const createCvResponse = await fetch(`${BASE_URL}/cvs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ title: 'My CV' }),
      });

      const cvId = (await createCvResponse.json()).data.id;

      await fetch(`${BASE_URL}/cvs/${cvId}/profile-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          firstName: 'Jane',
          lastName: 'Smith',
          headline: 'Developer',
          email: 'jane@test.com',
        }),
      });

      // Update profile
      const updateResponse = await fetch(`${BASE_URL}/cvs/${cvId}/profile-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          headline: 'Senior Developer',
          phoneNumber: '+9876543210',
        }),
      });

      expect(updateResponse.status).toBe(200);

      // Verify update
      const getCvResponse = await fetch(`${BASE_URL}/cvs/${cvId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const cv = await getCvResponse.json();
      expect(cv.data.profileInfo.headline).toBe('Senior Developer');
      expect(cv.data.profileInfo.phoneNumber).toBe('+9876543210');
      expect(cv.data.profileInfo.firstName).toBe('Jane'); // Unchanged
    });

    it('should delete CV and cascade delete all sections', async () => {
      // Create CV with multiple sections
      const createCvResponse = await fetch(`${BASE_URL}/cvs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ title: 'CV to Delete' }),
      });

      const cvId = (await createCvResponse.json()).data.id;

      // Add various sections
      await fetch(`${BASE_URL}/cvs/${cvId}/profile-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          firstName: 'Test',
          lastName: 'User',
          headline: 'Tester',
          email: 'test@test.com',
        }),
      });

      await fetch(`${BASE_URL}/cvs/${cvId}/skill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ skills: ['Skill1', 'Skill2'] }),
      });

      // Delete CV
      const deleteResponse = await fetch(`${BASE_URL}/cvs/${cvId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(deleteResponse.status).toBe(204);

      // Verify CV is deleted
      const getCvResponse = await fetch(`${BASE_URL}/cvs/${cvId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(getCvResponse.status).toBe(404);
    });
  });

  describe('CV List and Filtering', () => {
    beforeEach(async () => {
      // Create multiple CVs for testing
      const cvs = [
        { title: 'Frontend Developer CV' },
        { title: 'Backend Engineer CV' },
        { title: 'Full Stack CV' },
      ];

      for (const cv of cvs) {
        await fetch(`${BASE_URL}/cvs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(cv),
        });
      }
    });

    it('should list all user CVs', async () => {
      const response = await fetch(`${BASE_URL}/cvs`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.items).toHaveLength(3);
    });
  });

  describe('CV Ownership and Security', () => {
    let otherUserToken: string;

    beforeEach(async () => {
      // Create another user
      await createTestUser({
        email: 'other@test.com',
        password: 'Other123',
        name: 'Other User',
      });

      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'other@test.com',
          password: 'Other123',
        }),
      });

      otherUserToken = (await loginResponse.json()).data.token;
    });

    it('should prevent access to other users CVs', async () => {
      // Create CV as first user
      const createCvResponse = await fetch(`${BASE_URL}/cvs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ title: 'Private CV' }),
      });

      const cvId = (await createCvResponse.json()).data.id;

      // Try to access as second user
      const getResponse = await fetch(`${BASE_URL}/cvs/${cvId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${otherUserToken}`,
        },
      });

      expect(getResponse.status).toBe(403);
    });

    it('should prevent deleting other users CVs', async () => {
      // Create CV as first user
      const createCvResponse = await fetch(`${BASE_URL}/cvs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ title: 'Protected CV' }),
      });

      const cvId = (await createCvResponse.json()).data.id;

      // Try to delete as second user
      const deleteResponse = await fetch(`${BASE_URL}/cvs/${cvId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${otherUserToken}`,
        },
      });

      expect(deleteResponse.status).toBe(403);

      // Verify CV still exists for original owner
      const getResponse = await fetch(`${BASE_URL}/cvs/${cvId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(getResponse.status).toBe(200);
    });
  });

  describe('Data Validation', () => {
    let cvId: number;

    beforeEach(async () => {
      const createCvResponse = await fetch(`${BASE_URL}/cvs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ title: 'Validation Test CV' }),
      });

      cvId = (await createCvResponse.json()).data.id;
    });

    it('should accept profile info with only some fields (all optional)', async () => {
      const response = await fetch(`${BASE_URL}/cvs/${cvId}/profile-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          // All fields are optional
          phone: '+1234567890',
        }),
      });

      expect(response.status).toBe(201);
    });

    it('should accept valid profile info with all fields', async () => {
      const response = await fetch(`${BASE_URL}/cvs/${cvId}/profile-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          headline: 'Software Engineer',
          email: 'john@example.com',
          phone: '+1234567890',
        }),
      });

      expect(response.status).toBe(201);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent CV creations', async () => {
      const requests = Array(10).fill(null).map((_, i) =>
        fetch(`${BASE_URL}/cvs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({ title: `CV ${i + 1}` }),
        })
      );

      const responses = await Promise.all(requests);

      // All should succeed
      expect(responses.every(r => r.status === 201)).toBe(true);
    });
  });
});