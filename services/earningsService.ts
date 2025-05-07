// services/earningsService.ts
import { apiClient } from './apiClient';

export const EarningsService = {
  getEarningScreenProps: () =>
    apiClient('/Earnings/getEarningScreenProbs', {
      method: 'GET',
    }),

    cashOut: (data: { AmountCents: number; Currency: string }) =>
      apiClient('/Earnings/cashOut', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getGraphData: () =>
        apiClient('/Earnings/getGraphData', {
          method: 'GET',
        }),
};