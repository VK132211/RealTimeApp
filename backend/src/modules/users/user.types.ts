export type UserRow = {
  id: bigint;
  clerk_user_id: string;
  display_name: string | null;
  handle: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: Date;
  updated_at: Date;
};
export type User = {
  id: bigint;
  clerkUserId: string;
  displayName: string | null;
  handle: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
};
export type UserProfile = {
  user: User;
  clerkEmail: string | null;
  clerkFullName: string | null;
};

export type UserProfileResponse = {
  id: string;
  clerkUserId: string;
  displayName: string | null;
  email: string | null;
  handle: string | null;
  avatarUrl: string | null;
  bio: string | null;
};

export function toUserProfileResponse(profile: UserProfile): UserProfileResponse {
  const { user, clerkEmail, clerkFullName } = profile;
  return {
    id: user.id.toString(),
    clerkUserId: user.clerkUserId,
    email: clerkEmail ?? null,
    displayName: user.displayName ?? clerkFullName ?? null,
    handle: user.handle ?? null,
    avatarUrl: user.avatarUrl ?? null,
    bio: user.bio ?? null,
  };
}
