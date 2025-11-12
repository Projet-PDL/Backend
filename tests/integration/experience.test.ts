// tests/integration/experience.test.ts
import { FastifyInstance } from 'fastify';
import { build, createTestUser, createTestCV, generateTestToken } from '../helper';
import { prismaMock } from '../setup';

describe('Experience Routes - Integration Tests', () => {
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

  describe('POST /cvs/{cvId}/experiences', () => {
    it('devrait ajouter une nouvelle expérience professionnelle', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      
      const newExperience = {
        id: 'exp-1',
        cvId: testCV.id,
        title: 'Développeur Full Stack',
        company: 'Tech Company',
        location: 'Paris, France',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2023-01-01'),
        current: false,
        description: 'Développement d\'applications web',
      };

      prismaMock.experience.create.mockResolvedValue(newExperience);

      const response = await app.inject({
        method: 'POST',
        url: `/cvs/${testCV.id}/experiences`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          title: 'Développeur Full Stack',
          company: 'Tech Company',
          location: 'Paris, France',
          startDate: '2020-01-01',
          endDate: '2023-01-01',
          description: 'Développement d\'applications web',
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().title).toBe('Développeur Full Stack');
      expect(response.json().company).toBe('Tech Company');
      expect(response.json()).toHaveProperty('id');
    });

    it('devrait valider les dates (startDate < endDate)', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);

      const response = await app.inject({
        method: 'POST',
        url: `/cvs/${testCV.id}/experiences`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          title: 'Developer',
          company: 'Company',
          startDate: '2023-01-01',
          endDate: '2020-01-01', // Date de fin avant date de début
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().message).toContain('date');
    });

    it('devrait accepter une expérience en cours (sans endDate)', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      
      const currentExperience = {
        id: 'exp-2',
        cvId: testCV.id,
        title: 'Senior Developer',
        company: 'Current Company',
        startDate: new Date('2023-01-01'),
        endDate: null,
        current: true,
        description: 'Poste actuel',
      };

      prismaMock.experience.create.mockResolvedValue(currentExperience);

      const response = await app.inject({
        method: 'POST',
        url: `/cvs/${testCV.id}/experiences`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          title: 'Senior Developer',
          company: 'Current Company',
          startDate: '2023-01-01',
          current: true,
          description: 'Poste actuel',
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().current).toBe(true);
      expect(response.json().endDate).toBeNull();
    });
  });

  describe('PUT /cvs/{cvId}/experiences/{expId}', () => {
    it('devrait modifier une expérience existante', async () => {
      const experienceId = 'exp-1';
      
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.experience.findUnique.mockResolvedValue({
        id: experienceId,
        cvId: testCV.id,
        title: 'Old Title',
        company: 'Old Company',
      });

      const updatedExperience = {
        id: experienceId,
        cvId: testCV.id,
        title: 'Nouveau Titre',
        company: 'Nouvelle Entreprise',
        location: 'Lyon, France',
        startDate: new Date('2021-01-01'),
        endDate: new Date('2024-01-01'),
        description: 'Description mise à jour',
      };

      prismaMock.experience.update.mockResolvedValue(updatedExperience);

      const response = await app.inject({
        method: 'PUT',
        url: `/cvs/${testCV.id}/experiences/${experienceId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          title: 'Nouveau Titre',
          company: 'Nouvelle Entreprise',
          location: 'Lyon, France',
          startDate: '2021-01-01',
          endDate: '2024-01-01',
          description: 'Description mise à jour',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().title).toBe('Nouveau Titre');
      expect(response.json().company).toBe('Nouvelle Entreprise');
    });

    it('devrait retourner 404 pour une expérience inexistante', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.experience.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'PUT',
        url: `/cvs/${testCV.id}/experiences/nonexistent-id`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          title: 'New Title',
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /cvs/{cvId}/experiences/{expId}', () => {
    it('devrait supprimer une expérience', async () => {
      const experienceId = 'exp-1';
      
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.experience.findUnique.mockResolvedValue({
        id: experienceId,
        cvId: testCV.id,
        title: 'Developer',
      });
      prismaMock.experience.delete.mockResolvedValue({
        id: experienceId,
        cvId: testCV.id,
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/cvs/${testCV.id}/experiences/${experienceId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(204);
      expect(prismaMock.experience.delete).toHaveBeenCalledWith({
        where: { id: experienceId },
      });
    });

    it('devrait retourner 404 pour une expérience inexistante', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.experience.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'DELETE',
        url: `/cvs/${testCV.id}/experiences/nonexistent-id`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});