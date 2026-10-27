// apps/backend-api/src/services/authService.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export interface AuthUserPayload {
  userId: string;
  companyId: string;
  email: string;
  fullName: string;
  role: 'EMPLOYEE' | 'AUDITOR' | 'ADMIN';
}

const JWT_SECRET = process.env.JWT_SECRET || 'rexjar_super_secret_jwt_key_2026_production';
const JWT_EXPIRES_IN = '7d';

/**
 * Genera un token JWT firmado conteniendo el inquilino (companyId) y rol
 */
export function generateToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifica y decodifica un token JWT
 */
export function verifyToken(token: string): AuthUserPayload {
  return jwt.verify(token, JWT_SECRET) as AuthUserPayload;
}

/**
 * Compara contraseña plana contra hash bcrypt
 */
export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Genera hash bcrypt con salt 10
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

/**
 * Genera un código OTP numérico de 6 dígitos para login móvil sin contraseña
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
