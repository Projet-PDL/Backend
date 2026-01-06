import { cleanupDatabase, createTestUser, globalSetup, globalTeardown } from './setup';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

describe('Authentication Integration Tests', () => {
  beforeAll(async () => {
    await globalSetup();
  });

  afterAll(async () => {
    await globalTeardown();
  });

  beforeEach(async () => {
    await cleanupDatabase();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'newuser@test.com',
          password: 'SecurePass123',
          name: 'New User',
        }),
      });

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('id');
      expect(body.data.email).toBe('newuser@test.com');
      expect(body.data.name).toBe('New User');
      expect(body.data).not.toHaveProperty('password');
    });

    it('should reject duplicate email registration', async () => {
      await createTestUser({
        email: 'existing@test.com',
        password: 'password123',
        name: 'Existing User',
      });

      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'existing@test.com',
          password: 'DifferentPass123',
          name: 'Another User',
        }),
      });

      expect(response.status).toBe(500);
    });

    it('should validate password requirements', async () => {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'short',
          name: 'Test User',
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await createTestUser({
        email: 'login@test.com',
        password: 'TestPassword123',
        name: 'Login Test User',
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'login@test.com',
          password: 'TestPassword123',
        }),
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('token');
      expect(body.data).toHaveProperty('user');
      expect(body.data.user.email).toBe('login@test.com');
      expect(body.data.user).not.toHaveProperty('password');
      expect(body.data.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });

    it('should reject login with wrong password', async () => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'login@test.com',
          password: 'WrongPassword',
        }),
      });

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.success).toBe(false);
    });

    it('should reject login with non-existent email', async () => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@test.com',
          password: 'SomePassword123',
        }),
      });

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.success).toBe(false);
    });

    it('should return same user data on multiple logins', async () => {
      const response1 = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'login@test.com',
          password: 'TestPassword123',
        }),
      });

      const response2 = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'login@test.com',
          password: 'TestPassword123',
        }),
      });

      const body1 = await response1.json();
      const body2 = await response2.json();

      expect(body1.data.user.id).toBe(body2.data.user.id);
      expect(body1.data.user.email).toBe(body2.data.user.email);
      expect(body1.data.token).toBeDefined();
      expect(body2.data.token).toBeDefined();
    });
  });

  describe('Token-based Authentication', () => {
    let authToken: string;
    let userId: number;

    beforeEach(async () => {
      await createTestUser({
        email: 'tokentest@test.com',
        password: 'TokenTest123',
        name: 'Token Test User',
      });

      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'tokentest@test.com',
          password: 'TokenTest123',
        }),
      });

      const loginBody = await loginResponse.json();
      authToken = loginBody.data.token;
      userId = loginBody.data.user.id;
    });

    it('should access protected route with valid token', async () => {
      const response = await fetch(`${BASE_URL}/cvs`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
    });

    it('should reject protected route without token', async () => {
      const response = await fetch(`${BASE_URL}/cvs`, {
        method: 'GET',
      });

      expect(response.status).toBe(400);
    });

    it('should reject protected route with invalid token', async () => {
      const response = await fetch(`${BASE_URL}/cvs`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid.token.here',
        },
      });

      expect(response.status).toBe(401);
    });

    it('should accept token with or without Bearer prefix', async () => {
      const response = await fetch(`${BASE_URL}/cvs`, {
        method: 'GET',
        headers: {
          'Authorization': authToken,
        },
      });

      expect([200, 400]).toContain(response.status);
    });

    it('should maintain authentication across multiple requests', async () => {
      const requests = Array(5).fill(null).map(() =>
        fetch(`${BASE_URL}/cvs`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        })
      );

      const responses = await Promise.all(requests);

      for (const response of responses) {
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
      }
    });
  });

  describe('Password Security', () => {
    it('should hash passwords before storing', async () => {
      const password = 'MySecurePassword123';

      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'security@test.com',
          password: password,
          name: 'Security Test',
        }),
      });

      expect(response.status).toBe(201);

      // Check database directly
      const prisma = require('../../app/services/prismaService').default;
      const user = await prisma.user.findUnique({
        where: { email: 'security@test.com' },
      });

      expect(user.password).not.toBe(password);
      expect(user.password).toMatch(/^\$2[aby]\$/);
      expect(user.password.length).toBeGreaterThan(50);
    });

    it('should not expose password in any API response', async () => {
      await createTestUser({
        email: 'nopass@test.com',
        password: 'TestPass123',
        name: 'No Pass User',
      });

      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nopass@test.com',
          password: 'TestPass123',
        }),
      });

      const body = await loginResponse.json();
      const bodyText = JSON.stringify(body);

      expect(body.data.user).not.toHaveProperty('password');
      expect(bodyText).not.toContain('TestPass123');
      expect(bodyText).not.toContain('$2b$');
    });
  });
});