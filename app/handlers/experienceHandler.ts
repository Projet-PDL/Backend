import { FastifyReply, FastifyRequest } from 'fastify';
import * as service from '../services/experienceService';

type CvIdParams = { cvId: number };
type ExperienceIdParams = { cvId: number; experienceId: number };
type CreateExperienceBody = {
    title?: string;
    company?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
    position?: number;
};
type UpdateExperienceBody = {
    title?: string;
    company?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
    position?: number;
};

export async function listExperiences(
    request: FastifyRequest<{ Params: CvIdParams }>,
    reply: FastifyReply
) {
    try {
        const userId = (request as any).user?.id as string;
        const { cvId } = request.params;
        const experiences = await service.listByCv(userId, cvId);
        return reply.code(200).send({ success: true, data: experiences });
    } catch (error: any) {
        console.error('[listExperiences] Error:', error);
        return reply.code(error.statusCode || 500).send({
            success: false,
            message: error.message || 'Failed to list experiences',
        });
    }
}

export async function createExperience(
    request: FastifyRequest<{ Params: CvIdParams; Body: CreateExperienceBody }>,
    reply: FastifyReply
) {
    try {
        const userId = (request as any).user?.id as string;
        const { cvId } = request.params;
        const data = request.body;
        const experience = await service.create(userId, cvId, data);
        return reply.code(201).send({ success: true, data: experience });
    } catch (error: any) {
        console.error('[createExperience] Error:', error);
        return reply.code(error.statusCode || 500).send({
            success: false,
            message: error.message || 'Failed to create experience',
        });
    }
}

export async function getExperienceById(
    request: FastifyRequest<{ Params: ExperienceIdParams }>,
    reply: FastifyReply
) {
    try {
        const userId = (request as any).user?.id as string;
        const { cvId, experienceId } = request.params;
        const experience = await service.getById(userId, cvId, experienceId);
        return reply.code(200).send({ success: true, data: experience });
    } catch (error: any) {
        console.error('[getExperienceById] Error:', error);
        return reply.code(error.statusCode || 500).send({
            success: false,
            message: error.message || 'Failed to retrieve experience',
        });
    }
}

export async function updateExperience(
    request: FastifyRequest<{ Params: ExperienceIdParams; Body: UpdateExperienceBody }>,
    reply: FastifyReply
) {
    try {
        const userId = (request as any).user?.id as string;
        const { cvId, experienceId } = request.params;
        const data = request.body;
        const experience = await service.update(userId, cvId, experienceId, data);
        return reply.code(200).send({ success: true, data: experience });
    } catch (error: any) {
        console.error('[updateExperience] Error:', error);
        return reply.code(error.statusCode || 500).send({
            success: false,
            message: error.message || 'Failed to update experience',
        });
    }
}

export async function deleteExperience(
    request: FastifyRequest<{ Params: ExperienceIdParams }>,
    reply: FastifyReply
) {
    try {
        const userId = (request as any).user?.id as string;
        const { cvId, experienceId } = request.params;
        await service.remove(userId, cvId, experienceId);
        return reply.code(204).send();
    } catch (error: any) {
        console.error('[deleteExperience] Error:', error);
        return reply.code(error.statusCode || 500).send({
            success: false,
            message: error.message || 'Failed to delete experience',
        });
    }
}