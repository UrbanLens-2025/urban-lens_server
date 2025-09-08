export enum EmailTemplates {
  WELCOME = './welcome',
  CONFIRM_OTP = './confirm-otp',
}

export const EmailSubjects = {
  [EmailTemplates.WELCOME]: 'Welcome to Our Service!',
  [EmailTemplates.CONFIRM_OTP]: 'Your OTP Code',
};
