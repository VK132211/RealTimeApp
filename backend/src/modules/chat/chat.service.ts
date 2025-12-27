import { prisma } from "../../db/prisma.js";

export async function listChatUsers(currentUserId: bigint) {
  const users = await prisma.user.findMany({
    where: {
      id: { not: currentUserId },
    },
    select: {
      id: true,
      displayName: true,
      handle: true,
      avatarUrl: true,
    },
    orderBy: [{ displayName: "asc" }, { handle: "asc" }],
  });

  return users.map((u) => ({
    id: u.id, // JSON-safe
    displayName: u.displayName ?? null,
    handle: u.handle ?? null,
    avatarUrl: u.avatarUrl ?? null,
  }));
}

export async function listDirectMessages(params: { userId: bigint; otherUserId: bigint; limit: number }) {
  const { userId, otherUserId, limit } = params;
  const setLimit = Math.min(Math.max(limit || 50, 1), 200);

  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    take: setLimit,
    select: {
      id: true,
      senderId: true,
      recipientId: true,
      body: true,
      imageUrl: true,
      createdAt: true,
      sender: {
        select: {
          displayName: true,
          handle: true,
          avatarUrl: true,
        },
      },
      recipient: {
        select: {
          displayName: true,
          handle: true,
          avatarUrl: true,
        },
      },
    },
  });

  return messages.reverse().map((m) => ({
    id: m.id,
    senderUserId: m.senderId,
    recipientUserId: m.recipientId,
    body: m.body ?? null,
    imageUrl: m.imageUrl ?? null,
    createdAt: m.createdAt.toISOString(),
    sender: m.sender,
    recipient: m.recipient,
  }));
}

export async function createDirectMessage(params: {
  senderUserId: bigint;
  recipientUserId: bigint;
  body?: string | null;
  imageUrl?: string | null;
}) {
  const rawBody = params.body ?? "";
  const trimmedBody = rawBody.trim();

  if (!trimmedBody && !params.imageUrl) {
    throw new Error("Message body or image is required");
  }

  const dm = await prisma.directMessage.create({
    data: {
      senderId: params.senderUserId,
      recipientId: params.recipientUserId,
      body: trimmedBody || null,
      imageUrl: params.imageUrl ?? null,
    },
    select: {
      id: true,
      senderId: true,
      recipientId: true,
      body: true,
      imageUrl: true,
      createdAt: true,
      sender: {
        select: {
          displayName: true,
          handle: true,
          avatarUrl: true,
        },
      },
      recipient: {
        select: {
          displayName: true,
          handle: true,
          avatarUrl: true,
        },
      },
    },
  });

  return {
    id: dm.id,
    senderUserId: dm.senderId,
    recipientUserId: dm.recipientId,
    body: dm.body ?? null,
    imageUrl: dm.imageUrl ?? null,
    createdAt: dm.createdAt.toISOString(),
    sender: dm.sender,
    recipient: dm.recipient,
  };
}
