import { Role } from "@/generated/prisma/client";

export interface IAuthUser {
  id: string;
  user_code: string;
  username: string;
  email: string;
  role: Role;
}
