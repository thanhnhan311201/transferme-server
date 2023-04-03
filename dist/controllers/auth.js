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
exports.verifyJWTToken = exports.googleAuthentication = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const dotenv_1 = __importDefault(require("dotenv"));
const google_auth_library_1 = require("google-auth-library");
dotenv_1.default.config();
const user_1 = __importDefault(require("../models/user"));
const help_1 = require("../utils/help");
const config_1 = require("../utils/config");
const client = new google_auth_library_1.OAuth2Client(config_1.GOOGLE_CREDENTIAL_CLIENT_ID, config_1.GOOGLE_CREDENTIAL_CLIENT_SECRET, config_1.GOOGLE_REDIRECT_URI);
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new help_1.ResponseError("Validation failed!", 422, errors.array());
            throw error;
        }
        const email = req.body.email;
        const password = req.body.password;
        const hashPassword = bcryptjs_1.default.hashSync(password, 12);
        const user = new user_1.default({
            email: email,
            password: hashPassword,
            name: (0, help_1.genRandomName)(12),
            picture: "/images/user.png",
            provider: "transferme",
        });
        const result = yield user.save();
        res.status(201).json({
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
exports.signup = signup;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const err = new help_1.ResponseError("Validation failed", 422, errors.array());
            err.status = 422;
            throw err;
        }
        const email = req.body.email;
        const password = req.body.password;
        const user = yield user_1.default.findOne({ email: email });
        if (!user) {
            const err = new help_1.ResponseError("The user with this email could not be found!", 401);
            throw err;
        }
        if (!bcryptjs_1.default.compareSync(password, user.password)) {
            const err = new help_1.ResponseError("Wrong password", 401);
            throw err;
        }
        else {
            const token = jsonwebtoken_1.default.sign({
                email: user.email,
                userId: user._id.toString(),
            }, config_1.SECRET_JWT_KEY, { expiresIn: "1h" });
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
    }
    catch (error) {
        if (!error.status) {
            error.status = 500;
        }
        next(error);
    }
});
exports.login = login;
const googleAuthentication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authCode = req.body.authCode;
        const { tokens } = yield client.getToken(authCode);
        const ticket = yield client.verifyIdToken({
            idToken: tokens.id_token,
            audience: config_1.GOOGLE_CREDENTIAL_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            const err = new help_1.ResponseError("User not found", 401);
            throw err;
        }
        else {
            const user = yield user_1.default.findOne({ email: payload.email });
            if (!user) {
                const user = new user_1.default({
                    email: payload.email,
                    password: bcryptjs_1.default.hashSync((0, help_1.genRandomName)(8), 12),
                    name: payload.name,
                    picture: payload.picture,
                    provider: "google",
                });
                const result = yield user.save();
                const token = jsonwebtoken_1.default.sign({
                    email: result.email,
                    userId: result._id.toString(),
                }, config_1.SECRET_JWT_KEY, { expiresIn: "1h" });
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
            else {
                user.email = payload.email;
                user.name = payload.name;
                user.picture = payload.picture;
                const result = yield user.save();
                const token = jsonwebtoken_1.default.sign({
                    email: result.email,
                    userId: result._id.toString(),
                }, config_1.SECRET_JWT_KEY, { expiresIn: "1h" });
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
    }
    catch (error) {
        if (!error.status) {
            error.status = 500;
        }
        next(error);
    }
});
exports.googleAuthentication = googleAuthentication;
const verifyJWTToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token;
    if (!token) {
        return res
            .status(401)
            .json({ status: "error", code: 401, message: "Not authenticated." });
    }
    let decodedToken;
    try {
        decodedToken = jsonwebtoken_1.default.verify(token, config_1.SECRET_JWT_KEY);
    }
    catch (error) {
        const err = new help_1.ResponseError("Not authenticated.", 401);
        next(error);
    }
    if (!decodedToken) {
        return res
            .status(401)
            .json({ status: "error", code: 401, message: "Not authenticated." });
    }
    try {
        const user = yield user_1.default.findOne({ _id: decodedToken.userId });
        if (!user) {
            const err = new help_1.ResponseError("User not found!", 401);
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
    }
    catch (error) {
        if (!error.status) {
            error.status = 500;
        }
        next(error);
    }
});
exports.verifyJWTToken = verifyJWTToken;
