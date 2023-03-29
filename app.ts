import path from "path";

import mongoose from "mongoose";
import express, { Express, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";

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
  await mongoose.connect(process.env.MONGODB_URI as string);
  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
})();
