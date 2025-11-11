import { FastifyReply, FastifyRequest } from 'fastify';
import * as service from '../services/languageService';

type CvIdParams = { cvId: number };
type LanguageIdParams = { cvId: number; languageId: number };
type CreateLanguageBody = {
    languageName: string;
    proficiencyLevel?: string;
    position?: number;
};
type UpdateLanguageBody = {
    languageName?: string;
    proficiencyLevel?: string;
    position?: number;
};

export async function listLanguages(
    request: FastifyRequest<{ Params: CvIdParams }>,
    reply: FastifyReply
) {
    try {
    const { cvId } = request.params;
    const languages = await service.listByCv(cvId);
        return reply.code(200).send({ success: true, data: languages });
    } catch (error: any) {
        console.error('[listLanguages] Error:', error);
        return reply.code(error.statusCode || 500).send({
            success: false,
            message: error.message || 'Failed to list languages',
        });
    }
}

export async function createLanguage(
    request: FastifyRequest<{ Params: CvIdParams; Body: CreateLanguageBody }>,
    reply: FastifyReply
) {
    try {
    const { cvId } = request.params;
    const data = request.body;
    const language = await service.create(cvId, data);
        return reply.code(201).send({ success: true, data: language });
    } catch (error: any) {
        console.error('[createLanguage] Error:', error);
        return reply.code(error.statusCode || 500).send({
            success: false,
            message: error.message || 'Failed to create language',
        });
    }
}

export async function updateLanguage(
    request: FastifyRequest<{ Params: LanguageIdParams; Body: UpdateLanguageBody }>,
    reply: FastifyReply
) {
    try {
       
        const { languageId } = request.params;
        const data = request.body;
        const language = await service.update( languageId, data);
        
        return reply.code(200).send({ success: true, data: language });
    } catch (error: any) {
        console.error('[updateLanguage] Error:', error);
        return reply.code(error.statusCode || 500).send({
            success: false,
            message: error.message || 'Failed to update language',
        });
    }
}

export async function deleteLanguage(
    request: FastifyRequest<{ Params: LanguageIdParams }>,
    reply: FastifyReply
) {
    try {
        const { languageId } = request.params;
        await service.remove(languageId);
        return reply.code(204).send();
    } catch (error: any) {
        console.error('[deleteLanguage] Error:', error);
        return reply.code(error.statusCode || 500).send({
            success: false,
            message: error.message || 'Failed to delete language',
        });
    }
}