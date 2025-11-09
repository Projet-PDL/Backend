import { Type } from '@sinclair/typebox';
import { CommonErrorResponses } from '../baseSchema';

const ParamsCvId = Type.Object({
    cvId: Type.Integer(),
});

const ParamsCvAndId = (name: string) =>
    Type.Object({
        cvId: Type.Integer(),
        [name]: Type.Integer(),
    });

export const addEducationSchema = {
    params: ParamsCvId,
    body: Type.Object({
        school: Type.Optional(Type.String()),
        degree: Type.Optional(Type.String()),
        fieldOfStudy: Type.Optional(Type.String()),
        startDate: Type.Optional(Type.String({ format: 'date-time' })),
        endDate: Type.Optional(Type.String({ format: 'date-time' })),
        description: Type.Optional(Type.String()),
        position: Type.Optional(Type.Integer()),
    }, { additionalProperties: false }),
    response: {
        201: Type.Object({ success: Type.Literal(true), data: Type.Object({ id: Type.Integer() }) }),
        ...CommonErrorResponses,
    },
};

export const updateEducationSchema = {
    params: ParamsCvAndId('eduId'),
    body: Type.Partial(Type.Object({
        school: Type.String(),
        degree: Type.String(),
        fieldOfStudy: Type.String(),
        startDate: Type.String({ format: 'date-time' }),
        endDate: Type.String({ format: 'date-time' }),
        description: Type.String(),
        position: Type.Integer(),
    }), { additionalProperties: false }),
    response: {
        200: Type.Object({ success: Type.Literal(true), data: Type.Object({ id: Type.Integer() }) }),
        ...CommonErrorResponses,
    },
};

export const deleteEducationSchema = {
    params: ParamsCvAndId('eduId'),
    response: { 204: Type.Null(), ...CommonErrorResponses },
};