import { FastifyInstance } from 'fastify';
import * as ctrl from '../../handlers/profileInfoHandler';
import { addProfileInfoSchema, updateProfileInfoSchema } from './profileInfo.schema';

const profileInfoRoutes = async (fastify: FastifyInstance) => {
    //fastify.addHook('preHandler', requireAuth);

    fastify.post('/', { schema: { ...addProfileInfoSchema, tags: ['Profile Information Management'] } }, ctrl.addProfileInfo);
    fastify.put('/', { schema: { ...updateProfileInfoSchema, tags: ['Profile Information Management'] } }, ctrl.updateProfileInfo);
};

export default profileInfoRoutes;
