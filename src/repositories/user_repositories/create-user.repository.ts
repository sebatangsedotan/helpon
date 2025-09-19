import prisma from '@/config/prisma';
import { ICreateUserInput } from '@/types/user';

/**
 * Create new user
 * @param data 
 * @returns 
 */
export const create = (data: ICreateUserInput) => {
  return prisma.user.create({
    data: {
      user_code: `USR_${Date.now()}`,
      fullname: data.fullname,
      username: data.username,
      email: data.email,
      password: data.password,
      role: data.role
    }
  });
};
