import express from "express";
import { body } from "express-validator";

import User from "./user.model";
import userController from "./user.controller";

const userRoutes = express.Router();

userRoutes.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom(async (value) => {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject("Email address is already exists.");
        }
      })
      .normalizeEmail(),
    body("password", "Please enter a password at least 8 characters.")
      .trim()
      .isLength({ min: 8 })
      .isAlphanumeric(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Password have to match.");
        }
        return true;
      }),
  ],
  userController.signup
);

userRoutes.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .normalizeEmail(),
    body("password", "Please enter a password at least 8 characters.")
      .trim()
      .isLength({ min: 8 }),
  ],
  userController.login
);

userRoutes.post("/google", userController.googleAuthentication);

userRoutes.post("/verify-token", userController.verifyJWTToken);

userRoutes.post(
  "/verify-email",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom(async (value) => {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject("Email address is already exists.");
        }
      })
      .normalizeEmail(),
  ],
  userController.verifyEmail
);

export default userRoutes;
