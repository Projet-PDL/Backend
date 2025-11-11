import prisma from './prismaService';
import { NotFoundError, CreationError, UpdateError, AlreadyExistsError } from '../errors/crud';

export async function addProfileInfo(cvId: number, dto: any) {
    try {
        const created = await prisma.profileInfo.create({
            data: {
                cvId,
                firstName: dto.firstName ?? null,
                lastName: dto.lastName ?? null,
                headline: dto.headline ?? null,
                professionalSummary: dto.professionalSummary ?? null,
                email: dto.email ?? null,
                phone: dto.phone ?? null,
                street: dto.street ?? null,
                city: dto.city ?? null,
                postalCode: dto.postalCode ?? null,
                region: dto.region ?? null,
                country: dto.country ?? null,
                websiteUrl: dto.websiteUrl ?? null,
            },
            select: { cvId: true },
        });
        return created;
    } catch (e: any) {
        console.error('[addProfileInfo]', e);
        if (e?.code === 'P2002') {
            throw new AlreadyExistsError('ProfileInfo', { cvId }, 'profileInfoService.addProfileInfo');
        }
        throw new CreationError('ProfileInfo', e, 'profileInfoService.addProfileInfo');
    }
}

export async function updateProfileInfo(cvId: number, dto: any) {
    try {
        const updated = await prisma.profileInfo.update({
            where: { cvId },
            data: {
                ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
                ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
                ...(dto.headline !== undefined ? { headline: dto.headline } : {}),
                ...(dto.professionalSummary !== undefined ? { professionalSummary: dto.professionalSummary } : {}),
                ...(dto.email !== undefined ? { email: dto.email } : {}),
                ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
                ...(dto.street !== undefined ? { street: dto.street } : {}),
                ...(dto.city !== undefined ? { city: dto.city } : {}),
                ...(dto.postalCode !== undefined ? { postalCode: dto.postalCode } : {}),
                ...(dto.region !== undefined ? { region: dto.region } : {}),
                ...(dto.country !== undefined ? { country: dto.country } : {}),
                ...(dto.websiteUrl !== undefined ? { websiteUrl: dto.websiteUrl } : {}),
            },
            select: { cvId: true },
        });
        return updated;
    } catch (e: any) {
        if (e?.code === 'P2025') {
            throw new NotFoundError('ProfileInfo', { cvId }, 'profileInfoService.updateProfileInfo');
        }
        console.error('[updateProfileInfo]', e);
        throw new UpdateError('ProfileInfo', e, 'profileInfoService.updateProfileInfo');
    }
}
