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
const express_validator_1 = require("express-validator");
const user_service_1 = __importDefault(require("./user.service"));
const helpers_1 = require("../helpers");
var userController;
(function (userController) {
    userController.signup = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new helpers_1.ResponseError("Validation failed!", 422, errors.array());
                throw error;
            }
            const email = req.body.email;
            const password = req.body.password;
            const result = yield user_service_1.default.signup(email, password);
            return res.status(201).json({
                message: "User signup successfully!",
                status: "success",
                code: 201,
            });
        }
        catch (error) {
            if (!error.status) {
                error.status = 500;
            }
            next(error);
        }
    });
    userController.login = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const err = new helpers_1.ResponseError("Validation failed", 422, errors.array());
                err.status = 422;
                throw err;
            }
            const email = req.body.email;
            const password = req.body.password;
            const { token, user } = yield user_service_1.default.login(email, password);
            return res.status(200).json({
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
        catch (error) {
            if (!error.status) {
                error.status = 500;
            }
            next(error);
        }
    });
    userController.googleAuthentication = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const authCode = req.body.authCode;
            const { token, user } = yield user_service_1.default.googleLogin(authCode);
            return res.status(200).json({
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
        catch (error) {
            if (!error.status) {
                error.status = 500;
            }
            next(error);
        }
    });
    userController.verifyJWTToken = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const token = req.body.token;
            if (!token) {
                return res
                    .status(401)
                    .json({ status: "error", code: 401, message: "Not authenticated." });
            }
            const user = yield user_service_1.default.verifyToken(token);
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
        }
        catch (error) {
            if (!error.status) {
                error.status = 500;
            }
            next(error);
        }
    });
})(userController || (userController = {}));
exports.default = userController;
