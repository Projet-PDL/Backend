import { FastifyInstance } from 'fastify';
import * as ctrl from '../../handlers/cvHandler';
import { listSchema, createSchema, getByIdSchema, deleteSchema } from './cv.schema';
import educationRoutes from "../education/education.router";
import skillRoutes from "../skill/skill.router";
import certificationRoutes from "../certification/certification.router";
import interestRoutes from "../interest/interest.router";
import profileInfoRoutes from "../profile/profileInfo.router";
import languageRoutes from "../language/language.router";
import experienceRoutes from "../experience/experience.route";
import authMiddleware, { requireAuth } from '../../middlewares/authMiddleware';


const cvRoutes = async (fastify: FastifyInstance) => {
    fastify.register(async (secure) => {
        secure.addHook('preHandler', requireAuth);

        secure.get('/', { schema: { ...listSchema, tags: ['CV Management'] } }, ctrl.listMyCvs);
        secure.post('/', { schema: { ...createSchema, tags: ['CV Management'] } }, ctrl.createCv);
        secure.get('/:cvId', { schema: { ...getByIdSchema, tags: ['CV Management'] } }, ctrl.getCvById);
        secure.delete('/:cvId', { schema: { ...deleteSchema, tags: ['CV Management'] } }, ctrl.deleteCv);

        secure.register(educationRoutes, { prefix: '/:cvId/education' });
        secure.register(skillRoutes, { prefix: '/:cvId/skill' });
        secure.register(certificationRoutes, { prefix: '/:cvId/certification' });
        secure.register(interestRoutes, { prefix: '/:cvId/interest' });
        secure.register(profileInfoRoutes, { prefix: '/:cvId/profile-info' });
        secure.register(languageRoutes, { prefix: '/:cvId/language' });
        secure.register(experienceRoutes, { prefix: '/:cvId/experience' });
    });
};

export default cvRoutes;