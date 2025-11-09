import { FastifyReply, FastifyRequest } from 'fastify';
import * as cvEducation from '../services/educationService';

type CvParams = { cvId: number };
type CvEduParams = { cvId: number; eduId: number };

export async function addEducation(req: FastifyRequest<{ Params: CvParams }>, reply: FastifyReply) {
    try {
        const userId = (req as any).user?.id as string;
        const id = await cvEducation.addEducation(userId, req.params.cvId, req.body as any);
        return reply.code(201).send({ success: true, data: { id } });
    } catch (e: any) {
        console.error('[addEducation]', e);
        return reply.code(e.statusCode || 500).send({ success: false, message: e.message || 'Failed to add education' });
    }
}

export async function updateEducation(req: FastifyRequest<{ Params: CvEduParams }>, reply: FastifyReply) {
    try {
        const userId = (req as any).user?.id as string;
        const id = await cvEducation.updateEducation(userId, req.params.cvId, req.params.eduId, req.body as any);
        return reply.code(200).send({ success: true, data: { id } });
    } catch (e: any) {
        console.error('[updateEducation]', e);
        return reply.code(e.statusCode || 500).send({ success: false, message: e.message || 'Failed to update education' });
    }
}

export async function deleteEducation(req: FastifyRequest<{ Params: CvEduParams }>, reply: FastifyReply) {
    try {
        const userId = (req as any).user?.id as string;
        await cvEducation.deleteEducation(userId, req.params.cvId, req.params.eduId);
        return reply.code(204).send();
    } catch (e: any) {
        console.error('[deleteEducation]', e);
        return reply.code(e.statusCode || 500).send({ success: false, message: e.message || 'Failed to delete education' });
    }
}