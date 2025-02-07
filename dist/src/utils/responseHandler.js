"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResponse = void 0;
const createResponse = (statusCode, message, data = null) => {
    return {
        statusCode: statusCode,
        message,
        data
    };
};
exports.createResponse = createResponse;
