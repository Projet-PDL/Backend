import { BearerAuthHeader } from '../baseHeaders';
import { BaseError } from '../../errors/BaseError';

export const generateFromLinkedInSchema = {
  headers: BearerAuthHeader,
  params: {
    type: 'object',
    required: ['cvId'],
    properties: {
      cvId: {
        type: 'integer',
        minimum: 1,
        description: 'Existing CV identifier that will be synchronized with LinkedIn data',
      },
    },
  },
  body: {
    type: 'object',
    required: ['linkedInUrl'],
    properties: {
      linkedInUrl: {
        type: 'string',
        description: 'LinkedIn profile URL (e.g., https://www.linkedin.com/in/username/)',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            userId: { type: 'number' },
            title: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
            profileInfo: { type: 'object' },
            experiences: { type: 'array' },
            skills: { type: 'array' },
            certifications: { type: 'array' },
            interests: { type: 'array' },
            languages: { type: 'array' },
            educations: { type: 'array' },
          },
        },
      },
    },
    400: BaseError.getErrorResponseSchema(),
    401: BaseError.getErrorResponseSchema(),
    403: BaseError.getErrorResponseSchema(),
    404: BaseError.getErrorResponseSchema(),
    500: BaseError.getErrorResponseSchema(),
    503: BaseError.getErrorResponseSchema(),
  },
};
