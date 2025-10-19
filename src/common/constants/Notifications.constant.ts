import { Notification } from 'firebase-admin/messaging';

export enum NotificationTypes {
  CUSTOM = 'CUSTOM',
  WELCOME = 'WELCOME',
  LOCATION_REQUEST_APPROVED = 'LOCATION_REQUEST_APPROVED',
  LOCATION_REQUEST_REJECTED = 'LOCATION_REQUEST_REJECTED',
  LOCATION_REQUEST_NEEDS_MORE_INFO = 'LOCATION_REQUEST_NEEDS_MORE_INFO',
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
};
