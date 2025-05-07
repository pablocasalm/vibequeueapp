import { apiClient } from './apiClient';

export const UserService = {
  login: (credentials: { username: string; password: string }) =>
    apiClient('/User/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (registrationData: {
    username: string;
    password: string;
    email: string;
    referalCode?: string;
  }) =>
    apiClient('/User/register', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    }),

  changePassword: (passwordData: any) =>
    apiClient('/User/changepassword', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    }),

  getProfileInfo: () => apiClient('/User/getProfileInfo'),
};