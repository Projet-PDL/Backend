import jwt from 'jsonwebtoken';
import { generateToken, verifyToken, verifyTokenWithCache, TokenPayload } from '../app/services/jwtService';
import { TokenGenerationError } from '../app/errors/auth/TokenGenerationError';
import { TokenVerificationError } from '../app/errors/auth/TokenVerificationError';

// Mock jwt module
jest.mock('jsonwebtoken');
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

// Mock Redis service (simulate Redis unavailable)
jest.mock('../app/services/redisService', () => ({
  redisService: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(false),
    del: jest.fn().mockResolvedValue(false),
    isRedisAvailable: jest.fn().mockReturnValue(false),
  },
}));

// Mock logger
jest.mock('../app/utils/logger/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

describe('jwtService', () => {
  const mockPayload: TokenPayload = { userId: '123' };
  const mockToken = 'mock.jwt.token';
  const mockSecret = process.env.JWT_SECRET || 'your-secret-key';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      mockedJwt.sign.mockReturnValue(mockToken as any);

      const token = generateToken(mockPayload);

      expect(token).toBe(mockToken);
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        mockPayload,
        mockSecret,
        expect.objectContaining({ expiresIn: expect.any(Number) })
      );
    });

    it('should generate token with custom expiration', () => {
      mockedJwt.sign.mockReturnValue(mockToken as any);
      const customExpiration = 3600; // 1 hour

      const token = generateToken(mockPayload, customExpiration);

      expect(token).toBe(mockToken);
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        mockPayload,
        mockSecret,
        { expiresIn: customExpiration }
      );
    });

    it('should throw TokenGenerationError on jwt.sign failure', () => {
      const error = new Error('JWT signing failed');
      mockedJwt.sign.mockImplementation(() => {
        throw error;
      });

      expect(() => generateToken(mockPayload)).toThrow(TokenGenerationError);
    });

    it('should handle different user IDs', () => {
      mockedJwt.sign.mockReturnValue(mockToken as any);

      const payloads = [
        { userId: '1' },
        { userId: '999' },
        { userId: 'abc-123' },
      ];

      payloads.forEach((payload) => {
        generateToken(payload);
        expect(mockedJwt.sign).toHaveBeenCalledWith(
          payload,
          mockSecret,
          expect.any(Object)
        );
      });
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const decodedPayload = { userId: '123', iat: 1234567890, exp: 1234567890 };
      mockedJwt.verify.mockReturnValue(decodedPayload as any);

      const result = verifyToken(mockToken);

      expect(result).toEqual({ userId: '123' });
      expect(mockedJwt.verify).toHaveBeenCalledWith(mockToken, mockSecret);
    });

    it('should throw TokenVerificationError on invalid token', () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => verifyToken(mockToken)).toThrow(TokenVerificationError);
    });

    it('should throw TokenVerificationError on expired token', () => {
      const expiredError = new Error('jwt expired');
      (expiredError as any).name = 'TokenExpiredError';
      mockedJwt.verify.mockImplementation(() => {
        throw expiredError;
      });

      expect(() => verifyToken('expired.token')).toThrow(TokenVerificationError);
    });

    it('should throw TokenVerificationError on malformed token', () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      expect(() => verifyToken('malformed-token')).toThrow(TokenVerificationError);
    });

    it('should extract only userId from decoded token', () => {
      const decodedPayload = {
        userId: '456',
        iat: 1234567890,
        exp: 1234567890,
        someOtherField: 'should not be included',
      };
      mockedJwt.verify.mockReturnValue(decodedPayload as any);

      const result = verifyToken(mockToken);

      expect(result).toEqual({ userId: '456' });
      expect(result).not.toHaveProperty('iat');
      expect(result).not.toHaveProperty('exp');
      expect(result).not.toHaveProperty('someOtherField');
    });

    it('should handle different token formats', () => {
      const tokens = [
        'header.payload.signature',
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        'short-token',
      ];

      tokens.forEach((token) => {
        mockedJwt.verify.mockReturnValue({ userId: '123' } as any);
        const result = verifyToken(token);
        expect(result.userId).toBe('123');
      });
    });
  });

  describe('verifyTokenWithCache', () => {
    it('should verify token when Redis is unavailable (fallback)', async () => {
      const decodedPayload = { userId: '123', iat: 1234567890, exp: 1234567890 };
      mockedJwt.verify.mockReturnValue(decodedPayload as any);

      const result = await verifyTokenWithCache(mockToken);

      expect(result).toEqual({ userId: '123' });
      expect(mockedJwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String));
    });

    it('should throw TokenVerificationError on invalid token (no Redis)', async () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(verifyTokenWithCache('invalid.token')).rejects.toThrow(
        TokenVerificationError
      );
    });

    it('should throw TokenVerificationError on expired token (no Redis)', async () => {
      const expiredError = new Error('jwt expired');
      (expiredError as any).name = 'TokenExpiredError';
      mockedJwt.verify.mockImplementation(() => {
        throw expiredError;
      });

      await expect(verifyTokenWithCache('expired.token')).rejects.toThrow(
        TokenVerificationError
      );
    });

    it('should work normally without Redis (graceful degradation)', async () => {
      // Redis is mocked to always return null (cache miss)
      const decodedPayload = { userId: '456', iat: Date.now(), exp: Date.now() + 3600 };
      mockedJwt.verify.mockReturnValue(decodedPayload as any);

      const result = await verifyTokenWithCache('some.jwt.token');

      expect(result).toEqual({ userId: '456' });
      // Should work without throwing errors even though Redis is unavailable
    });
  });
});
