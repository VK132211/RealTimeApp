import { prisma } from "../../db/prisma.js";
import { BadRequestError } from "../../lib/errors.js";
import { getThreadById } from "./threads.repository.js";

export async function listRepliesForThread(threadId: bigint) {
  if (threadId <= 0) {
    throw new BadRequestError("Invalid Thread ID");
  }

  const replies = await prisma.reply.findMany({
    where: { threadId },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      body: true,
      createdAt: true,
      author: {
        select: {
          displayName: true,
          handle: true,
        },
      },
    },
  });
  return replies.map((r) => ({
    id: r.id,
    body: r.body,
    createdAt: r.createdAt,
    author: {
      displayName: r.author.displayName ?? null,
      handle: r.author.handle ?? null,
    },
  }));
}

export async function createReply(params: { threadId: bigint; authorUserId: bigint; body: string }) {
  const { threadId, authorUserId, body } = params;

  const newReply = await prisma.reply.create({
    data: {
      threadId: threadId,
      authorUserId: authorUserId,
      body: body,
    },
  });

  const fullRes = await prisma.reply.findUnique({
    where: { id: newReply.id },
    select: {
      id: true,
      body: true,
      createdAt: true,
      author: {
        select: {
          displayName: true,
          handle: true,
        },
      },
    },
  });
  return fullRes;
}

export async function findReplyAuthor(replyId: bigint) {
  const result = await prisma.reply.findUniqueOrThrow({
    where: { id: replyId },
    select: {
      author: {
        select: {
          id: true,
        },
      },
    },
  });
  return result.author.id;
}

export async function deleteReplyById(replyId: bigint) {
  return await prisma.reply.delete({
    where: { id: replyId },
  });
}

export async function likeThreadOnce(params: { threadId: bigint; userId: bigint }) {
  const { threadId, userId } = params;
  await prisma.threadReaction.create({
    data: {
      threadId: threadId,
      userId: userId,
    },
  });
}
export async function removeThreadOnce(params: { threadId: bigint; userId: bigint }) {
  const { threadId, userId } = params;
  await prisma.threadReaction.delete({
    where: {
      uniq_thread_reaction: {
        userId: userId,
        threadId: threadId,
      },
    },
  });
}

export async function getThreadDetailsWithCount(params: { threadId: bigint; viewerUserId: bigint | null }) {
  const { threadId, viewerUserId } = params;
  const thread = await getThreadById(threadId);
  const likeCount = await prisma.threadReaction.count({
    where: {
      threadId: threadId,
    },
  });
  const replyCount = await prisma.reply.count({
    where: {
      threadId: threadId,
    },
  });
  let viewerHasLikedThisPostOrNot = false;
  if (viewerUserId) {
    const viewerLikeCount = await prisma.threadReaction.count({
      where: {
        threadId: threadId,
        userId: viewerUserId,
      },
    });
    if (viewerLikeCount > 0) {
      viewerHasLikedThisPostOrNot = true;
    }
  }
  return {
    ...thread,
    likeCount,
    replyCount,
    viewerHasLikedThisPostOrNot,
  };
}
