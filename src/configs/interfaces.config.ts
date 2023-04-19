import mongoose from "mongoose";

export interface IUserModel {
  _id?: mongoose.Types.ObjectId;
  email: string;
  name: string;
  password: string;
  picture: string;
  provider: string;
}

export interface IJWT {
  userId: string;
  email: string;
}

export interface ISocketData {
  name: string;
  age: number;
}
