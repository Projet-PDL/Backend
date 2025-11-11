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

export const addSkillsSchema = {
    params: ParamsCvId,
    headers: BearerAuthHeader,
    body: Type.Object({
        // Supporter soit une string unique, soit une liste d'objets
        items: Type.Union([
            Type.Array(Type.Object({
                skillName: Type.String(),
                position: Type.Optional(Type.Integer()),
            })),
            Type.Array(Type.String())
        ]),
    }, { additionalProperties: false }),
    response: {
        201: Type.Object({
            success: Type.Literal(true),
            data: Type.Object({ inserted: Type.Integer() }),
        }),
        ...CommonErrorResponses,
    },
};

export const deleteSkillSchema = {
    params: ParamsCvAndId('skillId'),
    headers: BearerAuthHeader,
    response: { 204: Type.Null(), ...CommonErrorResponses },
};