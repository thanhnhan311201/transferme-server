import crypto from "crypto";

import type { RequestHandler } from "express";
import { validationResult } from "express-validator";

import userService from "./user.service";

import { ResponseError } from "../helpers";
import { errorLogger } from "../../../utils/logger.util";

namespace userController {
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
      const username = req.body.username;
      const email = req.body.email;
      const password = req.body.password;

      const result = await userService.signup(username, email, password);
      return res.status(201).json({
        status: "success",
        data: {
          user: {
            email: result.email,
            id: result._id,
            name: result.name,
            picture: result.picture,
          },
        },
      });
    } catch (error: ResponseError | any) {
      errorLogger(error.message);
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

      const { token, user } = await userService.login(email, password);

      return res.status(200).json({
        status: "success",
        data: {
          token: token,
          user: {
            email: user.email,
            id: user._id,
            name: user.name,
            picture: user.picture,
          },
        },
      });
    } catch (error: ResponseError | any) {
      errorLogger(error.message);
      if (!error.status) {
        error.status = 500;
      }
      next(error);
    }
  };

  export const googleAuthentication: RequestHandler = async (
    req,
    res,
    next
  ) => {
    try {
      const authCode = req.body.authCode;

      const { token, user } = await userService.googleLogin(authCode);

      return res.status(200).json({
        status: "success",
        data: {
          token: token,
          user: {
            email: user!.email,
            id: user!._id,
            name: user!.name,
            picture: user!.picture,
          },
        },
      });
    } catch (error: ResponseError | any) {
      errorLogger(error.message);
      if (!error.status) {
        error.status = 500;
      }
      next(error);
    }
  };

  export const verifyJWTToken: RequestHandler = async (req, res, next) => {
    try {
      const token: string = req.body.token;
      if (!token) {
        return res
          .status(401)
          .json({ status: "error", message: "Not authenticated." });
      }

      const user = await userService.verifyToken(token);

      return res.status(200).json({
        status: "success",
        data: {
          token: token,
          user: {
            email: user.email,
            id: user._id,
            name: user.name,
            picture: user.picture,
          },
        },
      });
    } catch (error: ResponseError | any) {
      errorLogger(error.message);
      if (!error.status) {
        error.status = 500;
      }
      next(error);
    }
  };

  export const verifyEmail: RequestHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: "error",
        message: "That email has already been taken!",
      });
    } else {
      return res.status(200).json({
        status: "success",
        data: {
          email: req.body.email,
        },
      });
    }
  };
}

export default userController;
