import { FastifyInstance } from 'fastify';
import * as ctrl from '../../handlers/interestHandler';
import {addInterestsSchema, putInterestsSchema} from "./interest.schema";

const interestRoutes = async (fastify: FastifyInstance) => {
    //fastify.addHook('preHandler', requireAuth);

    fastify.post('/:cvId/interests', { schema: { ...addInterestsSchema, tags: ['Interest Management'] } }, ctrl.addInterests);
    fastify.put('/:cvId/interests', { schema: { ...putInterestsSchema, tags: ['Interest Management'] } }, ctrl.putInterests);

};

export default interestRoutes;
