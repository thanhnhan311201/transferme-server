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
    if (!userId) {
      socketServer.receiver = "";
      return socket.emit("error", { message: "The user not found!" });
    }
    socketServer.sender = socket.id;

    const receivedSocketId = socketServer.getSocketId(userId);
    if (!receivedSocketId) {
      socketServer.receiver = "";
      return socket.emit("error", { message: "The user not found!" });
    }
    socketServer.receiver = receivedSocketId;

    socketServer.io
      .to(receivedSocketId)
      .emit(SOCKET_EVENTS.WAIT_TRANSFER_ACCEPTED, socket.user.email);
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
      totalChunk: number;
      countChunkId: number;
    }
  ) => {
    socketServer.io
      .to(socketServer.receiver)
      .emit(SOCKET_EVENTS.RECEIVE_FILE, file);
  };

  export const handleAcknowledge = (
    socket: socketIo.Socket,
    ack: { done: boolean; receivedChunk: number; totalChunk: number }
  ) => {
    socketServer.io
      .to(socketServer.sender)
      .emit(SOCKET_EVENTS.ON_ACK_RECEIVE_FILE, ack);
  };

  export const handleCancelTransfer = (socket: socketIo.Socket) => {
    console.log("cancel transfer");
    socketServer.io
      .to(socketServer.receiver)
      .emit(SOCKET_EVENTS.ON_CANCEL_TRANSFER);
  };
}

export default transferController;
