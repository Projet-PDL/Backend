import { FastifyInstance } from 'fastify';
import * as ctrl from '../../handlers/cvHandler';
import { listSchema, createSchema, getByIdSchema, deleteSchema } from './cv.schema';
import { generateFromLinkedInSchema } from './linkedin.schema';
import * as linkedInCtrl from '../../handlers/linkedInHandler';
import educationRoutes from "../education/education.router";
import skillRoutes from "../skill/skill.router";
import certificationRoutes from "../certification/certification.router";
import interestRoutes from "../interest/interest.router";
import profileInfoRoutes from "../profile/profileInfo.router";
import languageRoutes from "../language/language.router";
import experienceRoutes from "../experience/experience.route";
import authMiddleware, { requireAuth } from '../../middlewares/authMiddleware';
import requireCvOwnership from '../../middlewares/cvOwnershipMiddleware';


const cvRoutes = async (fastify: FastifyInstance) => {
    fastify.register(async (secure) => {
        // requireAuth must run first to populate request.user
        secure.addHook('preHandler', requireAuth);
        // Only check ownership when :cvId param exists
        secure.addHook('preHandler', async (req, reply) => {
            const params: any = req.params || {};
            if ('cvId' in params) {
                return requireCvOwnership(req, reply);
            }
            return;
        });

        secure.get('/', { schema: { ...listSchema, tags: ['CV Management'] } }, ctrl.listMyCvs);
        secure.post('/', { schema: { ...createSchema, tags: ['CV Management'] } }, ctrl.createCv);
        secure.post('/:cvId/generate-from-linkedin', { schema: { ...generateFromLinkedInSchema, tags: ['CV Management'] } }, linkedInCtrl.generateCVFromLinkedIn);
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