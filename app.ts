import path from "path";

import mongoose from "mongoose";
import express, { Express, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import io, { Server } from "socket.io";
import uuid from "uuid";

import authRoutes from "./routes/auth";

dotenv.config();

const app: Express = express();
const port = 8080;

app.use(bodyParser.json());
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
  })
);

app.use("/api/auth", authRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err?.status;
  const message = err.message;
  const data = err?.data;
  res.status(status).json({ message: message, ...(data && { data }) });
});

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const server = app.listen(port, () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
    const io = new Server(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "PUT", "POST", "DELETE", "OPTIONs"],
        allowedHeaders: ["Content-Type", "Authorization"],
      },
    });
    io.engine.generateId;
    io.on("connection", (socket) => {
      console.log(socket.id);
      console.log(io.of("/").sockets.size);
    });
  } catch (error) {
    console.log(error);
  }
})();
