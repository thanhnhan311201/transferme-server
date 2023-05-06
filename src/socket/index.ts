import socketIO from "socket.io";
import type { Server as HttpServer } from "http";
import jwt, { Jwt, type JwtPayload } from "jsonwebtoken";
import helmet from "helmet";

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
            "_id email name picture provider"
          );
          if (!user) {
            throw new Error("Not authorized!");
          }

          const emailDomain = user.email.split("@")[0];
          socket.socketName = `${
            emailDomain.length <= 15 ? emailDomain : emailDomain.slice(0, 16)
          }@${genRandomString(5)}`;
          socket.roomId = user._id.toString();
          socket.userInfo = user;
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

      const socketNames: string[] = [];
      const socketIds: Set<string> | undefined =
        this._io!.sockets.adapter.rooms.get(socket.roomId);
      if (socketIds) {
        for (const socketId of socketIds) {
          const _socket = this._io!.of("/").sockets.get(socketId);
          if (_socket) {
            socketNames.push(_socket.socketName);
          }
        }
      }
      socket.emit(SOCKET_EVENTS.NEW_CONNECTION, {
        socketNames: socketNames,
        socketName: socket.socketName,
      });
      socket.broadcast.to(socket.roomId).emit(SOCKET_EVENTS.NEW_CONNECTION, {
        socketNames: [socket.socketName],
      });

      transferEventListener(socket);

      socket.on("disconnect", (reason) => {
        socket.leave(socket.roomId);
        socket
          .to(socket.roomId)
          .emit(SOCKET_EVENTS.USER_LOGOUT, socket.socketName);
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
}

const socketServer = new SocketServer();

export default socketServer;
