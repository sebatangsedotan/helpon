import { Router } from 'express';
import { register } from '../controllers/auth_controller/register.controller';
import { createAccessToken } from '../controllers/auth_controller/token.controller';
import { verifyToken } from '@/middlewares/authorization';
import { loginLimiter } from '@/helpers/jwt-provider';
import { revokeToken } from '@/controllers/auth_controller/revoke.controller';
import { refreshToken } from '@/controllers/auth_controller/refresh.controller';
import { validateSession } from '@/controllers/auth_controller/validate.controller';
import { validate } from '@/middlewares/validate-request';
import { createUserSchema } from '@/validations/user.validation';

const authRouter = Router();

authRouter.post('/register', validate(createUserSchema), register);
authRouter.post('/token', loginLimiter, createAccessToken);
authRouter.get('/refresh', refreshToken);
authRouter.get('/revoke', revokeToken);
authRouter.get('/validate-session', verifyToken, validateSession);

export default authRouter;
