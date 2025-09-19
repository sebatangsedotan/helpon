import { randomUUIDv7 } from 'bun';
import jwt, {
  JsonWebTokenError,
  JwtPayload,
  Secret,
  VerifyOptions
} from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import {
  CONFIG_ACCESS_TOKEN_EXPIRY,
  CONFIG_ACCESS_TOKEN_SECRET,
  CONFIG_REFRESH_TOKEN_EXPIRY,
  CONFIG_REFRESH_TOKEN_SECRET
} from '@/config/config';
import IUserToken from '@/types/user';

export function generateAccessToken(user: IUserToken) {
  return jwt.sign(
    {
      jti: randomUUIDv7(),
      sub: user.id,
      user_code: user.user_code,
      role: user.role
    },
    CONFIG_ACCESS_TOKEN_SECRET,
    { expiresIn: CONFIG_ACCESS_TOKEN_EXPIRY }
  );
}

export function generateRefreshToken(user: IUserToken) {
  return jwt.sign(
    {
      jti: randomUUIDv7(),
      sub: user.id
    },
    CONFIG_REFRESH_TOKEN_SECRET,
    { expiresIn: CONFIG_REFRESH_TOKEN_EXPIRY }
  );
}

export const loginLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    status: 429,
    success: false,
    message: 'Too many login attempts. Please try again after 2 minutes.'
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  }
});

export function validateToken <T extends JwtPayload = JwtPayload>(
  token: string,
  secret: Secret,
  options?: VerifyOptions
): T {
  try {
    const decoded = jwt.verify(token, secret, options);
    if (typeof decoded === 'string') {
      throw new JsonWebTokenError('Unexpected token payload type (string)');
    }
    return decoded as T;
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw error;
    }
    throw new Error('Invalid token');
  }
}
