import { updateProfilePicture, getUserProfilePicture } from '../app/services/userService';

// Mock prisma
const mockUserUpdate = jest.fn();
const mockUserFindUnique = jest.fn();

jest.mock('../app/services/prismaService', () => ({
  __esModule: true,
  default: {
    user: {
      get update() {
        return mockUserUpdate;
      },
      get findUnique() {
        return mockUserFindUnique;
      },
    },
  },
}));

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProfilePicture', () => {
    it('should update user profile picture successfully', async () => {
      const userId = 1;
      const imageUrl = 'https://example.com/image.jpg';
      const updatedUser = {
        id: userId,
        email: 'user@example.com',
        name: 'Test User',
        profilePicture: imageUrl,
      };

      mockUserUpdate.mockResolvedValue(updatedUser as any);

      const result = await updateProfilePicture(userId, imageUrl);

      expect(result).toEqual(updatedUser);
      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: userId },
        data: { profilePicture: imageUrl },
      });
    });

    it('should handle different image URLs', async () => {
      const userId = 1;
      const imageUrls = [
        'https://storage.googleapis.com/bucket/image.png',
        'https://cdn.example.com/avatar.jpg',
        '/local/path/image.gif',
      ];

      mockUserUpdate.mockResolvedValue({} as any);

      for (const url of imageUrls) {
        await updateProfilePicture(userId, url);
        expect(mockUserUpdate).toHaveBeenCalledWith({
          where: { id: userId },
          data: { profilePicture: url },
        });
      }
    });

    it('should handle different user IDs', async () => {
      const userIds = [1, 42, 999];
      const imageUrl = 'https://example.com/image.jpg';

      mockUserUpdate.mockResolvedValue({} as any);

      for (const id of userIds) {
        await updateProfilePicture(id, imageUrl);
        expect(mockUserUpdate).toHaveBeenCalledWith({
          where: { id },
          data: { profilePicture: imageUrl },
        });
      }
    });

    it('should throw error when user does not exist', async () => {
      const userId = 999;
      const imageUrl = 'https://example.com/image.jpg';

      mockUserUpdate.mockRejectedValue(
        new Error('Record to update not found')
      );

      await expect(updateProfilePicture(userId, imageUrl)).rejects.toThrow(
        'Record to update not found'
      );
    });

    it('should handle database connection errors', async () => {
      const userId = 1;
      const imageUrl = 'https://example.com/image.jpg';

      mockUserUpdate.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(updateProfilePicture(userId, imageUrl)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('getUserProfilePicture', () => {
    it('should retrieve user profile data with picture', async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        email: 'user@example.com',
        name: 'Test User',
        profilePicture: 'https://example.com/profile.jpg',
      };

      mockUserFindUnique.mockResolvedValue(mockUser as any);

      const result = await getUserProfilePicture(userId);

      expect(result).toEqual(mockUser);
      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          profilePicture: true,
          id: true,
          email: true,
          name: true,
        },
      });
    });

    it('should return null when user does not exist', async () => {
      const userId = 999;

      mockUserFindUnique.mockResolvedValue(null);

      const result = await getUserProfilePicture(userId);

      expect(result).toBeNull();
      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: expect.any(Object),
      });
    });

    it('should return user with null profile picture if not set', async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        email: 'user@example.com',
        name: 'Test User',
        profilePicture: null,
      };

      mockUserFindUnique.mockResolvedValue(mockUser as any);

      const result = await getUserProfilePicture(userId);

      expect(result).toEqual(mockUser);
      expect(result?.profilePicture).toBeNull();
    });

    it('should only select specified fields', async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        email: 'user@example.com',
        name: 'Test User',
        profilePicture: 'url',
      };

      mockUserFindUnique.mockResolvedValue(mockUser as any);

      const result = await getUserProfilePicture(userId);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('profilePicture');
    });

    it('should handle different user IDs', async () => {
      const userIds = [1, 5, 100];

      for (const id of userIds) {
        mockUserFindUnique.mockResolvedValue({ id } as any);
        await getUserProfilePicture(id);
        expect(mockUserFindUnique).toHaveBeenCalledWith({
          where: { id },
          select: expect.any(Object),
        });
      }
    });
  });
});
