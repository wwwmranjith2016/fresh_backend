import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { config } from './config/environment';
import prisma from './config/database';
import { initializeSocket } from './socket/socketHandler';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import addressRoutes from './routes/address.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';
import categoryRoutes from './routes/category.routes';
import unitRoutes from './routes/unit.routes';

const app: Application = express();
const server = http.createServer(app);

initializeSocket(server);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'Fresh Chicken Delivery API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

app.get('/', (req: Request, res: Response) => {
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

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/units', unitRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    server.listen(config.port, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Local: http://localhost:${config.port}`);
      console.log(`🔗 Network: http://192.168.1.41:${config.port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

export { app, server };
