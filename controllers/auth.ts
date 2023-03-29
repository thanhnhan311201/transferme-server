import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import type { RequestHandler } from "express";
import { validationResult } from "express-validator";
import dotenv from "dotenv";

dotenv.config()

import User from "../models/user";

import { ResponseError, genRandomString } from "../utils/help";
import { SECRET_JWT_KEY } from "../utils/config";

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
      name: genRandomString(12),
      picture: "/images/user.png",
    });
    const result = await user.save();
    res.status(201).json({
      message: "User signup successfully!",
      user: {
        email: result.email,
        id: result._id,
        name: result.name,
        picture: result.picture,
      },
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
        { expiresIn: "1h" }
      );
      res.status(200).json({
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
