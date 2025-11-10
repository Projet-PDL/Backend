import prisma from './prismaService';

async function assertOwnership(userId: string, cvId: number) {
    const owns = await prisma.cV.findFirst({ where: { id: cvId, userId }, select: { id: true } });
    if (!owns) {
        const err: any = new Error('CV not found');
        err.statusCode = 404;
        throw err;
    }
}

export async function addInterests(userId: string, cvId: number, items: Array<any>) {
    try {
        await assertOwnership(userId, cvId);
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
    } catch (e) {
        console.error('[addInterests]', e);
        throw e;
    }
}

export async function putInterests(userId: string, cvId: number, items: Array<any>) {
    try {
        await assertOwnership(userId, cvId);
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
    } catch (e) {
        console.error('[putInterests]', e);
        throw e;
    }
}