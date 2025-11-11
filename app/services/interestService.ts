import prisma from './prismaService';
import { CreationError, UpdateError } from '../errors/crud';

export async function addInterests(cvId: number, items: Array<any>) {
    try {
        if (!items?.length) return 0;
        const res = await prisma.interest.createMany({
            data: items.map((i) => ({
                cvId,
                name: i.name,
                category: i.category ?? null,
                source: i.source ?? null,
                position: i.position ?? null,
            })),
        });
        return res.count;
    } catch (e: any) {
        console.error('[addInterests]', e);
        throw new CreationError('Interest', e, 'interestService.addInterests');
    }
}

export async function putInterests(cvId: number, items: Array<any>) {
    try {
        await prisma.$transaction(async (tx) => {
            await tx.interest.deleteMany({ where: { cvId } });
            if (items?.length) {
                await tx.interest.createMany({
                    data: items.map((i) => ({
                        cvId,
                        name: i.name,
                        category: i.category ?? null,
                        source: i.source ?? null,
                        position: i.position ?? null,
                    })),
                });
            }
        });
        return items?.length ?? 0;
    } catch (e: any) {
        console.error('[putInterests]', e);
        throw new UpdateError('Interest', e, 'interestService.putInterests');
    }
}