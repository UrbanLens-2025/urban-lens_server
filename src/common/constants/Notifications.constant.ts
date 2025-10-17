import { Notification } from 'firebase-admin/messaging';

export enum NotificationTypes {
  CUSTOM = 'CUSTOM',
  WELCOME = 'WELCOME',
  LOCATION_REQUEST_APPROVED = 'LOCATION_REQUEST_APPROVED',
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
};
