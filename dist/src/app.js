"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const rotating_file_stream_1 = require("rotating-file-stream");
const body_parser_1 = __importDefault(require("body-parser"));
const socket_io_1 = require("socket.io");
const router_1 = __importDefault(require("./router"));
const db_config_1 = __importDefault(require("./configs/db.config"));
const general_config_1 = require("./configs/general.config");
(0, db_config_1.default)();
const isProduction = process.env.NODE_ENV === "production";
// create http server
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// add socketio
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "PUT", "POST", "DELETE", "OPTIONs"],
        allowedHeaders: ["Content-Type", "Authorization"],
    },
});
io.on("connection", (socket) => {
    console.log(socket.id);
    console.log(io.of("/").sockets.size);
    socket.on("disconnect", (reason) => {
        console.log(reason);
        console.log("User disconnected!");
        console.log(io.of("/").sockets.size);
    });
});
// add util middleware
const accessLogStream = (0, rotating_file_stream_1.createStream)("access.log", {
    interval: "1d",
    path: path_1.default.join(__dirname, "log"),
});
app.use(isProduction
    ? (0, morgan_1.default)('⚡️[api]: :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', { stream: accessLogStream })
    : (0, morgan_1.default)("⚡️[api]: :method :url :status :response-time ms - :res[content-length]"));
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000"],
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
}));
app.use(body_parser_1.default.json());
app.use("/images", express_1.default.static(path_1.default.join(__dirname, "images")));
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000"],
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
}));
// add request handler
app.use("/api", router_1.default);
app.get("/", (req, res, next) => res.json({
    user_login: `${general_config_1.BASE_URL_API}/v1/user/login`,
    user_signup: `${general_config_1.BASE_URL_API}/v1/user/signup`,
    verify_jwt_token: `${general_config_1.BASE_URL_API}/v1/user/verify-token`,
    google_login: `${general_config_1.BASE_URL_API}/v1/user/google`,
}));
app.use("*", (req, res, next) => {
    res.status(404).json({
        status: "error",
        code: 404,
        message: "Not found!",
        links: {
            user_login: `${general_config_1.BASE_URL_API}/v1/user/login`,
            user_signup: `${general_config_1.BASE_URL_API}/v1/user/signup`,
            verify_jwt_token: `${general_config_1.BASE_URL_API}/v1/user/verify-token`,
            google_login: `${general_config_1.BASE_URL_API}/v1/user/google`,
        },
    });
});
// add error handler middleware
app.use((err, req, res, next) => {
    const status = err === null || err === void 0 ? void 0 : err.status;
    const message = err.message;
    const data = err === null || err === void 0 ? void 0 : err.data;
    res.status(status || 500).json({
        error: Object.assign({ status: status || 500, message: message || "Internal Server Error" }, (data && { data })),
    });
});
exports.default = httpServer;
