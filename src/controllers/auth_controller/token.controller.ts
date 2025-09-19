import { Request, Response } from 'express';
import {
  generateAccessToken,
  generateRefreshToken
} from '@/helpers/jwt-provider';
import { comparePassword } from '@/utils/password';
import prisma from '@/config/prisma';
import { getUserService } from '@/services/user_services/get-user.service';
import { CONFIG_REFRESH_TOKEN_EXPIRY } from '@/config/config';
import { handleControllerError } from '@/utils/catch-error-handler';

export const createAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { grant_type } = req.body;

    if (grant_type !== 'password') {
      throw Error('Invalid grant type.', {
        cause: { status: 400 }
      });
    }
    
    // Extract header Authorization
    const authHeader = req.headers.authorization || '';

    // Cek apakah header Authorization ada dan sesuai format Basic
    if (!authHeader.startsWith('Basic ')) {
      throw Error('Invalid credentials.', {
        cause: { status: 401 }
      });
    }

    // Decode base64 encoded credentials
    const b64 = authHeader.slice(6).trim();
    let decoded: string;
    try {
      decoded = Buffer.from(b64, 'base64').toString('utf8');
    } catch {
      throw Error('Invalid credentials.', { cause: { status: 400 } });
    }

    // Cek apakah format username:password benar
    const sepIndex = decoded.indexOf(':');
    if (sepIndex === -1) {
      throw Error('Invalid credentials.', { cause: { status: 400 } });
    }

    // Pisahkan username dan password berdasarkan tanda ':'
    const rawUsername = decoded.slice(0, sepIndex);
    const rawPassword = decoded.slice(sepIndex + 1);

    // Trim whitespace dan validate non-empty fields
    const sanitizedUsername = rawUsername.trim().toLowerCase();
    const sanitizedPassword = rawPassword.trim();

    if (!sanitizedUsername || !sanitizedPassword) {
      throw Error('Invalid credentials.', {
        cause: { status: 400 }
      });
    }

    // Cari user berdasarkan username
    const existingUser = await getUserService({ username: sanitizedUsername });

    // validasi password dengan hash yang tersimpan
    const isPasswordValid = await comparePassword(
      sanitizedPassword,
      existingUser.password
    );

    if (!isPasswordValid) {
      throw Error('Invalid credentials.', {
        cause: { status: 401 }
      });
    }

    // cek apakah status akun aktif
    if (existingUser.status !== 'ACTIVE') {
      throw Error('Invalid credentials.', {
        cause: { status: 403 }
      });
    }

    // Generate token
    const accessToken = generateAccessToken(existingUser);
    const refreshToken = generateRefreshToken(existingUser);

    const refreshTokenExpiry = new Date(
      Date.now() + CONFIG_REFRESH_TOKEN_EXPIRY * 1000
    );

    console.log(refreshTokenExpiry);
    // Simpan refresh token ke database dengan transaksi
    await prisma.$transaction(async (tx) => {
      // Hapus semua refresh token lama milik user jika ada
      await tx.refreshToken.deleteMany({
        where: { user_id: existingUser.id }
      });

      // Simpan refresh token baru
      await tx.refreshToken.create({
        data: {
          user_id: existingUser.id,
          refresh_token: refreshToken,
          expires_at: refreshTokenExpiry,
        }
      });
    });

    // Set cookie dan header
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: CONFIG_REFRESH_TOKEN_EXPIRY * 1000
    });

    res.header('x-access-token', accessToken);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Login successful'
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};
