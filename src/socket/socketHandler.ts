import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyAccessToken } from '../utils/jwt.util';

export class SocketHandler {
  private io: SocketIOServer;
  private userSockets: Map<string, string> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const payload = verifyAccessToken(token);
        (socket as any).userId = payload.id;
        (socket as any).userRole = payload.role;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const userId = (socket as any).userId;
      const userRole = (socket as any).userRole;

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

  public emitOrderStatusChange(customerId: string, order: any) {
    const socketId = this.userSockets.get(customerId);
    if (socketId) {
      this.io.to(socketId).emit('order:status-changed', order);
      console.log(`Order status change emitted to customer ${customerId}:`, order);
    } else {
      console.log(`No active socket connection for customer ${customerId}`);
    }
  }

  public emitNewOrderToAdmins(order: any) {
    this.io.to('admins').emit('order:new', order);
    console.log('New order notification emitted to admins:', order);
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

let socketHandler: SocketHandler | null = null;

export const initializeSocket = (server: HTTPServer): SocketHandler => {
  socketHandler = new SocketHandler(server);
  return socketHandler;
};

export const getSocketHandler = (): SocketHandler => {
  if (!socketHandler) {
    throw new Error('Socket handler not initialized');
  }
  return socketHandler;
};

export default {
  initializeSocket,
  getSocketHandler,
};
