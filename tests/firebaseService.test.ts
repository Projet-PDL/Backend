import { Readable } from 'stream';
import { EventEmitter } from 'events';

// Mock firebase-admin BEFORE importing the service
const mockFileInstance = {
  createWriteStream: jest.fn(),
  makePublic: jest.fn(),
  getSignedUrl: jest.fn(),
};

const mockBucket = {
  name: 'test-bucket',
  file: jest.fn(() => mockFileInstance),
};

const mockStorage = {
  bucket: jest.fn(() => mockBucket),
};

const mockApp = {
  storage: jest.fn(() => mockStorage),
};

jest.mock('firebase-admin', () => ({
  __esModule: true,
  default: {
    apps: [],
    app: jest.fn(() => mockApp),
    initializeApp: jest.fn(() => mockApp),
    credential: {
      cert: jest.fn(),
      applicationDefault: jest.fn(),
    },
    storage: jest.fn(() => mockStorage),
  },
}));

// Import AFTER mocking
import { uploadUserImage } from '../app/services/firebaseService';

// Mock logger
jest.mock('../app/utils/logger/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('firebaseService', () => {
  let mockWriteStream: EventEmitter;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock write stream
    mockWriteStream = new EventEmitter() as any;
    (mockWriteStream as any).write = jest.fn();
    (mockWriteStream as any).end = jest.fn();

    mockFileInstance.createWriteStream.mockReturnValue(mockWriteStream);
    mockFileInstance.makePublic.mockResolvedValue(undefined);
    mockFileInstance.getSignedUrl.mockResolvedValue(['https://signed-url.com']);
  });

  describe('uploadUserImage', () => {
    it('should upload image successfully and return public URL', async () => {
      const userId = 1;
      const mockReadStream = new Readable();
      mockReadStream._read = () => {};
      mockReadStream.push('file content');
      mockReadStream.push(null);

      const file = {
        filename: 'test.jpg',
        mimetype: 'image/jpeg',
        file: mockReadStream,
      };

      const uploadPromise = uploadUserImage(userId, file);

      // Wait a bit for the stream to be piped
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Simulate successful upload
      mockWriteStream.emit('finish');

      const result = await uploadPromise;

      expect(result).toContain('https://storage.googleapis.com/test-bucket/users%2F1%2F');
      expect(result).toContain('test.jpg');
      expect(mockBucket.file).toHaveBeenCalledWith(
        expect.stringContaining('users/1/')
      );
      expect(mockFileInstance.createWriteStream).toHaveBeenCalledWith({
        metadata: {
          contentType: 'image/jpeg',
        },
      });
      expect(mockFileInstance.makePublic).toHaveBeenCalled();
    });

    it('should throw error when no file is provided', async () => {
      await expect(uploadUserImage(1, null)).rejects.toThrow('No file provided');
    });

    it('should sanitize filename', async () => {
      const userId = 1;
      const mockReadStream = new Readable();
      mockReadStream._read = () => {};
      mockReadStream.push('content');
      mockReadStream.push(null);

      const file = {
        filename: 'test file@#$.jpg',
        mimetype: 'image/jpeg',
        file: mockReadStream,
      };

      const uploadPromise = uploadUserImage(userId, file);
      await new Promise((resolve) => setTimeout(resolve, 10));
      mockWriteStream.emit('finish');
      await uploadPromise;

      expect(mockBucket.file).toHaveBeenCalledWith(
        expect.stringMatching(/users\/1\/\d+_test_file___\.jpg/)
      );
    });

    it('should use default filename when not provided', async () => {
      const userId = 1;
      const mockReadStream = new Readable();
      mockReadStream._read = () => {};
      mockReadStream.push('content');
      mockReadStream.push(null);

      const file = {
        mimetype: 'image/png',
        file: mockReadStream,
      };

      const uploadPromise = uploadUserImage(userId, file);
      await new Promise((resolve) => setTimeout(resolve, 10));
      mockWriteStream.emit('finish');
      await uploadPromise;

      expect(mockBucket.file).toHaveBeenCalledWith(
        expect.stringMatching(/users\/1\/\d+_upload/)
      );
    });

    it('should handle different user IDs including string IDs', async () => {
      const userIds = [1, 42, '123', 'user-abc'];

      for (const userId of userIds) {
        const mockReadStream = new Readable();
        mockReadStream._read = () => {};
        mockReadStream.push('content');
        mockReadStream.push(null);

        const file = {
          filename: 'test.jpg',
          mimetype: 'image/jpeg',
          file: mockReadStream,
        };

        const uploadPromise = uploadUserImage(userId, file);
        await new Promise((resolve) => setTimeout(resolve, 10));
        mockWriteStream.emit('finish');
        await uploadPromise;

        expect(mockBucket.file).toHaveBeenCalledWith(
          expect.stringContaining(`users/${userId}/`)
        );

        jest.clearAllMocks();
      }
    });

    it('should use default mimetype when not provided', async () => {
      const userId = 1;
      const mockReadStream = new Readable();
      mockReadStream._read = () => {};
      mockReadStream.push('content');
      mockReadStream.push(null);

      const file = {
        filename: 'file.bin',
        file: mockReadStream,
      };

      const uploadPromise = uploadUserImage(userId, file);
      await new Promise((resolve) => setTimeout(resolve, 10));
      mockWriteStream.emit('finish');
      await uploadPromise;

      expect(mockFileInstance.createWriteStream).toHaveBeenCalledWith({
        metadata: {
          contentType: 'application/octet-stream',
        },
      });
    });

    it('should handle upload stream errors', async () => {
      const userId = 1;
      const mockReadStream = new Readable();
      mockReadStream._read = () => {};

      const file = {
        filename: 'test.jpg',
        mimetype: 'image/jpeg',
        file: mockReadStream,
      };

      const uploadPromise = uploadUserImage(userId, file);
      await new Promise((resolve) => setTimeout(resolve, 10));

      const uploadError = new Error('Upload failed');
      mockWriteStream.emit('error', uploadError);

      await expect(uploadPromise).rejects.toThrow('Upload failed');
    });

    it('should fallback to signed URL if makePublic fails', async () => {
      const userId = 1;
      const mockReadStream = new Readable();
      mockReadStream._read = () => {};
      mockReadStream.push('content');
      mockReadStream.push(null);

      const file = {
        filename: 'test.jpg',
        mimetype: 'image/jpeg',
        file: mockReadStream,
      };

      // Make makePublic fail
      mockFileInstance.makePublic.mockRejectedValue(new Error('Permission denied'));
      mockFileInstance.getSignedUrl.mockResolvedValue(['https://signed-url.com/test']);

      const uploadPromise = uploadUserImage(userId, file);
      await new Promise((resolve) => setTimeout(resolve, 10));
      mockWriteStream.emit('finish');

      const result = await uploadPromise;

      expect(result).toBe('https://signed-url.com/test');
      expect(mockFileInstance.getSignedUrl).toHaveBeenCalledWith({
        action: 'read',
        expires: expect.any(Number),
      });
    });

    it('should reject if both makePublic and getSignedUrl fail', async () => {
      const userId = 1;
      const mockReadStream = new Readable();
      mockReadStream._read = () => {};
      mockReadStream.push('content');
      mockReadStream.push(null);

      const file = {
        filename: 'test.jpg',
        mimetype: 'image/jpeg',
        file: mockReadStream,
      };

      mockFileInstance.makePublic.mockRejectedValue(new Error('Permission denied'));
      mockFileInstance.getSignedUrl.mockRejectedValue(new Error('Signing failed'));

      const uploadPromise = uploadUserImage(userId, file);
      await new Promise((resolve) => setTimeout(resolve, 10));
      mockWriteStream.emit('finish');

      await expect(uploadPromise).rejects.toThrow('Signing failed');
    });

    it('should create destination path with timestamp', async () => {
      const userId = 1;
      const mockReadStream = new Readable();
      mockReadStream._read = () => {};
      mockReadStream.push('content');
      mockReadStream.push(null);

      const file = {
        filename: 'test.jpg',
        mimetype: 'image/jpeg',
        file: mockReadStream,
      };

      const beforeTimestamp = Date.now();
      const uploadPromise = uploadUserImage(userId, file);
      await new Promise((resolve) => setTimeout(resolve, 10));
      mockWriteStream.emit('finish');
      await uploadPromise;
      const afterTimestamp = Date.now();

      expect(mockBucket.file).toHaveBeenCalled();

      // Verify the destination path contains timestamp
      const mockCalls = mockBucket.file.mock.calls as unknown as Array<[string]>;
      expect(mockCalls.length).toBeGreaterThan(0);

      const firstCallArg = mockCalls[0][0];
      expect(firstCallArg).toMatch(/users\/1\/\d+_test\.jpg/);

      const timestampMatch = firstCallArg.match(/users\/1\/(\d+)_test\.jpg/);
      if (timestampMatch && timestampMatch[1]) {
        const timestamp = parseInt(timestampMatch[1], 10);
        expect(timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
        expect(timestamp).toBeLessThanOrEqual(afterTimestamp);
      }
    });
  });
});
