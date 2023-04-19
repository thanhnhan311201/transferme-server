import path from "path";
import { createServer } from "http";
import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { createStream } from "rotating-file-stream";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import uuid from "uuid";

import apiRouter from "./router";
import connectDatabase from "./configs/db.config";
import { BASE_URL_API } from "./configs/general.config";

connectDatabase();

const isProduction = process.env.NODE_ENV === "production";

// create http server
const app: Express = express();
const httpServer = createServer(app);

// add socketio
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONs"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

io.on("connection", (socket) => {
  console.log(socket.id);
  console.log(io.of("/").sockets.size);

  socket.on("disconnect", (reason) => {
    console.log(reason);
    console.log("User disconnected!");
    console.log(io.of("/").sockets.size);
  });
});

// add util middleware
const accessLogStream = createStream("access.log", {
  interval: "1d",
  path: path.join(__dirname, "log"),
});
app.use(
  isProduction
    ? morgan(
        '⚡️[api]: :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
        { stream: accessLogStream }
      )
    : morgan(
        "⚡️[api]: :method :url :status :response-time ms - :res[content-length]"
      )
);
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
  })
);
app.use(bodyParser.json());
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
  })
);

// add request handler
app.use("/api", apiRouter);
app.get("/", (req: Request, res: Response, next: NextFunction) =>
  res.json({
    user_login: `${BASE_URL_API}/v1/user/login`,
    user_signup: `${BASE_URL_API}/v1/user/signup`,
    verify_jwt_token: `${BASE_URL_API}/v1/user/verify-token`,
    google_login: `${BASE_URL_API}/v1/user/google`,
  })
);
app.use("*", (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: "error",
    code: 404,
    message: "Not found!",
    links: {
      user_login: `${BASE_URL_API}/v1/user/login`,
      user_signup: `${BASE_URL_API}/v1/user/signup`,
      verify_jwt_token: `${BASE_URL_API}/v1/user/verify-token`,
      google_login: `${BASE_URL_API}/v1/user/google`,
    },
  });
});

// add error handler middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err?.status;
  const message = err.message;
  const data = err?.data;
  res.status(status || 500).json({
    error: {
      status: status || 500,
      message: message || "Internal Server Error",
      ...(data && { data }),
    },
  });
});

export default httpServer;
