export enum AllowedUploadTypes {
  IMAGE = 'image',
}

export const AllowedUploadMimeTypes = {
  [AllowedUploadTypes.IMAGE]: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
};
