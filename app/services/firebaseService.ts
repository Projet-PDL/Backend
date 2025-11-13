import admin from 'firebase-admin';
import dotenv from 'dotenv';
import logger from '../utils/logger/logger';

dotenv.config();

function initFirebase() {
  if (admin.apps.length) return admin.app();

  // Prefer a JSON string in env var FIREBASE_SERVICE_ACCOUNT_JSON
  // or a standard Google credentials path via GOOGLE_APPLICATION_CREDENTIALS
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  let credential: admin.ServiceAccount | undefined;

  if (serviceAccountJson) {
    try {
      const obj = JSON.parse(serviceAccountJson);
      credential = obj as admin.ServiceAccount;
    } catch (err) {
      logger.error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON');
      throw err;
    }
  }

  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error('FIREBASE_STORAGE_BUCKET environment variable is required');
  }

  const app = admin.initializeApp({
    credential: credential ? admin.credential.cert(credential) : admin.credential.applicationDefault(),
    storageBucket: bucketName,
  });

  return app;
}

initFirebase();

const bucket = admin.storage().bucket();

export async function uploadUserImage(userId: number | string, file: any): Promise<string> {
  if (!file) throw new Error('No file provided');

  const originalName = file.filename || 'upload';
  const timestamp = Date.now();
  const safeName = `${timestamp}_${originalName}`.replace(/[^a-zA-Z0-9._-]/g, '_');
  const destination = `users/${userId}/${safeName}`;

  const blob = bucket.file(destination);

  return new Promise<string>((resolve, reject) => {
    const stream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype || 'application/octet-stream',
      },
    });

    // `file.file` is the Readable stream from @fastify/multipart
    file.file.pipe(stream)
      .on('error', (err: any) => {
        logger.error('Error uploading file to Firebase', err);
        reject(err);
      })
      .on('finish', async () => {
        try {
          // Make public so clients can access the image via a stable URL.
          // Note: making files public may not be desired for all apps.
          await blob.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(destination)}`;
          resolve(publicUrl);
        } catch (err) {
          try {
            // Fallback: generate signed URL valid for 1 week
            const [signedUrl] = await blob.getSignedUrl({ action: 'read', expires: Date.now() + 7 * 24 * 60 * 60 * 1000 });
            resolve(signedUrl);
          } catch (err2) {
            logger.error('Error making file public or getting signed URL');
            reject(err2);
          }
        }
      });
  });
}

export default { uploadUserImage };
