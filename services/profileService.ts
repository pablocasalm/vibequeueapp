// services/profileService.ts
import { apiClient } from './apiClient';

export const ProfileService = {
  connectPayment: () =>
    apiClient('/Profile/connectPayment', {
      method: 'GET',
    }),

  getApplicationInfo: () =>
    apiClient('/Profile/getApplicationInfo', {
      method: 'GET',
    }),

  getApplicationMaxVersion: () =>
    apiClient('/Profile/getApplicationMaxVersion', {
      method: 'GET',
    }),

  uploadProfileImage: (formData: FormData) =>
    apiClient('/Profile/uploadProfileImage', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};
