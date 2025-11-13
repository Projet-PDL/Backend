import { FastifyRequest, FastifyReply } from 'fastify';
import { uploadUserImage } from '../services/firebaseService';
import { updateProfilePicture } from '../services/userService';

export const updateProfileImage = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // RequireAuth middleware should have set request.user.id
    const user = (request as any).user;
    if (!user || !user.id) {
      return reply.code(401).send({ success: false, message: 'Not authenticated' });
    }

    let file;
    try {
      file = await request.file();
    } catch (fileErr: any) {
      request.log.error('Error reading file from multipart request:', fileErr);
      return reply.code(400).send({ success: false, message: 'Failed to read uploaded file: ' + fileErr.message });
    }

    if (!file) {
      return reply.code(400).send({ success: false, message: 'No file uploaded' });
    }

    request.log.info(`File received: ${file.filename}, mimetype: ${file.mimetype}`);

    const imageUrl = await uploadUserImage(user.id, file);
    const updatedUser = await updateProfilePicture(Number(user.id), imageUrl);

    return reply.code(200).send({ success: true, data: { imageUrl: updatedUser.profilePicture } });
  } catch (err: any) {
    request.log.error('Failed to upload profile image', err);
    return reply.code(500).send({ success: false, message: 'Failed to upload image: ' + (err.message || String(err)) });
  }
};

export default { updateProfileImage };
