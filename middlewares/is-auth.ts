import { RequestHandler } from "express";
import jwt, { Jwt } from "jsonwebtoken";
import { type JwtPayload } from "jsonwebtoken";

import { ResponseError } from "../utils/help";
import { SECRET_JWT_KEY } from "../utils/config";

const isAuth: RequestHandler = (req: Record<string, any>, res, next) => {
  const authHeader: string | undefined = req.get("Authorization");
  if (!authHeader) {
    const err = new ResponseError("Not authorized!", 403);
    throw err;
  }

  const token = authHeader.split(" ")[1];
  let decodedToken: JwtPayload | undefined;
  try {
    decodedToken = jwt.verify(token, SECRET_JWT_KEY) as JwtPayload;
  } catch (error) {
    const err = new ResponseError("Not authorized!", 403);
    throw err;
  }

  if (!decodedToken) {
    const err = new ResponseError("Not authorized!", 403);
    throw err;
  }

  req.userId = decodedToken.userId;
  req.email = decodedToken.email;
  next();
};

export default isAuth;
