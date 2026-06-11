export type SortMode =
  | "latest"
  | "popular"
  | "rising"
  | "following"
  | "bookmarks"
  | "subscriptions";
export type TagPageSort = Extract<SortMode, "latest" | "popular" | "rising">;
export type BookmarkVisibility = "public" | "private";
export type ProfileVisibility = "public" | "members" | "private";
export type CollectionVisibility = "private" | "public";
export type SeriesVisibility = "private" | "public";
export type CollectionDiscoverySort = "updated" | "largest";
export type CreatorDiscoverySort = "popular" | "active" | "newest";
export type MatureRating = "general" | "restricted" | "adult";
export type MatureFilter = "all" | MatureRating;
export type ArtworkVisibility = "public" | "unlisted" | "private";
export type ArtworkReviewStatus = "pending" | "approved" | "rejected";
export type UserRole = "member" | "moderator" | "admin";
export type ReportTargetType = "artwork" | "comment" | "user";
export type ReportStatus = "open" | "resolved" | "dismissed";
export type ReportReason = "spam" | "abuse" | "illegal" | "copyright" | "other";
export type AdminReportTargetFilter = ReportTargetType | "all";
export type AdminReportReasonFilter = ReportReason | "all";
export type NotificationType = "like" | "comment" | "follow" | "moderation";
export type RankingPeriod = "daily" | "weekly";
export type ActivityType = "publish" | "like" | "comment" | "follow";
export type FollowListMode = "followers" | "following";

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
  authorId: string | null;
  author: string;
  body: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string | null;
  canManage: boolean;
};

export type ArtworkImage = {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  dominantColor: string;
  position: number;
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
  images: ArtworkImage[];
  creator: Creator;
  tags: string[];
  likeCount: number;
  liked: boolean;
  bookmarkCount: number;
  bookmarked: boolean;
  bookmarkVisibility: BookmarkVisibility | null;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  mature: boolean;
  matureRating: MatureRating;
  visibility: ArtworkVisibility;
  reviewStatus: ArtworkReviewStatus;
};

export type GalleryResponse = {
  artworks: Artwork[];
  tags: { name: string; count: number }[];
  creators: Creator[];
  nextCursor: string | null;
  totalCount: number;
  source: "d1" | "empty";
  matureAccess: MatureAccess;
};

export type ArtworkResponse = {
  artwork: Artwork;
  comments: Comment[];
  relatedArtworks: Artwork[];
  source: "d1";
};

export type RankingItem = {
  artwork: Artwork;
  score: number;
};

export type RankingResponse = {
  period: RankingPeriod;
  rankings: RankingItem[];
  matureAccess: MatureAccess;
};

export type SearchSuggestionArtwork = {
  id: string;
  title: string;
  thumbnailUrl: string;
  creator: {
    username: string;
    displayName: string;
  };
  matureRating: MatureRating;
};

export type SearchSuggestionsResponse = {
  query: string;
  tags: { name: string; count: number }[];
  creators: Creator[];
  artworks: SearchSuggestionArtwork[];
};

export type CreatorAnalyticsDay = {
  date: string;
  views: number;
  likes: number;
  bookmarks: number;
  comments: number;
};

export type CreatorAnalyticsArtwork = {
  artwork: Artwork;
  views7d: number;
  engagementRate: number;
};

export type CreatorAnalyticsResponse = {
  summary: {
    artworks: number;
    publicArtworks: number;
    matureArtworks: number;
    followers: number;
    totalViews: number;
    views7d: number;
    views30d: number;
    likes: number;
    bookmarks: number;
    comments: number;
  };
  daily: CreatorAnalyticsDay[];
  topArtworks: CreatorAnalyticsArtwork[];
  recentArtworks: CreatorAnalyticsArtwork[];
  generatedAt: string;
};

export type ActivityActor = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
};

export type ActivityItem = {
  id: string;
  type: ActivityType;
  actor: ActivityActor;
  targetUser: ActivityActor | null;
  artwork: Artwork | null;
  commentId: string | null;
  message: string;
  createdAt: string;
};

export type ActivityResponse = {
  activities: ActivityItem[];
  nextCursor: string | null;
  scope: "global" | "following";
  matureAccess: MatureAccess;
};

export type UserStorage = {
  baseLimit: number;
  siteCredits: number;
  creditsPerSlot: number;
  creditUnlockedSlots: number;
  bonusSlots: number;
  imageLimit: number;
  usedImages: number;
  remainingImages: number;
  lastLoginCreditDate: string | null;
};

export type UploadResponse = {
  artwork: Artwork;
  user: AuthUser;
  persisted: boolean;
  message: string;
};

export type AddArtworkImagesResponse = {
  artwork: Artwork;
  user: AuthUser;
  message: string;
};

export type ReplaceArtworkImageResponse = {
  artwork: Artwork;
  imageId: string;
  message: string;
};

export type DeleteArtworkResponse = {
  deleted: true;
  artworkId: string;
  user: AuthUser;
  message: string;
};

export type DeleteArtworkImageResponse = {
  deleted: true;
  imageId: string;
  artwork: Artwork;
  user: AuthUser;
  message: string;
};

export type UpdateArtworkResponse = {
  artwork: Artwork;
  message: string;
};

export type ReorderArtworkImagesResponse = {
  artwork: Artwork;
  message: string;
};

export type FollowResponse = {
  following: boolean;
  followerCount: number;
  message: string;
};

export type BlockResponse = {
  blocked: boolean;
  following: boolean;
  followerCount: number;
  message: string;
};

export type BlockedUser = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  blockedAt: string;
};

export type BlockedUsersResponse = {
  users: BlockedUser[];
};

export type UnblockUserResponse = {
  users: BlockedUser[];
  message: string;
};

export type CommentResponse = {
  comment: Comment;
  artwork: Artwork;
  message: string;
};

export type DeleteCommentResponse = {
  deleted: true;
  commentId: string;
  artwork: Artwork;
  message: string;
};

export type ModerationReport = {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  targetLabel: string;
  reporter: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt: string | null;
};

export type ReportResponse = {
  report: ModerationReport;
  message: string;
};

export type AdminReportsResponse = {
  reports: ModerationReport[];
  status: ReportStatus;
  targetType: AdminReportTargetFilter;
  reason: AdminReportReasonFilter;
  limit: number;
  totalCount: number;
};

export type TagAlias = {
  sourceTag: string;
  targetTag: string;
  createdAt: string;
};

export type TagImplication = {
  sourceTag: string;
  targetTag: string;
  createdAt: string;
};

export type AdminTagsResponse = {
  aliases: TagAlias[];
  implications: TagImplication[];
  topTags: { name: string; count: number }[];
};

export type AdminTagRuleResponse = {
  tags: AdminTagsResponse;
  message: string;
};

export type AdminModerationAction = "hide_artwork" | "restore_artwork" | "delete_comment";

export type AdminModerationActionResponse = {
  action: AdminModerationAction;
  targetId: string;
  message: string;
};

export type UserNotification = {
  id: string;
  type: NotificationType;
  message: string;
  actor: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
  } | null;
  artworkId: string | null;
  commentId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationsResponse = {
  notifications: UserNotification[];
  unreadCount: number;
};

export type NotificationPreferences = {
  likes: boolean;
  comments: boolean;
  follows: boolean;
  moderation: boolean;
};

export type NotificationPreferencesResponse = {
  preferences: NotificationPreferences;
  message?: string;
};

export type MarkNotificationsReadResponse = {
  unreadCount: number;
  message: string;
};

export type CollectionPreviewArtwork = {
  id: string;
  title: string;
  thumbnailUrl: string;
  dominantColor: string;
};

export type UserCollection = {
  id: string;
  name: string;
  description: string;
  visibility: CollectionVisibility;
  itemCount: number;
  artworkIds: string[];
  coverArtworkId: string | null;
  previewArtworks: CollectionPreviewArtwork[];
  createdAt: string;
  updatedAt: string;
};

export type CollectionsResponse = {
  collections: UserCollection[];
};

export type CollectionResponse = {
  collection: UserCollection;
  message: string;
};

export type CollectionDetailResponse = {
  collection: UserCollection;
  owner: Creator;
  artworks: Artwork[];
  nextCursor: string | null;
  totalCount: number;
  canManage: boolean;
  matureAccess: MatureAccess;
};

export type CollectionDiscoveryItem = {
  collection: UserCollection;
  owner: Creator;
};

export type CollectionDiscoveryResponse = {
  collections: CollectionDiscoveryItem[];
  nextCursor: string | null;
  totalCount: number;
  sort: CollectionDiscoverySort;
  query: string;
  matureAccess: MatureAccess;
};

export type CreatorPreviewArtwork = {
  id: string;
  title: string;
  thumbnailUrl: string;
  dominantColor: string;
};

export type CreatorDiscoveryItem = {
  creator: Creator;
  artworkCount: number;
  latestArtworkAt: string | null;
  previewArtworks: CreatorPreviewArtwork[];
};

export type CreatorDiscoveryResponse = {
  creators: CreatorDiscoveryItem[];
  nextCursor: string | null;
  totalCount: number;
  sort: CreatorDiscoverySort;
  query: string;
  matureAccess: MatureAccess;
};

export type CollectionItemResponse = {
  collection: UserCollection;
  artwork: Artwork;
  added: boolean;
  message: string;
};

export type DeleteCollectionResponse = {
  deleted: true;
  collectionId: string;
  message: string;
};

export type SeriesPreviewArtwork = {
  id: string;
  title: string;
  thumbnailUrl: string;
  dominantColor: string;
};

export type ArtworkSeries = {
  id: string;
  title: string;
  description: string;
  visibility: SeriesVisibility;
  itemCount: number;
  artworkIds: string[];
  coverArtworkId: string | null;
  previewArtworks: SeriesPreviewArtwork[];
  createdAt: string;
  updatedAt: string;
};

export type ArtworkSeriesListResponse = {
  series: ArtworkSeries[];
};

export type ArtworkSeriesResponse = {
  series: ArtworkSeries;
  message: string;
};

export type ArtworkSeriesDetailResponse = {
  series: ArtworkSeries;
  owner: Creator;
  artworks: Artwork[];
  nextCursor: string | null;
  totalCount: number;
  canManage: boolean;
  matureAccess: MatureAccess;
};

export type ArtworkSeriesItemResponse = {
  series: ArtworkSeries;
  artwork: Artwork;
  added: boolean;
  message: string;
};

export type DeleteArtworkSeriesResponse = {
  deleted: true;
  seriesId: string;
  message: string;
};

export type TagSubscriptionsResponse = {
  tags: string[];
};

export type TagSubscriptionResponse = {
  tag: string;
  subscribed: boolean;
  message: string;
};

export type TagRelatedItem = {
  name: string;
  count: number;
};

export type TagDetailResponse = {
  tag: string;
  subscribed: boolean;
  artworks: Artwork[];
  relatedTags: TagRelatedItem[];
  nextCursor: string | null;
  totalCount: number;
  sort: TagPageSort;
  rating: MatureFilter;
  matureAccess: MatureAccess;
};

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: UserRole;
  emailVerified: boolean;
  storage: UserStorage;
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

export type MfaMethod = "totp" | "email";

export type MfaRequiredResponse = {
  mfaRequired: true;
  mfaToken: string;
  methods: MfaMethod[];
  maskedEmail: string;
  message: string;
};

export type AuthLoginResponse = AuthResponse | MfaRequiredResponse;

export type AccountSession = {
  id: string;
  current: boolean;
  userAgent: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
};

export type AuthSessionsResponse = {
  sessions: AccountSession[];
};

export type RevokeSessionsResponse = {
  sessions: AccountSession[];
  csrfToken: string;
  message: string;
};

export type PasswordResetRequestResponse = {
  message: string;
};

export type PasswordResetConfirmResponse = {
  message: string;
};

export type EmailChangeRequestResponse = {
  pendingEmail: string;
  message: string;
};

export type EmailConfirmationKind = "verify" | "change";

export type EmailConfirmationStatus = "confirmed" | "invalid" | "unavailable";

export type EmailConfirmationResponse = {
  kind: EmailConfirmationKind;
  status: EmailConfirmationStatus;
  message: string;
};

export type PasskeySummary = {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
};

export type SecuritySettingsResponse = {
  twoStep: {
    totpEnabled: boolean;
    emailEnabled: boolean;
  };
  passkeys: PasskeySummary[];
  message?: string;
};

export type TotpSetupResponse = {
  secret: string;
  otpauthUrl: string;
  message: string;
};

export type PasskeyCredentialDescriptor = {
  type: "public-key";
  id: string;
  transports?: string[];
};

export type PasskeyRegistrationOptionsResponse = {
  publicKey: {
    challenge: string;
    rp: {
      id: string;
      name: string;
    };
    user: {
      id: string;
      name: string;
      displayName: string;
    };
    pubKeyCredParams: { type: "public-key"; alg: number }[];
    timeout: number;
    attestation: "none";
    authenticatorSelection: {
      residentKey: "preferred";
      userVerification: "preferred";
    };
    excludeCredentials: PasskeyCredentialDescriptor[];
  };
};

export type PasskeyAuthenticationOptionsResponse = {
  publicKey: {
    challenge: string;
    rpId: string;
    timeout: number;
    userVerification: "preferred";
    allowCredentials?: PasskeyCredentialDescriptor[];
  };
};

export type AdminUserSummary = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: UserRole;
  emailVerified: boolean;
  suspendedAt: string | null;
  createdAt: string;
};

export type AdminUserStatusFilter =
  | "all"
  | "active"
  | "suspended"
  | "unverified"
  | "moderator"
  | "admin";

export type AdminUsersResponse = {
  users: AdminUserSummary[];
  query: string;
  status: AdminUserStatusFilter;
  limit: number;
  totalCount: number;
};

export type AdminStatsResponse = {
  accounts: {
    totalUsers: number;
    verifiedUsers: number;
    admins: number;
    moderators: number;
    suspendedUsers: number;
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
  recentUsers: AdminUserSummary[];
};

export type AdminUserActionResponse = {
  user: AdminUserSummary;
  message: string;
};

export type AdminArtworkReviewsResponse = {
  publicArtworkReviewEnabled: boolean;
  artworks: Artwork[];
  totalCount: number;
  limit: number;
};

export type AdminArtworkReviewActionResponse = {
  artwork: Artwork;
  message: string;
};

export type AdminArtworkReviewSettingsResponse = {
  publicArtworkReviewEnabled: boolean;
  pendingCount: number;
  message?: string;
};

export type AdminAuditLogEntry = {
  id: string;
  admin: {
    id: string;
    username: string;
    displayName: string;
  };
  action: string;
  targetType: string;
  targetId: string;
  summary: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type AdminAuditLogResponse = {
  entries: AdminAuditLogEntry[];
};

export type PublicProfile = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  websiteUrl: string;
  bio: string;
  followerCount: number;
  following: boolean;
  blocked: boolean;
  profileVisibility: ProfileVisibility;
  joinedAt: string;
  ownProfile: boolean;
};

export type UserProfileResponse = {
  profile: PublicProfile;
  artworks: Artwork[];
  publicBookmarks: Artwork[];
  privateBookmarks: Artwork[];
  publicCollections: UserCollection[];
  publicSeries: ArtworkSeries[];
  nextCursors: {
    artworks: string | null;
    publicBookmarks: string | null;
    privateBookmarks: string | null;
    publicCollections: string | null;
    publicSeries: string | null;
  };
  stats: {
    artworks: number;
    publicBookmarks: number;
    privateBookmarks: number;
    publicCollections: number;
    publicSeries: number;
    following: number;
    totalLikes: number;
    totalViews: number;
  };
  matureAccess: MatureAccess;
};

export type ProfileFollowListItem = {
  creator: Creator;
  followedAt: string;
};

export type ProfileFollowListResponse = {
  profile: PublicProfile;
  mode: FollowListMode;
  users: ProfileFollowListItem[];
  nextCursor: string | null;
  totalCount: number;
};

export type ProfileSettingsResponse = {
  user: AuthUser;
  profile: {
    username: string;
    displayName: string;
    avatarUrl: string;
    websiteUrl: string;
    bio: string;
  };
  message?: string;
};

export type PrivacySecuritySettingsResponse = {
  user: AuthUser;
  privacy: {
    bookmarkDefaultVisibility: BookmarkVisibility;
    profileVisibility: ProfileVisibility;
    dateOfBirth: string | null;
    matureContentEnabled: boolean;
    mutedTags: string[];
  };
  matureAccess: MatureAccess;
};

export type AccountExportResponse = {
  exportedAt: string;
  user: AuthUser;
  profile: {
    username: string;
    displayName: string;
    avatarUrl: string;
    websiteUrl: string;
    bio: string;
    joinedAt: string;
  };
  privacy: PrivacySecuritySettingsResponse["privacy"];
  notificationPreferences: NotificationPreferences;
  artworks: Artwork[];
  comments: {
    id: string;
    artworkId: string;
    body: string;
    parentId: string | null;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
  }[];
  bookmarks: {
    artworkId: string;
    visibility: BookmarkVisibility;
    createdAt: string;
  }[];
  following: {
    userId: string;
    username: string;
    displayName: string;
    followedAt: string;
  }[];
  followers: {
    userId: string;
    username: string;
    displayName: string;
    followedAt: string;
  }[];
  blockedUsers: BlockedUser[];
  collections: UserCollection[];
  series: ArtworkSeries[];
};

export type PasswordChangeResponse = {
  user: AuthUser;
  csrfToken: string;
  message: string;
};

export type AccountDeactivationResponse = {
  deactivated: true;
  message: string;
};

export type SettingsResponse = ProfileSettingsResponse | PrivacySecuritySettingsResponse;
