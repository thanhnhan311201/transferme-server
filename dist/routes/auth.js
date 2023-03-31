"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const user_1 = __importDefault(require("../models/user"));
const authController = __importStar(require("../controllers/auth"));
const router = express_1.default.Router();
router.post("/signup", [
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage("Please enter a valid email.")
        .custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield user_1.default.findOne({ email: value });
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
], authController.signup);
router.post("/login", [
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage("Please enter a valid email.")
        .normalizeEmail(),
    (0, express_validator_1.body)("password", "Please enter a password at least 8 characters.")
        .trim()
        .isLength({ min: 8 }),
], authController.login);
router.post("/google", authController.googleAuthentication);
router.post("/verify-token", authController.verifyJWTToken);
exports.default = router;
