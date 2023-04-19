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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = __importDefault(require("./user.model"));
const helpers_1 = require("../helpers");
const general_config_1 = require("../../../configs/general.config");
const client = new google_auth_library_1.OAuth2Client(general_config_1.GOOGLE_CREDENTIAL_CLIENT_ID, general_config_1.GOOGLE_CREDENTIAL_CLIENT_SECRET, general_config_1.GOOGLE_REDIRECT_URI);
var userService;
(function (userService) {
    userService.signup = (email, password) => __awaiter(this, void 0, void 0, function* () {
        const hashPassword = bcryptjs_1.default.hashSync(password, 12);
        const user = new user_model_1.default({
            email: email,
            password: hashPassword,
            name: (0, helpers_1.genRandomName)(12),
            picture: "/images/user.png",
            provider: "transferme",
        });
        return yield user.save();
    });
    userService.login = (email, password) => __awaiter(this, void 0, void 0, function* () {
        const user = yield user_model_1.default.findOne({ email: email });
        if (!user) {
            const err = new helpers_1.ResponseError("The user with this email could not be found!", 401);
            throw err;
        }
        if (!bcryptjs_1.default.compareSync(password, user.password)) {
            const err = new helpers_1.ResponseError("Wrong password", 401);
            throw err;
        }
        const token = jsonwebtoken_1.default.sign({
            email: user.email,
            userId: user._id.toString(),
        }, general_config_1.SECRET_JWT_KEY, { expiresIn: general_config_1.TOKEN_EXPIRATION_TIME });
        return {
            token: token,
            user: user,
        };
    });
    userService.googleLogin = (authCode) => __awaiter(this, void 0, void 0, function* () {
        const { tokens } = yield client.getToken(authCode);
        const ticket = yield client.verifyIdToken({
            idToken: tokens.id_token,
            audience: general_config_1.GOOGLE_CREDENTIAL_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            const err = new helpers_1.ResponseError("User not found", 401);
            throw err;
        }
        let savedUser;
        const user = yield user_model_1.default.findOne({ email: payload.email });
        if (!user) {
            const user = new user_model_1.default({
                email: payload.email,
                password: bcryptjs_1.default.hashSync((0, helpers_1.genRandomName)(8), 12),
                name: payload.name,
                picture: payload.picture,
                provider: "google",
            });
            savedUser = yield user.save();
        }
        else {
            user.email = payload.email;
            user.name = payload.name;
            user.picture = payload.picture;
            savedUser = yield user.save();
        }
        const token = jsonwebtoken_1.default.sign({
            email: savedUser.email,
            userId: savedUser._id.toString(),
        }, general_config_1.SECRET_JWT_KEY, { expiresIn: general_config_1.TOKEN_EXPIRATION_TIME });
        return {
            token: token,
            user: user,
        };
    });
    userService.verifyToken = (token) => __awaiter(this, void 0, void 0, function* () {
        try {
            const decodedToken = jsonwebtoken_1.default.verify(token, general_config_1.SECRET_JWT_KEY);
            if (!decodedToken) {
                throw new helpers_1.ResponseError("User not found!", 401);
            }
            const user = yield user_model_1.default.findOne({ _id: decodedToken.userId });
            if (!user) {
                throw new helpers_1.ResponseError("User not found!", 401);
            }
            return user;
        }
        catch (error) {
            if (error) {
                throw error;
            }
            throw new helpers_1.ResponseError("User not found!", 401);
        }
    });
})(userService || (userService = {}));
exports.default = userService;
