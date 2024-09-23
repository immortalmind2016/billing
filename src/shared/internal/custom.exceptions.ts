export abstract class CustomInternalError extends Error {
  constructor(message: string) {
    super(message);
  }
}
