import { addSkills, deleteSkill } from '../app/services/skillService';
import { NotFoundError, CreationError, DeletionError } from '../app/errors/crud';

// Mock prisma
const mockSkillCreateMany = jest.fn();
const mockSkillFindFirst = jest.fn();
const mockSkillDelete = jest.fn();

jest.mock('../app/services/prismaService', () => ({
  __esModule: true,
  default: {
    skill: {
      get createMany() {
        return mockSkillCreateMany;
      },
      get findFirst() {
        return mockSkillFindFirst;
      },
      get delete() {
        return mockSkillDelete;
      },
    },
  },
}));

describe('skillService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe('addSkills', () => {
    const cvId = 1;

    it('should add skills from string array', async () => {
      const skills = ['JavaScript', 'TypeScript', 'React'];
      mockSkillCreateMany.mockResolvedValue({ count: 3 });

      const result = await addSkills(cvId, skills);

      expect(result).toBe(3);
      expect(mockSkillCreateMany).toHaveBeenCalledWith({
        data: [
          { cvId, skillName: 'JavaScript' },
          { cvId, skillName: 'TypeScript' },
          { cvId, skillName: 'React' },
        ],
      });
    });

    it('should add skills from object array', async () => {
      const skills = [
        { skillName: 'Python', position: 0 },
        { skillName: 'Django', position: 1 },
      ];
      mockSkillCreateMany.mockResolvedValue({ count: 2 });

      const result = await addSkills(cvId, skills);

      expect(result).toBe(2);
      expect(mockSkillCreateMany).toHaveBeenCalledWith({
        data: [
          { cvId, skillName: 'Python', position: 0 },
          { cvId, skillName: 'Django', position: 1 },
        ],
      });
    });

    it('should add skills from mixed array (strings and objects)', async () => {
      const skills = [
        'JavaScript',
        { skillName: 'TypeScript', position: 1 },
        'React',
      ];
      mockSkillCreateMany.mockResolvedValue({ count: 3 });

      const result = await addSkills(cvId, skills);

      expect(result).toBe(3);
      expect(mockSkillCreateMany).toHaveBeenCalledWith({
        data: [
          { cvId, skillName: 'JavaScript' },
          { cvId, skillName: 'TypeScript', position: 1 },
          { cvId, skillName: 'React' },
        ],
      });
    });

    it('should handle objects without position (default to null)', async () => {
      const skills = [{ skillName: 'Java' }];
      mockSkillCreateMany.mockResolvedValue({ count: 1 });

      await addSkills(cvId, skills);

      expect(mockSkillCreateMany).toHaveBeenCalledWith({
        data: [{ cvId, skillName: 'Java', position: null }],
      });
    });

    it('should return 0 for empty skills array', async () => {
      const result = await addSkills(cvId, []);

      expect(result).toBe(0);
      expect(mockSkillCreateMany).not.toHaveBeenCalled();
    });

    it('should throw CreationError on database error', async () => {
      const skills = ['JavaScript'];
      mockSkillCreateMany.mockRejectedValue(
        new Error('Database error')
      );

      await expect(addSkills(cvId, skills)).rejects.toThrow(CreationError);
      expect(console.error).toHaveBeenCalledWith(
        '[addSkills]',
        expect.any(Error)
      );
    });

    it('should handle large skill arrays', async () => {
      const skills = Array.from({ length: 50 }, (_, i) => `Skill ${i + 1}`);
      mockSkillCreateMany.mockResolvedValue({ count: 50 });

      const result = await addSkills(cvId, skills);

      expect(result).toBe(50);
      expect(mockSkillCreateMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ cvId, skillName: 'Skill 1' }),
        ]),
      });
    });

    it('should handle different CV IDs', async () => {
      const cvIds = [1, 5, 100];
      mockSkillCreateMany.mockResolvedValue({ count: 1 });

      for (const id of cvIds) {
        await addSkills(id, ['Skill']);
        expect(mockSkillCreateMany).toHaveBeenCalledWith({
          data: [{ cvId: id, skillName: 'Skill' }],
        });
      }
    });
  });

  describe('deleteSkill', () => {
    const cvId = 1;
    const skillId = 10;

    it('should delete existing skill successfully', async () => {
      const existingSkill = { id: skillId, cvId, skillName: 'JavaScript' };
      mockSkillFindFirst.mockResolvedValue(existingSkill as any);
      mockSkillDelete.mockResolvedValue(existingSkill as any);

      await deleteSkill(cvId, skillId);

      expect(mockSkillFindFirst).toHaveBeenCalledWith({
        where: { id: skillId, cvId },
      });
      expect(mockSkillDelete).toHaveBeenCalledWith({
        where: { id: skillId },
      });
    });

    it('should throw error when skill does not exist', async () => {
      mockSkillFindFirst.mockResolvedValue(null);

      await expect(deleteSkill(cvId, skillId)).rejects.toThrow();
    });

    it('should throw error when skill belongs to different CV', async () => {
      mockSkillFindFirst.mockResolvedValue(null);

      await expect(deleteSkill(cvId, skillId)).rejects.toThrow();
      expect(mockSkillDelete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError on Prisma P2025 error', async () => {
      const existingSkill = { id: skillId, cvId, skillName: 'JavaScript' };
      mockSkillFindFirst.mockResolvedValue(existingSkill as any);

      const prismaError: any = new Error('Record not found');
      prismaError.code = 'P2025';
      mockSkillDelete.mockRejectedValue(prismaError);

      await expect(deleteSkill(cvId, skillId)).rejects.toThrow(NotFoundError);
    });

    it('should throw DeletionError on other database errors', async () => {
      const existingSkill = { id: skillId, cvId, skillName: 'JavaScript' };
      mockSkillFindFirst.mockResolvedValue(existingSkill as any);
      mockSkillDelete.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(deleteSkill(cvId, skillId)).rejects.toThrow(DeletionError);
      expect(console.error).toHaveBeenCalledWith(
        '[deleteSkill]',
        expect.any(Error)
      );
    });

    it('should handle different CV and skill IDs', async () => {
      const testCases = [
        { cvId: 1, skillId: 10 },
        { cvId: 5, skillId: 25 },
        { cvId: 100, skillId: 500 },
      ];

      for (const { cvId, skillId } of testCases) {
        mockSkillFindFirst.mockResolvedValue({ id: skillId, cvId } as any);
        mockSkillDelete.mockResolvedValue({} as any);

        await deleteSkill(cvId, skillId);

        expect(mockSkillFindFirst).toHaveBeenCalledWith({
          where: { id: skillId, cvId },
        });
      }
    });

    it('should verify skill ownership before deletion', async () => {
      const wrongCvId = 999;
      mockSkillFindFirst.mockResolvedValue(null);

      await expect(deleteSkill(wrongCvId, skillId)).rejects.toThrow();
      expect(mockSkillDelete).not.toHaveBeenCalled();
    });
  });
});
