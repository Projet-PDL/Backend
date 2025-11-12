import prisma from './prismaService';
import { NotFoundError, CreationError, UpdateError, DeletionError } from '../errors/crud';

type CreateExperienceData = {
    title?: string;
    company?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
    position?: number;
};

type UpdateExperienceData = {
    title?: string;
    company?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
    position?: number;
};

export async function listByCv(cvId: number) {
    try {
        const experiences = await prisma.experience.findMany({
            where: { cvId },
            orderBy: { position: 'asc' },
            select: {
                id: true,
                title: true,
                company: true,
                location: true,
                startDate: true,
                endDate: true,
                isCurrent: true,
                description: true,
                position: true,
            },
        });

        return experiences;
    } catch (error: any) {
        console.error('[listByCv] Prisma error:', error);
        if (error.statusCode) throw error;
        throw new CreationError('Experience', error, 'experienceService.listByCv');
    }
}

export async function create(cvId: number, data: CreateExperienceData) {
    try {
        const experience = await prisma.experience.create({
            data: {
                cvId,
                title: data.title ?? null,
                company: data.company ?? null,
                location: data.location ?? null,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                isCurrent: data.isCurrent ?? false,
                description: data.description ?? null,
                position: data.position ?? null,
            },
            select: {
                id: true,
                title: true,
                company: true,
                location: true,
                startDate: true,
                endDate: true,
                isCurrent: true,
                description: true,
                position: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return experience;
    } catch (error: any) {
        console.error('[create] Prisma error:', error);
        if (error.statusCode) throw error;
        throw new CreationError('Experience', error, 'experienceService.create');
    }
}

export async function getById(cvId: number, experienceId: number) {
    try {
        const experience = await prisma.experience.findFirst({
            where: { id: experienceId, cvId },
        });

        if (!experience) {
            throw new NotFoundError('Experience', { id: experienceId }, 'experienceService.getById');
        }

        return {
            id: experience.id,
            title: experience.title,
            company: experience.company,
            location: experience.location,
            startDate: experience.startDate,
            endDate: experience.endDate,
            isCurrent: experience.isCurrent,
            description: experience.description,
            position: experience.position,
            createdAt: experience.createdAt,
            updatedAt: experience.updatedAt,
        };
    } catch (error: any) {
        console.error('[getById] Prisma error:', error);
        if (error.statusCode) throw error;
        throw new CreationError('Experience', error, 'experienceService.getById');
    }
}

export async function update(
    cvId: number,
    experienceId: number,
    data: UpdateExperienceData
) {
    try {
        const experience = await prisma.experience.findFirst({ where: { id: experienceId, cvId } });

        if (!experience) {
            throw new NotFoundError('Experience', { id: experienceId }, 'experienceService.update');
        }

        const updated = await prisma.experience.update({
            where: { id: experienceId },
            data: {
                ...(data.title !== undefined && { title: data.title }),
                ...(data.company !== undefined && { company: data.company }),
                ...(data.location !== undefined && { location: data.location }),
                ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
                ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
                ...(data.isCurrent !== undefined && { isCurrent: data.isCurrent }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.position !== undefined && { position: data.position }),
            },
            select: {
                id: true,
                title: true,
                company: true,
                location: true,
                startDate: true,
                endDate: true,
                isCurrent: true,
                description: true,
                position: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return updated;
    } catch (error: any) {
        console.error('[update] Prisma error:', error);
        if (error.statusCode) throw error;
        throw new UpdateError('Experience', error, 'experienceService.update');
    }
}

export async function remove(cvId: number, experienceId: number) {
    try {
        const exist = await prisma.experience.findFirst({ where: { id: experienceId, cvId } });

        if (!exist) {
            throw new NotFoundError('Experience', { id: experienceId }, 'experienceService.remove');
        }

        await prisma.experience.delete({ where: { id: experienceId } });
    } catch (error: any) {
        console.error('[remove] Prisma error:', error);
        if (error.statusCode) throw error;
        throw new DeletionError('Experience', error, 'experienceService.remove');
    }
}