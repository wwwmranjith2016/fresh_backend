"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const response_util_1 = require("../utils/response.util");
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    if (err.name === 'JsonWebTokenError') {
        return (0, response_util_1.sendError)(res, 'Invalid token', 401);
    }
    if (err.name === 'TokenExpiredError') {
        return (0, response_util_1.sendError)(res, 'Token expired', 401);
    }
    if (err.code === 'P2002') {
        return (0, response_util_1.sendError)(res, 'A record with this value already exists', 409);
    }
    if (err.code === 'P2025') {
        return (0, response_util_1.sendError)(res, 'Record not found', 404);
    }
    return (0, response_util_1.sendError)(res, err.message || 'Internal server error', err.statusCode || 500);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    return (0, response_util_1.sendError)(res, 'Route not found', 404);
};
exports.notFoundHandler = notFoundHandler;
