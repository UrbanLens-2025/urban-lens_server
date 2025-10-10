export enum EmailTemplates {
  WELCOME = './welcome',
  CONFIRM_OTP = './confirm-otp',
  BUSINESS_APPROVED = './business-approved',
  BUSINESS_REJECTED = './business-rejected',
}

export const EmailSubjects = {
  [EmailTemplates.WELCOME]: 'Welcome to Urban Lens!',
  [EmailTemplates.CONFIRM_OTP]: 'Your OTP Code',
  [EmailTemplates.BUSINESS_APPROVED]: 'Business Application Approved!',
  [EmailTemplates.BUSINESS_REJECTED]: 'Business Application Update',
};
