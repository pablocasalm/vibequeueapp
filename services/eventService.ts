// services/eventService.ts
import { apiClient } from './apiClient';

export const EventService = {
  getAllEvents: () => apiClient('/Event/getAllEvents'),

  getEventDetails: (data: string) =>
    apiClient(`/Event/getEventById?eventId=${data}`, {
      method: 'GET',
    }),

  createEvent: (eventData: any) =>
    apiClient('/Event/createEvent', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),

  updateEvent: (eventData: any) =>
    apiClient('/Event/modifyEvent', {
      method: 'PUT',
      body: JSON.stringify(eventData),
    }),

  deleteEvent: (eventData: any) =>
    apiClient('/Event/deleteEvent', {
      method: 'PUT',
      body: JSON.stringify(eventData),
    }),
};
