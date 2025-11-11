import { FastifyInstance } from 'fastify';
import { login, register } from '../../handlers/authHandler';
import { loginSchema, registerSchema } from './auth.schema';



const authRoutes = async (fastify: FastifyInstance) => {
  // POST /login - Authenticate user and return a JWT token
  fastify.post('/login', { schema: { ...loginSchema, tags: ['Authentication'] } }, login);

  // POST /register - Register a new user
  fastify.post('/register',{ schema: { ...registerSchema, tags: ['Authentication'] } },  register);
};

export default authRoutes;