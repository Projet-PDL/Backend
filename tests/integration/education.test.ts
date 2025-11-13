// tests/integration/education.test.ts
import { FastifyInstance } from 'fastify';
import { build, createTestUser, createTestCV, generateTestToken } from '../helper';
import { prismaMock } from '../setup';

describe('Education Routes - Integration Tests', () => {
  let app: FastifyInstance;
  let testUser: any;
  let authToken: string;
  let testCV: any;

  beforeAll(async () => {
    app = await build();
    testUser = createTestUser();
    testCV = createTestCV(testUser.id);
    authToken = generateTestToken(testUser.id);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /cvs/{cvId}/educations', () => {
    it('devrait ajouter une nouvelle formation', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      
      const newEducation = {
        id: 1,
        cvId: parseInt(testCV.id),
        degree: 'Master en Informatique',
        institution: 'Université de Paris',
        location: 'Paris, France',
        startDate: new Date('2018-09-01'),
        endDate: new Date('2020-06-30'),
        current: false,
        description: 'Spécialisation en Intelligence Artificielle',
      };

      prismaMock.education.create.mockResolvedValue(newEducation);

      const response = await app.inject({
        method: 'POST',
        url: `/cvs/${testCV.id}/educations`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          degree: 'Master en Informatique',
          institution: 'Université de Paris',
          location: 'Paris, France',
          startDate: '2018-09-01',
          endDate: '2020-06-30',
          description: 'Spécialisation en Intelligence Artificielle',
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().success).toBe(true);
      expect(response.json().data).toHaveProperty('id');
    });

    it('devrait valider les dates (startDate < endDate)', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);

      const response = await app.inject({
        method: 'POST',
        url: `/cvs/${testCV.id}/educations`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          degree: 'Bachelor',
          institution: 'University',
          startDate: '2023-01-01',
          endDate: '2020-01-01', // Date de fin avant date de début
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().message).toContain('date');
    });

    it('devrait accepter une formation en cours (sans endDate)', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      
      const currentEducation = {
        id: 2,
        cvId: parseInt(testCV.id),
        degree: 'Doctorat en IA',
        institution: 'École Polytechnique',
        startDate: new Date('2023-09-01'),
        endDate: null,
        current: true,
        description: 'Recherche en Deep Learning',
      };

      prismaMock.education.create.mockResolvedValue(currentEducation);

      const response = await app.inject({
        method: 'POST',
        url: `/cvs/${testCV.id}/educations`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          degree: 'Doctorat en IA',
          institution: 'École Polytechnique',
          startDate: '2023-09-01',
          current: true,
          description: 'Recherche en Deep Learning',
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().success).toBe(true);
    });
  });

  describe('PUT /cvs/{cvId}/educations/{eduId}', () => {
    it('devrait modifier une formation existante', async () => {
      const educationId = 1;
      
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.education.findUnique.mockResolvedValue({
        id: educationId,
        cvId: parseInt(testCV.id),
        degree: 'Old Degree',
        institution: 'Old School',
      });

      const updatedEducation = {
        id: educationId,
        cvId: parseInt(testCV.id),
        degree: 'Nouveau Diplôme',
        institution: 'Nouvelle École',
        location: 'Lyon, France',
        startDate: new Date('2019-09-01'),
        endDate: new Date('2021-06-30'),
        description: 'Description mise à jour',
      };

      prismaMock.education.update.mockResolvedValue(updatedEducation);

      const response = await app.inject({
        method: 'PUT',
        url: `/cvs/${testCV.id}/educations/${educationId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          degree: 'Nouveau Diplôme',
          institution: 'Nouvelle École',
          location: 'Lyon, France',
          startDate: '2019-09-01',
          endDate: '2021-06-30',
          description: 'Description mise à jour',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().success).toBe(true);
      expect(response.json().data).toHaveProperty('id');
    });

    it('devrait retourner 404 pour une formation inexistante', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.education.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'PUT',
        url: `/cvs/${testCV.id}/educations/9999`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          degree: 'New Degree',
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /cvs/{cvId}/educations/{eduId}', () => {
    it('devrait supprimer une formation', async () => {
      const educationId = 1;
      
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.education.findUnique.mockResolvedValue({
        id: educationId,
        cvId: parseInt(testCV.id),
        degree: 'Bachelor',
      });
      prismaMock.education.delete.mockResolvedValue({
        id: educationId,
        cvId: parseInt(testCV.id),
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/cvs/${testCV.id}/educations/${educationId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(204);
      expect(prismaMock.education.delete).toHaveBeenCalledWith({
        where: { id: educationId },
      });
    });

    it('devrait retourner 404 pour une formation inexistante', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.education.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'DELETE',
        url: `/cvs/${testCV.id}/educations/9999`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});