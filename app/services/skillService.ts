import prisma from './prismaService';
import { NotFoundError, CreationError, DeletionError } from '../errors/crud';

export async function addSkills(cvId: number, items: Array<any>) {
    try {
        // Normaliser : string[] -> { skillName }[]
        const rows = items.map((it: any) =>
            typeof it === 'string' ? { cvId, skillName: it } : { cvId, skillName: it.skillName, position: it.position ?? null }
        );
        if (!rows.length) return 0;
        const res = await prisma.skill.createMany({ data: rows });
        return res.count;
    } catch (e: any) {
        console.error('[addSkills]', e);
        throw new CreationError('Skill', e, 'skillService.addSkills');
    }
}

export async function deleteSkill(cvId: number, skillId: number) {
    try {
        // optionally, ensure the skill belongs to the cvId before deleting
        const exist = await prisma.skill.findFirst({ where: { id: skillId, cvId } });
        if (!exist) {
            const err: any = new Error('Skill not found');
            err.statusCode = 404;
            throw err;
        }
        await prisma.skill.delete({ where: { id: skillId } });
    } catch (e: any) {
        if (e?.code === 'P2025') {
            throw new NotFoundError('Skill', { id: skillId }, 'skillService.deleteSkill');
        }
        console.error('[deleteSkill]', e);
        throw new DeletionError('Skill', e, 'skillService.deleteSkill');
    }
}