import { Type } from '@sinclair/typebox';
import { CommonErrorResponses } from '../baseSchema';

// Ce fichier sert a la declaration des schemas de validation pour les requetes

export const loginSchema = {
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String(),
  }),
  response: {
    200: Type.Object({
      success: Type.Literal(true),
      data: Type.Object({
        token: Type.String()
      })
    }),
    ...CommonErrorResponses,
  }
};

export const verifyTokenSchema = {
  headers: Type.Object({
    authorization: Type.Optional(Type.String())
  }, { additionalProperties: false }),
  response: {
    200: Type.Object({
      success: Type.Literal(true),
      data: Type.Object({
        userId: Type.String(),
      })
    }),
    ...CommonErrorResponses,
  },
};

export const registerSchema = {
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 8 }), // Ensure password has a minimum length
    name: Type.String({ minLength: 1 }), // Ensure name is not empty
  }),
  response: {
    201: Type.Object({
      success: Type.Literal(true),
      data: Type.Object({
        id: Type.Number(),
        email: Type.String({ format: 'email' }),
        name: Type.String(),
      }),
    }),
    ...CommonErrorResponses,
  },
};