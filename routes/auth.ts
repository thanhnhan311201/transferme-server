import express from "express";
import { body } from "express-validator";

import User from "../models/user";
import * as authController from "../controllers/auth";

const router = express.Router();

router.post(
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
  authController.signup
);

router.post(
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
  authController.login
);

router.post("/google", authController.googleAuthentication);

router.post("/verify-token", authController.verifyJWTToken);

export default router;
