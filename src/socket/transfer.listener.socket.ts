import socketIO from "socket.io";

import transferController from "./transfer.controller.socket";

import { SOCKET_EVENTS } from "./config.socket";

const transferEventListener = (socket: socketIO.Socket) => {
  socket.on(
    SOCKET_EVENTS.ERROR_TRANSFER,
    transferController.handleTransferFailed
  );

  socket.on(
    SOCKET_EVENTS.WAIT_TRANSFER_ACCEPTED,
    transferController.handlePending
  );

  socket.on(SOCKET_EVENTS.SEND_FILE, transferController.sendFile);

  socket.on(
    SOCKET_EVENTS.SUCCESS_TRANSFER,
    transferController.handleTransferSuccess
  );
};

export default transferEventListener;
