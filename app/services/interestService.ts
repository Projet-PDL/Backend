import prisma from './prismaService';

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
    } catch (e) {
        console.error('[addInterests]', e);
        throw e;
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
    } catch (e) {
        console.error('[putInterests]', e);
        throw e;
    }
}