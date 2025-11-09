import { FastifyReply, FastifyRequest } from 'fastify';
import * as service from '../services/cvService';

type ListQuery = {
    q?: string;
    updatedAfter?: string;
    page?: number;
    size?: number;
};

type CreateBody = { title?: string };
type IdParams = { cvId: number };

export async function listMyCvs(
    request: FastifyRequest<{ Querystring: ListQuery }>,
    reply: FastifyReply
) {
    try {
        const userId = (request as any).user?.id as string;
        const { q, updatedAfter, page = 0, size = 20 } = request.query || {};
        const out = await service.listByUser(userId, { q, updatedAfter, page, size });
        return reply.code(200).send({ success: true, data: out });
    } catch (error: any) {
        console.error('[listMyCvs] Error:', error);
        return reply.code(error.statusCode || 500).send({
            success: false,
            message: error.message || 'An unexpected error occurred',
        });
    }
}

export async function createCv(
    request: FastifyRequest<{ Body: CreateBody }>,
    reply: FastifyReply
) {
    try {
        const userId = (request as any).user?.id as string;
        const { title } = request.body || {};
        const cv = await service.create(userId, { title });
        return reply.code(201).send({ success: true, data: cv });
    } catch (error: any) {
        console.error('[createCv] Error:', error);
        return reply.code(error.statusCode || 500).send({
            success: false,
            message: error.message || 'Failed to create CV',
        });
    }
}

export async function getCvById(
    request: FastifyRequest<{ Params: IdParams }>,
    reply: FastifyReply
) {
    try {
        const userId = (request as any).user?.id as string;
        const { cvId } = request.params;
        const data = await service.getById(userId, cvId);
        return reply.code(200).send({ success: true, data });
    } catch (error: any) {
        console.error('[getCvById] Error:', error);
        return reply.code(error.statusCode || 500).send({
            success: false,
            message: error.message || 'Failed to retrieve CV',
        });
    }
}

export async function deleteCv(
    request: FastifyRequest<{ Params: IdParams }>,
    reply: FastifyReply
) {
    try {
        const userId = (request as any).user?.id as string;
        const { cvId } = request.params;
        await service.remove(userId, cvId);
        return reply.code(204).send();
    } catch (error: any) {
        console.error('[deleteCv] Error:', error);
        return reply.code(error.statusCode || 500).send({
            success: false,
            message: error.message || 'Failed to delete CV',
        });
    }
}
