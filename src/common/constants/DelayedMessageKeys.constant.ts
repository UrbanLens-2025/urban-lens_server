export enum DelayedMessageKeys {
  PAYMENT_EXPIRED = 'delayed.payment.expired',
  TRANSACTION_EXPIRED = 'delayed.transaction.expired',
  LOCATION_BOOKING_SOFT_LOCK_EXPIRED = 'LOCATION_BOOKING_PAYMENT_EXPIRED',
}

export type DelayedMessageKeysMap = {
  [DelayedMessageKeys.PAYMENT_EXPIRED]: {
    eventId: string;
  };
  [DelayedMessageKeys.TRANSACTION_EXPIRED]: {
    transactionId: string;
  };
  [DelayedMessageKeys.LOCATION_BOOKING_SOFT_LOCK_EXPIRED]: {
    locationBookingId: string;
  };
};

export type DelayedMessagePayload<T extends DelayedMessageKeys> =
  DelayedMessageKeysMap[T];
