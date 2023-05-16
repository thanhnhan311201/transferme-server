import socketIO from "socket.io";
import type { Server as HttpServer } from "http";
import jwt, { Jwt, type JwtPayload } from "jsonwebtoken";
import helmet from "helmet";
import mongoose from "mongoose";

import transferEventListener from "./transfer.listener.socket";
import { SOCKET_EVENTS } from "./config.socket";

import userModel from "../api/v1/user/user.model";

import { ResponseError } from "../api/v1/helpers";

import { socketLogger } from "../utils/logger.util";
import { BASE_URL_CLIENT } from "../configs/general.config";
import { genRandomString } from "../utils/general.utils";
import { ExtendedError } from "socket.io/dist/namespace";

import { SECRET_JWT_KEY } from "../configs/general.config";

class SocketServer {
  private _io: socketIO.Server | null = null;
  private socketRecord: Map<string, string> = new Map();

  initSocketServer(httpServer: HttpServer) {
    this._io = new socketIO.Server(httpServer, {
      cors: {
        origin: BASE_URL_CLIENT,
        methods: ["GET", "PUT", "POST", "DELETE", "OPTIONs"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      },
    });

    this._io.engine.use(helmet());

    this._io.use(
      async (
        socket: socketIO.Socket,
        next: (err?: ExtendedError | undefined) => void
      ) => {
        try {
          const cookie = socket.handshake.headers.cookie;
          if (!cookie) {
            throw new Error("Not authorized!");
          }
          const token = cookie
            .split(";")
            .find((str) => str.includes("access_token"))
            ?.split("=")[1];
          if (!token) {
            throw new Error("Not authorized!");
          }
          const decodedToken = jwt.verify(token, SECRET_JWT_KEY) as JwtPayload;
          if (!decodedToken) {
            throw new Error("Not authorized!");
          }

          const user = await userModel.findById(
            decodedToken.userId,
            "_id email name picture"
          );
          if (!user) {
            throw new Error("Not authorized!");
          }

          socket.user = user;

          this.socketRecord.set(user._id.toString(), socket.id);

          next();
        } catch (error: any) {
          if (error instanceof Error) {
            next(error);
          } else {
            next(new Error("Server Internal Error!"));
          }
        }
      }
    );

    this._io.on("connection", (socket) => {
      socketLogger(
        `Number of connected sockets: ${this._io!.of("/").sockets.size}`
      );

      let onlineUsers: {
        id: string;
        email: string;
        name: string;
        picture: string;
      }[] = [];
      this._io!.of("/").sockets.forEach(
        (_socket: socketIO.Socket, socketId: string) => {
          if (socketId !== socket.id) {
            onlineUsers.push({
              id: _socket.user._id.toString(),
              email: _socket.user.email,
              name: _socket.user.name,
              picture: _socket.user.picture,
            });
          }
        }
      );

      socket.emit(SOCKET_EVENTS.NEW_CONNECTION, onlineUsers);
      socket.broadcast.emit(SOCKET_EVENTS.NEW_CONNECTION, [
        {
          id: socket.user._id.toString(),
          email: socket.user.email,
          name: socket.user.name,
          picture: socket.user.picture,
        },
      ]);

      transferEventListener(socket);

      socket.on("disconnect", (reason) => {
        socket.broadcast.emit(SOCKET_EVENTS.USER_LOGOUT, socket.user._id);
        socketLogger(`User ${socket.id} disconnected!`);
        socketLogger(
          `Number of connected sockets: ${this._io!.of("/").sockets.size}`
        );
      });
    });
  }

  get io(): socketIO.Server {
    if (!this._io) {
      throw new Error("SocketIO not initialized!");
    }
    return this._io;
  }

  getSocketId(userId: string) {
    return this.socketRecord.get(userId);
  }
}

const socketServer = new SocketServer();

export default socketServer;
