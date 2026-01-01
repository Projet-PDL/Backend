import { authService } from '../app/services/authService';
import * as jwtService from '../app/services/jwtService';
import prisma from '../app/services/prismaService';
import bcrypt from 'bcrypt';
import { UserNotFoundError } from '../app/errors/auth/UserNotFoundError';
import { InvalidCredentialsError } from '../app/errors/auth/InvalidCredentialsError';
import { TokenGenerationError } from '../app/errors/auth/TokenGenerationError';
import { TokenVerificationError } from '../app/errors/auth/TokenVerificationError';

// Mock dependencies
const mockUserFindUnique = jest.fn();
const mockUserCreate = jest.fn();

jest.mock('../app/services/prismaService', () => ({
  __esModule: true,
  default: {
    user: {
      get findUnique() {
        return mockUserFindUnique;
      },
      get create() {
        return mockUserCreate;
      },
    },
  },
}));

jest.mock('bcrypt');
jest.mock('../app/services/jwtService');
jest.mock('../app/utils/logger/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwtService = jwtService as jest.Mocked<typeof jwtService>;

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: '$2b$10$hashedPassword',
      name: 'Test User',
    };

    it('should successfully login with valid credentials', async () => {
      mockUserFindUnique.mockResolvedValue(mockUser as any);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockedJwtService.generateToken.mockReturnValue('mock.jwt.token');

      const result = await authService.login('test@example.com', 'password123');

      expect(result).toEqual({
        token: 'mock.jwt.token',
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
        },
      });
      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
      expect(mockedJwtService.generateToken).toHaveBeenCalledWith({ userId: '1' });
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
      mockUserFindUnique.mockResolvedValue(null);

      await expect(
        authService.login('nonexistent@example.com', 'password')
      ).rejects.toThrow(UserNotFoundError);

      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
      expect(mockedJwtService.generateToken).not.toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsError when password is incorrect', async () => {
      mockUserFindUnique.mockResolvedValue(mockUser as any);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow(InvalidCredentialsError);

      expect(mockedJwtService.generateToken).not.toHaveBeenCalled();
    });

    it('should throw TokenGenerationError when token generation fails', async () => {
      mockUserFindUnique.mockResolvedValue(mockUser as any);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockedJwtService.generateToken.mockImplementation(() => {
        throw new Error('Token generation failed');
      });

      await expect(
        authService.login('test@example.com', 'password123')
      ).rejects.toThrow(TokenGenerationError);
    });

    it('should return minimal user info without password', async () => {
      const userWithSensitiveData = {
        ...mockUser,
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserFindUnique.mockResolvedValue(userWithSensitiveData as any);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockedJwtService.generateToken.mockReturnValue('token');

      const result = await authService.login('test@example.com', 'password');

      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('name');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const mockDecoded = { userId: '123' };
      mockedJwtService.verifyToken.mockReturnValue(mockDecoded);

      const result = await authService.verifyToken('valid.token');

      expect(result).toEqual({ userId: '123' });
      expect(mockedJwtService.verifyToken).toHaveBeenCalledWith('valid.token');
    });

    it('should throw TokenVerificationError when token is invalid', async () => {
      mockedJwtService.verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.verifyToken('invalid.token')).rejects.toThrow(
        TokenVerificationError
      );
    });

    it('should throw TokenVerificationError when verifyToken returns null', async () => {
      mockedJwtService.verifyToken.mockReturnValue(null as any);

      await expect(authService.verifyToken('token')).rejects.toThrow(
        TokenVerificationError
      );
    });

    it('should handle expired tokens', async () => {
      mockedJwtService.verifyToken.mockImplementation(() => {
        const error: any = new Error('jwt expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      await expect(authService.verifyToken('expired.token')).rejects.toThrow(
        TokenVerificationError
      );
    });
  });

  describe('createUser', () => {
    const newUserData = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
    };

    it('should create a new user with hashed password', async () => {
      const hashedPassword = '$2b$10$hashedPassword';
      const createdUser = {
        id: 1,
        email: newUserData.email,
        password: hashedPassword,
        name: newUserData.name,
      };

      (mockedBcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserCreate.mockResolvedValue(createdUser as any);

      const result = await authService.createUser(
        newUserData.email,
        newUserData.password,
        newUserData.name
      );

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(newUserData.password, 10);
      expect(mockUserCreate).toHaveBeenCalledWith({
        data: {
          email: newUserData.email,
          password: hashedPassword,
          name: newUserData.name,
        },
      });
      expect(result).toEqual(createdUser);
    });

    it('should use bcrypt with salt rounds of 10', async () => {
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockUserCreate.mockResolvedValue({} as any);

      await authService.createUser('user@test.com', 'pass', 'Name');

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('pass', 10);
    });

    it('should handle database errors during user creation', async () => {
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockUserCreate.mockRejectedValue(new Error('Database error'));

      await expect(
        authService.createUser('user@test.com', 'pass', 'Name')
      ).rejects.toThrow('Database error');
    });

    it('should create users with different data', async () => {
      const users = [
        { email: 'user1@test.com', password: 'pass1', name: 'User One' },
        { email: 'user2@test.com', password: 'pass2', name: 'User Two' },
      ];

      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockUserCreate.mockResolvedValue({} as any);

      for (const user of users) {
        await authService.createUser(user.email, user.password, user.name);
        expect(mockUserCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({
            email: user.email,
            name: user.name,
          }),
        });
      }
    });
  });
});
