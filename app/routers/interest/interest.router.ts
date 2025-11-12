import { FastifyInstance } from 'fastify';
import * as ctrl from '../../handlers/interestHandler';
import {addInterestsSchema, putInterestsSchema} from "./interest.schema";

const interestRoutes = async (fastify: FastifyInstance) => {
    //fastify.addHook('preHandler', requireAuth);

    fastify.post('/interests', { schema: { ...addInterestsSchema, tags: ['Interest Management'] } }, ctrl.addInterests);
    fastify.put('/interests', { schema: { ...putInterestsSchema, tags: ['Interest Management'] } }, ctrl.putInterests);

};

export default interestRoutes;
