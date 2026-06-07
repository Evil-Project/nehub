export type SortMode = "latest" | "popular" | "rising" | "following" | "bookmarks";
export type BookmarkVisibility = "public" | "private";

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
  bookmarkVisibility: BookmarkVisibility | null;
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
  matureAccess: MatureAccess;
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

export type MatureAccess = {
  allowed: boolean;
  signedIn: boolean;
  ageVerified: boolean;
  enabled: boolean;
  restrictedRegion: boolean;
  country: string | null;
  reason:
    | "allowed"
    | "sign_in_required"
    | "age_verification_required"
    | "disabled"
    | "region_restricted";
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

export type PublicProfile = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  followerCount: number;
  following: boolean;
  joinedAt: string;
  ownProfile: boolean;
};

export type UserProfileResponse = {
  profile: PublicProfile;
  artworks: Artwork[];
  publicBookmarks: Artwork[];
  privateBookmarks: Artwork[];
  stats: {
    artworks: number;
    publicBookmarks: number;
    privateBookmarks: number;
    totalLikes: number;
    totalViews: number;
  };
  matureAccess: MatureAccess;
};

export type ProfileSettingsResponse = {
  user: AuthUser;
  profile: {
    username: string;
    displayName: string;
    avatarUrl: string;
    bio: string;
  };
};

export type PrivacySecuritySettingsResponse = {
  user: AuthUser;
  privacy: {
    bookmarkDefaultVisibility: BookmarkVisibility;
    dateOfBirth: string | null;
    matureContentEnabled: boolean;
  };
  matureAccess: MatureAccess;
};

export type SettingsResponse = ProfileSettingsResponse | PrivacySecuritySettingsResponse;
