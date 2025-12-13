export const ACCOUNT_WARNING_CREATED_EVENT = 'account.warning-created';

export class AccountWarningCreatedEvent {
  constructor(
    public readonly warningId: string,
    public readonly accountId: string,
  ) {}
}
