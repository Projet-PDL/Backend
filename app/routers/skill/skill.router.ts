import { FastifyInstance } from 'fastify';
import * as ctrl from '../../handlers/skillHandler';
import {addSkillsSchema, deleteSkillSchema} from "./skill.schema";

const skillRoutes = async (fastify: FastifyInstance) => {
    //fastify.addHook('preHandler', requireAuth);

    fastify.post('/', { schema: addSkillsSchema }, ctrl.addSkills);
    fastify.delete('/:skillId', { schema: deleteSkillSchema }, ctrl.deleteSkill);
};

export default skillRoutes;
