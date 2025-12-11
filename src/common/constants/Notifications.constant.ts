import { Notification } from 'firebase-admin/messaging';

export enum NotificationTypes {
  CUSTOM = 'CUSTOM',
  WELCOME = 'WELCOME',
  LOCATION_REQUEST_APPROVED = 'LOCATION_REQUEST_APPROVED',
  LOCATION_REQUEST_REJECTED = 'LOCATION_REQUEST_REJECTED',
  LOCATION_REQUEST_NEEDS_MORE_INFO = 'LOCATION_REQUEST_NEEDS_MORE_INFO',
  WALLET_DEPOSIT_CONFIRMED = 'WALLET_DEPOSIT_CONFIRMED',
  BOOKING_APPROVED = 'BOOKING_APPROVED',
  BOOKING_REJECTED = 'BOOKING_REJECTED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  BOOKING_FORCE_CANCELLED = 'BOOKING_FORCE_CANCELLED',
}

export const NotificationsConstant: {
  [key in NotificationTypes]: {
    payload: Notification;
  };
} = {
  [NotificationTypes.CUSTOM]: {
    payload: {
      title: '{title}',
      body: '{body}',
    },
  },
  [NotificationTypes.WELCOME]: {
    payload: {
      title: 'Hi {name}. Welcome to Urban Lens!',
      body: "Thank you for joining Urban Lens. We're excited to have you on board!",
    },
  },
  [NotificationTypes.LOCATION_REQUEST_APPROVED]: {
    payload: {
      title: 'Your location request has been approved!',
      body: 'Congratulations! Your requested location: {name} is now live on Urban Lens.',
    },
  },
  [NotificationTypes.LOCATION_REQUEST_REJECTED]: {
    payload: {
      title: 'Your location request has been rejected',
      body: 'We regret to inform you that your requested location: {name} has been rejected.',
    },
  },
  [NotificationTypes.LOCATION_REQUEST_NEEDS_MORE_INFO]: {
    payload: {
      title: 'More information needed for your location request',
      body: 'Your requested location: {name} requires additional information. Please check your email for details.',
    },
  },
  [NotificationTypes.WALLET_DEPOSIT_CONFIRMED]: {
    payload: {
      title: 'Deposit confirmed!',
      body: 'Your deposit of {amount} {currency} has been successfully added to your wallet.',
    },
  },
  [NotificationTypes.BOOKING_APPROVED]: {
    payload: {
      title: 'Booking approved!',
      body: 'Your booking for {locationName} has been approved.',
    },
  },
  [NotificationTypes.BOOKING_REJECTED]: {
    payload: {
      title: 'Booking rejected',
      body: 'Your booking for {locationName} has been rejected.',
    },
  },
  [NotificationTypes.BOOKING_CANCELLED]: {
    payload: {
      title: 'Booking cancelled',
      body: 'A booking for your location {locationName} has been cancelled.',
    },
  },
  [NotificationTypes.BOOKING_FORCE_CANCELLED]: {
    payload: {
      title: 'Booking force cancelled',
      body: 'Your booking for {locationName} has been cancelled by the business owner due to unforeseen circumstances.',
    },
  },
};
