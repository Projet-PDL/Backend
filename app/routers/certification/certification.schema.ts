import { Type } from '@sinclair/typebox';
import { CommonErrorResponses } from '../baseSchema';
import { BearerAuthHeader } from '../baseHeaders';

const ParamsCvId = Type.Object({
    cvId: Type.Integer(),
});

const ParamsCvAndId = (name: string) =>
    Type.Object({
        cvId: Type.Integer(),
        [name]: Type.Integer(),
    });


export const addCertificationSchema = {
    params: ParamsCvId,
    headers: BearerAuthHeader,
    body: Type.Object({
        name: Type.String(),
        issuer: Type.Optional(Type.String()),
        issueDate: Type.Optional(Type.String({ format: 'date-time' })),
        expirationDate: Type.Optional(Type.String({ format: 'date-time' })),
        credentialUrl: Type.Optional(Type.String()),
        position: Type.Optional(Type.Integer()),
    }, { additionalProperties: false }),
    response: {
        201: Type.Object({ success: Type.Literal(true), data: Type.Object({ id: Type.Integer() }) }),
        ...CommonErrorResponses,
    },
};

export const updateCertificationSchema = {
    params: ParamsCvAndId('certId'),
    headers: BearerAuthHeader,
    body: Type.Partial(Type.Object({
        name: Type.String(),
        issuer: Type.String(),
        issueDate: Type.String({ format: 'date-time' }),
        expirationDate: Type.String({ format: 'date-time' }),
        credentialUrl: Type.String(),
        position: Type.Integer(),
    }), { additionalProperties: false }),
    response: {
        200: Type.Object({ success: Type.Literal(true), data: Type.Object({ id: Type.Integer() }) }),
        ...CommonErrorResponses,
    },
};

export const deleteCertificationSchema = {
    params: ParamsCvAndId('certId'),
    headers: BearerAuthHeader,
    response: { 204: Type.Null(), ...CommonErrorResponses },
};