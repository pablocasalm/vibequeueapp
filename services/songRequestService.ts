import { apiClient } from './apiClient';

export const SongRequestService = {
  modifySongRequest: (data: {
    songrequestid: string;
    state: string;
    eventid: string;
  }) =>
    apiClient('/SongRequest/modifySongRequest', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    startPlayingSong: (data: { songrequestid: string; eventid: string }) =>
      apiClient('/SongRequest/startPlayingSong', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
};

