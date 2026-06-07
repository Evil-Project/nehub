export type SortMode = "latest" | "popular" | "rising" | "following" | "bookmarks";

export type Creator = {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  followerCount: number;
  following: boolean;
};

export type Comment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

export type Artwork = {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  dominantColor: string;
  creator: Creator;
  tags: string[];
  likeCount: number;
  bookmarkCount: number;
  bookmarked: boolean;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  mature: boolean;
};

export type GalleryResponse = {
  artworks: Artwork[];
  tags: { name: string; count: number }[];
  creators: Creator[];
  source: "d1" | "empty";
};

export type ArtworkResponse = {
  artwork: Artwork;
  comments: Comment[];
  source: "d1";
};

export type UploadResponse = {
  artwork: Artwork;
  persisted: boolean;
  message: string;
};

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: "member" | "admin";
  emailVerified: boolean;
};

export type AuthConfigResponse = {
  turnstileSiteKey: string;
};

export type AuthSessionResponse = {
  user: AuthUser | null;
  csrfToken: string | null;
};

export type AuthResponse = {
  user: AuthUser;
  csrfToken: string;
  message: string;
};

export type AdminStatsResponse = {
  accounts: {
    totalUsers: number;
    verifiedUsers: number;
    admins: number;
    activeSessions: number;
    pendingVerifications: number;
  };
  content: {
    artworks: number;
    creators: number;
    likes: number;
    views: number;
  };
  storage: {
    d1: boolean;
    r2: boolean;
    email: boolean;
  };
  recentUsers: Array<{
    id: string;
    email: string;
    username: string;
    displayName: string;
    role: "member" | "admin";
    emailVerified: boolean;
    createdAt: string;
  }>;
};
