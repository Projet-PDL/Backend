import { Type } from '@sinclair/typebox';

export const BearerAuthHeader = Type.Object(
  {
    authorization: Type.String({ pattern: '^Bearer\\s.+$' }),
  },
  { additionalProperties: true }
);