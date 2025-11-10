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

    fastify.get('/:cvId/experiences', { schema: listExperiencesSchema }, ctrl.listExperiences);
    fastify.post('/:cvId/experiences', { schema: createExperienceSchema }, ctrl.createExperience);
    fastify.get('/:cvId/experiences/:experienceId', { schema: getExperienceByIdSchema }, ctrl.getExperienceById);
    fastify.put('/:cvId/experiences/:experienceId', { schema: updateExperienceSchema }, ctrl.updateExperience);
    fastify.delete('/:cvId/experiences/:experienceId', { schema: deleteExperienceSchema }, ctrl.deleteExperience);
};

export default experienceRoutes;