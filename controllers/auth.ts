import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt, { Jwt, type JwtPayload } from "jsonwebtoken";
import type { RequestHandler } from "express";
import { validationResult } from "express-validator";
import dotenv from "dotenv";
import { auth, OAuth2Client, type Credentials } from "google-auth-library";

dotenv.config();

import User from "../models/user";

import { ResponseError, genRandomName } from "../utils/help";
import {
  SECRET_JWT_KEY,
  GOOGLE_CREDENTIAL_CLIENT_ID,
  GOOGLE_CREDENTIAL_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  TOKEN_EXPIRATION_TIME,
} from "../utils/config";

const client = new OAuth2Client(
  GOOGLE_CREDENTIAL_CLIENT_ID,
  GOOGLE_CREDENTIAL_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

export const signup: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new ResponseError(
        "Validation failed!",
        422,
        errors.array()
      );
      throw error;
    }
    const email = req.body.email;
    const password = req.body.password;

    const hashPassword = bcrypt.hashSync(password, 12);
    const user = new User({
      email: email,
      password: hashPassword,
      name: genRandomName(12),
      picture: "/images/user.png",
      provider: "transferme",
    });
    const result = await user.save();
    res.status(201).json({
      message: "User signup successfully!",
      status: "success",
      code: 201,
    });
  } catch (error: ResponseError | any) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new ResponseError("Validation failed", 422, errors.array());
      err.status = 422;
      throw err;
    }

    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email: email });
    if (!user) {
      const err = new ResponseError(
        "The user with this email could not be found!",
        401
      );
      throw err;
    }

    if (!bcrypt.compareSync(password, user.password)) {
      const err = new ResponseError("Wrong password", 401);
      throw err;
    } else {
      const token = jwt.sign(
        {
          email: user.email,
          userId: user._id.toString(),
        },
        SECRET_JWT_KEY,
        { expiresIn: TOKEN_EXPIRATION_TIME }
      );
      res.status(200).json({
        status: "success",
        code: 200,
        message: "Login successfully!",
        token: token,
        user: {
          email: user.email,
          id: user._id,
          name: user.name,
          picture: user.picture,
        },
      });
    }
  } catch (error: ResponseError | any) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export const googleAuthentication: RequestHandler = async (req, res, next) => {
  try {
    const authCode = req.body.authCode;

    const { tokens }: { tokens: Credentials; res: any } = await client.getToken(
      authCode
    );
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: GOOGLE_CREDENTIAL_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      const err = new ResponseError("User not found", 401);
      throw err;
    } else {
      const user = await User.findOne({ email: payload.email });
      if (!user) {
        const user = new User({
          email: payload.email,
          password: bcrypt.hashSync(genRandomName(8), 12),
          name: payload.name,
          picture: payload.picture,
          provider: "google",
        });
        const result = await user.save();
        const token = jwt.sign(
          {
            email: result.email,
            userId: result._id.toString(),
          },
          SECRET_JWT_KEY,
          { expiresIn: TOKEN_EXPIRATION_TIME }
        );
        res.status(200).json({
          status: "success",
          code: 200,
          message: "Login successfully!",
          token: token,
          user: {
            email: result.email,
            id: result._id,
            name: result.name,
            picture: result.picture,
          },
        });
      } else {
        user.email = payload.email!;
        user.name = payload.name!;
        user.picture = payload.picture!;
        const result = await user.save();
        const token = jwt.sign(
          {
            email: result.email,
            userId: result._id.toString(),
          },
          SECRET_JWT_KEY,
          { expiresIn: "1h" }
        );
        res.status(200).json({
          status: "success",
          code: 200,
          message: "Login successfully!",
          token: token,
          user: {
            email: result.email,
            id: result._id,
            name: result.name,
            picture: result.picture,
          },
        });
      }
    }
  } catch (error: ResponseError | any) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export const verifyJWTToken: RequestHandler = async (req, res, next) => {
  const token: string = req.body.token;
  if (!token) {
    return res
      .status(401)
      .json({ status: "error", code: 401, message: "Not authenticated." });
  }

  let decodedToken: JwtPayload | undefined;
  try {
    decodedToken = jwt.verify(token, SECRET_JWT_KEY) as JwtPayload;
  } catch (error) {
    const err = new ResponseError("Not authenticated.", 401);
    next(error);
  }
  if (!decodedToken) {
    return res
      .status(401)
      .json({ status: "error", code: 401, message: "Not authenticated." });
  }

  try {
    const user = await User.findOne({ _id: decodedToken.userId });
    if (!user) {
      const err = new ResponseError("User not found!", 401);
      throw err;
    }

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Authenticated.",
      user: {
        email: user.email,
        id: user._id,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error: ResponseError | any) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};
