import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import * as authService from '../services/authService';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const raw = (request.headers.authorization || '').trim();
  if (!raw) {
    return reply.code(401).send({ success: false, message: 'Authorization header missing' });
  }

  // Accept both 'Bearer <token>' and raw token
  const token = raw.startsWith('Bearer ') || raw.startsWith('bearer ') ? raw.split(' ')[1].trim() : raw;

  try {
    const decoded = await authService.authService.verifyToken(token);
    if (!decoded) {
      return reply.code(401).send({
        success: false,
        message: 'Invalid token',
      });
    }
    (request as any).user = decoded;
  } catch (err) {
    // Do not leak internal error details; return 401 for invalid tokens
    return reply.code(401).send({ success: false, message: 'Invalid token' });
  }
}

const authMiddleware: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', requireAuth);
};

export default authMiddleware;