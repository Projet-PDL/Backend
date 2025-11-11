import { Type } from '@sinclair/typebox';
import { CommonErrorResponses } from '../baseSchema';
import { BearerAuthHeader } from '../baseHeaders';

const baseProfileInfo = Type.Object({
    firstName: Type.Optional(Type.String()),
    lastName: Type.Optional(Type.String()),
    headline: Type.Optional(Type.String()),
    professionalSummary: Type.Optional(Type.String()),
    email: Type.Optional(Type.String({ format: 'email' })),
    phone: Type.Optional(Type.String()),
    street: Type.Optional(Type.String()),
    city: Type.Optional(Type.String()),
    postalCode: Type.Optional(Type.String()),
    region: Type.Optional(Type.String()),
    country: Type.Optional(Type.String()),
    websiteUrl: Type.Optional(Type.String({ format: 'uri' })),
}, { additionalProperties: false });

export const addProfileInfoSchema = {
    params: Type.Object({ cvId: Type.Integer() }),
    headers: BearerAuthHeader,
    body: baseProfileInfo,
    response: {
        201: Type.Object({
            success: Type.Literal(true),
            data: Type.Object({ cvId: Type.Integer() }),
        }),
        ...CommonErrorResponses,
    },
};

export const updateProfileInfoSchema = {
    params: Type.Object({ cvId: Type.Integer() }),
    headers: BearerAuthHeader,
    body: Type.Partial(baseProfileInfo),
    response: {
        200: Type.Object({
            success: Type.Literal(true),
            data: Type.Object({ cvId: Type.Integer() }),
        }),
        ...CommonErrorResponses,
    },
};
