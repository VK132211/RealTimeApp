export type NotificationType = "REPLY_ON_THREAD" | "LIKE_ON_THREAD";

export type Notification = {
  id: bigint;
  type: NotificationType | string;
  threadId: bigint;
  createdAt: string;
  readAt: string | null;
  actor: {
    displayName: string | null;
    handle: string | null;
  };
  thread: {
    title: string;
  };
};
