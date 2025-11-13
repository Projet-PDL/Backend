import prisma from './prismaService';

export async function updateProfilePicture(userId: number, imageUrl: string) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { profilePicture: imageUrl },
  });
  return updated;
}

export async function getUserProfilePicture(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profilePicture: true, id: true, email: true, name: true }
  });
  return user;
}

export default { updateProfilePicture, getUserProfilePicture };
