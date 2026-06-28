import 'dotenv/config';
import jwt from 'jsonwebtoken';

const JWT_SECRET = (import.meta.env.JWT_SECRET || process.env.JWT_SECRET) as string;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET environment variable is missing or less than 32 characters long. Set it to a secure random string.");
}

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
