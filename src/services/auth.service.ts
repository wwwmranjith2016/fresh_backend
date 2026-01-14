import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { RegisterRequest, LoginRequest } from '../types';
import { generateAccessToken, generateRefreshToken, JwtPayload } from '../utils/jwt.util';
import { UserRole } from '@prisma/client';

export class AuthService {
  async register(data: RegisterRequest) {
    const existingUser = await prisma.user.findUnique({
      where: { phone: data.phone },
    });

    if (existingUser) {
      throw new Error('Phone number already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        phone: data.phone,
        password: hashedPassword,
        name: data.name,
        email: data.email,
        role: data.role || UserRole.CUSTOMER,
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

    const payload: JwtPayload = {
      id: user.id,
      phone: user.phone,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginRequest) {
    const user = await prisma.user.findUnique({
      where: { phone: data.phone },
    });

    if (!user) {
      throw new Error('Invalid phone number or password');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid phone number or password');
    }

    const payload: JwtPayload = {
      id: user.id,
      phone: user.phone,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

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

  async updateFcmToken(userId: string, fcmToken: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { fcmToken },
    });

    return { success: true };
  }

  async getLatestCustomer() {
    const customer = await prisma.user.findFirst({
      where: { role: UserRole.CUSTOMER },
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
}

export default new AuthService();
