export enum EmailTemplates {
  WELCOME = './welcome',
  CONFIRM_OTP = './confirm-otp',
  BUSINESS_APPROVED = './business-approved',
  BUSINESS_REJECTED = './business-rejected',
  LOCATION_APPROVED = './location-approved',
  LOCATION_REJECTED = './location-rejected',
  LOCATION_NEEDS_MORE_INFO = './location-needs-more-info',
}

export const EmailSubjects = {
  [EmailTemplates.WELCOME]: 'Welcome to Urban Lens!',
  [EmailTemplates.CONFIRM_OTP]: 'Your OTP Code',
  [EmailTemplates.BUSINESS_APPROVED]: 'Business Application Approved!',
  [EmailTemplates.BUSINESS_REJECTED]: 'Business Application Update',
  [EmailTemplates.LOCATION_APPROVED]: 'Location Request Approved!',
  [EmailTemplates.LOCATION_REJECTED]: 'Location Request Rejected',
  [EmailTemplates.LOCATION_NEEDS_MORE_INFO]: 'Location Request Needs More Info',
};
