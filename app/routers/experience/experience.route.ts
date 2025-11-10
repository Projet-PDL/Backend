import { FastifyInstance } from 'fastify';
import * as ctrl from '../../handlers/experienceHandler';
import { 
    listExperiencesSchema, 
    createExperienceSchema,
    getExperienceByIdSchema,
    updateExperienceSchema, 
    deleteExperienceSchema 
} from './experience.schema';

const experienceRoutes = async (fastify: FastifyInstance) => {
    //fastify.addHook('preHandler', requireAuth);

    fastify.get('/', { schema: listExperiencesSchema }, ctrl.listExperiences);
    fastify.post('/', { schema: createExperienceSchema }, ctrl.createExperience);
    fastify.get('/:experienceId', { schema: getExperienceByIdSchema }, ctrl.getExperienceById);
    fastify.put('/:experienceId', { schema: updateExperienceSchema }, ctrl.updateExperience);
    fastify.delete('/:experienceId', { schema: deleteExperienceSchema }, ctrl.deleteExperience);
};

export default experienceRoutes;