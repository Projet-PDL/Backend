import prisma from './prismaService';
import { NotFoundError, CreationError, UpdateError, DeletionError } from '../errors/crud';

export async function addCertification(cvId: number, dto: any) {
    try {
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
    } catch (e: any) {
        console.error('[addCertification]', e);
        throw new CreationError('Certification', e, 'certificationService.addCertification');
    }
}

export async function updateCertification(cvId: number, certId: number, dto: any) {
    try {
        // ensure certification belongs to the given cvId
        const existing = await prisma.certification.findFirst({ where: { id: certId, cvId } });
        if (!existing) {
            const err: any = new Error('Certification not found');
            err.statusCode = 404;
            throw err;
        }

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
        if (e?.code === 'P2025') {
            throw new NotFoundError('Certification', { id: certId }, 'certificationService.updateCertification');
        }
        console.error('[updateCertification]', e);
        throw new UpdateError('Certification', e, 'certificationService.updateCertification');
    }
}

export async function deleteCertification(cvId: number, certId: number) {
    try {
        const existing = await prisma.certification.findFirst({ where: { id: certId, cvId } });
        if (!existing) {
            const err: any = new Error('Certification not found');
            err.statusCode = 404;
            throw err;
        }
        await prisma.certification.delete({ where: { id: certId } });
    } catch (e: any) {
        if (e?.code === 'P2025') {
            throw new NotFoundError('Certification', { id: certId }, 'certificationService.deleteCertification');
        }
        console.error('[deleteCertification]', e);
        throw new DeletionError('Certification', e, 'certificationService.deleteCertification');
    }
}