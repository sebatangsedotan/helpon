import { softDelete } from '@/repositories/user_repositories/delete-user.repository';
import { findUserById } from '@/repositories/user_repositories/find-user.repository';

export const deleteUserService = async (id: string) => {
  await findUserById(id);
  return softDelete(id);
};
