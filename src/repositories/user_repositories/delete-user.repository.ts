import prisma from '@/config/prisma';

/**
 * Soft delete user by id
 * @param id user id
 * @returns
 */

export const softDelete = (id: string) => {
  return prisma.user.update({
    where: { id },
    data: {
      deleted_at: new Date(),
      status: 'DELETED'
    }
  });
};