import { FastifyInstance } from 'fastify';
import * as ctrl from '../../handlers/educationHandler';
import {addEducationSchema, deleteEducationSchema, updateEducationSchema} from "./education.schema";

const educationRoutes = async (fastify: FastifyInstance) => {
    //fastify.addHook('preHandler', requireAuth);

    fastify.post('/', { schema: { ...addEducationSchema, tags: ['Education Management'] } }, ctrl.addEducation);
    fastify.put('/:eduId', { schema: { ...updateEducationSchema, tags: ['Education Management'] } }, ctrl.updateEducation);
    fastify.delete('/:eduId', { schema: { ...deleteEducationSchema, tags: ['Education Management'] } }, ctrl.deleteEducation);
};

export default educationRoutes;
