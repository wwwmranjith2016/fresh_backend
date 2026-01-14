"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocketHandler = exports.initializeSocket = exports.SocketHandler = void 0;
const socket_io_1 = require("socket.io");
const jwt_util_1 = require("../utils/jwt.util");
class SocketHandler {
    constructor(server) {
        this.userSockets = new Map();
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });
        this.setupSocketHandlers();
    }
    setupSocketHandlers() {
        this.io.use((socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication error'));
                }
                const payload = (0, jwt_util_1.verifyAccessToken)(token);
                socket.userId = payload.id;
                socket.userRole = payload.role;
                next();
            }
            catch (error) {
                next(new Error('Authentication error'));
            }
        });
        this.io.on('connection', (socket) => {
            const userId = socket.userId;
            const userRole = socket.userRole;
            console.log(`User connected: ${userId} (${userRole})`);
            this.userSockets.set(userId, socket.id);
            if (userRole === 'ADMIN') {
                socket.join('admins');
            }
            socket.on('disconnect', () => {
                console.log(`User disconnected: ${userId}`);
                this.userSockets.delete(userId);
            });
            socket.on('ping', () => {
                socket.emit('pong');
            });
        });
    }
    emitOrderStatusChange(customerId, order) {
        const socketId = this.userSockets.get(customerId);
        if (socketId) {
            this.io.to(socketId).emit('order:status-changed', order);
        }
    }
    emitNewOrderToAdmins(order) {
        this.io.to('admins').emit('order:new', order);
    }
    getIO() {
        return this.io;
    }
}
exports.SocketHandler = SocketHandler;
let socketHandler = null;
const initializeSocket = (server) => {
    socketHandler = new SocketHandler(server);
    return socketHandler;
};
exports.initializeSocket = initializeSocket;
const getSocketHandler = () => {
    if (!socketHandler) {
        throw new Error('Socket handler not initialized');
    }
    return socketHandler;
};
exports.getSocketHandler = getSocketHandler;
exports.default = {
    initializeSocket: exports.initializeSocket,
    getSocketHandler: exports.getSocketHandler,
};
