"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const environment_1 = require("./config/environment");
const database_1 = __importDefault(require("./config/database"));
const socketHandler_1 = require("./socket/socketHandler");
const error_middleware_1 = require("./middleware/error.middleware");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const address_routes_1 = __importDefault(require("./routes/address.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
(0, socketHandler_1.initializeSocket)(server);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Fresh Chicken Delivery API is running',
        timestamp: new Date().toISOString(),
        environment: environment_1.config.nodeEnv
    });
});
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Fresh Chicken Delivery API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            orders: '/api/orders',
            addresses: '/api/addresses',
            notifications: '/api/notifications',
            admin: '/api/admin'
        }
    });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/addresses', address_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
const startServer = async () => {
    try {
        await database_1.default.$connect();
        console.log('✅ Database connected');
        server.listen(environment_1.config.port, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${environment_1.config.port}`);
            console.log(`📍 Environment: ${environment_1.config.nodeEnv}`);
            console.log(`🔗 Local: http://localhost:${environment_1.config.port}`);
            console.log(`🔗 Network: http://192.168.1.41:${environment_1.config.port}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
process.on('SIGINT', async () => {
    console.log('\n👋 Shutting down gracefully...');
    await database_1.default.$disconnect();
    process.exit(0);
});
