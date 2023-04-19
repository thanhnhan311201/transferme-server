"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GOOGLE_REDIRECT_URI = exports.GOOGLE_CREDENTIAL_CLIENT_SECRET = exports.GOOGLE_CREDENTIAL_CLIENT_ID = exports.TOKEN_EXPIRATION_TIME = exports.SECRET_JWT_KEY = exports.BASE_URL_SERVER = exports.BASE_URL_API = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.BASE_URL_API = process.env.BASE_URL_API;
exports.BASE_URL_SERVER = process.env.BASE_URL_SERVER;
exports.SECRET_JWT_KEY = process.env.SECRET_JWT_KEY;
exports.TOKEN_EXPIRATION_TIME = process.env
    .TOKEN_EXPIRATION_TIME;
exports.GOOGLE_CREDENTIAL_CLIENT_ID = process.env
    .GOOGLE_CREDENTIAL_CLIENT_ID;
exports.GOOGLE_CREDENTIAL_CLIENT_SECRET = process.env
    .GOOGLE_CREDENTIAL_CLIENT_SECRET;
exports.GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
