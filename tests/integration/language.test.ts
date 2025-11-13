// tests/integration/language.test.ts
import { FastifyInstance } from 'fastify';
import { build, createTestUser, createTestCV, generateTestToken } from '../helper';
import { prismaMock } from '../setup';

describe('Language Routes - Integration Tests', () => {
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

  describe('POST /cvs/{cvId}/languages', () => {
    it('devrait ajouter une nouvelle langue', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      
      const newLanguage = {
        id: 1,
        cvId: parseInt(testCV.id),
        name: 'Anglais',
        level: 'Courant',
      };

      prismaMock.language.create.mockResolvedValue(newLanguage);

      const response = await app.inject({
        method: 'POST',
        url: `/cvs/${testCV.id}/languages`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: 'Anglais',
          level: 'Courant',
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().success).toBe(true);
      expect(response.json().data).toHaveProperty('id');
    });

    it('devrait valider les champs requis', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);

      const response = await app.inject({
        method: 'POST',
        url: `/cvs/${testCV.id}/languages`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          // Manque le nom
          level: 'Débutant',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('devrait accepter différents niveaux de langue', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      
      const levels = ['Débutant', 'Intermédiaire', 'Avancé', 'Courant', 'Natif'];
      
      for (let i = 0; i < levels.length; i++) {
        const language = {
          id: i + 1,
          cvId: parseInt(testCV.id),
          name: `Langue ${i}`,
          level: levels[i],
        };

        prismaMock.language.create.mockResolvedValueOnce(language);

        const response = await app.inject({
          method: 'POST',
          url: `/cvs/${testCV.id}/languages`,
          headers: {
            authorization: `Bearer ${authToken}`,
          },
          payload: {
            name: `Langue ${i}`,
            level: levels[i],
          },
        });

        expect(response.statusCode).toBe(201);
        expect(response.json().success).toBe(true);
      }
    });

    it('devrait gérer plusieurs langues différentes', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      
      const languages = [
        { id: 10, cvId: parseInt(testCV.id), name: 'Français', level: 'Natif' },
        { id: 11, cvId: parseInt(testCV.id), name: 'Espagnol', level: 'Intermédiaire' },
        { id: 12, cvId: parseInt(testCV.id), name: 'Allemand', level: 'Débutant' },
      ];

      for (const lang of languages) {
        prismaMock.language.create.mockResolvedValueOnce(lang);

        const response = await app.inject({
          method: 'POST',
          url: `/cvs/${testCV.id}/languages`,
          headers: {
            authorization: `Bearer ${authToken}`,
          },
          payload: {
            name: lang.name,
            level: lang.level,
          },
        });

        expect(response.statusCode).toBe(201);
      }
    });
  });

  describe('PUT /cvs/{cvId}/languages/{langId}', () => {
    it('devrait modifier une langue existante', async () => {
      const languageId = 1;
      
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.language.findUnique.mockResolvedValue({
        id: languageId,
        cvId: parseInt(testCV.id),
        name: 'Anglais',
        level: 'Intermédiaire',
      });

      const updatedLanguage = {
        id: languageId,
        cvId: parseInt(testCV.id),
        name: 'Anglais',
        level: 'Courant',
      };

      prismaMock.language.update.mockResolvedValue(updatedLanguage);

      const response = await app.inject({
        method: 'PUT',
        url: `/cvs/${testCV.id}/languages/${languageId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: 'Anglais',
          level: 'Courant',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().success).toBe(true);
      expect(response.json().data).toHaveProperty('id');
    });

    it('devrait permettre de changer le nom de la langue', async () => {
      const languageId = 2;
      
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.language.findUnique.mockResolvedValue({
        id: languageId,
        cvId: parseInt(testCV.id),
        name: 'Espagnol',
        level: 'Débutant',
      });

      const updatedLanguage = {
        id: languageId,
        cvId: parseInt(testCV.id),
        name: 'Italien',
        level: 'Débutant',
      };

      prismaMock.language.update.mockResolvedValue(updatedLanguage);

      const response = await app.inject({
        method: 'PUT',
        url: `/cvs/${testCV.id}/languages/${languageId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: 'Italien',
          level: 'Débutant',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().success).toBe(true);
    });

    it('devrait retourner 404 pour une langue inexistante', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.language.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'PUT',
        url: `/cvs/${testCV.id}/languages/9999`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: 'Portugais',
          level: 'Avancé',
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /cvs/{cvId}/languages/{langId}', () => {
    it('devrait supprimer une langue', async () => {
      const languageId = 1;
      
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.language.findUnique.mockResolvedValue({
        id: languageId,
        cvId: parseInt(testCV.id),
        name: 'Anglais',
        level: 'Courant',
      });
      prismaMock.language.delete.mockResolvedValue({
        id: languageId,
        cvId: parseInt(testCV.id),
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/cvs/${testCV.id}/languages/${languageId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(204);
      expect(prismaMock.language.delete).toHaveBeenCalledWith({
        where: { id: languageId },
      });
    });

    it('devrait retourner 404 pour une langue inexistante', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.language.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'DELETE',
        url: `/cvs/${testCV.id}/languages/9999`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});