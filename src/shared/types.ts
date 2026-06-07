export type SortMode = "latest" | "popular" | "rising" | "following";

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
  viewCount: number;
  commentCount: number;
  createdAt: string;
  mature: boolean;
};

export type GalleryResponse = {
  artworks: Artwork[];
  tags: { name: string; count: number }[];
  creators: Creator[];
  source: "d1" | "seed";
};

export type ArtworkResponse = {
  artwork: Artwork;
  comments: Comment[];
  source: "d1" | "seed";
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
  emailVerified: boolean;
};

export type AuthConfigResponse = {
  turnstileSiteKey: string;
};

export type AuthSessionResponse = {
  user: AuthUser | null;
};

export type AuthResponse = {
  user: AuthUser;
  message: string;
};
