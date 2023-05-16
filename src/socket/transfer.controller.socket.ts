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
      return socket.emit("error", { message: "The user not found!" });
    }

    const receivedSocketId = socketServer.getSocketId(userId);
    if (!receivedSocketId) {
      return socket.emit("error", { message: "The user not found!" });
    }

    const receivedSocket = socketServer.io
      .of("/")
      .sockets.get(receivedSocketId);
    if (!receivedSocket) {
      return socket.emit("error", { message: "The device not found!" });
    }

    const transferRoom = `${socket.user._id.toString()}_${userId}`;
    socket.transferRoom = transferRoom;
    receivedSocket.transferRoom = transferRoom;
    socket.join(transferRoom);
    receivedSocket.join(transferRoom);

    socketServer.io
      .to(receivedSocketId)
      .emit(SOCKET_EVENTS.WAIT_TRANSFER_ACCEPTED, socket.user.email);
  };

  export const handleResponse = (socket: socketIo.Socket, confirm: boolean) => {
    if (confirm) {
      socket.broadcast
        .to(socket.transferRoom)
        .emit(SOCKET_EVENTS.ACCEPT_REQUEST);
    } else {
      socket.broadcast
        .to(socket.transferRoom)
        .emit(SOCKET_EVENTS.REFUSE_REQUEST);
      socketServer.io
        .of("/")
        .in(socket.transferRoom)
        .socketsLeave(socket.transferRoom);
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
    socket.broadcast
      .to(socket.transferRoom)
      .emit(SOCKET_EVENTS.RECEIVE_FILE, file);
  };

  export const handleAcknowledge = (
    socket: socketIo.Socket,
    ack: { done: boolean; receivedChunk: number; totalChunk: number }
  ) => {
    socket.broadcast
      .to(socket.transferRoom)
      .emit(SOCKET_EVENTS.ON_ACK_RECEIVE_FILE, ack);

    if (ack.done) {
      socketServer.io
        .of("/")
        .in(socket.transferRoom)
        .socketsLeave(socket.transferRoom);
    }
  };

  export const handleCancelTransfer = (socket: socketIo.Socket) => {
    socket.broadcast
      .to(socket.transferRoom)
      .emit(SOCKET_EVENTS.ON_CANCEL_TRANSFER);
  };
}

export default transferController;
