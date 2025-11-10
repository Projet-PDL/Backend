
import exampleRoutes from './example.routes';
import { FastifyInstance } from 'fastify';
import authRoutes from "./auth/auth.router"
import cvRoutes from "./cv/cv.router";

const registerRoutes = (fastify: FastifyInstance) => {
  // Register example routes with a prefix
  fastify.register(exampleRoutes, { prefix: '/example' });
  fastify.register(authRoutes, { prefix: '/auth' });
  fastify.register(cvRoutes, { prefix: '/cvs' });

};

export default registerRoutes;