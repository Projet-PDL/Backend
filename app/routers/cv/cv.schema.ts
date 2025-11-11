import { Type } from '@sinclair/typebox';
import { CommonErrorResponses } from '../baseSchema';
import { BearerAuthHeader } from '../baseHeaders';

export const listSchema = {
    headers: BearerAuthHeader,
    querystring: Type.Object({
        q: Type.Optional(Type.String()),
        updatedAfter: Type.Optional(Type.String({ format: 'date-time' })),
        page: Type.Optional(Type.Integer({ minimum: 0, default: 0 })),
        size: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20 })),
    }, { additionalProperties: false }),
    response: {
        200: Type.Object({
            success: Type.Literal(true),
            data: Type.Object({
                items: Type.Array(Type.Object({
                    id: Type.Integer(),
                    title: Type.Optional(Type.String()),
                    createdAt: Type.String(),
                    updatedAt: Type.String(),
                })),
                page: Type.Integer(),
                size: Type.Integer(),
                total: Type.Integer(),
            }),
        }),
        ...CommonErrorResponses,
    },
};

export const createSchema = {
    headers: BearerAuthHeader,
    body: Type.Object({
        title: Type.Optional(Type.String()),
    }, { additionalProperties: false }),
    response: {
        201: Type.Object({
            success: Type.Literal(true),
            data: Type.Object({
                id: Type.Integer(),
                title: Type.Optional(Type.String()),
                createdAt: Type.String(),
                updatedAt: Type.String(),
            }),
        }),
        ...CommonErrorResponses,
    },
};

export const getByIdSchema = {
    params: Type.Object({
        cvId: Type.Integer(),
    }),
    headers: BearerAuthHeader,
    response: {
        200: Type.Object({
            success: Type.Literal(true),
            data: Type.Object({
                id: Type.Integer(),
                title: Type.Optional(Type.String()),
                createdAt: Type.String(),
                updatedAt: Type.String(),
                profileInfo: Type.Optional(Type.Object({
                    firstName: Type.Optional(Type.String()),
                    lastName: Type.Optional(Type.String()),
                    headline: Type.Optional(Type.String()),
                    professionalSummary: Type.Optional(Type.String()),
                    email: Type.Optional(Type.String()),
                    phone: Type.Optional(Type.String()),
                    city: Type.Optional(Type.String()),
                    country: Type.Optional(Type.String()),
                })),
                experiences: Type.Array(Type.Object({
                    id: Type.Integer(),
                    title: Type.Optional(Type.String()),
                    company: Type.Optional(Type.String()),
                    startDate: Type.Optional(Type.String()),
                    endDate: Type.Optional(Type.String()),
                    isCurrent: Type.Optional(Type.Boolean()),
                    description: Type.Optional(Type.String()),
                    position: Type.Optional(Type.Integer()),
                })),
                educations: Type.Array(Type.Object({
                    id: Type.Integer(),
                    school: Type.Optional(Type.String()),
                    degree: Type.Optional(Type.String()),
                    fieldOfStudy: Type.Optional(Type.String()),
                    startDate: Type.Optional(Type.String()),
                    endDate: Type.Optional(Type.String()),
                    description: Type.Optional(Type.String()),
                    position: Type.Optional(Type.Integer()),
                })),
                skills: Type.Array(Type.Object({
                    id: Type.Integer(),
                    skillName: Type.String(),
                    position: Type.Optional(Type.Integer()),
                })),
                languages: Type.Array(Type.Object({
                    id: Type.Integer(),
                    languageName: Type.String(),
                    proficiencyLevel: Type.Optional(Type.String()),
                    position: Type.Optional(Type.Integer()),
                })),
                certifications: Type.Array(Type.Object({
                    id: Type.Integer(),
                    name: Type.String(),
                    issuer: Type.Optional(Type.String()),
                    issueDate: Type.Optional(Type.String()),
                    expirationDate: Type.Optional(Type.String()),
                    credentialUrl: Type.Optional(Type.String()),
                    position: Type.Optional(Type.Integer()),
                })),
                interests: Type.Array(Type.Object({
                    id: Type.Integer(),
                    name: Type.String(),
                    category: Type.Optional(Type.String()),
                    source: Type.Optional(Type.String()),
                    position: Type.Optional(Type.Integer()),
                })),
            }),
        }),
        ...CommonErrorResponses,
    },
};

export const deleteSchema = {
    params: Type.Object({
        cvId: Type.Integer(),
    }),
    headers: BearerAuthHeader,
    response: {
        204: Type.Null(),
        ...CommonErrorResponses,
    },
};
