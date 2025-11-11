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

    fastify.get('/', { schema: { ...listExperiencesSchema, tags: ['Experience Management'] } }, ctrl.listExperiences);
    fastify.post('/', { schema: { ...createExperienceSchema, tags: ['Experience Management'] } }, ctrl.createExperience);
    fastify.get('/:experienceId', { schema: { ...getExperienceByIdSchema, tags: ['Experience Management'] } }, ctrl.getExperienceById);
    fastify.put('/:experienceId', { schema: { ...updateExperienceSchema, tags: ['Experience Management'] } }, ctrl.updateExperience);
    fastify.delete('/:experienceId', { schema: { ...deleteExperienceSchema, tags: ['Experience Management'] } }, ctrl.deleteExperience);
};

export default experienceRoutes;