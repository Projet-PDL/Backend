import { FastifyInstance } from 'fastify';
import * as ctrl from '../../handlers/educationHandler';
import {addEducationSchema, deleteEducationSchema, updateEducationSchema} from "./education.schema";

const educationRoutes = async (fastify: FastifyInstance) => {
    //fastify.addHook('preHandler', requireAuth);

    fastify.post('/', { schema: addEducationSchema }, ctrl.addEducation);
    fastify.put('/:eduId', { schema: updateEducationSchema }, ctrl.updateEducation);
    fastify.delete('/:eduId', { schema: deleteEducationSchema }, ctrl.deleteEducation);
};

export default educationRoutes;
