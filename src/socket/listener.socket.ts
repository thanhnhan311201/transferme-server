import socketIO from "socket.io";

import { SOCKET_EVENTS } from "./config.socket";

const socketEventListener = (socket: socketIO.Socket) => {
  socket.on(SOCKET_EVENTS.ERROR_TRANSFER, () =>
    console.log("Have an error while transfering")
  );
  socket.on(SOCKET_EVENTS.WAIT_TRANSFER_ACCEPTED, (device: string) =>
    console.log(`Waiting for ${device} to accept the transfer request`)
  );
  socket.on(SOCKET_EVENTS.SEND_FILE, (file: FileReader) => console.log(file));
  socket.on(SOCKET_EVENTS.SUCCESS_TRANSFER, () =>
    console.log("Successful transfer")
  );
};

export default socketEventListener;
