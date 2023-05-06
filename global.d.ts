import { Socket, Server as SocketServer } from "socket.io";
import type mongoose from "mongoose";

declare module "socket.io" {
  class Socket {
    userInfo: {
      _id: mongoose.Types.ObjectId;
      email: string;
      name: string;
      picture: string;
      provider: string;
    };
    socketName: string;
    roomId: string;
  }
}

declare global {
  namespace NodeJS {
    interface Global {
      _io: SocketServer;
      test: string;
    }
  }
}
