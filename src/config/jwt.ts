import jwt, { SignOptions } from 'jsonwebtoken'
import { env } from './env';

export const signToken = (payload: object) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] });

export const verifyToken = (token: string) => jwt.verify(token, env.JWT_SECRET);
