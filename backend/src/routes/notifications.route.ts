import { getAuth } from "@clerk/express";
import { Router } from "express";
import { BadRequestError, UnAuthorizedError } from "../lib/errors.js";
import { getUserFromClerk } from "../modules/users/user.service.js";
import {
  listNotificationsForUser,
  markAllAsRead,
  markNotificationRead,
} from "../modules/notifications/notifications.service.js";
import { bigintToString } from "../lib/utils.js";

export const notificationsRouter = Router();

notificationsRouter.get("/", async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      throw new UnAuthorizedError("Please SignIn");
    }
    const profile = await getUserFromClerk(auth.userId);
    const isUnreadOnly = req.query.unreadOnly === "true";
    const notifications = await listNotificationsForUser({
      userId: profile.user.id,
      unreadOnly: isUnreadOnly,
    });
    res.json({ data: bigintToString(notifications) });
  } catch (error) {
    next(error);
  }
});

notificationsRouter.post("/:id/read", async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      throw new UnAuthorizedError("Pleas SignIn!");
    }
    const notificationId = BigInt(req.params.id);
    if (notificationId <= 0) {
      throw new BadRequestError("Invalid Notification ID");
    }
    const profile = await getUserFromClerk(auth.userId);
    await markNotificationRead({
      userId: profile.user.id,
      notificationId,
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
notificationsRouter.post("/read-all", async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      throw new UnAuthorizedError("Pleas SignIn!");
    }

    const profile = await getUserFromClerk(auth.userId);
    await markAllAsRead(profile.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
