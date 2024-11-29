import { WebSocketServer, WebSocket } from "ws";
import { formattedTime } from "./utils";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  username: string;
  socket: WebSocket;
  room: string;
}

let allSockets: User[] = [];

wss.on("connection", (socket) => {
  socket.on("message", (message) => {
    const parsedMessage = JSON.parse(message.toString());

    if (parsedMessage.type === "join") {
      allSockets.push({
        username: parsedMessage.payload.username,
        socket,
        room: parsedMessage.payload.room,
      });
    }

    if (parsedMessage.type === "chat") {
      // find current user

      const currentUser = allSockets.find((s) => s.socket === socket);

      // send message to all users in the current user's room
      for (let i = 0; i < allSockets.length; i++) {
        if (allSockets[i].room === currentUser?.room) {
          allSockets[i].socket.send(
            JSON.stringify({
              username: currentUser?.username,
              message: parsedMessage.payload.message,
              timestamp: formattedTime(new Date()),
            })
          );
        }
      }
    }
  });

  socket.on("close", () => {
    allSockets = allSockets.filter((s) => s.socket !== socket);
  });
});
