import { FastifyInstance } from 'fastify';
import * as ctrl from '../../handlers/skillHandler';
import {addSkillsSchema, deleteSkillSchema} from "./skill.schema";

const skillRoutes = async (fastify: FastifyInstance) => {
    //fastify.addHook('preHandler', requireAuth);

    fastify.post('/', { schema: { ...addSkillsSchema, tags: ['Skill Management'] } }, ctrl.addSkills);
    fastify.delete('/:skillId', { schema: { ...deleteSkillSchema, tags: ['Skill Management'] } }, ctrl.deleteSkill);
};

export default skillRoutes;
