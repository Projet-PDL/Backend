import { FastifyInstance } from 'fastify';
import { login, verifyToken, register } from '../../handlers/authHandler';
import { loginSchema, registerSchema, verifyTokenSchema } from './auth.schema';



const authRoutes = async (fastify: FastifyInstance) => {
  // POST /login - Authenticate user and return a JWT token
  fastify.post('/login', { schema: { ...loginSchema, tags: ['Authentication'] } }, login);

  // GET /login/verify-token - Verify JWT token
  fastify.get('/verify-token', { schema: { ...verifyTokenSchema, tags: ['Authentication'] } }, verifyToken);
  // POST /register - Register a new user
  fastify.post('/register',{ schema: { ...registerSchema, tags: ['Authentication'] } },  register);
};

export default authRoutes;