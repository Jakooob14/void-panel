import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.FILE_ENCRYPTION_KEY!, 'base64');
if (key.length !== 32) throw new Error('Invalid encryption key size. Must be 32 bytes.');

export function encryptFileBuffer(fileBuffer: Buffer) {
  // Also save the file signature for later use at 16-20 bytes
  let signatureBuffer = fileBuffer.subarray(0, 4);
  if (signatureBuffer.length !== 4) signatureBuffer = Buffer.alloc(4, 0);

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encryptedBuffer = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);

  return Buffer.concat([iv, signatureBuffer, encryptedBuffer]);
}

export function decryptFileBuffer(fileBuffer: Buffer) {
  const iv = fileBuffer.subarray(0, 16);
  const encryptedBuffer = fileBuffer.subarray(20);

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
}
