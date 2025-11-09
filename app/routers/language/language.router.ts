import { FastifyInstance } from 'fastify';
import * as ctrl from '../../handlers/languageHandler';
import { 
    listLanguagesSchema, 
    createLanguageSchema, 
    updateLanguageSchema, 
    deleteLanguageSchema 
} from './language.schema';

const languageRoutes = async (fastify: FastifyInstance) => {
    //fastify.addHook('preHandler', requireAuth);

    fastify.get('/:cvId', { schema: listLanguagesSchema }, ctrl.listLanguages);
    fastify.post('/:cvId', { schema: createLanguageSchema }, ctrl.createLanguage);
    fastify.put('/:languageId', { schema: updateLanguageSchema }, ctrl.updateLanguage);
    fastify.delete('/:languageId', { schema: deleteLanguageSchema }, ctrl.deleteLanguage);
};

export default languageRoutes;