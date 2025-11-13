// tests/integration/certification.test.ts
import { FastifyInstance } from 'fastify';
import { build, createTestUser, createTestCV, generateTestToken } from '../helper';
import { prismaMock } from '../setup';

describe('Certification Routes - Integration Tests', () => {
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

  describe('POST /cvs/{cvId}/certifications', () => {
    it('devrait ajouter une nouvelle certification', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      
      const newCertification = {
        id: 1,
        cvId: parseInt(testCV.id),
        name: 'AWS Solutions Architect',
        issuer: 'Amazon Web Services',
        date: new Date('2023-06-15'),
        url: 'https://aws.amazon.com/certification/',
      };

      prismaMock.certification.create.mockResolvedValue(newCertification);

      const response = await app.inject({
        method: 'POST',
        url: `/cvs/${testCV.id}/certifications`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: 'AWS Solutions Architect',
          issuer: 'Amazon Web Services',
          date: '2023-06-15',
          url: 'https://aws.amazon.com/certification/',
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
        url: `/cvs/${testCV.id}/certifications`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          // Manque le nom de la certification
          issuer: 'Some Issuer',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('devrait accepter une certification sans URL', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      
      const certificationWithoutUrl = {
        id: 2,
        cvId: parseInt(testCV.id),
        name: 'Scrum Master Certified',
        issuer: 'Scrum Alliance',
        date: new Date('2022-03-20'),
        url: null,
      };

      prismaMock.certification.create.mockResolvedValue(certificationWithoutUrl);

      const response = await app.inject({
        method: 'POST',
        url: `/cvs/${testCV.id}/certifications`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: 'Scrum Master Certified',
          issuer: 'Scrum Alliance',
          date: '2022-03-20',
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().success).toBe(true);
    });
  });

  describe('PUT /cvs/{cvId}/certifications/{certId}', () => {
    it('devrait modifier une certification existante', async () => {
      const certificationId = 1;
      
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.certification.findUnique.mockResolvedValue({
        id: certificationId,
        cvId: parseInt(testCV.id),
        name: 'Old Certification',
        issuer: 'Old Issuer',
      });

      const updatedCertification = {
        id: certificationId,
        cvId: parseInt(testCV.id),
        name: 'Certification Mise à Jour',
        issuer: 'Nouvel Organisme',
        date: new Date('2024-01-10'),
        url: 'https://example.com/cert',
      };

      prismaMock.certification.update.mockResolvedValue(updatedCertification);

      const response = await app.inject({
        method: 'PUT',
        url: `/cvs/${testCV.id}/certifications/${certificationId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: 'Certification Mise à Jour',
          issuer: 'Nouvel Organisme',
          date: '2024-01-10',
          url: 'https://example.com/cert',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().success).toBe(true);
      expect(response.json().data).toHaveProperty('id');
    });

    it('devrait retourner 404 pour une certification inexistante', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.certification.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'PUT',
        url: `/cvs/${testCV.id}/certifications/9999`,
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

  describe('DELETE /cvs/{cvId}/certifications/{certId}', () => {
    it('devrait supprimer une certification', async () => {
      const certificationId = 1;
      
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.certification.findUnique.mockResolvedValue({
        id: certificationId,
        cvId: parseInt(testCV.id),
        name: 'Certification à supprimer',
      });
      prismaMock.certification.delete.mockResolvedValue({
        id: certificationId,
        cvId: parseInt(testCV.id),
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/cvs/${testCV.id}/certifications/${certificationId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(204);
      expect(prismaMock.certification.delete).toHaveBeenCalledWith({
        where: { id: certificationId },
      });
    });

    it('devrait retourner 404 pour une certification inexistante', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(testCV);
      prismaMock.certification.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'DELETE',
        url: `/cvs/${testCV.id}/certifications/9999`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});