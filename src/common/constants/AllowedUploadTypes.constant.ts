export enum AllowedUploadTypes {
  IMAGE = 'image',
}

export const AllowedUploadMimeTypes = {
  [AllowedUploadTypes.IMAGE]: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
};
