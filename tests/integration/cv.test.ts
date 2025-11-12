// tests/integration/cv.test.ts
import { FastifyInstance } from 'fastify';
import { build, createTestUser, createTestCV, generateTestToken } from '../helper';
import { prismaMock } from '../setup';

describe('CV Routes - Integration Tests', () => {
  let app: FastifyInstance;
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    app = await build();
    testUser = createTestUser();
    authToken = generateTestToken(testUser.id);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /cvs', () => {
    it('devrait lister tous les CVs de l\'utilisateur', async () => {
      const mockCVs = [
        createTestCV(testUser.id),
        { ...createTestCV(testUser.id), id: 'cv-2', title: 'CV 2' },
      ];

      prismaMock.cv.findMany.mockResolvedValue(mockCVs);

      const response = await app.inject({
        method: 'GET',
        url: '/cvs',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveLength(2);
      expect(response.json()[0]).toHaveProperty('id');
      expect(response.json()[0]).toHaveProperty('title');
    });

    it('devrait filtrer les CVs par query', async () => {
      const mockCVs = [createTestCV(testUser.id)];
      prismaMock.cv.findMany.mockResolvedValue(mockCVs);

      const response = await app.inject({
        method: 'GET',
        url: '/cvs?q=test',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(prismaMock.cv.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            title: expect.objectContaining({
              contains: 'test',
            }),
          }),
        })
      );
    });
  });

  describe('POST /cvs', () => {
    it('devrait créer un nouveau CV vide', async () => {
      const newCV = createTestCV(testUser.id);
      prismaMock.cv.create.mockResolvedValue(newCV);

      const response = await app.inject({
        method: 'POST',
        url: '/cvs',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          title: 'Mon nouveau CV',
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toHaveProperty('id');
      expect(response.json().title).toBe('Mon nouveau CV');
    });

    it('devrait rejeter la création sans authentification', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/cvs',
        payload: {
          title: 'Mon CV',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /cvs/{cvId}', () => {
    it('devrait retourner un CV avec toutes ses sections', async () => {
      const cvId = 'test-cv-id';
      const mockCV = {
        ...createTestCV(testUser.id),
        id: cvId,
        profileInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
        experiences: [
          {
            id: 'exp-1',
            title: 'Developer',
            company: 'Tech Corp',
            startDate: new Date('2020-01-01'),
            endDate: new Date('2023-01-01'),
          },
        ],
        educations: [
          {
            id: 'edu-1',
            degree: 'Master',
            institution: 'University',
            startDate: new Date('2015-01-01'),
            endDate: new Date('2017-01-01'),
          },
        ],
        skills: [
          { id: 'skill-1', name: 'JavaScript', level: 'Expert' },
          { id: 'skill-2', name: 'TypeScript', level: 'Advanced' },
        ],
      };

      prismaMock.cv.findUnique.mockResolvedValue(mockCV);

      const response = await app.inject({
        method: 'GET',
        url: `/cvs/${cvId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('profileInfo');
      expect(response.json()).toHaveProperty('experiences');
      expect(response.json()).toHaveProperty('educations');
      expect(response.json()).toHaveProperty('skills');
      expect(response.json().experiences).toHaveLength(1);
      expect(response.json().skills).toHaveLength(2);
    });

    it('devrait retourner 404 pour un CV inexistant', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/cvs/nonexistent-id',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it('devrait interdire l\'accès au CV d\'un autre utilisateur', async () => {
      const mockCV = createTestCV('another-user-id');
      prismaMock.cv.findUnique.mockResolvedValue(mockCV);

      const response = await app.inject({
        method: 'GET',
        url: `/cvs/${mockCV.id}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('DELETE /cvs/{cvId}', () => {
    it('devrait supprimer un CV existant', async () => {
      const cvId = 'test-cv-id';
      const mockCV = createTestCV(testUser.id);
      
      prismaMock.cv.findUnique.mockResolvedValue(mockCV);
      prismaMock.cv.delete.mockResolvedValue(mockCV);

      const response = await app.inject({
        method: 'DELETE',
        url: `/cvs/${cvId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(204);
      expect(prismaMock.cv.delete).toHaveBeenCalledWith({
        where: { id: cvId },
      });
    });

    it('devrait retourner 404 pour un CV inexistant', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'DELETE',
        url: '/cvs/nonexistent-id',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /cvs/{cvId}/profile-info', () => {
    it('devrait mettre à jour les informations de profil', async () => {
      const cvId = 'test-cv-id';
      const mockCV = createTestCV(testUser.id);
      
      prismaMock.cv.findUnique.mockResolvedValue(mockCV);
      prismaMock.profileInfo.upsert.mockResolvedValue({
        id: 'profile-1',
        cvId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+33123456789',
        summary: 'Développeur passionné',
      });

      const response = await app.inject({
        method: 'PUT',
        url: `/cvs/${cvId}/profile-info`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+33123456789',
          summary: 'Développeur passionné',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().firstName).toBe('John');
      expect(response.json().lastName).toBe('Doe');
    });

    it('devrait valider les données du profil', async () => {
      const cvId = 'test-cv-id';
      const mockCV = createTestCV(testUser.id);
      prismaMock.cv.findUnique.mockResolvedValue(mockCV);

      const response = await app.inject({
        method: 'PUT',
        url: `/cvs/${cvId}/profile-info`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          email: 'invalid-email', // Email invalide
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});