import prisma from '@/config/prisma';
import { IUpdateUserInput } from '@/types/user';

/**
 * Update user by id
 * @param id user id
 * @param data
 * @returns
 */

export const update = (id: string, data: IUpdateUserInput) => {
  return prisma.user.update({
    where: { id },
    data
  });
};
