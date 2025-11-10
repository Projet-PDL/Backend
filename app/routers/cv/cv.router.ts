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

const cvRoutes = async (fastify: FastifyInstance) => {
    //fastify.addHook('preHandler', requireAuth);

    fastify.get('/', { schema: listSchema }, ctrl.listMyCvs);
    fastify.post('/', { schema: createSchema }, ctrl.createCv);
    fastify.get('/:cvId', { schema: getByIdSchema }, ctrl.getCvById);
    fastify.delete('/:cvId', { schema: deleteSchema }, ctrl.deleteCv);

    fastify.register(educationRoutes, { prefix: '/:cvId/education' });
    fastify.register(skillRoutes, { prefix: '/:cvId/skill' });
    fastify.register(certificationRoutes, { prefix: '/:cvId/certification' });
    fastify.register(interestRoutes, { prefix: '/:cvId/interest' });
    fastify.register(profileInfoRoutes, { prefix: '/:cvId/profile-info' });
    fastify.register(languageRoutes, {prefix : '/:cvId/language' });
    fastify.register(experienceRoutes, { prefix: '/:cvId/experience' });
};

export default cvRoutes;
