import { prisma } from "../../db/prisma.js";
import { logger } from "../../lib/logger.js";
import { User } from "./user.types.js";

export async function upsertUserFromClerkProfile(params: {
  clerkUserId: string;
  displayName: string | null;
  avatarUrl: string | null;
}): Promise<User> {
  const { clerkUserId, displayName, avatarUrl } = params;

  try {
    return prisma.user.upsert({
      where: { clerkUserId },
      create: {
        clerkUserId,
        displayName,
        avatarUrl,
      },
      update: {
        displayName,
        avatarUrl,
      },
    });
  } catch (error) {
    logger.error("DatabseError", error);
    throw error;
  }
}

export async function repoUpdateUserProfile(params: {
  clerkUserId: string;
  displayName?: string;
  handle?: string;
  bio?: string;
  avatarUrl?: string;
}): Promise<User> {
  const { clerkUserId, displayName, handle, bio, avatarUrl } = params;

  return prisma.user.update({
    where: { clerkUserId },
    data: {
      ...(displayName !== undefined && { displayName }),
      ...(handle !== undefined && { handle }),
      ...(bio !== undefined && { bio }),
      ...(avatarUrl !== undefined && { avatarUrl }),
    },
  });
}
