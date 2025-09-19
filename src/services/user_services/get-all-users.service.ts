import { User } from '@/generated/prisma/client';
import { findUserById } from '@/repositories/user_repositories/find-user.repository';
import { getUserList } from '@/repositories/user_repositories/get-all-users.repository';
import { IFindUsersQuery } from '@/types/user';

export const getAllUsersService = async (
  authenticatedUser: User,
  query: IFindUsersQuery
) => {
  const existingUser = await findUserById(authenticatedUser.id);
  if (!existingUser) {
    throw new Error('User not found.', {
      cause: { status: 404, message: 'User not found.' }
    });
  }

  if (query.role === 'SUPER_ADMIN' || query.role === 'ADMIN') {
    if (existingUser.role !== 'SUPER_ADMIN') {
      throw new Error('Unauthorized access to admin data.', {
        cause: { status: 403, message: 'Unauthorized access to admin data.' }
      });
    }
  }
  
  query.excluded_roles = ['ADMIN', 'SUPER_ADMIN'];

  const { users, total_data } = await getUserList(query);
  const current_page = query.current_page || 1;
  const limit_data = query.limit_data || 10;

  return {
    data: users,
    meta: {
      total_data,
      current_page,
      limit_data,
      total_page: Math.ceil(total_data / limit_data)
    }
  };
};
