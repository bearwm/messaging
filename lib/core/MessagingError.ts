export default class MessagingError extends Error {
  readonly ns: string = '@labs42/messaging';

  constructor(
    public readonly reason: string,
    public readonly comment: string = '') {

    super(`Messaging error reason: ${reason}. ${comment}`);
    Object.setPrototypeOf(this, MessagingError.prototype);
  }
}
