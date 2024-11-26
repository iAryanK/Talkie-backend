import { model, Schema } from "mongoose";
import { connectToDB } from "./db";

connectToDB();

const userSchema = new Schema({
  username: { type: String },
  phone: { type: String, unique: true },
});

export const UserModel = model("User", userSchema);
