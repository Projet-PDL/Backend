import { generateToken, verifyToken, verifyTokenWithCache } from './jwtService';
import prisma from './prismaService';
import bcrypt from 'bcrypt';
import logger from '../utils/logger/logger';
import { UserNotFoundError } from '../errors/auth/UserNotFoundError';
import { InvalidCredentialsError } from '../errors/auth/InvalidCredentialsError';
import { TokenGenerationError } from '../errors/auth/TokenGenerationError';
import { TokenVerificationError } from '../errors/auth/TokenVerificationError';



export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    logger.info({ email }, 'Login attempt started');

    const user: any = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UserNotFoundError(email);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new InvalidCredentialsError();
    }

    try {
      const token = generateToken({ userId: String(user.id) });
      logger.info({ email, userId: user.id }, 'Token generated successfully');
      // Return token and minimal user account info
      return { token, user: { id: user.id, email: user.email, name: user.name } };
    } catch (err) {
      throw new TokenGenerationError(err);
    }
  },

  async verifyToken(token: string): Promise<{ userId: string }> {
    try {
      const decodedToken = await verifyTokenWithCache(token);
      if (!decodedToken) {
        throw new TokenVerificationError({ token });
      }
      logger.info({ token }, 'Token verified successfully via authService');
      return decodedToken;
    } catch (err) {
      throw new TokenVerificationError(err);
    }
  },

  async createUser(email: string, password: string, name: string): Promise<any> {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    return user;
  },
};