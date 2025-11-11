import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import * as authService from '../services/authService';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const token = (request.headers.authorization || '').trim();
  if (!token) {
    return reply.code(401).send({
      success: false,
      message: 'Authorization header missing',
    });
  }

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
    console.error(err);
    return reply.code(401).send({ success: false, message: 'Invalid token' });
  }
}

const authMiddleware: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', requireAuth);
};

export default authMiddleware;