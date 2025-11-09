export const IEmailSenderWorker = Symbol('IEmailSenderWorker');
export interface IEmailSenderWorker {
  sendEmail(
    to: string,
    template: string,
    context: Record<string, any>,
  ): Promise<void>;
}
