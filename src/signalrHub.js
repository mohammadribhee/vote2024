import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
  .withUrl("https://votenew2024.azurewebsites.net/voteHub")
  .withAutomaticReconnect()
  .build();

export default connection;
