import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { env } from "../config/env.js";
import { getUserFromClerk } from "../modules/users/user.service.js";
let io: Server | null = null;

const onlineUsers = new Map<number, Set<string>>();

function addOnlineUser(rawUserId: unknown, socketId: string) {
  const userId = Number(rawUserId);
  if (userId <= 0) return;
  const existing = onlineUsers.get(userId);
  if (existing) {
    existing.add(socketId);
  } else {
    onlineUsers.set(userId, new Set([socketId]));
  }
}

function removeOnlineUser(rawUserId: unknown, socketId: string) {
  const userId = Number(rawUserId);
  if (userId <= 0) return;
  const existing = onlineUsers.get(userId);
  if (!existing) return;
  existing.delete(socketId);
  if (existing.size === 0) {
    onlineUsers.delete(userId);
  }
}

function getOnlineUserIds(): number[] {
  return Array.from(onlineUsers.keys());
}

function broadCastPresence() {
  io?.emit("presence:update", {
    onlineUserIds: getOnlineUserIds(),
  });
}

export function initIo(httpServer: HttpServer) {
  if (io) return io;
  io = new Server(httpServer, {
    cors: {
      origin: `http://localhost:${env.PORT}`,
      credentials: true,
    },
  });

  io.on("connection", async (socket) => {
    console.log(`[io connection]------> ${socket.id}`);
    try {
      const clerkUserId = socket.handshake.auth?.userId;

      if (!clerkUserId || typeof clerkUserId !== "string") {
        console.log(`[Missing clerk user id]------> ${socket.id}`);
        socket.disconnect(true);
        return;
      }

      const profile = await getUserFromClerk(clerkUserId);
      const rawLocalUserId = profile.user.id;
      const localUserId = Number(rawLocalUserId);
      const displayName = profile.user.displayName ?? null;
      const handle = profile.user.handle ?? null;

      if (!Number.isFinite(localUserId) || localUserId <= 0) {
        console.log(`[Invalid user id]------> ${socket.id}`);
        socket.disconnect(true);
        return;
      }
      (socket.data as {
        userId: number;
        displayName: string | null;
        handle: string | null;
      }) = {
        userId: localUserId,
        displayName,
        handle,
      };
      const notiRoom = `notifications:user:${localUserId}`;
      socket.join(notiRoom);
      addOnlineUser(localUserId, socket.id);
      broadCastPresence();
    } catch (error) {
      console.log(`[Error while socket connection]------> ${error}`);
      socket.disconnect(true);
    }
  });
}

export function getIo() {
  return io;
}
