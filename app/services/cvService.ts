import prisma from './prismaService';
import { NotFoundError, CreationError, DeletionError } from '../errors/crud';
import { BaseError } from '../errors/BaseError';

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
        if (error instanceof BaseError) throw error;
        console.error('[listByUser] Prisma error:', error);
        // Listing failures are treated as generic creation error for now to provide context
        throw new CreationError('CV', error, 'cvService.listByUser');
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
        if (error instanceof BaseError) throw error;
        console.error('[create] Prisma error:', error);
        throw new CreationError('CV', error, 'cvService.create');
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
            throw new NotFoundError('CV', { id: cvId }, 'cvService.getById');
        }

        return cv;
    } catch (error: any) {
        if (error instanceof BaseError) throw error;
        console.error('[getById] Prisma error:', error);
        if (error.statusCode) throw error;
        throw new CreationError('CV', error, 'cvService.getById');
    }
}

export async function remove(userId: number, cvId: number) {
    try {
        const exist = await prisma.cV.findFirst({ where: { id: cvId, userId }, select: { id: true } });
        if (!exist) {
            throw new NotFoundError('CV', { id: cvId }, 'cvService.remove');
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
        if (error instanceof BaseError) throw error;
        console.error('[remove] Prisma error:', error);
        throw new DeletionError('CV', error, 'cvService.remove');
    }
}
