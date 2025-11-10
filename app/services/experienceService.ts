import prisma from './prismaService';

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

export async function listByCv(userId: string, cvId: number) {
    try {
        const cv = await prisma.cV.findFirst({
            where: { id: cvId, userId },
            select: { id: true },
        });

        if (!cv) {
            const err: any = new Error('CV not found');
            err.statusCode = 404;
            throw err;
        }

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
        throw new Error('Failed to list experiences');
    }
}

export async function create(userId: string, cvId: number, data: CreateExperienceData) {
    try {
        const cv = await prisma.cV.findFirst({
            where: { id: cvId, userId },
            select: { id: true },
        });

        if (!cv) {
            const err: any = new Error('CV not found');
            err.statusCode = 404;
            throw err;
        }

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
        throw new Error('Failed to create experience');
    }
}

export async function getById(userId: string, cvId: number, experienceId: number) {
    try {
        const experience = await prisma.experience.findFirst({
            where: { id: experienceId, cvId },
            include: { cv: { select: { userId: true } } },
        });

        if (!experience || experience.cv.userId !== userId) {
            const err: any = new Error('Experience not found');
            err.statusCode = 404;
            throw err;
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
        throw new Error('Failed to retrieve experience');
    }
}

export async function update(
    userId: string,
    cvId: number,
    experienceId: number,
    data: UpdateExperienceData
) {
    try {
        const experience = await prisma.experience.findFirst({
            where: { id: experienceId, cvId },
            include: { cv: { select: { userId: true } } },
        });

        if (!experience || experience.cv.userId !== userId) {
            const err: any = new Error('Experience not found');
            err.statusCode = 404;
            throw err;
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
        throw new Error('Failed to update experience');
    }
}

export async function remove(userId: string, cvId: number, experienceId: number) {
    try {
        const exist = await prisma.experience.findFirst({
            where: { id: experienceId, cvId },
            include: { cv: { select: { userId: true } } },
        });

        if (!exist || exist.cv.userId !== userId) {
            const err: any = new Error('Experience not found');
            err.statusCode = 404;
            throw err;
        }

        await prisma.experience.delete({
            where: { id: experienceId },
        });
    } catch (error: any) {
        console.error('[remove] Prisma error:', error);
        if (error.statusCode) throw error;
        throw new Error('Failed to delete experience');
    }
}