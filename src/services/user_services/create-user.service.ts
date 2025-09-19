import { Role } from '@/generated/prisma/client';
import { create } from '@/repositories/user_repositories/create-user.repository';
import {
  findUserByEmail,
  findUserByUsername
} from '@/repositories/user_repositories/find-user.repository';
import { ICreateUserInput } from '@/types/user';
import { hashPassword } from '@/utils/password';

export const createUserService = async (data: ICreateUserInput) => {
  const existingUserByEmail = await findUserByEmail(data.email);
  if (existingUserByEmail) {
    throw new Error('Email already in use.', {
      cause: { status: 400, message: 'Email already in use.' }
    });
  }
  
  const existingUserByUsername = await findUserByUsername(data.username);
  if (existingUserByUsername) {
    throw new Error('Username already in use.', {
      cause: { status: 400, message: 'Username already in use.' }
    });
  }

  const hashedPassword = await hashPassword(data.password);

  const userRole = data.role ? data.role : Role.CUSTOMER;

  const userToCreate = {
    ...data,
    password: hashedPassword,
    role: userRole
  };

  const newUser = await create(userToCreate);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};
