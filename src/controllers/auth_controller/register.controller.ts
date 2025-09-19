import { Request, Response } from 'express';
import { createUserService } from '@/services/user_services/create-user.service';
import { handleControllerError } from '@/utils/catch-error-handler';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullname, username, email, password, role = 'CUSOTMER' } = req.body;

    const sanitizedData = {
      fullname: fullname?.trim(),
      username: username?.trim().toLowerCase(),
      email: email?.trim().toLowerCase(),
      password: password?.trim()
    };

    if (
      !sanitizedData.fullname ||
      !sanitizedData.username ||
      !sanitizedData.email ||
      !sanitizedData.password
    ) {
      throw new Error('All fields are required.', {
        cause: { status: 400 }
      });
    }
    const newUser = await createUserService({
      fullname: sanitizedData.fullname,
      username: sanitizedData.username,
      email: sanitizedData.email,
      password: sanitizedData.password,
      role: role
    });

    res.status(201).json({
      success: true,
      status: 201,
      message: 'User registered successfully',
      data: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};
