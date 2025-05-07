// services/historyService.ts
import { apiClient } from './apiClient';

export const HistoryService = {
  getHistory: () =>
    apiClient('/History/getHistory', {
      method: 'GET',
    }),
};