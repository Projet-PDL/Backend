
import exampleRoutes from './example.routes';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import authRoutes from "./auth/auth.router"

const registerRoutes = (fastify: FastifyInstance) => {
  // Register example routes with a prefix
  fastify.register(exampleRoutes, { prefix: '/example' });
  
  fastify.register(authRoutes, { prefix: '/auth' });

};

export default registerRoutes;