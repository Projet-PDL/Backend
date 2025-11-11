import { BaseError } from '../BaseError';

/**
 * Generic CRUD-related errors for reuse across services.
 */
export class NotFoundError extends BaseError {
  constructor(resource: string, identifier?: any, context?: string, suggestion?: string) {
    const details = identifier === undefined ? undefined : { identifier };
    super(
      `${resource} not found${identifier !== undefined ? ` (identifier: ${JSON.stringify(identifier)})` : ''}`,
      `${resource.toUpperCase()}_NOT_FOUND`,
      404,
      details,
      context,
      suggestion,
      true
    );
  }
}

export class AlreadyExistsError extends BaseError {
  constructor(resource: string, identifier?: any, context?: string, suggestion?: string) {
    const details = identifier === undefined ? undefined : { identifier };
    super(
      `${resource} already exists${identifier !== undefined ? ` (identifier: ${JSON.stringify(identifier)})` : ''}`,
      `${resource.toUpperCase()}_ALREADY_EXISTS`,
      409,
      details,
      context,
      suggestion,
      true
    );
  }
}

export class CreationError extends BaseError {
  constructor(resource: string, details?: any, context?: string, suggestion?: string) {
    super(
      `Failed to create ${resource}`,
      `${resource.toUpperCase()}_CREATION_FAILED`,
      500,
      details,
      context,
      suggestion,
      true
    );
  }
}

export class UpdateError extends BaseError {
  constructor(resource: string, details?: any, context?: string, suggestion?: string) {
    super(
      `Failed to update ${resource}`,
      `${resource.toUpperCase()}_UPDATE_FAILED`,
      500,
      details,
      context,
      suggestion,
      true
    );
  }
}

export class DeletionError extends BaseError {
  constructor(resource: string, details?: any, context?: string, suggestion?: string) {
    super(
      `Failed to delete ${resource}`,
      `${resource.toUpperCase()}_DELETION_FAILED`,
      500,
      details,
      context,
      suggestion,
      true
    );
  }
}

export default {
  NotFoundError,
  AlreadyExistsError,
  CreationError,
  UpdateError,
  DeletionError,
};
