import prisma from './prismaService';

type CreateLanguageData = {
    languageName: string;
    proficiencyLevel?: string;
    position?: number;
};

type UpdateLanguageData = {
    languageName?: string;
    proficiencyLevel?: string;
    position?: number;
};

export async function listByCv(cvId: number) {
    try {
        const languages = await prisma.language.findMany({
            where: { cvId },
            orderBy: { position: 'asc' },
            select: {
                id: true,
                languageName: true,
                proficiencyLevel: true,
                position: true,
            },
        });

        return languages;
    } catch (error: any) {
        console.error('[listByCv] Prisma error:', error);
        if (error.statusCode) throw error;
        throw new Error('Failed to list languages');
    }
}

export async function create(cvId: number, data: CreateLanguageData) {
    try {
        const language = await prisma.language.create({
            data: {
                cvId,
                languageName: data.languageName,
                proficiencyLevel: data.proficiencyLevel ?? null,
                position: data.position ?? null,
            },
            select: {
                id: true,
                languageName: true,
                proficiencyLevel: true,
                position: true,
                createdAt: true,
            },
        });

        return language;
    } catch (error: any) {
        console.error('[create] Prisma error:', error);
        if (error.statusCode) throw error;
        throw new Error('Failed to create language');
    }
}

export async function getById(cvId: number, languageId: number) {
    try {
        const language = await prisma.language.findFirst({
            where: { id: languageId, cvId },
        });

        if (!language) {
            const err: any = new Error('Language not found');
            err.statusCode = 404;
            throw err;
        }

        return {
            id: language.id,
            languageName: language.languageName,
            proficiencyLevel: language.proficiencyLevel,
            position: language.position,
            createdAt: language.createdAt,
        };
    } catch (error: any) {
        console.error('[getById] Prisma error:', error);
        if (error.statusCode) throw error;
        throw new Error('Failed to retrieve language');
    }
}

export async function update(
    languageId: number,
    data: UpdateLanguageData
) {
    try {
       
        const updated = await prisma.language.update({
            where: { id: languageId },
            data: {
                ...(data.languageName !== undefined && { languageName: data.languageName }),
                ...(data.proficiencyLevel !== undefined && { proficiencyLevel: data.proficiencyLevel }),
                ...(data.position !== undefined && { position: data.position }),
            },
            select: {
                id: true,
                languageName: true,
                proficiencyLevel: true,
                position: true,
                createdAt: true,
            },
        });

        return updated;
    } catch (error: any) {
        console.error('[update] Prisma error:', error);
        if (error.statusCode) throw error;
        throw new Error('Failed to update language');
    }
}

export async function remove( languageId: number) {
    try {
        const exist = await prisma.language.findFirst({
            where: { id: languageId },
        });

        if (!exist ) {
            const err: any = new Error('Language not found');
            err.statusCode = 404;
            throw err;
        }

        await prisma.language.delete({
            where: { id: languageId },
        });
    } catch (error: any) {
        console.error('[remove] Prisma error:', error);
        if (error.statusCode) throw error;
        throw new Error('Failed to delete language');
    }
}