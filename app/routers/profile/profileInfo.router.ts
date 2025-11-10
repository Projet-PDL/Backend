import { FastifyInstance } from 'fastify';
import * as ctrl from '../../handlers/profileInfoHandler';
import { addProfileInfoSchema, updateProfileInfoSchema } from './profileInfo.schema';

const profileInfoRoutes = async (fastify: FastifyInstance) => {
    //fastify.addHook('preHandler', requireAuth);

    fastify.post('/', { schema: addProfileInfoSchema }, ctrl.addProfileInfo);
    fastify.put('/', { schema: updateProfileInfoSchema }, ctrl.updateProfileInfo);
};

export default profileInfoRoutes;
