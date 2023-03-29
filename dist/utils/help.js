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
Object.defineProperty(exports, "__esModule", { value: true });
exports.genRandomString = exports.ResponseError = exports.catchAsync = exports.catchSync = void 0;
const catchSync = (fn, ...args) => {
    try {
        const result = fn(args);
        return [result, undefined];
    }
    catch (error) {
        return [undefined, error];
    }
};
exports.catchSync = catchSync;
const catchAsync = (fn, ...args) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = fn(args);
        return [result, undefined];
    }
    catch (error) {
        return [undefined, error];
    }
});
exports.catchAsync = catchAsync;
class ResponseError extends Error {
    constructor(message, status, data) {
        super(message);
        this.status = status;
        this.data = data;
    }
}
exports.ResponseError = ResponseError;
const genRandomString = (length) => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const charLength = chars.length;
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charLength));
    }
    return result;
};
exports.genRandomString = genRandomString;
