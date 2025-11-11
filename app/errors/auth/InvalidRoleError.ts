import { BaseError } from '../BaseError';

export class InvalidRoleError extends BaseError {
  constructor() {
    super(
      `Invalid role provided.`,
      'INVALID_ROLE',
      400,
      undefined,
      'AuthService.validateRole',
      'Roles are no longer supported. Remove role from requests.'
    );
  }
}




