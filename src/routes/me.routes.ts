import { Router } from 'express';
import { getMe } from '../controllers/me/get-me.controller';
import { verifyToken } from '../middlewares/authorization';

const meRouter = Router();

meRouter.get('/me', verifyToken, getMe);

export default meRouter;
