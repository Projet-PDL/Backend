import { Type } from '@sinclair/typebox';
import { CommonErrorResponses } from '../baseSchema';
import { BearerAuthHeader } from '../baseHeaders';

export const listExperiencesSchema = {
    params: Type.Object({
        cvId: Type.Integer(),
    }),
    headers: BearerAuthHeader,
    response: {
        200: Type.Object({
            success: Type.Literal(true),
            data: Type.Array(Type.Object({
                id: Type.Integer(),
                title: Type.Optional(Type.String()),
                company: Type.Optional(Type.String()),
                location: Type.Optional(Type.String()),
                startDate: Type.Optional(Type.String()),
                endDate: Type.Optional(Type.String()),
                isCurrent: Type.Optional(Type.Boolean()),
                description: Type.Optional(Type.String()),
                position: Type.Optional(Type.Integer()),
            })),
        }),
        ...CommonErrorResponses,
    },
};

export const createExperienceSchema = {
    params: Type.Object({
        cvId: Type.Integer(),
    }),
    headers: BearerAuthHeader,
    body: Type.Object({
        title: Type.Optional(Type.String()),
        company: Type.Optional(Type.String()),
        location: Type.Optional(Type.String()),
        startDate: Type.Optional(Type.String({ format: 'date-time' })),
        endDate: Type.Optional(Type.String({ format: 'date-time' })),
        isCurrent: Type.Optional(Type.Boolean()),
        description: Type.Optional(Type.String()),
        position: Type.Optional(Type.Integer()),
    }, { additionalProperties: false }),
    response: {
        201: Type.Object({
            success: Type.Literal(true),
            data: Type.Object({
                id: Type.Integer(),
                title: Type.Optional(Type.String()),
                company: Type.Optional(Type.String()),
                location: Type.Optional(Type.String()),
                startDate: Type.Optional(Type.String()),
                endDate: Type.Optional(Type.String()),
                isCurrent: Type.Optional(Type.Boolean()),
                description: Type.Optional(Type.String()),
                position: Type.Optional(Type.Integer()),
                createdAt: Type.String(),
                updatedAt: Type.String(),
            }),
        }),
        ...CommonErrorResponses,
    },
};

export const getExperienceByIdSchema = {
    params: Type.Object({
        cvId: Type.Integer(),
        experienceId: Type.Integer(),
    }),
    headers: BearerAuthHeader,
    response: {
        200: Type.Object({
            success: Type.Literal(true),
            data: Type.Object({
                id: Type.Integer(),
                title: Type.Optional(Type.String()),
                company: Type.Optional(Type.String()),
                location: Type.Optional(Type.String()),
                startDate: Type.Optional(Type.String()),
                endDate: Type.Optional(Type.String()),
                isCurrent: Type.Optional(Type.Boolean()),
                description: Type.Optional(Type.String()),
                position: Type.Optional(Type.Integer()),
                createdAt: Type.String(),
                updatedAt: Type.String(),
            }),
        }),
        ...CommonErrorResponses,
    },
};

export const updateExperienceSchema = {
    params: Type.Object({
        cvId: Type.Integer(),
        experienceId: Type.Integer(),
    }),
    headers: BearerAuthHeader,
    body: Type.Object({
        title: Type.Optional(Type.String()),
        company: Type.Optional(Type.String()),
        location: Type.Optional(Type.String()),
        startDate: Type.Optional(Type.String({ format: 'date-time' })),
        endDate: Type.Optional(Type.String({ format: 'date-time' })),
        isCurrent: Type.Optional(Type.Boolean()),
        description: Type.Optional(Type.String()),
        position: Type.Optional(Type.Integer()),
    }, { additionalProperties: false }),
    response: {
        200: Type.Object({
            success: Type.Literal(true),
            data: Type.Object({
                id: Type.Integer(),
                title: Type.Optional(Type.String()),
                company: Type.Optional(Type.String()),
                location: Type.Optional(Type.String()),
                startDate: Type.Optional(Type.String()),
                endDate: Type.Optional(Type.String()),
                isCurrent: Type.Optional(Type.Boolean()),
                description: Type.Optional(Type.String()),
                position: Type.Optional(Type.Integer()),
                createdAt: Type.String(),
                updatedAt: Type.String(),
            }),
        }),
        ...CommonErrorResponses,
    },
};

export const deleteExperienceSchema = {
    params: Type.Object({
        cvId: Type.Integer(),
        experienceId: Type.Integer(),
    }),
    headers: BearerAuthHeader,
    response: {
        204: Type.Null(),
        ...CommonErrorResponses,
    },
};