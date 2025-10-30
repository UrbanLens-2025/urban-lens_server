import { AccountEntity } from '@/modules/account/domain/Account.entity';

export const USER_REGISTRATION_CONFIRMED = 'user.registration.confirmed';

export class UserRegistrationConfirmedEvent {
  constructor(public readonly user: AccountEntity) {}
}
