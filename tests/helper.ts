// tests/helper.ts
import Fastify, { FastifyInstance } from 'fastify';
import { prismaMock } from './setup';

// Import de tes routes (adapte les chemins selon ta structure)
import authRouter from '../app/routers/auth/auth.router';
import cvRouter from '../app/routers/cv/cv.router';
import educationRouter from '../app/routers/education/education.router';
import experienceRouter from '../app/routers/experience/experience.route';
import skillRouter from '../app/routers/skill/skill.router';
import languageRouter from '../app/routers/language/language.router';
import certificationRouter from '../app/routers/certification/certification.router';
import interestRouter from '../app/routers/interest/interest.router';
import profileRouter from '../app/routers/profile/profileInfo.router';

export async function build(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false, // Désactive les logs pendant les tests
  });

  // Enregistre tes middlewares si nécessaire
  // app.register(require('../app/middleware/auth'));

  // Enregistre toutes tes routes
  app.register(authRouter, { prefix: '/auth' });

  app.register(cvRouter, { prefix: '/cvs' });
  app.register(educationRouter, { prefix: '/cvs/education' });
  app.register(experienceRouter, { prefix: '/cvs/experience' });
  app.register(skillRouter, { prefix: '/cvs/skills' });
  app.register(languageRouter, { prefix: '/cvs/languages' });
  app.register(certificationRouter, { prefix: '/cvs/certifications' });
  app.register(interestRouter, { prefix: '/cvs/interests' });
  app.register(profileRouter, { prefix: '/cvs/profile' });

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