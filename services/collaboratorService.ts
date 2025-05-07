// services/collaboratorService.ts
import { apiClient } from './apiClient';

export const CollaboratorService = {
  addCollaborator: (collaboratorData: any) =>
    apiClient('/Collaborator/addCollaborator', {
      method: 'POST',
      body: JSON.stringify(collaboratorData),
    }),

  getAllCollaborators: (eventId: string) =>
    apiClient(`/Collaborator/getAllCollaborators?eventid=${eventId}`, {
      method: 'POST',
    }),

  deleteCollaborator: (data: { eventId: string; collaboratorId: number }) =>
    apiClient('/Collaborator/deleteCollaborator', {
      method: 'DELETE',
      body: JSON.stringify(data),
    }),
};
