export type Notification = {
  id: number;
  type: string;
  threadId: number;
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
