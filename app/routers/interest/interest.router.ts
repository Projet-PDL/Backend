import { FastifyInstance } from 'fastify';
import * as ctrl from '../../handlers/interestHandler';
import {addInterestsSchema, putInterestsSchema, deleteInterestSchema} from "./interest.schema";

const interestRoutes = async (fastify: FastifyInstance) => {
    //fastify.addHook('preHandler', requireAuth);

    fastify.post('/interests', { schema: { ...addInterestsSchema, tags: ['Interest Management'] } }, ctrl.addInterests);
    fastify.put('/interests', { schema: { ...putInterestsSchema, tags: ['Interest Management'] } }, ctrl.putInterests);
    fastify.delete('/:interestId', { schema: { ...deleteInterestSchema, tags: ['Interest Management'] } }, ctrl.deleteInterest);

};

export default interestRoutes;
