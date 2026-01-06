import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION ? parseInt(process.env.JWT_EXPIRATION, 10) : 604800;

import logger from '../utils/logger/logger';
import { TokenGenerationError } from '../errors/auth/TokenGenerationError';
import { TokenVerificationError } from '../errors/auth/TokenVerificationError';
import { redisService } from './redisService';


export interface TokenPayload {
  userId: string;
}

export function generateToken(payload: TokenPayload, expiresIn: number = JWT_EXPIRATION): string {
  try {
    const options: SignOptions = { expiresIn };
    const token = jwt.sign(payload, SECRET_KEY as jwt.Secret, options);
    logger.info({ payload }, 'Token generated successfully');
    return token;
  } catch (error) {
    logger.error({ error, payload }, 'Token generation failed');
    throw new TokenGenerationError({ payload, error });
  }
}

export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as TokenPayload & JwtPayload;
    logger.info({ token }, 'Token verified successfully');
    return { userId: decoded.userId };
  } catch (error) {
    logger.error({ token, error }, 'Token verification failed');
    throw new TokenVerificationError({ token, error });
  }
}

/**
 * Verify JWT token with Redis caching
 * Falls back to classic verification if Redis is unavailable
 */
export async function verifyTokenWithCache(token: string): Promise<TokenPayload> {
  const cacheKey = `jwt:${token}`;

  try {
    // Try to get cached token payload from Redis
    const cached = await redisService.get(cacheKey);

    if (cached) {
      logger.debug({ token }, 'Token verified from Redis cache');
      return JSON.parse(cached) as TokenPayload;
    }

    // Cache miss or Redis unavailable - verify token normally
    const decoded = jwt.verify(token, SECRET_KEY) as TokenPayload & JwtPayload;
    const payload: TokenPayload = { userId: decoded.userId };

    // Try to cache the verified token (silently fails if Redis is down)
    // Calculate TTL from token expiration
    const ttl = decoded.exp ? Math.max(0, decoded.exp - Math.floor(Date.now() / 1000)) : JWT_EXPIRATION;
    await redisService.set(cacheKey, JSON.stringify(payload), ttl);

    logger.info({ token, cached: false }, 'Token verified successfully and cached');
    return payload;

  } catch (error) {
    // If error is from JWT verification, throw it
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      logger.error({ token, error }, 'Token verification failed');
      throw new TokenVerificationError({ token, error });
    }

    // If error is from Redis or other source, fall back to classic verification
    logger.warn({ token, error }, 'Redis error during token verification - falling back to classic verification');
    return verifyToken(token);
  }
}

/**
 * Invalidate a token in Redis cache (for logout functionality)
 */
export async function invalidateToken(token: string): Promise<void> {
  const cacheKey = `jwt:${token}`;

  try {
    await redisService.del(cacheKey);
    logger.info({ token }, 'Token invalidated from cache');
  } catch (error) {
    logger.warn({ token, error }, 'Failed to invalidate token from cache');
  }
}
