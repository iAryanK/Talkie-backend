import { WebSocketServer, WebSocket } from "ws";
import express from "express";
import cors from "cors";
import { UserModel } from "./model";
require("dotenv").config();

const wss = new WebSocketServer({ port: Number(process.env.WS_PORT) });
const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/v1/find_user", async (req, res) => {
  const param = req.body.value;
  try {
    const user = await UserModel.findOne({
      $or: [{ username: param }, { phone: param }],
    });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.log("[FIND_USER_ERROR]", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/v1/create_user", async (req, res) => {
  const username = req.body.username;
  const phone = req.body.phone;
  try {
    const existingUser = await UserModel.findOne({ phone });

    if (existingUser) {
      res.status(200).json({ message: "User already exists!" });
      return;
    }

    await UserModel.create({ username, phone });

    res.status(200).json({ message: "User created successfully!" });
  } catch (error) {
    console.log("[CREATE_USER_ERROR]", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(process.env.HTTP_PORT, () => {
  console.log("HTTP server started");
});

interface User {
  socket: WebSocket;
  room: string;
}

let allSockets: User[] = [];

wss.on("connection", (socket) => {
  socket.on("message", (message) => {
    // cannot communicate json objects in websockets, so the data from frontend will be stringified
    const parsedMessage = JSON.parse(message.toString());

    if (parsedMessage.type === "join") {
      allSockets.push({ socket, room: parsedMessage.payload.room });
    }

    if (parsedMessage.type === "chat") {
      // find current user's room
      const currentUserRoom = allSockets.find((s) => s.socket === socket)?.room;

      // send message to all users in the room
      for (let i = 0; i < allSockets.length; i++) {
        if (allSockets[i].room === currentUserRoom) {
          allSockets[i].socket.send(parsedMessage.payload.message);
        }
      }
    }
  });

  socket.on("close", () => {
    allSockets = allSockets.filter((s) => s.socket !== socket);
  });
});
