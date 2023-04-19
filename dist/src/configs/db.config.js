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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mongoDbUrl = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}`;
        console.log(`⚡️[database]: Connecting to ${mongoDbUrl}...`);
        mongoose_1.default.Promise = global.Promise;
        // Connect to the database
        yield mongoose_1.default.connect(mongoDbUrl);
        console.log("⚡️[database]: Successfully connected to the database!");
    }
    catch (error) {
        console.log(`⚡️[error]: ${error}\n⚡️[database]: Could not connect to the database. Exiting now...`);
        process.emit("SIGTERM");
    }
});
exports.default = connectDatabase;
