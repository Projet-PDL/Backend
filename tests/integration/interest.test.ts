// tests/integration/interest.test.ts
import { FastifyInstance } from 'fastify';
import { build, createTestUser, createTestCV, generateTestToken } from '../helper';
import { prismaMock } from '../setup';

describe('Interest Routes - Integration Tests', () => {
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

  describe('POST /cvs/{cvId}/interests', () => {
    it('devrait ajouter un nouveau centre d\'intérêt', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      
      const newInterest = {
        id: 1,
        cvId: parseInt(testCV.id),
        name: 'Développement Open Source',
        description: 'Contribution régulière à des projets open source',
      };

      prismaMock.interest.create.mockResolvedValue(newInterest);

      const response = await app.inject({
        method: 'POST',
        url: `/cvs/${testCV.id}/interests`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: 'Développement Open Source',
          description: 'Contribution régulière à des projets open source',
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().success).toBe(true);
      expect(response.json().data).toHaveProperty('id');
    });

    it('devrait valider le nom requis', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);

      const response = await app.inject({
        method: 'POST',
        url: `/cvs/${testCV.id}/interests`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          // Manque le nom
          description: 'Description sans nom',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('devrait accepter un intérêt sans description', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      
      const interestWithoutDesc = {
        id: 2,
        cvId: parseInt(testCV.id),
        name: 'Photographie',
        description: null,
      };

      prismaMock.interest.create.mockResolvedValue(interestWithoutDesc);

      const response = await app.inject({
        method: 'POST',
        url: `/cvs/${testCV.id}/interests`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: 'Photographie',
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().success).toBe(true);
    });

    it('devrait gérer plusieurs intérêts différents', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      
      const interests = [
        { id: 3, cvId: parseInt(testCV.id), name: 'Voyages', description: 'Exploration de nouvelles cultures' },
        { id: 4, cvId: parseInt(testCV.id), name: 'Sport', description: 'Course à pied et natation' },
      ];

      for (const interest of interests) {
        prismaMock.interest.create.mockResolvedValueOnce(interest);

        const response = await app.inject({
          method: 'POST',
          url: `/cvs/${testCV.id}/interests`,
          headers: {
            authorization: `Bearer ${authToken}`,
          },
          payload: {
            name: interest.name,
            description: interest.description,
          },
        });

        expect(response.statusCode).toBe(201);
      }
    });
  });

  describe('PUT /cvs/{cvId}/interests/{interestId}', () => {
    it('devrait modifier un centre d\'intérêt existant', async () => {
      const interestId = 1;
      
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.interest.findUnique.mockResolvedValue({
        id: interestId,
        cvId: parseInt(testCV.id),
        name: 'Old Interest',
      });

      const updatedInterest = {
        id: interestId,
        cvId: parseInt(testCV.id),
        name: 'Intérêt Mis à Jour',
        description: 'Nouvelle description détaillée',
      };

      prismaMock.interest.update.mockResolvedValue(updatedInterest);

      const response = await app.inject({
        method: 'PUT',
        url: `/cvs/${testCV.id}/interests/${interestId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: 'Intérêt Mis à Jour',
          description: 'Nouvelle description détaillée',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().success).toBe(true);
      expect(response.json().data).toHaveProperty('id');
    });

    it('devrait retourner 404 pour un intérêt inexistant', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.interest.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'PUT',
        url: `/cvs/${testCV.id}/interests/9999`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: 'New Name',
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /cvs/{cvId}/interests/{interestId}', () => {
    it('devrait supprimer un centre d\'intérêt', async () => {
      const interestId = 1;
      
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.interest.findUnique.mockResolvedValue({
        id: interestId,
        cvId: parseInt(testCV.id),
        name: 'Interest à supprimer',
      });
      prismaMock.interest.delete.mockResolvedValue({
        id: interestId,
        cvId: parseInt(testCV.id),
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/cvs/${testCV.id}/interests/${interestId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(204);
      expect(prismaMock.interest.delete).toHaveBeenCalledWith({
        where: { id: interestId },
      });
    });

    it('devrait retourner 404 pour un intérêt inexistant', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.interest.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'DELETE',
        url: `/cvs/${testCV.id}/interests/9999`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});