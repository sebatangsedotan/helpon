import { UserStatus } from '@/generated/prisma/client';
import { object, string, mixed } from 'yup';

// Password regex: at least 8 characters, 1 uppercase, 1 lowercase, 1 number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

export const createUserSchema = object({
  body: object({
    username: string()
      .required('Username is required')
      .min(3, 'Username must be at least 3 characters long')
      .max(30, 'Username must be at most 30 characters long'),
    email: string()
      .email('Must be a valid email')
      .required('Email is required'),
    fullname: string().required('Name is required'),
    password: string()
      .required('Password is required')
      .matches(
        passwordRegex,
        'Password must be at least 8 characters, and include one uppercase letter, one lowercase letter, and one number'
      ),
    role: string().oneOf(
      ['ADMIN', 'COORDINATOR', 'HELPER', 'CUSTOMER'],
      'Invalid role'
    )
  })
});

export const updateUserSchema = object({
  body: object({
    fullname: string().optional(),
    avatarUrl: string().url('Must be a valid URL').nullable().optional(),
    status: mixed<UserStatus>().oneOf(Object.values(UserStatus)).optional()
  }).test(
    'at-least-one-field',
    'At least one field must be provided for update',
    (value) => Object.keys(value).length > 0
  ),
  params: object({
    id: string().required('User ID is required')
  })
});

export const listUsersSchema = object({
  query: object({
    current_page: string().optional(),
    limit_data: string().optional(),
    search: string().optional(),
    sort_by: string().optional(), // Can be more specific with enums if needed
    sort_order: mixed<'asc' | 'desc'>().oneOf(['asc', 'desc']).optional(),
    role: mixed<string>().oneOf(['ADMIN', 'COORDINATOR', 'HELPER', 'CUSTOMER']),
    status: mixed<UserStatus>().oneOf(Object.values(UserStatus)).optional()
  })
});
