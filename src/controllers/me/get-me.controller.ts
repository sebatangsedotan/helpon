import { handleControllerError } from '@/utils/catch-error-handler';
import { Request, Response } from 'express';

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      throw new Error('User not authenticated. Please login again.', {
        cause: { status: 401 }
      });
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: 'User fetched successfully',
      data: user
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};
