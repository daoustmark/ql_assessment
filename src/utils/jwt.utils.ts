import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { UserRole } from '../backend/models/UserRole';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

interface JWTPayload {
  userId: Types.ObjectId;
  email: string;
  role: UserRole;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const extractTokenFromHeader = (header: string): string => {
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) {
    throw new Error('Invalid authorization header');
  }
  return token;
}; 