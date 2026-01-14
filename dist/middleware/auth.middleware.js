"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = exports.authMiddleware = void 0;
const jwt_util_1 = require("../utils/jwt.util");
const response_util_1 = require("../utils/response.util");
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return (0, response_util_1.sendError)(res, 'No token provided', 401);
        }
        const token = authHeader.substring(7);
        const payload = (0, jwt_util_1.verifyAccessToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        return (0, response_util_1.sendError)(res, 'Invalid or expired token', 401);
    }
};
exports.authMiddleware = authMiddleware;
const adminMiddleware = (req, res, next) => {
    if (req.user?.role !== 'ADMIN') {
        return (0, response_util_1.sendError)(res, 'Unauthorized: Admin access required', 403);
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
