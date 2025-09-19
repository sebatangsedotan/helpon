import prisma from '@/config/prisma';
import { Prisma } from '@/generated/prisma/client';
import { IFindUsersQuery } from '@/types/user';

/**
 * Get user list with pagination and filters
 * @param query
 * @returns
 */

export const getUserList = async (query: IFindUsersQuery) => {
  const {
    current_page = 1,
    limit_data = 5,
    search,
    sort_by = 'created_at',
    sort_order = 'desc',
    role,
    excluded_roles = ['SUPER_ADMIN'],
    status
  } = query;
  const skip = (current_page - 1) * limit_data;

  const where: Prisma.UserWhereInput = {
    deleted_at: null,
    ...(status && { status }),
    ...(role && { role }),
    ...(excluded_roles &&
      excluded_roles.length > 0 && { role: { notIn: excluded_roles } }),
    ...(search && {
      OR: [
        { username: { contains: search } },
        { email: { contains: search } },
        { fullname: { contains: search } }
      ]
    })
  };

  const [users, total_data] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit_data,
      orderBy: { [sort_by]: sort_order }
    }),
    prisma.user.count({ where })
  ]);

  return { users, total_data };
};
