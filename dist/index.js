"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const utils_1 = require("./utils");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let allSockets = [];
wss.on("connection", (socket) => {
    socket.on("message", (message) => {
        const parsedMessage = JSON.parse(message.toString());
        if (parsedMessage.type === "join") {
            console.log("ParsedMessage_join", parsedMessage);
            allSockets.push({
                username: parsedMessage.payload.username,
                socket,
                room: parsedMessage.payload.room,
            });
        }
        if (parsedMessage.type === "chat") {
            // find current user's room
            console.log("ParsedMessage_chat", parsedMessage);
            const currentUser = allSockets.find((s) => s.socket === socket);
            // send message to all users in the room
            for (let i = 0; i < allSockets.length; i++) {
                if (allSockets[i].room === (currentUser === null || currentUser === void 0 ? void 0 : currentUser.room)) {
                    allSockets[i].socket.send(JSON.stringify({
                        username: currentUser === null || currentUser === void 0 ? void 0 : currentUser.username,
                        message: parsedMessage.payload.message,
                        timestamp: (0, utils_1.formattedTime)(new Date()),
                    }));
                }
            }
        }
    });
    socket.on("close", () => {
        allSockets = allSockets.filter((s) => s.socket !== socket);
    });
});
