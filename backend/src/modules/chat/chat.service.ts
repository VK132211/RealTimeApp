import { prisma } from "../../db/prisma.js";

export async function listChatUsers(currentUserId: bigint) {
  try {
    const result = await prisma.user.findUniqueOrThrow({ where: { id: currentUserId } });
    return result;
  } catch (error) {
    throw error;
  }
}

export async function listDirectMessages(params: { userId: bigint; otherUserId: bigint; limit: number }) {
  const { userId, otherUserId, limit } = params;
  const result = await prisma.directMessage.findMany({
    where: {
      senderId: userId,
      recipientId: otherUserId,
    },
    take: limit,
  });
  return result.reverse();
}

export async function createDirectMessage(params: {
  senderUserId: bigint;
  recipientUserId: bigint;
  body?: string | null;
  imageUrl?: string | null;
}) {
  const { senderUserId, recipientUserId } = params;
  const rawBody = params?.body ?? "";
  const trimmedBody = rawBody.trim();
  const setImageUrl = params?.imageUrl ?? null;

  if (!trimmedBody && !setImageUrl) {
    throw new Error("Message body or image is required");
  }

  const result = await prisma.directMessage.create({
    data: {
      senderId: senderUserId,
      recipientId: recipientUserId,
      body: trimmedBody || null,
      imageUrl: setImageUrl,
    },
  });

  const fullRes = await prisma.directMessage.findUniqueOrThrow({
    where: { id: result.id },
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
  return fullRes;
}
