import { IAuthUser } from '../auth-user';

declare global {
  namespace Express {
    interface Request {
      user?: IAuthUser;
    }
  }
}
