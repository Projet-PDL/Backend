import prisma from './prismaService';

async function assertOwnership(userId: string, cvId: number) {
    const owns = await prisma.cV.findFirst({ where: { id: cvId, userId }, select: { id: true } });
    if (!owns) {
        const err: any = new Error('CV not found');
        err.statusCode = 404;
        throw err;
    }
}

export async function addCertification(userId: string, cvId: number, dto: any) {
    try {
        await assertOwnership(userId, cvId);
        const created = await prisma.certification.create({
            data: {
                cvId,
                name: dto.name,
                issuer: dto.issuer ?? null,
                issueDate: dto.issueDate ? new Date(dto.issueDate) : null,
                expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : null,
                credentialUrl: dto.credentialUrl ?? null,
                position: dto.position ?? null,
            },
            select: { id: true },
        });
        return created.id;
    } catch (e) {
        console.error('[addCertification]', e);
        throw e;
    }
}

export async function updateCertification(userId: string, cvId: number, certId: number, dto: any) {
    try {
        await assertOwnership(userId, cvId);
        const updated = await prisma.certification.update({
            where: { id: certId },
            data: {
                ...(dto.name !== undefined ? { name: dto.name } : {}),
                ...(dto.issuer !== undefined ? { issuer: dto.issuer } : {}),
                ...(dto.issueDate !== undefined ? { issueDate: dto.issueDate ? new Date(dto.issueDate) : null } : {}),
                ...(dto.expirationDate !== undefined ? { expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : null } : {}),
                ...(dto.credentialUrl !== undefined ? { credentialUrl: dto.credentialUrl } : {}),
                ...(dto.position !== undefined ? { position: dto.position } : {}),
            },
            select: { id: true },
        });
        return updated.id;
    } catch (e: any) {
        if (e?.code === 'P2025') { const err: any = new Error('Certification not found'); err.statusCode = 404; throw err; }
        console.error('[updateCertification]', e);
        throw e;
    }
}

export async function deleteCertification(userId: string, cvId: number, certId: number) {
    try {
        await assertOwnership(userId, cvId);
        await prisma.certification.delete({ where: { id: certId } });
    } catch (e: any) {
        if (e?.code === 'P2025') { const err: any = new Error('Certification not found'); err.statusCode = 404; throw err; }
        console.error('[deleteCertification]', e);
        throw e;
    }
}