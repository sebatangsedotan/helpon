import prisma from '@/config/prisma';

/**
 * Find user by email
 * @param email
 * @returns
 */

export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: { email, deleted_at: null }
  });
};

/**
 * Find user by username
 * @param username
 * @returns
 */

export const findUserByUsername = (username: string) => {
  return prisma.user.findUnique({
    where: { username, deleted_at: null }
  });
};

/**
 * Find user by id
 * @param id user id
 * @returns
 */

export const findUserById = (id: string) => {
  return prisma.user.findUnique({
    where: { id, deleted_at: null }
  });
};

/**
 * Find user by user_code
 * @param user_code
 * @returns
 */

export const findUserByCode = (user_code: string) => {
  return prisma.user.findUnique({
    where: { user_code, deleted_at: null }
  });
};
