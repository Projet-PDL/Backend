import { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../services/prismaService';
import { BaseError } from '../errors/BaseError';

/**
 * Verifies that the CV referenced by `:cvId` belongs to the authenticated user.
 * - If no `cvId` param is present, it is a no-op (allows routes like GET / and POST /).
 * - If CV is missing or doesn't belong to the user, replies with a 403 structured error.
 */
export async function requireCvOwnership(request: FastifyRequest, reply: FastifyReply) {
  try {
    const params: any = request.params || {};
    if (!('cvId' in params)) return; // nothing to check for routes that don't contain cvId

    const cvId = Number(params.cvId);
    if (Number.isNaN(cvId)) {
      const err = new BaseError('Invalid CV identifier', 'CV_INVALID_ID', 400, { cvId: params.cvId }, 'cvOwnershipMiddleware');
      return reply.code(err.statusCode).send(err.toJSON());
    }

    const userId = (request as any).user?.id;
    if (!userId) {
      const err = new BaseError('Unauthorized', 'AUTH_MISSING_USER', 401, null, 'cvOwnershipMiddleware');
      return reply.code(err.statusCode).send(err.toJSON());
    }

    const cv = await prisma.cV.findFirst({ where: { id: cvId, userId } });
    if (!cv) {
      const err = new BaseError('Unauthorized to access this CV', 'CV_FORBIDDEN', 403, { cvId }, 'cvOwnershipMiddleware');
      return reply.code(err.statusCode).send(err.toJSON());
    }

    // passes - allow request to continue
    return;
  } catch (error: any) {
    // Unexpected error: return generic 500
    const err = new BaseError('Failed to validate CV ownership', 'CV_OWNERSHIP_CHECK_FAILED', 500, { error: String(error) }, 'cvOwnershipMiddleware');
    return reply.code(err.statusCode).send(err.toJSON());
  }
}

export default requireCvOwnership;
