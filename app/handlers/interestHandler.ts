import { FastifyReply, FastifyRequest } from 'fastify';
import * as cvInterest from '../services/interestService';

type CvParams = { cvId: number };

export async function addInterests(req: FastifyRequest<{ Params: CvParams }>, reply: FastifyReply) {
    try {
        const userId = (req as any).user?.id as string;
        const inserted = await cvInterest.addInterests(userId, req.params.cvId, (req.body as any).items);
        return reply.code(201).send({ success: true, data: { inserted } });
    } catch (e: any) {
        console.error('[addInterests]', e);
        return reply.code(e.statusCode || 500).send({ success: false, message: e.message || 'Failed to add interests' });
    }
}

export async function putInterests(req: FastifyRequest<{ Params: CvParams }>, reply: FastifyReply) {
    try {
        const userId = (req as any).user?.id as string;
        const replaced = await cvInterest.putInterests(userId, req.params.cvId, (req.body as any).items);
        return reply.code(200).send({ success: true, data: { replaced } });
    } catch (e: any) {
        console.error('[putInterests]', e);
        return reply.code(e.statusCode || 500).send({ success: false, message: e.message || 'Failed to replace interests' });
    }
}