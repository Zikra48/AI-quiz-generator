import crypto from 'crypto';
import { QuizQuestionRaw, Difficulty } from './types.ts';

const ALGORITHM = 'aes-256-cbc';
// Derive a 32-byte key from GEMINI_API_KEY or fallback secret
function getSecretKey(): Buffer {
  const secret = process.env.QUIZ_SESSION_SECRET || process.env.GEMINI_API_KEY || 'quiz-studio-academic-salt-2026';
  return crypto.createHash('sha256').update(secret).digest();
}

export interface EncryptedSessionPayload {
  quizId: string;
  topic: string;
  difficulty: Difficulty;
  createdAt: number;
  questions: Array<{
    id: number;
    question: string;
    options: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
    correct_answer: 'A' | 'B' | 'C' | 'D';
    explanation: string;
  }>;
}

export function createSessionToken(payload: EncryptedSessionPayload): string {
  try {
    const key = getSecretKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const jsonStr = JSON.stringify(payload);
    let encrypted = cipher.update(jsonStr, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Format: iv:encrypted
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (err) {
    // Fallback base64 obfuscation if crypto throws
    console.error('Error creating encrypted token, using fallback', err);
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }
}

export function decryptSessionToken(token: string): EncryptedSessionPayload | null {
  try {
    if (!token) return null;
    const parts = token.split(':');
    if (parts.length === 2) {
      const iv = Buffer.from(parts[0], 'hex');
      const encryptedText = parts[1];
      const key = getSecretKey();
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return JSON.parse(decrypted) as EncryptedSessionPayload;
    }
    // Try base64 fallback
    const raw = Buffer.from(token, 'base64').toString('utf8');
    return JSON.parse(raw) as EncryptedSessionPayload;
  } catch (err) {
    console.error('Failed to decrypt session token:', err);
    return null;
  }
}
