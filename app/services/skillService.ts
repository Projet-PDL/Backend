import prisma from './prismaService';

async function assertOwnership(userId: string, cvId: number) {
    const owns = await prisma.cV.findFirst({ where: { id: cvId, userId }, select: { id: true } });
    if (!owns) {
        const err: any = new Error('CV not found');
        err.statusCode = 404;
        throw err;
    }
}

export async function addSkills(userId: string, cvId: number, items: Array<any>) {
    try {
        await assertOwnership(userId, cvId);
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

export async function deleteSkill(userId: string, cvId: number, skillId: number) {
    try {
        await assertOwnership(userId, cvId);
        await prisma.skill.delete({ where: { id: skillId } });
    } catch (e: any) {
        if (e?.code === 'P2025') { const err: any = new Error('Skill not found'); err.statusCode = 404; throw err; }
        console.error('[deleteSkill]', e);
        throw e;
    }
}