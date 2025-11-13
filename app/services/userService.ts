import prisma from './prismaService';

export async function updateProfilePicture(userId: number, imageUrl: string) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { profilePicture: imageUrl },
  });
  return updated;
}

export default { updateProfilePicture };
