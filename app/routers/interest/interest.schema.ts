import { Type } from '@sinclair/typebox';
import { CommonErrorResponses } from '../baseSchema';

const ParamsCvId = Type.Object({
    cvId: Type.Integer(),
});

export const addInterestsSchema = {
    params: ParamsCvId,
    body: Type.Object({
        items: Type.Array(Type.Object({
            name: Type.String(),
            category: Type.Optional(Type.String()),
            source: Type.Optional(Type.String()),
            position: Type.Optional(Type.Integer()),
        })),
    }, { additionalProperties: false }),
    response: {
        201: Type.Object({ success: Type.Literal(true), data: Type.Object({ inserted: Type.Integer() }) }),
        ...CommonErrorResponses,
    },
};

export const putInterestsSchema = {
    params: ParamsCvId,
    body: Type.Object({
        items: Type.Array(Type.Object({
            name: Type.String(),
            category: Type.Optional(Type.String()),
            source: Type.Optional(Type.String()),
            position: Type.Optional(Type.Integer()),
        })),
    }, { additionalProperties: false }),
    response: {
        200: Type.Object({ success: Type.Literal(true), data: Type.Object({ replaced: Type.Integer() }) }),
        ...CommonErrorResponses,
    },
};