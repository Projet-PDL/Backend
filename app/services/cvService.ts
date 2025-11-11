import prisma from './prismaService';

type ListOpts = { q?: string; updatedAfter?: string; page: number; size: number };

export async function listByUser(userId: string, opts: ListOpts) {
    try {
        const where: any = { userId };
        if (opts.q) where.title = { contains: opts.q, mode: 'insensitive' };
        if (opts.updatedAfter) where.updatedAt = { gte: new Date(opts.updatedAfter) };

        const [items, total] = await Promise.all([
            prisma.cV.findMany({
                where,
                orderBy: { updatedAt: 'desc' },
                skip: opts.page * opts.size,
                take: opts.size,
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            prisma.cV.count({ where }),
        ]);

        return { items, page: opts.page, size: opts.size, total };
    } catch (error: any) {
        console.error('[listByUser] Prisma error:', error);
        throw new Error('Failed to list CVs');
    }
}

export async function create(userId: number, data: { title?: string }) {
    try {
        const cv = await prisma.cV.create({
            data: { userId, title: data.title ?? null },
            select: { id: true, title: true, createdAt: true, updatedAt: true },
        });
        return cv;
    } catch (error: any) {
        console.error('[create] Prisma error:', error);
        throw new Error('Failed to create CV');
    }
}

export async function getById(userId: number, cvId: number) {
    try {
        const cv = await prisma.cV.findFirst({
            where: { id: cvId, userId },
            include: {
                profileInfo: true,
                experiences: true,
                educations: true,
                skills: true,
                languages: true,
                certifications: true,
                interests: true,
            },
        });

        if (!cv) {
            const err: any = new Error('CV not found');
            err.statusCode = 404;
            throw err;
        }

        return cv;
    } catch (error: any) {
        console.error('[getById] Prisma error:', error);
        if (error.statusCode) throw error;
        throw new Error('Failed to retrieve CV');
    }
}

export async function remove(userId: number, cvId: number) {
    try {
        const exist = await prisma.cV.findFirst({ where: { id: cvId, userId }, select: { id: true } });
        if (!exist) {
            const err: any = new Error('CV not found');
            err.statusCode = 404;
            throw err;
        }

        await prisma.$transaction(async (tx: any) => {
            await tx.profileInfo.deleteMany({ where: { cvId } });
            await tx.experience.deleteMany({ where: { cvId } });
            await tx.education.deleteMany({ where: { cvId } });
            await tx.skill.deleteMany({ where: { cvId } });
            await tx.language.deleteMany({ where: { cvId } });
            await tx.certification.deleteMany({ where: { cvId } });
            await tx.interest.deleteMany({ where: { cvId } });
            await tx.cV.delete({ where: { id: cvId } });
        });
    } catch (error: any) {
        console.error('[remove] Prisma error:', error);
        throw new Error('Failed to delete CV');
    }
}
