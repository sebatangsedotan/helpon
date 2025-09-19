import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { getUserService } from '@/services/user_services/get-user.service';
import {
  generateAccessToken,
  generateRefreshToken
} from '@/helpers/jwt-provider';
import prisma from '@/config/prisma';
import {
  CONFIG_REFRESH_TOKEN_EXPIRY,
  CONFIG_REFRESH_TOKEN_SECRET
} from '@/config/config';
import { handleControllerError } from '@/utils/catch-error-handler';

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get refresh token from cookies
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      throw Error('No refresh token provided.', {
        cause: { status: 401 }
      });
      // note for frontend: force logout on client side!!
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      CONFIG_REFRESH_TOKEN_SECRET
    ) as jwt.JwtPayload;

    if (!decoded || !decoded.sub) {
      throw Error('Invalid refresh token.', {
        cause: { status: 401 }
      });
    }

    // Fetch user from database
    const user = await getUserService({ id: decoded.sub as string });

    if (!user) {
      throw Error('User not found.', {
        cause: { status: 401 }
      });
    }

    const storedRefreshToken = await prisma.refreshToken.findFirst({
      where: {
        user_id: user.id,
        refresh_token: refreshToken,
        expires_at: {
          gt: new Date()
        }
      }
    });

    if (!storedRefreshToken) {
      throw Error('Refresh token not found or expired. Please login again.', {
        cause: { status: 401 }
      });
    }

    if (user.status !== 'ACTIVE') {
      throw Error('User account is inactive. Please contact support.', {
        cause: { status: 403 }
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    const refreshTokenExpiry = new Date(
      Date.now() + CONFIG_REFRESH_TOKEN_EXPIRY * 1000
    );

    // Store new refresh token and delete the old one in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete the old refresh token
      await tx.refreshToken.delete({
        where: { id: storedRefreshToken.id }
      });

      // Create new refresh token record
      await tx.refreshToken.create({
        data: {
          user_id: user.id,
          refresh_token: newRefreshToken,
          expires_at: refreshTokenExpiry
        }
      });
    });

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: CONFIG_REFRESH_TOKEN_EXPIRY * 1000
    });

    res.header('x-access-token', newAccessToken);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};
