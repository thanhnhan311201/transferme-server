import socketIO from "socket.io";

import transferController from "./transfer.controller.socket";

import { SOCKET_EVENTS } from "./config.socket";
import { errorLogger } from "../utils/logger.util";

const transferEventListener = (socket: socketIO.Socket) => {
  socket.on(SOCKET_EVENTS.ERROR_TRANSFER, () => {
    transferController.handleTransferFailed(socket);
  });

  socket.on(SOCKET_EVENTS.SUCCESS_TRANSFER, () => {
    transferController.handleTransferSuccess(socket);
  });

  socket.on(SOCKET_EVENTS.REQUEST_SEND_FILE, (userId: string) => {
    transferController.handleRequestTransfer(socket, userId);
  });

  socket.on(
    SOCKET_EVENTS.SEND_FILE,
    (file: {
      fileData: ArrayBuffer;
      fileName: string;
      fileType: string;
      fileSize: number;
      totalChunk: number;
      countChunkId: number;
    }) => {
      transferController.handleSendFile(socket, file);
    }
  );

  socket.on(SOCKET_EVENTS.REPLY_TO_REQUEST, (confirm: boolean) => {
    transferController.handleResponse(socket, confirm);
  });

  socket.on(
    SOCKET_EVENTS.ACK_RECEIVE_FILE,
    (ack: { done: boolean; receivedChunk: number; totalChunk: number }) => {
      transferController.handleAcknowledge(socket, ack);
    }
  );

  socket.on(SOCKET_EVENTS.CANCEL_TRANSFER, () => {
    transferController.handleCancelTransfer(socket);
  });
};

export default transferEventListener;
