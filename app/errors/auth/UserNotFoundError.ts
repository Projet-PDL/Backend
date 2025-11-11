import { BaseError } from '../BaseError';


export class UserNotFoundError extends BaseError {
  constructor(email: string) {
    super(
      `User with email "${email}" not found.`,
      'USER_NOT_FOUND',
      404,
      { email },
      'AuthService.findUser',
      'Verify the email address and try again.'
    );
  }
}