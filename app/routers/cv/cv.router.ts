import { FastifyInstance } from 'fastify';
import * as ctrl from '../../handlers/cvHandler';
import { listSchema, createSchema, getByIdSchema, deleteSchema } from './cv.schema';

const cvRoutes = async (fastify: FastifyInstance) => {
    //fastify.addHook('preHandler', requireAuth);

    fastify.get('/', { schema: listSchema }, ctrl.listMyCvs);
    fastify.post('/', { schema: createSchema }, ctrl.createCv);
    fastify.get('/:cvId', { schema: getByIdSchema }, ctrl.getCvById);
    fastify.delete('/:cvId', { schema: deleteSchema }, ctrl.deleteCv);
};

export default cvRoutes;
