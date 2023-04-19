"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router_1 = __importDefault(require("./api/v1/router"));
const apiRouter = (0, express_1.default)();
apiRouter.use("/v1", router_1.default);
exports.default = apiRouter;
