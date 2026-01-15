"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
const jwt_util_1 = require("../utils/jwt.util");
const client_1 = require("@prisma/client");
const phone_util_1 = require("../utils/phone-util");
console.log('Current directory:', __dirname);
console.log('Resolving module path:', require.resolve('../utils/phone-util'));
class AuthService {
    async register(data) {
        const phone = (0, phone_util_1.normalizePhone)(data.phone);
        const existingUser = await database_1.default.user.findUnique({
            where: { phone },
        });
        if (existingUser) {
            throw new Error('Phone number already registered');
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        const user = await database_1.default.user.create({
            data: {
                phone,
                password: hashedPassword,
                name: data.name,
                email: data.email,
                role: data.role || client_1.UserRole.CUSTOMER,
            },
            select: {
                id: true,
                phone: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        const payload = {
            id: user.id,
            phone: user.phone,
            role: user.role,
        };
        const accessToken = (0, jwt_util_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_util_1.generateRefreshToken)(payload);
        return {
            user,
            accessToken,
            refreshToken,
        };
    }
    async login(data) {
        const phone = (0, phone_util_1.normalizePhone)(data.phone);
        const user = await database_1.default.user.findUnique({
            where: { phone },
        });
        if (!user) {
            throw new Error('Invalid phone number or password');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid phone number or password');
        }
        const payload = {
            id: user.id,
            phone: user.phone,
            role: user.role,
        };
        const accessToken = (0, jwt_util_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_util_1.generateRefreshToken)(payload);
        return {
            user: {
                id: user.id,
                phone: user.phone,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            accessToken,
            refreshToken,
        };
    }
    async updateFcmToken(userId, fcmToken) {
        await database_1.default.user.update({
            where: { id: userId },
            data: { fcmToken },
        });
        return { success: true };
    }
    async getLatestCustomer() {
        const customer = await database_1.default.user.findFirst({
            where: { role: client_1.UserRole.CUSTOMER },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                phone: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return customer;
    }
    async getUserByPhone(rawPhone) {
        const phone = (0, phone_util_1.normalizePhone)(rawPhone);
        const user = await database_1.default.user.findUnique({
            where: { phone },
            select: {
                id: true,
                phone: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            return null;
        }
        const addresses = await database_1.default.address.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });
        return {
            user,
            addresses,
        };
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
