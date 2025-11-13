import { FastifyInstance } from 'fastify';
import { updateProfileImage } from '../../handlers/userHandler';
import { requireAuth } from '../../middlewares/authMiddleware';

const userRoutes = async (fastify: FastifyInstance) => {
  // PUT /users/me/image - upload profile image for authenticated user
  fastify.put('/me/image', {
    preHandler: requireAuth,
    schema: {
      tags: ['User'],
      consumes: ['multipart/form-data'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                imageUrl: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, updateProfileImage);
};

export default userRoutes;