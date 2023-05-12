import dotenv from "dotenv";
dotenv.config();

import httpServer from "./src/app";
import connectDatabase from "./src/configs/db.config";
import socketServer from "./src/socket";

import { serverLogger } from "./src/utils/logger.util";

const port = process.env.PORT || 8080;

httpServer.listen(port, () => {
  serverLogger(`Server is running at http://localhost:${port}`);
});

// connect database
connectDatabase();

// init socket server
socketServer.initSocketServer(httpServer);

// Close the server and exit the process when a termination signal is received
process.on("SIGTERM", () => {
  httpServer.close(() => {
    serverLogger("Server stopped!");
    process.exit(1);
  });
});
