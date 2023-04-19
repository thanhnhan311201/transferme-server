"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const user_model_1 = __importDefault(require("./user.model"));
const user_controller_1 = __importDefault(require("./user.controller"));
const userRoutes = express_1.default.Router();
userRoutes.post("/signup", [
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage("Please enter a valid email.")
        .custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield user_model_1.default.findOne({ email: value });
        if (user) {
            return Promise.reject("Email address is already exists.");
        }
    }))
        .normalizeEmail(),
    (0, express_validator_1.body)("password", "Please enter a password at least 8 characters.")
        .trim()
        .isLength({ min: 8 })
        .isAlphanumeric(),
    (0, express_validator_1.body)("confirmPassword")
        .trim()
        .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Password have to match.");
        }
        return true;
    }),
], user_controller_1.default.signup);
userRoutes.post("/login", [
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage("Please enter a valid email.")
        .normalizeEmail(),
    (0, express_validator_1.body)("password", "Please enter a password at least 8 characters.")
        .trim()
        .isLength({ min: 8 }),
], user_controller_1.default.login);
userRoutes.post("/google", user_controller_1.default.googleAuthentication);
userRoutes.post("/verify-token", user_controller_1.default.verifyJWTToken);
exports.default = userRoutes;
