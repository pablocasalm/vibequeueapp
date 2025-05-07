import { apiClient } from './apiClient';

export const FileService = {
  uploadProfileImage: async (imageBase64: string, contentType: string) => {
    return apiClient('/File/uploadProfileImage', {
      method: 'POST',
      body: JSON.stringify({
        base64Image: imageBase64,
        contentType: contentType,
      }),
    });
  },
};
