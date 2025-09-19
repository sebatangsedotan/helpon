import { IUpdateUserInput } from "@/types/user";
import { update } from "@/repositories/user_repositories/update-user.repository";
import { findUserById } from "@/repositories/user_repositories/find-user.repository";

export const updateUserService = async (id: string, data: IUpdateUserInput) => {
  await findUserById(id);
  return update(id, data);
};
