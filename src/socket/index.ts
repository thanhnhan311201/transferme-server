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
          socket.roomId = user._id.toString();
          socket.clientId = `${user.email.split("@")[0]}@${genRandomString(5)}`;

          this.socketRecord.set(socket.clientId, socket.id);

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

      socket.join(socket.roomId);

      let onlineUsers: {
        id: string;
        clientId: string;
        picture: string;
      }[] = [];

      const roomSockets = this._io!.of("/").adapter.rooms.get(socket.roomId);
      if (roomSockets) {
        for (const socketId of roomSockets) {
          if (socketId === socket.id) {
            continue;
          }
          const _socket = this._io?.of("/").sockets.get(socketId);
          if (_socket) {
            onlineUsers.push({
              id: _socket.user._id.toString(),
              clientId: _socket.clientId,
              picture: _socket.user.picture,
            });
          }
        }
      }

      socket.emit(SOCKET_EVENTS.NEW_CONNECTION, {
        action: "login",
        onlineUsers,
        clientId: socket.clientId,
      });
      socket.broadcast.to(socket.roomId).emit(SOCKET_EVENTS.NEW_CONNECTION, {
        action: "new_user_login",
        onlineUsers: [
          {
            id: socket.user._id.toString(),
            clientId: socket.clientId,
            picture: socket.user.picture,
          },
        ],
        clientId: "",
      });

      transferEventListener(socket);

      socket.on("disconnect", (reason) => {
        socket.broadcast
          .to(socket.roomId)
          .emit(SOCKET_EVENTS.USER_LOGOUT, socket.user._id);
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
