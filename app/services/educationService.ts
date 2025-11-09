import prisma from './prismaService';

async function assertOwnership(userId: string, cvId: number) {
    const owns = await prisma.cV.findFirst({ where: { id: cvId, userId }, select: { id: true } });
    if (!owns) {
        const err: any = new Error('CV not found');
        err.statusCode = 404;
        throw err;
    }
}

export async function addEducation(userId: string, cvId: number, dto: any) {
    try {
        await assertOwnership(userId, cvId);
        const created = await prisma.education.create({
            data: {
                cvId,
                school: dto.school ?? null,
                degree: dto.degree ?? null,
                fieldOfStudy: dto.fieldOfStudy ?? null,
                startDate: dto.startDate ? new Date(dto.startDate) : null,
                endDate: dto.endDate ? new Date(dto.endDate) : null,
                description: dto.description ?? null,
                position: dto.position ?? null,
            },
            select: { id: true },
        });
        return created.id;
    } catch (e) {
        console.error('[addEducation]', e);
        throw e;
    }
}

export async function updateEducation(userId: string, cvId: number, eduId: number, dto: any) {
    try {
        await assertOwnership(userId, cvId);
        const updated = await prisma.education.update({
            where: { id: eduId },
            data: {
                ...(dto.school !== undefined ? { school: dto.school } : {}),
                ...(dto.degree !== undefined ? { degree: dto.degree } : {}),
                ...(dto.fieldOfStudy !== undefined ? { fieldOfStudy: dto.fieldOfStudy } : {}),
                ...(dto.startDate !== undefined ? { startDate: dto.startDate ? new Date(dto.startDate) : null } : {}),
                ...(dto.endDate !== undefined ? { endDate: dto.endDate ? new Date(dto.endDate) : null } : {}),
                ...(dto.description !== undefined ? { description: dto.description } : {}),
                ...(dto.position !== undefined ? { position: dto.position } : {}),
            },
            select: { id: true },
        });
        return updated.id;
    } catch (e: any) {
        if (e?.code === 'P2025') { const err: any = new Error('Education not found'); err.statusCode = 404; throw err; }
        console.error('[updateEducation]', e);
        throw e;
    }
}

export async function deleteEducation(userId: string, cvId: number, eduId: number) {
    try {
        await assertOwnership(userId, cvId);
        await prisma.education.delete({ where: { id: eduId } });
    } catch (e: any) {
        if (e?.code === 'P2025') { const err: any = new Error('Education not found'); err.statusCode = 404; throw err; }
        console.error('[deleteEducation]', e);
        throw e;
    }
}