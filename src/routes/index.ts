import { Router } from 'express';
import authRouter from './auth.routes';
import meRouter from './me.routes';

const appRouter = Router();

appRouter.use('/api/v1/auth', authRouter);
appRouter.use('/api/v1', meRouter);

export default appRouter;
