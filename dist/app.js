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
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const auth_1 = __importDefault(require("./routes/auth"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 8080;
app.use(body_parser_1.default.json());
app.use("/images", express_1.default.static(path_1.default.join(__dirname, "images")));
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000"],
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
}));
app.use("/api/auth", auth_1.default);
app.use((err, req, res, next) => {
    const status = err === null || err === void 0 ? void 0 : err.status;
    const message = err.message;
    const data = err === null || err === void 0 ? void 0 : err.data;
    res.status(status).json(Object.assign({ message: message }, (data && { data })));
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connect(process.env.MONGODB_URI);
    app.listen(port, () => {
        console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
}))();