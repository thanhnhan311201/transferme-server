import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";

dotenv.config();

const app: Express = express();
const port = 8080;

app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
  })
);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
