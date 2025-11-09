import { Type } from '@sinclair/typebox';
import { CommonErrorResponses } from '../baseSchema';

export const listLanguagesSchema = {
    params: Type.Object({
        cvId: Type.Integer(),
    }),
    response: {
        200: Type.Object({
            success: Type.Literal(true),
            data: Type.Array(Type.Object({
                id: Type.Integer(),
                languageName: Type.String(),
                proficiencyLevel: Type.Optional(Type.String()),
                position: Type.Optional(Type.Integer()),
            })),
        }),
        ...CommonErrorResponses,
    },
};

export const createLanguageSchema = {
    params: Type.Object({
        cvId: Type.Integer(),
    }),
    body: Type.Object({
        languageName: Type.String(),
        proficiencyLevel: Type.Optional(Type.String()),
        position: Type.Optional(Type.Integer()),
    }, { additionalProperties: false }),
    response: {
        201: Type.Object({
            success: Type.Literal(true),
            data: Type.Object({
                id: Type.Integer(),
                languageName: Type.String(),
                proficiencyLevel: Type.Optional(Type.String()),
                position: Type.Optional(Type.Integer()),
                createdAt: Type.String(),
            }),
        }),
        ...CommonErrorResponses,
    },
};

export const updateLanguageSchema = {
    params: Type.Object({
        languageId: Type.Integer(),
    }),
    body: Type.Object({
        languageName: Type.Optional(Type.String()),
        proficiencyLevel: Type.Optional(Type.String()),
        position: Type.Optional(Type.Integer()),
    }, { additionalProperties: false }),
    response: {
        200: Type.Object({
            success: Type.Literal(true),
            data: Type.Object({
                id: Type.Integer(),
                languageName: Type.String(),
                proficiencyLevel: Type.Optional(Type.String()),
                position: Type.Optional(Type.Integer()),
                createdAt: Type.String(),
            }),
        }),
        ...CommonErrorResponses,
    },
};

export const deleteLanguageSchema = {
    params: Type.Object({
        languageId: Type.Integer(),
    }),
    response: {
        204: Type.Null(),
        ...CommonErrorResponses,
    },
};