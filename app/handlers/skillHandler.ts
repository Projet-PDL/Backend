import { FastifyReply, FastifyRequest } from 'fastify';
import * as cvSkill from '../services/skillService';

type CvParams = { cvId: number };
type CvSkillParams = { cvId: number; skillId: number };

export async function addSkills(req: FastifyRequest<{ Params: CvParams }>, reply: FastifyReply) {
    try {
        const inserted = await cvSkill.addSkills(req.params.cvId, (req.body as any).items);
        return reply.code(201).send({ success: true, data: { inserted } });
    } catch (e: any) {
        console.error('[addSkills]', e);
        return reply.code(e.statusCode || 500).send({ success: false, message: e.message || 'Failed to add skills' });
    }
}

export async function deleteSkill(req: FastifyRequest<{ Params: CvSkillParams }>, reply: FastifyReply) {
    try {
        await cvSkill.deleteSkill(req.params.cvId, req.params.skillId);
        return reply.code(204).send();
    } catch (e: any) {
        console.error('[deleteSkill]', e);
        return reply.code(e.statusCode || 500).send({ success: false, message: e.message || 'Failed to delete skill' });
    }
}