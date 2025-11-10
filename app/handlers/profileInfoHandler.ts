import { FastifyReply, FastifyRequest } from 'fastify';
import * as cvProfileInfo from '../services/profileInfoService';

type CvParams = { cvId: number };

export async function addProfileInfo(req: FastifyRequest<{ Params: CvParams }>, reply: FastifyReply) {
    try {
        const userId = (req as any).user?.id as string;
        const cvId = req.params.cvId;
        const body = req.body as any;
        const result = await cvProfileInfo.addProfileInfo(userId, cvId, body);
        return reply.code(201).send({ success: true, data: { cvId: result.cvId } });
    } catch (error: any) {
        console.error('[addProfileInfo]', error);
        return reply.code(error.statusCode || 500).send({
            success: false,
            message: error.message || 'Failed to add profile info',
        });
    }
}

export async function updateProfileInfo(req: FastifyRequest<{ Params: CvParams }>, reply: FastifyReply) {
    try {
        const userId = (req as any).user?.id as string;
        const cvId = req.params.cvId;
        const body = req.body as any;
        const result = await cvProfileInfo.updateProfileInfo(userId, cvId, body);
        return reply.code(200).send({ success: true, data: { cvId: result.cvId } });
    } catch (error: any) {
        console.error('[updateProfileInfo]', error);
        return reply.code(error.statusCode || 500).send({
            success: false,
            message: error.message || 'Failed to update profile info',
        });
    }
}
