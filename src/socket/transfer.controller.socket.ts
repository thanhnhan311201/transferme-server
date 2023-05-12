import socketIo from "socket.io";

import socketServer from ".";

import { SOCKET_EVENTS } from "./config.socket";

namespace transferController {
  export const handleTransferFailed = (socket: socketIo.Socket) => {
    console.log("Have an error while transfering");
  };

  export const handleTransferSuccess = (socket: socketIo.Socket) => {
    console.log("Successful transfer");
  };

  export const handleRequestTransfer = (
    socket: socketIo.Socket,
    userId: string
  ) => {
    socketServer.sender = socket.id;

    const receivedSocketId = socketServer.getSocketId(userId);
    if (!receivedSocketId) {
      socketServer.receiver = "";
      return socket.emit("error", { message: "The device not found!" });
    }
    socketServer.receiver = receivedSocketId;
    const receivedSocket = socketServer.io
      .of("/")
      .sockets.get(receivedSocketId);
    if (!receivedSocket) {
      return socket.emit("error", { message: "The device not found!" });
    }
    socketServer.io
      .to(receivedSocket.id)
      .emit(SOCKET_EVENTS.WAIT_TRANSFER_ACCEPTED);
  };

  export const handleResponse = (socket: socketIo.Socket, confirm: boolean) => {
    if (confirm) {
      socketServer.io
        .to(socketServer.sender)
        .emit(SOCKET_EVENTS.ACCEPT_REQUEST);
    } else {
      socketServer.io
        .to(socketServer.sender)
        .emit(SOCKET_EVENTS.REFUSE_REQUEST);
    }
  };

  export const handleSendFile = (
    socket: socketIo.Socket,
    file: {
      fileData: ArrayBuffer;
      fileName: string;
      fileType: string;
      fileSize: number;
    }
  ) => {
    socketServer.io
      .to(socketServer.receiver)
      .emit(SOCKET_EVENTS.RECEIVE_FILE, file);
  };
}

export default transferController;
