import {Router} from 'express'
import { userRouter } from './user.routes.js';
import { threadsRouter } from './threads.route.js';
import { notificationsRouter } from './notifications.route.js';
import { chatRouter } from './chat.route.js';
import { uploadRouter } from './upload.route.js';

export const apiRouter =  Router();

apiRouter.use("/me", userRouter)
apiRouter.use("/threads",threadsRouter)
apiRouter.use("/notifications",notificationsRouter);
apiRouter.use("/chat", chatRouter);
apiRouter.use("/upload",uploadRouter);