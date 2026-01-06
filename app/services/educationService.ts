import prisma from './prismaService';
import { NotFoundError, CreationError, UpdateError, DeletionError, AlreadyExistsError } from '../errors/crud';



export async function addEducation(cvId: number, dto: any) {
    try {
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
    } catch (e: any) {
        console.error('[addEducation]', e);
        if (e?.code === 'P2002') {
            throw new AlreadyExistsError('Education', null, 'educationService.addEducation');
        }
        throw new CreationError('Education', e, 'educationService.addEducation');
    }
}

export async function updateEducation(cvId: number, eduId: number, dto: any) {
    try {
        const updated = await prisma.education.update({
            where: {
                id: eduId,
                cvId: cvId
            },
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
        if (e?.code === 'P2025') {
            throw new NotFoundError('Education', { id: eduId }, 'educationService.updateEducation');
        }
        console.error('[updateEducation]', e);
        throw new UpdateError('Education', e, 'educationService.updateEducation');
    }
}

export async function deleteEducation(cvId: number, eduId: number) {
    try {
        await prisma.education.delete({
            where: {
                id: eduId,
                cvId: cvId
            }
        });
    } catch (e: any) {
        if (e?.code === 'P2025') {
            throw new NotFoundError('Education', { id: eduId }, 'educationService.deleteEducation');
        }
        console.error('[deleteEducation]', e);
        throw new DeletionError('Education', e, 'educationService.deleteEducation');
    }
}