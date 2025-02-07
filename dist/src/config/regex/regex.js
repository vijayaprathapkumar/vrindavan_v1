"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePassword = exports.validateEmailRegex = void 0;
const validateEmailRegex = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
};
exports.validateEmailRegex = validateEmailRegex;
const validatePassword = (password) => {
    return password && password.trim() !== "";
};
exports.validatePassword = validatePassword;
