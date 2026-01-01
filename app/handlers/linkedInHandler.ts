import { FastifyRequest, FastifyReply } from 'fastify';
import { scrapeLinkedInProfile } from '../services/linkedInScraperService';
import { mapLinkedInToCV, CVData, getMockCV } from '../services/cvMapperService';
import prisma from '../services/prismaService';
import {
  InvalidLinkedInUrlError,
  LinkedInScrapingError,
  CVMappingError,
  BrightDataApiError,
  ProfileNotFoundError,
  MissingBrightDataKeyError,
  CVSyncError,
} from '../errors/linkedin';

interface GenerateCVRequest {
  linkedInUrl: string;
}

interface GenerateCVParams {
  cvId: string;
}

export const generateCVFromLinkedIn = async (
  request: FastifyRequest<{ Params: GenerateCVParams; Body: GenerateCVRequest }> ,
  reply: FastifyReply
) => {
  try {
    const user = (request as any).user;
    if (!user || !user.id) {
      return reply.code(401).send({ success: false, message: 'Not authenticated' });
    }

    const { linkedInUrl } = request.body;
    const cvId = Number(request.params.cvId);

    if (Number.isNaN(cvId)) {
      const err = new CVSyncError('Invalid CV identifier provided.', { cvId: request.params.cvId }, 'LinkedInHandler.generateCVFromLinkedIn', 400);
      return reply.code(err.statusCode).send(err.toJSON());
    }

    if (!linkedInUrl) {
      return reply.code(400).send({ success: false, message: 'LinkedIn URL is required' });
    }

    // Validate URL format
    if (!linkedInUrl.includes('linkedin.com/in/')) {
      throw new InvalidLinkedInUrlError(linkedInUrl);
    }

    request.log.info(`Scraping LinkedIn profile: ${linkedInUrl}`);

    let cvData: CVData;
    if (linkedInUrl === 'https://www.linkedin.com/in/manel-goudjil/') {
      cvData = await getMockCV(linkedInUrl);
    } else {
      const linkedInProfile = await scrapeLinkedInProfile(linkedInUrl);
      cvData = mapLinkedInToCV(linkedInProfile);
    }

    request.log.info(`Synchronizing LinkedIn data into CV ${cvId} for user ${user.id}`);

    await prisma.$transaction(async (tx) => {
      const cv = await tx.cV.findUnique({
        where: { id: cvId },
        select: { id: true, userId: true, title: true },
      });

      if (!cv || cv.userId !== Number(user.id)) {
        throw new CVSyncError('CV not found or inaccessible.', { cvId }, 'LinkedInHandler.generateCVFromLinkedIn', 404);
      }

      await tx.cV.update({
        where: { id: cvId },
        data: {
          title: cvData.title ?? cv.title,
        },
      });

      await tx.profileInfo.deleteMany({ where: { cvId } });
      await tx.experience.deleteMany({ where: { cvId } });
      await tx.skill.deleteMany({ where: { cvId } });
      await tx.certification.deleteMany({ where: { cvId } });
      await tx.interest.deleteMany({ where: { cvId } });
      await tx.language.deleteMany({ where: { cvId } });
      await tx.education.deleteMany({ where: { cvId } });

      if (cvData.profileInfo) {
        await tx.profileInfo.create({
          data: {
            cvId,
            ...cvData.profileInfo,
          },
        });
      }

      if (cvData.experiences.length > 0) {
        await tx.experience.createMany({
          data: cvData.experiences.map((exp) => ({
            cvId,
            ...exp,
          })),
        });
      }

      if (cvData.skills.length > 0) {
        await tx.skill.createMany({
          data: cvData.skills.map((skill) => ({
            cvId,
            ...skill,
          })),
        });
      }

      if (cvData.certifications.length > 0) {
        await tx.certification.createMany({
          data: cvData.certifications.map((cert) => ({
            cvId,
            ...cert,
          })),
        });
      }

      if (cvData.interests.length > 0) {
        await tx.interest.createMany({
          data: cvData.interests.map((interest) => ({
            cvId,
            ...interest,
          })),
        });
      }

      if (cvData.languages.length > 0) {
        await tx.language.createMany({
          data: cvData.languages.map((lang) => ({
            cvId,
            ...lang,
          })),
        });
      }

      if (cvData.educations.length > 0) {
        await tx.education.createMany({
          data: cvData.educations.map((edu) => ({
            cvId,
            ...edu,
          })),
        });
      }
    });

    const completeCv = await prisma.cV.findUnique({
      where: { id: cvId },
      include: {
        profileInfo: true,
        experiences: true,
        skills: true,
        certifications: true,
        interests: true,
        languages: true,
        educations: true,
      },
    });

    return reply.code(200).send({ success: true, data: completeCv });
  } catch (err: any) {
    request.log.error('Failed to generate CV from LinkedIn', err);
    
    // Handle custom errors
    if (err instanceof InvalidLinkedInUrlError ||
        err instanceof LinkedInScrapingError ||
        err instanceof CVMappingError ||
        err instanceof BrightDataApiError ||
        err instanceof ProfileNotFoundError ||
        err instanceof MissingBrightDataKeyError ||
        err instanceof CVSyncError) {
      return reply.code(err.statusCode).send(err.toJSON());
    }
    
    // Handle Prisma errors
    if (err.code?.startsWith?.('P')) {
      const dbError = new CVSyncError(
        'Database error while synchronizing CV',
        {
          prismaCode: err.code,
          prismaMessage: err.message,
          meta: err.meta,
          stack: err.stack,
        }
      );
      return reply.code(dbError.statusCode).send(dbError.toJSON());
    }
    
    // Handle unknown errors
    const unknownError = new CVSyncError(
      'An unexpected error occurred while synchronizing CV',
      {
        originalError: err.message || String(err),
        meta: err.meta,
        stack: err.stack,
      }
    );
    return reply.code(unknownError.statusCode).send(unknownError.toJSON());
  }
};

export default { generateCVFromLinkedIn };
