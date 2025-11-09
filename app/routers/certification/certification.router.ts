import { FastifyInstance } from 'fastify';
import * as ctrl from '../../handlers/certificationHandler';
import {addCertificationSchema, deleteCertificationSchema, updateCertificationSchema} from "./certification.schema";

const certificationRoutes = async (fastify: FastifyInstance) => {
    //fastify.addHook('preHandler', requireAuth);

    fastify.post('/', { schema: addCertificationSchema }, ctrl.addCertification);
    fastify.put('/:certId', { schema: updateCertificationSchema }, ctrl.updateCertification);
    fastify.delete('/:certId', { schema: deleteCertificationSchema }, ctrl.deleteCertification);

};

export default certificationRoutes;
