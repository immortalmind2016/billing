import { CustomInternalError } from './custom.exceptions';

export class EntityNotFoundError extends CustomInternalError {
  constructor(entityName: string, entityId: string) {
    super(`Entity ${entityName} with id ${entityId} not found`);
  }
}

export class EntityCustomError extends CustomInternalError {
  constructor(errorMessage: string) {
    super(errorMessage);
  }
}

export class EntityExistError extends CustomInternalError {
  constructor(message: string) {
    super(message);
  }
}
