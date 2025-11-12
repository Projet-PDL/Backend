// tests/integration/auth.test.ts
import { FastifyInstance } from 'fastify';
import { build, createTestUser } from '../helper';
import { prismaMock } from '../setup';
import * as bcrypt from 'bcrypt';

describe('Auth Routes - Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('devrait créer un nouveau compte utilisateur', async () => {
      const newUser = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        name: 'New User',
      };

      // Mock de la réponse Prisma
      prismaMock.user.create.mockResolvedValue({
        id: 'new-user-id',
        email: newUser.email,
        name: newUser.name,
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: newUser,
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toHaveProperty('id');
      expect(response.json().email).toBe(newUser.email);
      expect(response.json()).not.toHaveProperty('password'); // Ne pas renvoyer le mot de passe
    });

    it('devrait rejeter un email déjà existant', async () => {
      prismaMock.user.findUnique.mockResolvedValue(createTestUser());

      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'Password123!',
          name: 'Test',
        },
      });

      expect(response.statusCode).toBe(409); // Conflict
      expect(response.json().message).toContain('existe déjà');
    });

    it('devrait valider le format de l\'email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'invalid-email',
          password: 'Password123!',
          name: 'Test',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      const testUser = createTestUser();
      testUser.password = await bcrypt.hash('CorrectPassword123!', 10);

      prismaMock.user.findUnique.mockResolvedValue(testUser);

      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'CorrectPassword123!',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('token');
      expect(response.json()).toHaveProperty('user');
      expect(response.json().user.email).toBe(testUser.email);
    });

    it('devrait rejeter un mot de passe incorrect', async () => {
      const testUser = createTestUser();
      testUser.password = await bcrypt.hash('CorrectPassword', 10);

      prismaMock.user.findUnique.mockResolvedValue(testUser);

      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'WrongPassword',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('devrait rejeter un utilisateur inexistant', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'nonexistent@example.com',
          password: 'Password123!',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /auth/me', () => {
    it('devrait retourner les informations de l\'utilisateur connecté', async () => {
      const testUser = createTestUser();
      prismaMock.user.findUnique.mockResolvedValue(testUser);

      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: {
          authorization: 'Bearer valid-jwt-token',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().email).toBe(testUser.email);
    });

    it('devrait rejeter une requête sans token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('PUT /auth/me/password', () => {
    it('devrait changer le mot de passe avec succès', async () => {
      const testUser = createTestUser();
      testUser.password = await bcrypt.hash('OldPassword123!', 10);

      prismaMock.user.findUnique.mockResolvedValue(testUser);
      prismaMock.user.update.mockResolvedValue({
        ...testUser,
        password: 'new-hashed-password',
      });

      const response = await app.inject({
        method: 'PUT',
        url: '/auth/me/password',
        headers: {
          authorization: 'Bearer valid-jwt-token',
        },
        payload: {
          oldPassword: 'OldPassword123!',
          newPassword: 'NewPassword123!',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().message).toContain('modifié');
    });

    it('devrait rejeter si l\'ancien mot de passe est incorrect', async () => {
      const testUser = createTestUser();
      testUser.password = await bcrypt.hash('OldPassword123!', 10);

      prismaMock.user.findUnique.mockResolvedValue(testUser);

      const response = await app.inject({
        method: 'PUT',
        url: '/auth/me/password',
        headers: {
          authorization: 'Bearer valid-jwt-token',
        },
        payload: {
          oldPassword: 'WrongOldPassword',
          newPassword: 'NewPassword123!',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});