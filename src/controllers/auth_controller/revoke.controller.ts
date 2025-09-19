import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import { handleControllerError } from '@/utils/catch-error-handler';
import { validateToken } from '@/helpers/jwt-provider';
import {
  CONFIG_REFRESH_TOKEN_EXPIRY,
  CONFIG_REFRESH_TOKEN_SECRET
} from '@/config/config';

export const revokeToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refresh_token;
    const userId = req.user?.id;

    if (!refreshToken && !userId) {
      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        maxAge: CONFIG_REFRESH_TOKEN_EXPIRY * 1000
      });

      res.status(200).json({
        success: true,
        status: 200,
        message: 'Logged out successfully'
      });
      return;
    }

    if (refreshToken) {
      try {
        const decoded = validateToken(
          refreshToken,
          CONFIG_REFRESH_TOKEN_SECRET
        );
        const { rid: refreshId } = decoded;
        await prisma.refreshToken.delete({
          where: { id: refreshId }
        });
      } catch (error) {
        console.warn(
          'Failed to process refresh token during logout:',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }

    if (userId) {
      await prisma.refreshToken.deleteMany({
        where: { user_id: userId }
      });
    }

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: CONFIG_REFRESH_TOKEN_EXPIRY * 1000
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Logged out successfully'
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};
