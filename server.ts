import dotenv from "dotenv";
dotenv.config();

import httpServer from "./src/app";

const port = process.env.PORT || 8080;

httpServer.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

// Close the server and exit the process when a termination signal is received
process.on("SIGTERM", () => {
  httpServer.close(() => {
    console.log("Server stopped!");
    process.exit(1);
  });
});
