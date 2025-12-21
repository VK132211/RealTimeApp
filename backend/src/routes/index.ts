import {Router} from 'express'
import { userRouter } from './user.routes.js';
import { threadsRouter } from './threads.route.js';

export const apiRouter =  Router();

apiRouter.use("/me", userRouter)
apiRouter.use("/threads",threadsRouter)
