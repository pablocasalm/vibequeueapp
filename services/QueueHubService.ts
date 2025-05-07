import * as signalR from '@microsoft/signalr';

let connection: signalR.HubConnection | null = null;

export const QueueHubService = {  
  startConnection: async (eventid: string, onSongEntered: (songData: any) => void) => {

    try{
      connection = new signalR.HubConnectionBuilder()
      .withUrl('https://djappapi.azurewebsites.net/queuehub', {withCredentials : true})
      .withAutomaticReconnect()
      .build();

      console.log('Connecting to HUB endpoint');
      connection.on('SongEnteredQueue', onSongEntered);
      
      await connection.start();
      console.log('Connection with hub started... Joining group...');

      await connection.invoke('JoinEventGroup', eventid);
      console.log('Group joined successfully!');
    }catch(error){
      console.error(error);
    }  

  },

  stopConnection: async (eventCode: string) => {
    if (connection) {
      await connection.invoke('LeaveEventGroup', eventCode);
      await connection.stop();      
      console.log('Connection stopped successfully!');

    }
  },
};