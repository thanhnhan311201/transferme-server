"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./src/app"));
const port = process.env.PORT || 8080;
app_1.default.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
// Close the server and exit the process when a termination signal is received
process.on("SIGTERM", () => {
    app_1.default.close(() => {
        console.log("Server stopped!");
        process.exit(1);
    });
});
