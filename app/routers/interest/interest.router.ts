import { FastifyInstance } from 'fastify';
import * as ctrl from '../../handlers/interestHandler';
import {addInterestsSchema, putInterestsSchema} from "./interest.schema";

const interestRoutes = async (fastify: FastifyInstance) => {
    //fastify.addHook('preHandler', requireAuth);

    fastify.post('/:cvId/interests', { schema: addInterestsSchema }, ctrl.addInterests);
    fastify.put('/:cvId/interests', { schema: putInterestsSchema }, ctrl.putInterests);

};

export default interestRoutes;
