import prisma from './prismaService';

export async function addSkills(cvId: number, items: Array<any>) {
    try {
        // Normaliser : string[] -> { skillName }[]
        const rows = items.map((it: any) =>
            typeof it === 'string' ? { cvId, skillName: it } : { cvId, skillName: it.skillName, position: it.position ?? null }
        );
        if (!rows.length) return 0;
        const res = await prisma.skill.createMany({ data: rows });
        return res.count;
    } catch (e) {
        console.error('[addSkills]', e);
        throw e;
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
        if (e?.code === 'P2025') { const err: any = new Error('Skill not found'); err.statusCode = 404; throw err; }
        console.error('[deleteSkill]', e);
        throw e;
    }
}