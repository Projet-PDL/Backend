// tests/helper.ts
import Fastify, { FastifyInstance } from 'fastify';
import { prismaMock } from './setup';

// Import de tes routes (adapte les chemins selon ta structure)
import authRouter from '../app/routers/auth';
import cvRouter from '../app/routers/cv';
import educationRouter from '../app/routers/education';
import experienceRouter from '../app/routers/experience';
import skillRouter from '../app/routers/skill';
import languageRouter from '../app/routers/language';
import certificationRouter from '../app/routers/certification';
import interestRouter from '../app/routers/interests';
import profileRouter from '../app/routers/profile';

export async function build(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false, // Désactive les logs pendant les tests
  });

  // Enregistre tes middlewares si nécessaire
  // app.register(require('../app/middleware/auth'));

  // Enregistre toutes tes routes
  app.register(authRouter, { prefix: '/auth' });
  app.register(cvRouter, { prefix: '/cvs' });
  app.register(educationRouter, { prefix: '/cvs' });
  app.register(experienceRouter, { prefix: '/cvs' });
  app.register(skillRouter, { prefix: '/cvs' });
  app.register(languageRouter, { prefix: '/cvs' });
  app.register(certificationRouter, { prefix: '/cvs' });
  app.register(interestRouter, { prefix: '/cvs' });
  app.register(profileRouter, { prefix: '/cvs' });

  await app.ready();
  return app;
}

// Helper pour générer un token JWT de test
export function generateTestToken(userId: string): string {
  // Utilise ton jwtService pour générer un vrai token
  // Ou retourne un mock token pour les tests
  return 'test-jwt-token-' + userId;
}

// Helper pour créer un utilisateur de test
export function createTestUser() {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Helper pour créer un CV de test
export function createTestCV(userId: string) {
  return {
    id: 'test-cv-id',
    userId,
    title: 'Mon CV Test',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}