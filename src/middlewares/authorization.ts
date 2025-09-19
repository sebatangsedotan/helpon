import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { Role } from '@/generated/prisma/client';
import prisma from '@/config/prisma';
import { CONFIG_ACCESS_TOKEN_SECRET } from '@/config/config';

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const access_token = req.headers['authorization']?.split(' ')[1];

    if (!access_token) {
      res.status(401).json({
        success: false,
        status: 401,
        message: 'Authentication required'
      });
      return;
    }

    const decoded = jwt.verify(
      access_token,
      CONFIG_ACCESS_TOKEN_SECRET
    ) as jwt.JwtPayload;

    if (!decoded || !decoded.sub || !decoded.jti) {
      res.status(401).json({
        success: false,
        status: 401,
        message: 'Invalid token format'
      });
      return;
    }

    // Check if token is expired (additional check beyond jwt.verify)
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      res.status(401).json({
        success: false,
        status: 401,
        message: 'Token expired'
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub as string },
      select: {
        id: true,
        user_code: true,
        username: true,
        email: true,
        role: true,
        status: true,
        updated_at: true
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        status: 401,
        message: 'User not found'
      });
      return;
    }

    // Check if token was issued before user's last significant update
    // This helps invalidate tokens when user's critical info changes
    if (decoded.iat && user.updated_at) {
      const tokenIssuedAt = new Date(decoded.iat * 1000);
      if (tokenIssuedAt < user.updated_at) {
        res.status(401).json({
          success: false,
          status: 401,
          message: 'Token invalidated due to account changes'
        });
        return;
      }
    }

    const hasValidRefreshToken = await prisma.refreshToken.findFirst({
      where: {
        user_id: user.id,
        expires_at: {
          gt: new Date()
        }
      }
    });

    if (!hasValidRefreshToken) {
      res.status(401).json({
        success: false,
        status: 401,
        message: 'Session expired. Please login again.'
      });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(401).json({
        success: false,
        status: 401,
        message: 'User account is inactive or suspended'
      });
      return;
    }

    req.user = {
      id: user.id,
      user_code: user.user_code,
      username: user.username,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        status: 401,
        message: 'Token expired'
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        status: 401,
        message: 'Invalid token'
      });
    } else {
      console.error('Auth error:', error);
      res.status(500).json({
        success: false,
        status: 500,
        message: 'Authentication error'
      });
    }
  }
};

export const authorizeRoles = (allowedRoles: Role[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          status: 401,
          message: 'Authentication required'
        });
        return;
      }

      if (!allowedRoles.includes(user.role as Role)) {
        res.status(403).json({
          success: false,
          status: 403,
          message: 'Access denied: insufficient permissions'
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        status: 500,
        message: 'Authorization error'
      });
    }
  };
};
