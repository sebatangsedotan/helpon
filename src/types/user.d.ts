import { Role, User, UserStatus } from '@/generated/prisma/client';

export default interface IUserToken {
  id?: string;
  user_code: string;
  role?: Role;
}

export type ICreateUserInput = {
  fullname: string;
  username: string;
  email: string;
  password: string;
  role: Role;
};

export type IUpdateUserInput = Partial<{
  fullname: string;
  avatarUrl: string;
  status: UserStatus;
}>;

export type IFindUsersQuery = {
  current_page?: number;
  limit_data?: number;
  search?: string;
  sort_by?: keyof User;
  sort_order?: 'asc' | 'desc';
  role?: Role;
  excluded_roles?: Role[];
  status?: UserStatus;
};
