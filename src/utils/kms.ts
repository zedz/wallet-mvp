import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import { env } from '@/config/env';

const ALGORITHM = 'aes-256-gcm';

// Derive a 32-byte key from the environment secret
function deriveKey(secret: string): Buffer {
  return createHash('sha256').update(secret).digest();
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

export function encrypt(text: string): EncryptedData {
  const key = deriveKey(env.KEY_ENC_SECRET);
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

export function decrypt(data: EncryptedData): string {
  const key = deriveKey(env.KEY_ENC_SECRET);
  const iv = Buffer.from(data.iv, 'hex');
  const authTag = Buffer.from(data.authTag, 'hex');
  
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export function encryptJson<T>(data: T): string {
  const jsonString = JSON.stringify(data);
  const encrypted = encrypt(jsonString);
  return JSON.stringify(encrypted);
}

export function decryptJson<T>(encryptedString: string): T {
  const encryptedData: EncryptedData = JSON.parse(encryptedString);
  const jsonString = decrypt(encryptedData);
  return JSON.parse(jsonString);
}