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
exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const user_1 = __importDefault(require("../models/user"));
const help_1 = require("../utils/help");
const config_1 = require("../utils/config");
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
            name: (0, help_1.genRandomString)(12),
            picture: "/images/user.png",
        });
        const result = yield user.save();
        res.status(201).json({
            message: "User signup successfully!",
            user: {
                email: result.email,
                id: result._id,
                name: result.name,
                picture: result.picture,
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
