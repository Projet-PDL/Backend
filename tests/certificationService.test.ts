import {
  addCertification,
  updateCertification,
  deleteCertification,
} from '../app/services/certificationService';
import { NotFoundError, CreationError, UpdateError, DeletionError } from '../app/errors/crud';

// Mock prisma
const mockCertificationCreate = jest.fn();
const mockCertificationFindFirst = jest.fn();
const mockCertificationUpdate = jest.fn();
const mockCertificationDelete = jest.fn();

jest.mock('../app/services/prismaService', () => ({
  __esModule: true,
  default: {
    certification: {
      get create() {
        return mockCertificationCreate;
      },
      get findFirst() {
        return mockCertificationFindFirst;
      },
      get update() {
        return mockCertificationUpdate;
      },
      get delete() {
        return mockCertificationDelete;
      },
    },
  },
}));

describe('certificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe('addCertification', () => {
    const cvId = 1;

    it('should create certification with all fields', async () => {
      const dto = {
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        issueDate: '2023-01-15',
        expirationDate: '2026-01-15',
        credentialUrl: 'https://aws.amazon.com/cert/123',
        position: 0,
      };

      mockCertificationCreate.mockResolvedValue({ id: 10 } as any);

      const result = await addCertification(cvId, dto);

      expect(result).toBe(10);
      expect(mockCertificationCreate).toHaveBeenCalledWith({
        data: {
          cvId,
          name: dto.name,
          issuer: dto.issuer,
          issueDate: new Date(dto.issueDate),
          expirationDate: new Date(dto.expirationDate),
          credentialUrl: dto.credentialUrl,
          position: dto.position,
        },
        select: { id: true },
      });
    });

    it('should create certification with only required fields', async () => {
      const dto = { name: 'Basic Certification' };
      mockCertificationCreate.mockResolvedValue({ id: 11 } as any);

      const result = await addCertification(cvId, dto);

      expect(result).toBe(11);
      expect(mockCertificationCreate).toHaveBeenCalledWith({
        data: {
          cvId,
          name: 'Basic Certification',
          issuer: null,
          issueDate: null,
          expirationDate: null,
          credentialUrl: null,
          position: null,
        },
        select: { id: true },
      });
    });

    it('should handle null optional fields', async () => {
      const dto = {
        name: 'Certification',
        issuer: null,
        credentialUrl: null,
      };

      mockCertificationCreate.mockResolvedValue({ id: 12 } as any);

      await addCertification(cvId, dto);

      expect(mockCertificationCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          issuer: null,
          credentialUrl: null,
        }),
        select: { id: true },
      });
    });

    it('should throw CreationError on database error', async () => {
      const dto = { name: 'Test Cert' };
      mockCertificationCreate.mockRejectedValue(
        new Error('Database error')
      );

      await expect(addCertification(cvId, dto)).rejects.toThrow(CreationError);
      expect(console.error).toHaveBeenCalledWith(
        '[addCertification]',
        expect.any(Error)
      );
    });

    it('should convert date strings to Date objects', async () => {
      const dto = {
        name: 'Cert',
        issueDate: '2024-06-01',
        expirationDate: '2027-06-01',
      };

      mockCertificationCreate.mockResolvedValue({ id: 13 } as any);

      await addCertification(cvId, dto);

      expect(mockCertificationCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          issueDate: expect.any(Date),
          expirationDate: expect.any(Date),
        }),
        select: { id: true },
      });
    });
  });

  describe('updateCertification', () => {
    const cvId = 1;
    const certId = 10;

    it('should update certification successfully', async () => {
      const existingCert = { id: certId, cvId, name: 'Old Name' };
      const dto = { name: 'New Name', issuer: 'New Issuer' };

      mockCertificationFindFirst.mockResolvedValue(existingCert as any);
      mockCertificationUpdate.mockResolvedValue({ id: certId } as any);

      const result = await updateCertification(cvId, certId, dto);

      expect(result).toBe(certId);
      expect(mockCertificationFindFirst).toHaveBeenCalledWith({
        where: { id: certId, cvId },
      });
      expect(mockCertificationUpdate).toHaveBeenCalledWith({
        where: { id: certId },
        data: {
          name: 'New Name',
          issuer: 'New Issuer',
        },
        select: { id: true },
      });
    });

    it('should only update provided fields', async () => {
      const existingCert = { id: certId, cvId };
      const dto = { name: 'Updated Name' };

      mockCertificationFindFirst.mockResolvedValue(existingCert as any);
      mockCertificationUpdate.mockResolvedValue({ id: certId } as any);

      await updateCertification(cvId, certId, dto);

      expect(mockCertificationUpdate).toHaveBeenCalledWith({
        where: { id: certId },
        data: { name: 'Updated Name' },
        select: { id: true },
      });
    });

    it('should throw error when certification not found', async () => {
      mockCertificationFindFirst.mockResolvedValue(null);

      await expect(updateCertification(cvId, certId, {})).rejects.toThrow();
      expect(mockCertificationUpdate).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError on Prisma P2025 error', async () => {
      const existingCert = { id: certId, cvId };
      mockCertificationFindFirst.mockResolvedValue(existingCert as any);

      const prismaError: any = new Error('Record not found');
      prismaError.code = 'P2025';
      mockCertificationUpdate.mockRejectedValue(prismaError);

      await expect(updateCertification(cvId, certId, {})).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw UpdateError on other database errors', async () => {
      const existingCert = { id: certId, cvId };
      mockCertificationFindFirst.mockResolvedValue(existingCert as any);
      mockCertificationUpdate.mockRejectedValue(
        new Error('Database error')
      );

      await expect(updateCertification(cvId, certId, {})).rejects.toThrow(
        UpdateError
      );
      expect(console.error).toHaveBeenCalledWith(
        '[updateCertification]',
        expect.any(Error)
      );
    });

    it('should handle date updates', async () => {
      const existingCert = { id: certId, cvId };
      const dto = {
        issueDate: '2024-01-01',
        expirationDate: '2027-01-01',
      };

      mockCertificationFindFirst.mockResolvedValue(existingCert as any);
      mockCertificationUpdate.mockResolvedValue({ id: certId } as any);

      await updateCertification(cvId, certId, dto);

      expect(mockCertificationUpdate).toHaveBeenCalledWith({
        where: { id: certId },
        data: {
          issueDate: expect.any(Date),
          expirationDate: expect.any(Date),
        },
        select: { id: true },
      });
    });

    it('should handle setting fields to null', async () => {
      const existingCert = { id: certId, cvId };
      const dto = {
        issueDate: null,
        credentialUrl: null,
      };

      mockCertificationFindFirst.mockResolvedValue(existingCert as any);
      mockCertificationUpdate.mockResolvedValue({ id: certId } as any);

      await updateCertification(cvId, certId, dto);

      expect(mockCertificationUpdate).toHaveBeenCalledWith({
        where: { id: certId },
        data: {
          issueDate: null,
          credentialUrl: null,
        },
        select: { id: true },
      });
    });
  });

  describe('deleteCertification', () => {
    const cvId = 1;
    const certId = 10;

    it('should delete certification successfully', async () => {
      const existingCert = { id: certId, cvId, name: 'Test Cert' };
      mockCertificationFindFirst.mockResolvedValue(existingCert as any);
      mockCertificationDelete.mockResolvedValue(existingCert as any);

      await deleteCertification(cvId, certId);

      expect(mockCertificationFindFirst).toHaveBeenCalledWith({
        where: { id: certId, cvId },
      });
      expect(mockCertificationDelete).toHaveBeenCalledWith({
        where: { id: certId },
      });
    });

    it('should throw error when certification not found', async () => {
      mockCertificationFindFirst.mockResolvedValue(null);

      await expect(deleteCertification(cvId, certId)).rejects.toThrow();
      expect(mockCertificationDelete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError on Prisma P2025 error', async () => {
      const existingCert = { id: certId, cvId };
      mockCertificationFindFirst.mockResolvedValue(existingCert as any);

      const prismaError: any = new Error('Record not found');
      prismaError.code = 'P2025';
      mockCertificationDelete.mockRejectedValue(prismaError);

      await expect(deleteCertification(cvId, certId)).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw DeletionError on other database errors', async () => {
      const existingCert = { id: certId, cvId };
      mockCertificationFindFirst.mockResolvedValue(existingCert as any);
      mockCertificationDelete.mockRejectedValue(
        new Error('Database error')
      );

      await expect(deleteCertification(cvId, certId)).rejects.toThrow(
        DeletionError
      );
      expect(console.error).toHaveBeenCalledWith(
        '[deleteCertification]',
        expect.any(Error)
      );
    });

    it('should verify certification ownership before deletion', async () => {
      const wrongCvId = 999;
      mockCertificationFindFirst.mockResolvedValue(null);

      await expect(deleteCertification(wrongCvId, certId)).rejects.toThrow();
      expect(mockCertificationDelete).not.toHaveBeenCalled();
    });
  });
});
