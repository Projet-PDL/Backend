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

    fastify.get('/', { schema: { ...listLanguagesSchema, tags: ['Language Management'] } }, ctrl.listLanguages);
    fastify.post('/', { schema: { ...createLanguageSchema, tags: ['Language Management'] } }, ctrl.createLanguage);
    fastify.put('/:languageId', { schema: { ...updateLanguageSchema, tags: ['Language Management'] } }, ctrl.updateLanguage);
    fastify.delete('/:languageId', { schema: { ...deleteLanguageSchema, tags: ['Language Management'] } }, ctrl.deleteLanguage);
};

export default languageRoutes;