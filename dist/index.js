"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const model_1 = require("./model");
require("dotenv").config();
const wss = new ws_1.WebSocketServer({ port: 8080 });
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post("/api/v1/find_user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const param = req.body.value;
    try {
        const user = yield model_1.UserModel.findOne({
            $or: [{ username: param }, { phone: param }],
        });
        if (user) {
            res.status(200).json(user);
            console.log("[FIND_USER]", user);
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        console.log("[FIND_USER_ERROR]", error);
        res.status(500).send("Internal Server Error");
    }
}));
app.post("/api/v1/create_user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const phone = req.body.phone;
    try {
        const existingUser = yield model_1.UserModel.findOne({ phone });
        if (existingUser) {
            res.status(200).json({ message: "User already exists!" });
            return;
        }
        yield model_1.UserModel.create({ username, phone });
        res.status(200).json({ message: "User created successfully!" });
    }
    catch (error) {
        console.log("[CREATE_USER_ERROR]", error);
        res.status(500).send("Internal Server Error");
    }
}));
app.listen(3000, () => {
    console.log("Server started on http://localhost:3000");
});
let allSockets = [];
wss.on("connection", (socket) => {
    socket.on("message", (message) => {
        var _a;
        // cannot communicate json objects in websockets, so the data from frontend will be stringified
        const parsedMessage = JSON.parse(message.toString());
        if (parsedMessage.type === "join") {
            console.log("User joined room: ", parsedMessage.payload.room);
            allSockets.push({ socket, room: parsedMessage.payload.room });
        }
        if (parsedMessage.type === "chat") {
            console.log("User sent message: ", parsedMessage.payload.message);
            // find current user's room
            const currentUserRoom = (_a = allSockets.find((s) => s.socket === socket)) === null || _a === void 0 ? void 0 : _a.room;
            // send message to all users in the room
            for (let i = 0; i < allSockets.length; i++) {
                if (allSockets[i].room === currentUserRoom) {
                    allSockets[i].socket.send(parsedMessage.payload.message);
                    console.log("Message sent to user in room: ", allSockets[i].room);
                }
            }
        }
    });
    socket.on("close", () => {
        allSockets = allSockets.filter((s) => s.socket !== socket);
        console.log(allSockets.length + " Users connected");
    });
});
{
    /*
    // What user can send
  // join a room
  {
    type:"join",
    payload: {
      // username: "John Doe",
      room: "room1"
    }
  }
  
  // send message
  {
    type:"chat",
    payload: {
      // username: "John Doe",
      // room: "room1",
      message: "Hello, world!"
    }
  }
  
  
  
  
  // What server can send
  {
  type:"chat",
  payload: {
    // username: "John Doe",
    // room: "room1",
    message: "Hello, world!"
    }
  }
    */
}
