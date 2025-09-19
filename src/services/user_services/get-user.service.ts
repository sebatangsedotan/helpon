import { User } from '@/generated/prisma/client';
import {
  findUserByCode,
  findUserByEmail,
  findUserById,
  findUserByUsername
} from '@/repositories/user_repositories/find-user.repository';

export interface GetUserQuery {
  id?: string;
  user_code?: string;
  username?: string;
  email?: string;
}

export const getUserService = async (query: GetUserQuery): Promise<User> => {
  const { id, user_code, username, email } = query;

  // Validate that at least one search criterion is provided
  if (!id && !user_code && !username && !email) {
    throw new Error('At least one search criterion must be provided', {
      cause: {
        status: 400,
        message: 'At least one search criterion must be provided'
      }
    });
  }

  let user: User | null = null;

  try {
    if (id) {
      user = await findUserById(id);
    } else if (user_code) {
      user = await findUserByCode(user_code);
    } else if (username) {
      user = await findUserByUsername(username);
    } else if (email) {
      user = await findUserByEmail(email);
    }

    if (!user) {
      //throw status code and message
      throw new Error('User not found', {
        cause: { status: 404, message: 'User not found' }
      });
    }

    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    console.error('Get User Service Error :', error);
    throw new Error('Error retrieving user information', {
      cause: {
        status: 500,
        message: 'Error retrieving user information'
      }
    });
  }
};

export const getUserById = async (id: string): Promise<User> => {
  return getUserService({ id });
};

export const getUserByUsername = async (username: string): Promise<User> => {
  return getUserService({ username });
};

export const getUserByEmail = async (email: string): Promise<User> => {
  return getUserService({ email });
};

export const getUserByUserCode = async (user_code: string): Promise<User> => {
  return getUserService({ user_code });
};
