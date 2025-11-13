// tests/integration/skill.test.ts
import { FastifyInstance } from 'fastify';
import { build, createTestUser, createTestCV, generateTestToken } from '../helper';
import { prismaMock } from '../setup';

describe('Skill Routes - Integration Tests', () => {
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

  describe('POST /cvs/{cvId}/skills', () => {
    it('devrait ajouter une nouvelle compétence', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      
      const newSkill = {
        id: 1,
        cvId: parseInt(testCV.id),
        name: 'JavaScript',
        level: 'Expert',
        category: 'Langages de programmation',
      };

      prismaMock.skill.create.mockResolvedValue(newSkill);

      const response = await app.inject({
        method: 'POST',
        url: `/cvs/${testCV.id}/skills`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: 'JavaScript',
          level: 'Expert',
          category: 'Langages de programmation',
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().success).toBe(true);
      expect(response.json().data).toHaveProperty('id');
    });

    it('devrait valider le nom de la compétence', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);

      const response = await app.inject({
        method: 'POST',
        url: `/cvs/${testCV.id}/skills`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          // Manque le nom
          level: 'Expert',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('devrait accepter une compétence sans catégorie', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      
      const skillWithoutCategory = {
        id: 2,
        cvId: parseInt(testCV.id),
        name: 'Communication',
        level: 'Avancé',
        category: null,
      };

      prismaMock.skill.create.mockResolvedValue(skillWithoutCategory);

      const response = await app.inject({
        method: 'POST',
        url: `/cvs/${testCV.id}/skills`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: 'Communication',
          level: 'Avancé',
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().success).toBe(true);
    });

    it('devrait gérer différents niveaux de compétence', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      
      const levels = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'];
      
      for (let i = 0; i < levels.length; i++) {
        const skill = {
          id: i + 10,
          cvId: parseInt(testCV.id),
          name: `Compétence ${i}`,
          level: levels[i],
          category: 'Technique',
        };

        prismaMock.skill.create.mockResolvedValueOnce(skill);

        const response = await app.inject({
          method: 'POST',
          url: `/cvs/${testCV.id}/skills`,
          headers: {
            authorization: `Bearer ${authToken}`,
          },
          payload: {
            name: `Compétence ${i}`,
            level: levels[i],
            category: 'Technique',
          },
        });

        expect(response.statusCode).toBe(201);
        expect(response.json().success).toBe(true);
      }
    });

    it('devrait gérer plusieurs catégories de compétences', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      
      const skills = [
        { id: 20, cvId: parseInt(testCV.id), name: 'React', level: 'Expert', category: 'Frameworks' },
        { id: 21, cvId: parseInt(testCV.id), name: 'Docker', level: 'Avancé', category: 'DevOps' },
        { id: 22, cvId: parseInt(testCV.id), name: 'PostgreSQL', level: 'Intermédiaire', category: 'Bases de données' },
      ];

      for (const skill of skills) {
        prismaMock.skill.create.mockResolvedValueOnce(skill);

        const response = await app.inject({
          method: 'POST',
          url: `/cvs/${testCV.id}/skills`,
          headers: {
            authorization: `Bearer ${authToken}`,
          },
          payload: {
            name: skill.name,
            level: skill.level,
            category: skill.category,
          },
        });

        expect(response.statusCode).toBe(201);
      }
    });
  });

  describe('PUT /cvs/{cvId}/skills/{skillId}', () => {
    it('devrait modifier une compétence existante', async () => {
      const skillId = 1;
      
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.skill.findUnique.mockResolvedValue({
        id: skillId,
        cvId: parseInt(testCV.id),
        name: 'JavaScript',
        level: 'Intermédiaire',
        category: 'Programmation',
      });

      const updatedSkill = {
        id: skillId,
        cvId: parseInt(testCV.id),
        name: 'JavaScript',
        level: 'Expert',
        category: 'Langages de programmation',
      };

      prismaMock.skill.update.mockResolvedValue(updatedSkill);

      const response = await app.inject({
        method: 'PUT',
        url: `/cvs/${testCV.id}/skills/${skillId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: 'JavaScript',
          level: 'Expert',
          category: 'Langages de programmation',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().success).toBe(true);
      expect(response.json().data).toHaveProperty('id');
    });

    it('devrait permettre de changer la catégorie', async () => {
      const skillId = 2;
      
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.skill.findUnique.mockResolvedValue({
        id: skillId,
        cvId: parseInt(testCV.id),
        name: 'Leadership',
        level: 'Avancé',
        category: 'Soft Skills',
      });

      const updatedSkill = {
        id: skillId,
        cvId: parseInt(testCV.id),
        name: 'Leadership',
        level: 'Expert',
        category: 'Management',
      };

      prismaMock.skill.update.mockResolvedValue(updatedSkill);

      const response = await app.inject({
        method: 'PUT',
        url: `/cvs/${testCV.id}/skills/${skillId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: 'Leadership',
          level: 'Expert',
          category: 'Management',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().success).toBe(true);
    });

    it('devrait retourner 404 pour une compétence inexistante', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.skill.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'PUT',
        url: `/cvs/${testCV.id}/skills/9999`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: 'Python',
          level: 'Expert',
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /cvs/{cvId}/skills/{skillId}', () => {
    it('devrait supprimer une compétence', async () => {
      const skillId = 1;
      
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.skill.findUnique.mockResolvedValue({
        id: skillId,
        cvId: parseInt(testCV.id),
        name: 'JavaScript',
        level: 'Expert',
      });
      prismaMock.skill.delete.mockResolvedValue({
        id: skillId,
        cvId: parseInt(testCV.id),
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/cvs/${testCV.id}/skills/${skillId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(204);
      expect(prismaMock.skill.delete).toHaveBeenCalledWith({
        where: { id: skillId },
      });
    });

    it('devrait retourner 404 pour une compétence inexistante', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.skill.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'DELETE',
        url: `/cvs/${testCV.id}/skills/9999`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});