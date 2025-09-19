import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { getUserService } from '@/services/user_services/get-user.service';
import { CONFIG_ACCESS_TOKEN_SECRET } from '@/config/config';
import prisma from '@/config/prisma';
import { handleControllerError } from '@/utils/catch-error-handler';

export const validateSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const accessToken = req.headers['authorization']?.split(' ')[1];

    if (!accessToken) {
      throw new Error('No access token provided.', {
        cause: { status: 401 }
      });
    }

    const decoded = jwt.verify(
      accessToken,
      CONFIG_ACCESS_TOKEN_SECRET
    ) as jwt.JwtPayload;

    if (!decoded || !decoded.sub) {
      throw new Error('Invalid access token.', {
        cause: { status: 401 }
      });
    }

    const user = await getUserService({ id: decoded.sub as string });

    if (!user) {
      throw new Error('User not found.', {
        cause: { status: 401 }
      });
    }

    if (decoded.iat && user.updated_at) {
      const tokenIssuedAt = new Date(decoded.iat * 1000);
      if (tokenIssuedAt < user.updated_at) {
        throw new Error('Access token is outdated.', {
          cause: { status: 401 }
        });
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
      throw new Error('Refresh token not found or expired.', {
        cause: { status: 401 }
      });
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('User account is not active. Please contact support.', {
        cause: { status: 403 }
      });
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Session is valid',
      data: {
        user: {
          id: user.id,
          user_code: user.user_code,
          username: user.username,
          role: user.role,
          status: user.status
        }
      }
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};
