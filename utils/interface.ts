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

export interface IServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

export interface IClientToServerEvents {
  hello: () => void;
}

export interface IInterServerEvents {
  ping: () => void;
}

export interface ISocketData {
  name: string;
  age: number;
}
