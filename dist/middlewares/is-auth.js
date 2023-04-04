"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const help_1 = require("../utils/help");
const config_1 = require("../utils/config");
const isAuth = (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        const err = new help_1.ResponseError("Not authorized!", 403);
        throw err;
    }
    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
        decodedToken = jsonwebtoken_1.default.verify(token, config_1.SECRET_JWT_KEY);
    }
    catch (error) {
        const err = new help_1.ResponseError("Not authorized!", 403);
        throw err;
    }
    if (!decodedToken) {
        const err = new help_1.ResponseError("Not authorized!", 403);
        throw err;
    }
    req.userId = decodedToken.userId;
    req.email = decodedToken.email;
    next();
};
exports.default = isAuth;
