import socketServer from ".";

import { SOCKET_EVENTS } from "./config.socket";

namespace transferController {
  export const handleTransferFailed = () => {
    console.log("Have an error while transfering");
  };

  export const handlePending = (device: string) => {
    console.log(`Waiting for ${device} to accept the transfer request`);
  };

  export const sendFile = (file: FileReader) => {
    console.log(file);
  };

  export const handleTransferSuccess = () => {
    console.log("Successful transfer");
  };
}

export default transferController;
