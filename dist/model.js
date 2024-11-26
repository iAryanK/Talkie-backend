"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const db_1 = require("./db");
(0, db_1.connectToDB)();
const userSchema = new mongoose_1.Schema({
    username: { type: String },
    phone: { type: String, unique: true },
});
exports.UserModel = (0, mongoose_1.model)("User", userSchema);
