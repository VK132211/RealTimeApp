import { prisma } from "../../db/prisma.js";
import { bigintToString } from "../../lib/utils.js";
import { getIo } from "../../realtime/io.js";

export async function createReplyNotification(params: { threadId: bigint; actorUserId: bigint }) {
  const { threadId, actorUserId } = params;
  const threadRes = await prisma.thread.findFirstOrThrow({
    where: { id: threadId },
  });
  const authorUserId = threadRes.authorUserId;
  if (authorUserId === actorUserId) return;
  const insertRes = await prisma.notification.create({
    data: {
      userId: authorUserId,
      actorUserID: actorUserId,
      threadId,
      type: "REPLY_ON_THREAD",
    },
  });
  const newNotificationId = insertRes.id;
  const fullRes = await prisma.notification.findFirstOrThrow({
    where: {
      id: newNotificationId,
    },
    select: {
      id: true,
      type: true,
      threadId: true,
      createdAt: true,
      readAt: true,
      actor: {
        select: {
          displayName: true,
          handle: true,
        },
      },
      thread: {
        select: {
          title: true,
        },
      },
    },
  });
  //EMIT NOTIFICATION:NEW
  const io = getIo();
  if (io) {
    io.to(`notifications:user:${authorUserId}`).emit("notification:new", bigintToString(fullRes));
  }
}
export async function createLikeNotification(params: { threadId: bigint; actorUserId: bigint }) {
  const { threadId, actorUserId } = params;
  const threadRes = await prisma.thread.findFirstOrThrow({
    where: { id: threadId },
  });
  const authorUserId = threadRes.authorUserId;
  if (authorUserId === actorUserId) return;
  const insertRes = await prisma.notification.create({
    data: {
      userId: authorUserId,
      actorUserID: actorUserId,
      threadId,
      type: "LIKE_ON_THREAD",
    },
  });
  const newNotificationId = insertRes.id;
  const fullRes = await prisma.notification.findFirstOrThrow({
    where: {
      id: newNotificationId,
    },
    select: {
      id: true,
      type: true,
      threadId: true,
      createdAt: true,
      readAt: true,
      actor: {
        select: {
          displayName: true,
          handle: true,
        },
      },
      thread: {
        select: {
          title: true,
        },
      },
    },
  });

  //EMIT NOTIFICATION:NEW
  const io = getIo();
  if (io) {
    io.to(`notifications:user:${authorUserId}`).emit("notification:new", bigintToString(fullRes));
  }
}

export async function listNotificationsForUser(params: { userId: bigint; unreadOnly: boolean }) {
  const { userId, unreadOnly } = params;
  const readAt = unreadOnly ? null : undefined;
  const result = await prisma.notification.findMany({
    where: {
      userId,
      readAt: readAt,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      actor: {
        select: {
          displayName: true,
          handle: true,
        },
      },
      thread: {
        select: {
          title: true,
        },
      },
    },
  });
  return result;
}

export async function markNotificationRead(params: { userId: bigint; notificationId: bigint }) {
  const { userId, notificationId } = params;
  await prisma.notification.update({
    where: { id: notificationId, userId: userId },
    data: { readAt: new Date() },
  });
}

export async function markAllAsRead(userId: bigint) {
  await prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });
}
