import { FastifyInstance } from 'fastify';
import { updateProfileImage, getProfileImage } from '../../handlers/userHandler';
import { requireAuth } from '../../middlewares/authMiddleware';

const userRoutes = async (fastify: FastifyInstance) => {
  // GET /users/me/image - get authenticated user's profile image URL
  fastify.get('/me/image', {
    preHandler: requireAuth,
    schema: {
      tags: ['User'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                email: { type: 'string' },
                name: { type: 'string' },
                profilePicture: { type: 'string', nullable: true }
              }
            }
          }
        }
      }
    }
  }, getProfileImage);

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