import { FastifyReply, FastifyRequest } from 'fastify';
import * as cvCertification from '../services/certificationService';

type CvParams = { cvId: number };
type CvCertParams = { cvId: number; certId: number };

export async function addCertification(req: FastifyRequest<{ Params: CvParams }>, reply: FastifyReply) {
    try {
        const userId = (req as any).user?.id as string;
        const id = await cvCertification.addCertification(userId, req.params.cvId, req.body as any);
        return reply.code(201).send({ success: true, data: { id } });
    } catch (e: any) {
        console.error('[addCertification]', e);
        return reply.code(e.statusCode || 500).send({ success: false, message: e.message || 'Failed to add certification' });
    }
}

export async function updateCertification(req: FastifyRequest<{ Params: CvCertParams }>, reply: FastifyReply) {
    try {
        const userId = (req as any).user?.id as string;
        const id = await cvCertification.updateCertification(userId, req.params.cvId, req.params.certId, req.body as any);
        return reply.code(200).send({ success: true, data: { id } });
    } catch (e: any) {
        console.error('[updateCertification]', e);
        return reply.code(e.statusCode || 500).send({ success: false, message: e.message || 'Failed to update certification' });
    }
}

export async function deleteCertification(req: FastifyRequest<{ Params: CvCertParams }>, reply: FastifyReply) {
    try {
        const userId = (req as any).user?.id as string;
        await cvCertification.deleteCertification(userId, req.params.cvId, req.params.certId);
        return reply.code(204).send();
    } catch (e: any) {
        console.error('[deleteCertification]', e);
        return reply.code(e.statusCode || 500).send({ success: false, message: e.message || 'Failed to delete certification' });
    }
}