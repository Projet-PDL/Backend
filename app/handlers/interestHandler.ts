import { FastifyReply, FastifyRequest } from 'fastify';
import * as cvInterest from '../services/interestService';

type CvParams = { cvId: number };
type CvAndInterestParams = { cvId: number; interestId: number };

export async function addInterests(req: FastifyRequest<{ Params: CvParams }>, reply: FastifyReply) {
    try {
        const inserted = await cvInterest.addInterests(req.params.cvId, (req.body as any).items);
        return reply.code(201).send({ success: true, data: { inserted } });
    } catch (e: any) {
        console.error('[addInterests]', e);
        return reply.code(e.statusCode || 500).send({ success: false, message: e.message || 'Failed to add interests' });
    }
}

export async function putInterests(req: FastifyRequest<{ Params: CvParams }>, reply: FastifyReply) {
    try {
        const replaced = await cvInterest.putInterests(req.params.cvId, (req.body as any).items);
        return reply.code(200).send({ success: true, data: { replaced } });
    } catch (e: any) {
        console.error('[putInterests]', e);
        return reply.code(e.statusCode || 500).send({ success: false, message: e.message || 'Failed to replace interests' });
    }
}

export async function deleteInterest(req: FastifyRequest<{ Params: CvAndInterestParams }>, reply: FastifyReply) {
    try {
        await cvInterest.deleteInterest(req.params.cvId, req.params.interestId);
        return reply.code(200).send({ success: true, message: 'Interest deleted successfully' });
    } catch (e: any) {
        console.error('[deleteInterest]', e);
        return reply.code(e.statusCode || 500).send({ success: false, message: e.message || 'Failed to delete interest' });
    }
}