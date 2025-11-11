import { FastifyInstance } from 'fastify';
import * as ctrl from '../../handlers/certificationHandler';
import {addCertificationSchema, deleteCertificationSchema, updateCertificationSchema} from "./certification.schema";

const certificationRoutes = async (fastify: FastifyInstance) => {
    //fastify.addHook('preHandler', requireAuth);

    fastify.post('/', { schema: { ...addCertificationSchema, tags: ['Certification Management'] } }, ctrl.addCertification);
    fastify.put('/:certId', { schema: { ...updateCertificationSchema, tags: ['Certification Management'] } }, ctrl.updateCertification);
    fastify.delete('/:certId', { schema: { ...deleteCertificationSchema, tags: ['Certification Management'] } }, ctrl.deleteCertification);

};

export default certificationRoutes;
