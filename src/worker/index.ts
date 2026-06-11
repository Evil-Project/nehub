import { Hono } from "hono";
import { EmailMessage } from "cloudflare:email";
import { z } from "zod";
import type { Context } from "hono";
import type {
  ActivityItem,
  ActivityResponse,
  ActivityType,
  AccountDeactivationResponse,
  AccountExportResponse,
  AccountSession,
  AuthConfigResponse,
  DeleteArtworkResponse,
  AuthLoginResponse,
  AuthResponse,
  AuthSessionResponse,
  AuthSessionsResponse,
  AuthUser,
  AdminArtworkReviewActionResponse,
  AdminArtworkReviewSettingsResponse,
  AdminArtworkReviewsResponse,
  AdminAuditLogEntry,
  AdminAuditLogResponse,
  AdminModerationActionResponse,
  AdminReportReasonFilter,
  AdminReportTargetFilter,
  AdminReportsResponse,
  AdminStatsResponse,
  AdminTagRuleResponse,
  AdminTagsResponse,
  AdminUserActionResponse,
  AdminUserSummary,
  AdminUserStatusFilter,
  AdminUsersResponse,
  AddArtworkImagesResponse,
  Artwork,
  ArtworkImage,
  ArtworkResponse,
  ArtworkReviewStatus,
  ArtworkVisibility,
  ArtworkSeries,
  ArtworkSeriesDetailResponse,
  ArtworkSeriesItemResponse,
  ArtworkSeriesListResponse,
  ArtworkSeriesResponse,
  BlockResponse,
  BlockedUser,
  BlockedUsersResponse,
  BookmarkVisibility,
  Comment,
  CommentResponse,
  CollectionItemResponse,
  CollectionResponse,
  CollectionDetailResponse,
  CollectionDiscoveryItem,
  CollectionDiscoveryResponse,
  CollectionDiscoverySort,
  CollectionPreviewArtwork,
  CollectionVisibility,
  CollectionsResponse,
  Creator,
  CreatorAnalyticsResponse,
  CreatorDiscoveryItem,
  CreatorDiscoveryResponse,
  CreatorDiscoverySort,
  CreatorPreviewArtwork,
  DeleteArtworkSeriesResponse,
  DeleteArtworkImageResponse,
  DeleteCollectionResponse,
  FollowListMode,
  GalleryResponse,
  FollowResponse,
  DeleteCommentResponse,
  MatureAccess,
  MatureFilter,
  MatureRating,
  MarkNotificationsReadResponse,
  ModerationReport,
  MfaMethod,
  NotificationPreferences,
  NotificationPreferencesResponse,
  NotificationType,
  NotificationsResponse,
  EmailChangeRequestResponse,
  EmailConfirmationKind,
  EmailConfirmationResponse,
  EmailConfirmationStatus,
  PasswordChangeResponse,
  PasswordResetConfirmResponse,
  PasswordResetRequestResponse,
  PasskeyAuthenticationOptionsResponse,
  PasskeyRegistrationOptionsResponse,
  PasskeySummary,
  PrivacySecuritySettingsResponse,
  ProfileFollowListItem,
  ProfileFollowListResponse,
  ProfileVisibility,
  ProfileSettingsResponse,
  RankingPeriod,
  RankingResponse,
  ReportResponse,
  ReportReason,
  ReportStatus,
  ReportTargetType,
  ReplaceArtworkImageResponse,
  ReorderArtworkImagesResponse,
  RevokeSessionsResponse,
  SearchSuggestionsResponse,
  SecuritySettingsResponse,
  SeriesPreviewArtwork,
  SeriesVisibility,
  SortMode,
  TagAlias,
  TagDetailResponse,
  TagImplication,
  TagRelatedItem,
  TagPageSort,
  TagSubscriptionResponse,
  TagSubscriptionsResponse,
  TotpSetupResponse,
  UserCollection,
  UserNotification,
  UserRole,
  UserStorage,
  UserProfileResponse,
  UpdateArtworkResponse,
  UnblockUserResponse,
  UploadResponse
} from "../shared/types";
type Bindings = Env;
type AppContext = Context<{ Bindings: Bindings }>;
type ArtworkMediaEnv = Pick<Env, "PUBLIC_ARTWORK_MEDIA_URL">;

const app = new Hono<{ Bindings: Bindings }>();

app.onError((error, context) => {
  console.error("Unhandled Worker error", error);
  return context.json({ message: "Internal server error." }, 500);
});

const sessionCookieName = "nehub_session";
const csrfCookieName = "nehub_csrf";
const csrfHeaderName = "x-csrf-token";
const sessionDurationSeconds = 60 * 60 * 24 * 30;
const verificationTokenDurationSeconds = 60 * 60 * 24;
const passwordResetTokenDurationSeconds = 60 * 60;
const emailChangeTokenDurationSeconds = 60 * 60 * 2;
const mfaChallengeDurationSeconds = 60 * 10;
const webauthnChallengeDurationSeconds = 60 * 5;
const minuteSeconds = 60;
const hourSeconds = 60 * minuteSeconds;
const passwordIterations = 120_000;
const passwordKeyLengthBytes = 32;
const maxUploadBytes = 10 * 1024 * 1024;
const maxAvatarUploadBytes = 4 * 1024 * 1024;
const maxUploadFiles = 8;
const baseStorageImageLimit = 10;
const creditsPerStorageSlot = 10;
const loginSiteCreditMin = 1;
const loginSiteCreditMax = 10;
const artworkLikeSiteCreditReward = 100;
const maxImageDimension = 32_768;
const maxImagePixels = 50_000_000;
const maxExplicitArtworkTags = 12;
const maxExpandedArtworkTags = 24;
const maxTagLength = 64;
const defaultAdminUserId = "usr_default_admin";
const bootstrapPasswordHash = "bootstrap-env";
const publicArtworkReviewSettingKey = "public_artwork_review_enabled";
const rateLimitDefaults = {
  auth: { limit: 10, windowSeconds: 15 * minuteSeconds },
  resend: { limit: 3, windowSeconds: 15 * minuteSeconds },
  profile: { limit: 20, windowSeconds: hourSeconds },
  social: { limit: 120, windowSeconds: hourSeconds },
  comments: { limit: 60, windowSeconds: hourSeconds },
  reports: { limit: 20, windowSeconds: hourSeconds },
  uploads: { limit: 16, windowSeconds: hourSeconds },
  collections: { limit: 120, windowSeconds: hourSeconds },
  notifications: { limit: 180, windowSeconds: hourSeconds },
  activity: { limit: 240, windowSeconds: hourSeconds },
  analytics: { limit: 240, windowSeconds: hourSeconds },
  admin: { limit: 240, windowSeconds: hourSeconds }
} as const;
const allowedUploadTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"]
]);
type UploadImageMetadata = {
  contentType: string;
  width: number;
  height: number;
  dominantColor: string;
};
type PreparedUploadImage = UploadImageMetadata & {
  bytes: Uint8Array;
  extension: string;
  position: number;
};
const publicMediaCacheControl = "public, max-age=31536000, immutable";
const protectedMediaCacheControl = "private, no-store";
const defaultArtworkMediaBaseUrl = "https://art.evilneur.org";
const mediaVariantOptions = {
  thumbnail: {
    width: 640,
    fit: "scale-down",
    quality: 78,
    format: "webp",
    metadata: "none"
  },
  preview: {
    width: 1600,
    fit: "scale-down",
    quality: 86,
    format: "webp",
    metadata: "none"
  }
} as const;
type MediaVariant = keyof typeof mediaVariantOptions;

const asciiAt = (bytes: Uint8Array, offset: number, length: number) =>
  String.fromCharCode(...bytes.slice(offset, offset + length));

const hslToHex = (hue: number, saturation: number, lightness: number) => {
  const saturationRatio = saturation / 100;
  const lightnessRatio = lightness / 100;
  const chroma = (1 - Math.abs(2 * lightnessRatio - 1)) * saturationRatio;
  const huePrime = hue / 60;
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1));
  const [red1, green1, blue1] =
    huePrime < 1
      ? [chroma, x, 0]
      : huePrime < 2
        ? [x, chroma, 0]
        : huePrime < 3
          ? [0, chroma, x]
          : huePrime < 4
            ? [0, x, chroma]
            : huePrime < 5
              ? [x, 0, chroma]
              : [chroma, 0, x];
  const match = lightnessRatio - chroma / 2;
  const toHex = (value: number) =>
    Math.round((value + match) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(red1)}${toHex(green1)}${toHex(blue1)}`;
};

const metadataColorFromBytes = (bytes: Uint8Array) => {
  let hash = 2166136261;
  const stride = Math.max(1, Math.floor(bytes.length / 4096));
  for (let index = 0; index < bytes.length; index += stride) {
    hash ^= bytes[index];
    hash = Math.imul(hash, 16777619);
  }
  const hue = Math.abs(hash) % 360;
  const saturation = 36 + ((hash >>> 8) % 24);
  const lightness = 34 + ((hash >>> 16) % 18);
  return hslToHex(hue, saturation, lightness);
};

const validImageDimensions = (width: number, height: number) =>
  Number.isInteger(width) &&
  Number.isInteger(height) &&
  width > 0 &&
  height > 0 &&
  width <= maxImageDimension &&
  height <= maxImageDimension &&
  width * height <= maxImagePixels;

const parsePngDimensions = (bytes: Uint8Array, view: DataView) => {
  if (
    bytes.length < 24 ||
    bytes[0] !== 0x89 ||
    asciiAt(bytes, 1, 3) !== "PNG" ||
    asciiAt(bytes, 12, 4) !== "IHDR"
  ) {
    return null;
  }
  return {
    width: view.getUint32(16, false),
    height: view.getUint32(20, false)
  };
};

const parseGifDimensions = (bytes: Uint8Array, view: DataView) => {
  if (bytes.length < 10) {
    return null;
  }
  const signature = asciiAt(bytes, 0, 6);
  if (signature !== "GIF87a" && signature !== "GIF89a") {
    return null;
  }
  return {
    width: view.getUint16(6, true),
    height: view.getUint16(8, true)
  };
};

const jpegStartOfFrameMarkers = new Set([
  0xc0,
  0xc1,
  0xc2,
  0xc3,
  0xc5,
  0xc6,
  0xc7,
  0xc9,
  0xca,
  0xcb,
  0xcd,
  0xce,
  0xcf
]);

const parseJpegDimensions = (bytes: Uint8Array, view: DataView) => {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return null;
  }
  let offset = 2;
  while (offset + 3 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    while (offset < bytes.length && bytes[offset] === 0xff) {
      offset += 1;
    }
    const marker = bytes[offset];
    offset += 1;
    if (marker === 0xd9 || marker === 0xda) {
      break;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      continue;
    }
    if (offset + 2 > bytes.length) {
      return null;
    }
    const segmentLength = view.getUint16(offset, false);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) {
      return null;
    }
    const dataStart = offset + 2;
    if (jpegStartOfFrameMarkers.has(marker)) {
      if (dataStart + 5 > bytes.length) {
        return null;
      }
      return {
        width: view.getUint16(dataStart + 3, false),
        height: view.getUint16(dataStart + 1, false)
      };
    }
    offset += segmentLength;
  }
  return null;
};

const uint24LittleEndian = (bytes: Uint8Array, offset: number) =>
  bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);

const parseWebpDimensions = (bytes: Uint8Array, view: DataView) => {
  if (
    bytes.length < 30 ||
    asciiAt(bytes, 0, 4) !== "RIFF" ||
    asciiAt(bytes, 8, 4) !== "WEBP"
  ) {
    return null;
  }

  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const chunkType = asciiAt(bytes, offset, 4);
    const chunkSize = view.getUint32(offset + 4, true);
    const dataStart = offset + 8;
    const dataEnd = dataStart + chunkSize;
    if (dataEnd > bytes.length) {
      return null;
    }

    if (chunkType === "VP8X" && chunkSize >= 10) {
      return {
        width: uint24LittleEndian(bytes, dataStart + 4) + 1,
        height: uint24LittleEndian(bytes, dataStart + 7) + 1
      };
    }
    if (chunkType === "VP8L" && chunkSize >= 5 && bytes[dataStart] === 0x2f) {
      const byte1 = bytes[dataStart + 1];
      const byte2 = bytes[dataStart + 2];
      const byte3 = bytes[dataStart + 3];
      const byte4 = bytes[dataStart + 4];
      return {
        width: 1 + byte1 + ((byte2 & 0x3f) << 8),
        height: 1 + ((byte2 & 0xc0) >> 6) + (byte3 << 2) + ((byte4 & 0x0f) << 10)
      };
    }
    if (
      chunkType === "VP8 " &&
      chunkSize >= 10 &&
      bytes[dataStart + 3] === 0x9d &&
      bytes[dataStart + 4] === 0x01 &&
      bytes[dataStart + 5] === 0x2a
    ) {
      return {
        width: view.getUint16(dataStart + 6, true) & 0x3fff,
        height: view.getUint16(dataStart + 8, true) & 0x3fff
      };
    }

    offset = dataEnd + (chunkSize % 2);
  }
  return null;
};

const readUploadImageMetadata = (bytes: Uint8Array): UploadImageMetadata | null => {
  if (bytes.length < 10) {
    return null;
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const candidates: Array<[string, { width: number; height: number } | null]> = [
    ["image/png", parsePngDimensions(bytes, view)],
    ["image/jpeg", parseJpegDimensions(bytes, view)],
    ["image/webp", parseWebpDimensions(bytes, view)],
    ["image/gif", parseGifDimensions(bytes, view)]
  ];
  const detected = candidates.find(([, dimensions]) => dimensions !== null);
  if (!detected?.[1] || !validImageDimensions(detected[1].width, detected[1].height)) {
    return null;
  }
  return {
    contentType: detected[0],
    width: detected[1].width,
    height: detected[1].height,
    dominantColor: metadataColorFromBytes(bytes)
  };
};

const uploadSchema = z.object({
  title: z.string().trim().min(2).max(120),
  caption: z.string().trim().max(800).default(""),
  tags: z.string().trim().max(240).default("original"),
  mature: z.enum(["true", "false"]).optional(),
  matureRating: z.enum(["general", "restricted", "adult"]).default("general"),
  visibility: z.enum(["public", "unlisted", "private"]).default("public"),
  turnstileToken: z.string().min(1).max(4096)
});

const artworkUpdateSchema = z.object({
  title: z.string().trim().min(2).max(120),
  caption: z.string().trim().max(800).default(""),
  tags: z.string().trim().max(240).default("original"),
  matureRating: z.enum(["general", "restricted", "adult"]),
  visibility: z.enum(["public", "unlisted", "private"]).default("public")
});

const artworkImageOrderSchema = z.object({
  imageIds: z.array(z.string().trim().min(1).max(80)).min(1).max(maxUploadFiles)
});

const registerSchema = z.object({
  email: z.string().trim().email().max(254),
  username: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_-]+$/),
  displayName: z.string().trim().min(2).max(60),
  password: z.string().min(10).max(160),
  turnstileToken: z.string().min(1).max(4096)
});

const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(254),
  password: z.string().min(1).max(160),
  turnstileToken: z.string().min(1).max(4096)
});

const mfaVerifySchema = z.object({
  mfaToken: z.string().trim().min(24).max(256),
  method: z.enum(["totp", "email"]),
  code: z.string().trim().regex(/^\d{6}$/)
});

const resendVerificationSchema = z.object({
  turnstileToken: z.string().min(1).max(4096)
});

const passwordResetRequestSchema = z.object({
  email: z.string().trim().email().max(254),
  turnstileToken: z.string().min(1).max(4096)
});

const passwordResetConfirmSchema = z.object({
  token: z.string().trim().min(24).max(256),
  newPassword: z.string().min(10).max(160),
  turnstileToken: z.string().min(1).max(4096)
});

const websiteUrlSchema = z
  .string()
  .trim()
  .max(500)
  .optional()
  .default("")
  .refine((value) => {
    if (!value) {
      return true;
    }
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  });

const profileSettingsSchema = z.object({
  displayName: z.string().trim().min(2).max(60),
  username: z.string().trim().toLowerCase().min(3).max(32).regex(/^[a-z0-9_-]+$/),
  avatarUrl: z.string().trim().max(500).optional().default(""),
  websiteUrl: websiteUrlSchema,
  bio: z.string().trim().max(500).optional().default("")
});

const privacySecuritySchema = z.object({
  bookmarkDefaultVisibility: z.enum(["public", "private"]),
  profileVisibility: z.enum(["public", "members", "private"]),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  matureContentEnabled: z.boolean(),
  mutedTags: z.array(z.string().trim().min(1).max(maxTagLength)).max(80).default([])
});

const notificationPreferencesSchema = z.object({
  likes: z.boolean(),
  comments: z.boolean(),
  follows: z.boolean(),
  moderation: z.boolean()
});

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1).max(160),
  newPassword: z.string().min(10).max(160)
});

const accountDeactivationSchema = z.object({
  currentPassword: z.string().min(1).max(160),
  confirmation: z.literal("DEACTIVATE")
});

const emailChangeRequestSchema = z.object({
  email: z.string().trim().email().max(254),
  currentPassword: z.string().min(1).max(160)
});

const totpConfirmSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/)
});

const emailMfaSettingsSchema = z.object({
  enabled: z.boolean()
});

const passkeyRegistrationOptionsSchema = z.object({
  name: z.string().trim().min(1).max(80).optional().default("Passkey")
});

const webauthnClientResponseSchema = z.object({
  clientDataJSON: z.string().min(1).max(65536)
});

const passkeyRegistrationSchema = z.object({
  id: z.string().min(1).max(4096),
  rawId: z.string().min(1).max(4096),
  type: z.literal("public-key"),
  response: webauthnClientResponseSchema.extend({
    attestationObject: z.string().min(1).max(131072)
  }),
  transports: z.array(z.string().min(1).max(32)).max(8).optional().default([]),
  name: z.string().trim().min(1).max(80).optional().default("Passkey")
});

const passkeyAuthenticationSchema = z.object({
  id: z.string().min(1).max(4096),
  rawId: z.string().min(1).max(4096),
  type: z.literal("public-key"),
  response: webauthnClientResponseSchema.extend({
    authenticatorData: z.string().min(1).max(65536),
    signature: z.string().min(1).max(65536),
    userHandle: z.string().max(4096).nullable().optional()
  })
});

const bookmarkSchema = z.object({
  visibility: z.enum(["public", "private"]).optional()
});

const commentSchema = z.object({
  body: z.string().trim().min(1).max(800),
  parentId: z.string().trim().min(1).max(80).optional()
});

const protectedCommentSchema = commentSchema.extend({
  turnstileToken: z.string().min(1).max(4096)
});

const reportSchema = z.object({
  reason: z.enum(["spam", "abuse", "illegal", "copyright", "other"]),
  details: z.string().trim().max(800).optional().default("")
});

const protectedReportSchema = reportSchema.extend({
  turnstileToken: z.string().min(1).max(4096)
});

const resolveReportSchema = z.object({
  status: z.enum(["resolved", "dismissed"])
});

const artworkModerationSchema = z.object({
  action: z.enum(["hide", "restore"])
});

const userRoleSchema = z.object({
  role: z.enum(["member", "moderator", "admin"])
});

const artworkReviewSchema = z.object({
  action: z.enum(["approve", "reject"])
});

const artworkReviewSettingsSchema = z.object({
  publicArtworkReviewEnabled: z.boolean()
});

const markNotificationsReadSchema = z.object({
  id: z.string().trim().min(1).max(80).optional()
});

const collectionVisibilitySchema = z.enum(["private", "public"]);

const collectionSchema = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(240).optional().default(""),
  visibility: collectionVisibilitySchema.optional().default("private")
});

const collectionUpdateSchema = collectionSchema.extend({
  coverArtworkId: z.string().trim().min(1).max(80).nullable().optional()
});

const collectionItemSchema = z.object({
  artworkId: z.string().trim().min(1).max(80)
});

const seriesVisibilitySchema = z.enum(["private", "public"]);

const seriesSchema = z.object({
  title: z.string().trim().min(2).max(80),
  description: z.string().trim().max(360).optional().default(""),
  visibility: seriesVisibilitySchema.optional().default("private")
});

const seriesUpdateSchema = seriesSchema.extend({
  coverArtworkId: z.string().trim().min(1).max(80).nullable().optional()
});

const seriesItemSchema = z.object({
  artworkId: z.string().trim().min(1).max(80),
  position: z.number().int().min(0).max(9999).optional()
});

const userSuspensionSchema = z.object({
  suspended: z.boolean(),
  reason: z.string().trim().max(240).optional().default("")
});

const tagRuleSchema = z.object({
  sourceTag: z.string().trim().min(1).max(maxTagLength),
  targetTag: z.string().trim().min(1).max(maxTagLength)
});

const json = <T>(data: T, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...init?.headers
    }
  });

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const toBase64Url = (bytes: Uint8Array) => {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};

const fromBase64Url = (value: string) => {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

const toArrayBuffer = (bytes: Uint8Array) =>
  bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

type KeysetGallerySort = Extract<
  SortMode,
  "latest" | "popular" | "rising" | "following" | "bookmarks" | "subscriptions"
>;

type GalleryCursor = {
  createdAt: string;
  id: string;
  sort?: KeysetGallerySort;
  score?: number;
};

type CollectionDiscoveryCursor = {
  updatedAt: string;
  id: string;
  sort?: CollectionDiscoverySort;
  query?: string;
  itemCount?: number;
};

type CreatorDiscoveryCursor = {
  createdAt: string;
  id: string;
  sort?: CreatorDiscoverySort;
  query?: string;
  followerCount?: number;
  latestArtworkAt?: string;
};

type SeriesCursor = {
  position: number;
  id: string;
};

type FollowListCursor = {
  mode?: FollowListMode;
  username?: string;
  followedAt: string;
  id: string;
};

const risingScoreForArtwork = (artwork: Pick<Artwork, "likeCount" | "viewCount">) =>
  Math.trunc((artwork.likeCount * 1_000_000) / Math.max(1, artwork.viewCount));

const cursorScoreForArtwork = (
  sort: KeysetGallerySort,
  artwork: Pick<Artwork, "likeCount" | "viewCount">
) => {
  if (sort === "popular") {
    return artwork.likeCount;
  }
  if (sort === "rising") {
    return risingScoreForArtwork(artwork);
  }
  return undefined;
};

const encodeGalleryCursor = (
  sort: KeysetGallerySort,
  artwork: Pick<Artwork, "createdAt" | "id" | "likeCount" | "viewCount">
) => {
  const score = cursorScoreForArtwork(sort, artwork);
  return toBase64Url(
    textEncoder.encode(
      JSON.stringify({
        v: 1,
        sort,
        createdAt: artwork.createdAt,
        id: artwork.id,
        ...(typeof score === "number" ? { score } : {})
      })
    )
  );
};

const isKeysetGallerySort = (sort: SortMode): sort is KeysetGallerySort =>
  sort === "latest" ||
  sort === "popular" ||
  sort === "rising" ||
  sort === "following" ||
  sort === "bookmarks" ||
  sort === "subscriptions";

const galleryCursorIsValidForSort = (
  sort: KeysetGallerySort,
  cursor: GalleryCursor | undefined
) => {
  if (!cursor) {
    return true;
  }
  if (cursor.sort && cursor.sort !== sort) {
    return false;
  }
  return sort === "popular" || sort === "rising" ? typeof cursor.score === "number" : true;
};

const isLegacyOffsetCursor = (value: string) => /^\d+$/.test(value.trim());

const decodeGalleryCursor = (value: string | null | undefined) => {
  const rawValue = value?.trim();
  if (!rawValue) {
    return undefined;
  }
  if (isLegacyOffsetCursor(rawValue)) {
    return "legacy" as const;
  }
  try {
    const decoded = JSON.parse(textDecoder.decode(fromBase64Url(rawValue))) as {
      v?: unknown;
      sort?: unknown;
      createdAt?: unknown;
      id?: unknown;
      score?: unknown;
    };
    if (
      decoded.v === 1 &&
      typeof decoded.createdAt === "string" &&
      typeof decoded.id === "string" &&
      decoded.createdAt.length > 0 &&
      decoded.id.length > 0
    ) {
      const sort =
        decoded.sort === "latest" ||
        decoded.sort === "popular" ||
        decoded.sort === "rising" ||
        decoded.sort === "following" ||
        decoded.sort === "bookmarks" ||
        decoded.sort === "subscriptions"
          ? decoded.sort
          : undefined;
      return {
        createdAt: decoded.createdAt,
        id: decoded.id,
        ...(sort ? { sort } : {}),
        ...(typeof decoded.score === "number" && Number.isFinite(decoded.score)
          ? { score: decoded.score }
          : {})
      } satisfies GalleryCursor;
    }
  } catch {
    return null;
  }
  return null;
};

const randomToken = (bytes = 32) => {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return toBase64Url(buffer);
};

const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(value));
  return toBase64Url(new Uint8Array(digest));
};

const sha256Bytes = async (value: Uint8Array) =>
  new Uint8Array(await crypto.subtle.digest("SHA-256", toArrayBuffer(value)));

const concatBytes = (...chunks: Uint8Array[]) => {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
};

const base32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

const toBase32 = (bytes: Uint8Array) => {
  let output = "";
  let buffer = 0;
  let bitsLeft = 0;
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bitsLeft += 8;
    while (bitsLeft >= 5) {
      output += base32Alphabet[(buffer >> (bitsLeft - 5)) & 31];
      bitsLeft -= 5;
    }
  }
  if (bitsLeft > 0) {
    output += base32Alphabet[(buffer << (5 - bitsLeft)) & 31];
  }
  return output;
};

const fromBase32 = (value: string) => {
  const normalized = value.toUpperCase().replace(/=+$/g, "").replace(/\s+/g, "");
  let buffer = 0;
  let bitsLeft = 0;
  const bytes: number[] = [];
  for (const char of normalized) {
    const index = base32Alphabet.indexOf(char);
    if (index === -1) {
      throw new Error("Invalid base32 value");
    }
    buffer = (buffer << 5) | index;
    bitsLeft += 5;
    if (bitsLeft >= 8) {
      bytes.push((buffer >> (bitsLeft - 8)) & 255);
      bitsLeft -= 8;
    }
  }
  return new Uint8Array(bytes);
};

const constantTimeEqual = (left: Uint8Array, right: Uint8Array) => {
  if (left.length !== right.length) {
    return false;
  }
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index] ^ right[index];
  }
  return diff === 0;
};

const constantTimeStringEqual = async (left: string, right: string) => {
  const [leftDigest, rightDigest] = await Promise.all([
    crypto.subtle.digest("SHA-256", textEncoder.encode(left)),
    crypto.subtle.digest("SHA-256", textEncoder.encode(right))
  ]);
  return constantTimeEqual(new Uint8Array(leftDigest), new Uint8Array(rightDigest));
};

const hmacSha256 = async (key: string, value: string) => {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, textEncoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
};

const hmacSha1Bytes = async (key: Uint8Array, value: Uint8Array) => {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    toArrayBuffer(key),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, toArrayBuffer(value)));
};

const generateTotpSecret = () => {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return toBase32(bytes);
};

const generateNumericCode = (length = 6) => {
  const max = 10 ** length;
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(bytes[0] % max).padStart(length, "0");
};

const totpCodeForCounter = async (secretBase32: string, counter: number) => {
  const key = fromBase32(secretBase32);
  const counterBytes = new Uint8Array(8);
  const view = new DataView(counterBytes.buffer);
  view.setUint32(4, counter, false);
  const hmac = await hmacSha1Bytes(key, counterBytes);
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3];
  return String(binary % 1_000_000).padStart(6, "0");
};

const verifyTotpCode = async (secretBase32: string, code: string) => {
  const currentCounter = Math.floor(Date.now() / 1000 / 30);
  for (const drift of [-1, 0, 1]) {
    const expected = await totpCodeForCounter(secretBase32, currentCounter + drift);
    if (await constantTimeStringEqual(code, expected)) {
      return true;
    }
  }
  return false;
};

const hashPassword = async (password: string) => {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: passwordIterations
    },
    key,
    passwordKeyLengthBytes * 8
  );
  return `pbkdf2-sha256$${passwordIterations}$${toBase64Url(salt)}$${toBase64Url(new Uint8Array(bits))}`;
};

const verifyPassword = async (password: string, storedHash: string) => {
  const [algorithm, iterationsValue, saltValue, hashValue] = storedHash.split("$");
  if (algorithm !== "pbkdf2-sha256" || !iterationsValue || !saltValue || !hashValue) {
    return false;
  }

  const iterations = Number(iterationsValue);
  if (!Number.isSafeInteger(iterations) || iterations < 100_000) {
    return false;
  }

  try {
    const salt = fromBase64Url(saltValue);
    const expected = fromBase64Url(hashValue);
    if (salt.length === 0 || expected.length === 0) {
      return false;
    }
    const key = await crypto.subtle.importKey(
      "raw",
      textEncoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        hash: "SHA-256",
        salt,
        iterations
      },
      key,
      expected.length * 8
    );
    return constantTimeEqual(new Uint8Array(bits), expected);
  } catch {
    return false;
  }
};

const getCookie = (request: Request, name: string) => {
  const header = request.headers.get("cookie");
  if (!header) {
    return undefined;
  }
  for (const part of header.split(";")) {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (rawKey === name) {
      const value = rawValue.join("=");
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return undefined;
};

const secureCookieSuffix = (context: AppContext) => {
  const requestUrl = new URL(context.req.url);
  const forwardedProto = context.req.header("X-Forwarded-Proto");
  if (requestUrl.protocol === "https:" || forwardedProto === "https") {
    return "; Secure";
  }
  return "";
};

const sessionCookie = (context: AppContext, token: string, maxAge = sessionDurationSeconds) =>
  `${sessionCookieName}=${encodeURIComponent(
    token
  )}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax${secureCookieSuffix(context)}`;

const csrfCookie = (context: AppContext, nonce: string, maxAge = sessionDurationSeconds) =>
  `${csrfCookieName}=${encodeURIComponent(
    nonce
  )}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secureCookieSuffix(context)}`;

const clearSessionCookie = (context: AppContext) =>
  `${sessionCookieName}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${secureCookieSuffix(context)}`;

const clearCsrfCookie = (context: AppContext) =>
  `${csrfCookieName}=; Max-Age=0; Path=/; SameSite=Lax${secureCookieSuffix(context)}`;

const createCsrfToken = async (sessionToken: string, nonce = randomToken(24)) => ({
  nonce,
  token: `${nonce}.${await hmacSha256(sessionToken, nonce)}`
});

const issueCsrfToken = async (context: AppContext, sessionToken: string) => {
  const existingNonce = getCookie(context.req.raw, csrfCookieName);
  const nonce =
    existingNonce && /^[A-Za-z0-9_-]{24,96}$/.test(existingNonce)
      ? existingNonce
      : undefined;
  const csrf = await createCsrfToken(sessionToken, nonce);
  context.header("Set-Cookie", csrfCookie(context, csrf.nonce), { append: true });
  return csrf.token;
};

const validateCsrf = async (context: AppContext) => {
  const sessionToken = getCookie(context.req.raw, sessionCookieName);
  const nonce = getCookie(context.req.raw, csrfCookieName);
  const submitted = context.req.header(csrfHeaderName);
  if (!sessionToken || !nonce || !submitted) {
    return context.json({ message: "Security token is missing." }, 403);
  }

  const [submittedNonce, submittedSignature] = submitted.split(".");
  if (!submittedNonce || !submittedSignature || submittedNonce !== nonce) {
    return context.json({ message: "Security token is invalid." }, 403);
  }

  const expected = await createCsrfToken(sessionToken, nonce);
  if (!(await constantTimeStringEqual(submitted, expected.token))) {
    return context.json({ message: "Security token is invalid." }, 403);
  }

  return undefined;
};

const requestClientIp = (context: AppContext) => {
  const forwarded = context.req.header("CF-Connecting-IP");
  if (forwarded?.trim()) {
    return forwarded.trim();
  }
  const xForwardedFor = context.req.header("X-Forwarded-For");
  const firstForwarded = xForwardedFor?.split(",")[0]?.trim();
  if (firstForwarded) {
    return firstForwarded;
  }
  return "local";
};

const requestUserAgent = (context: AppContext) =>
  (context.req.header("User-Agent") ?? "Unknown browser").trim().slice(0, 240) ||
  "Unknown browser";

const currentSessionHash = async (context: AppContext) => {
  const sessionToken = getCookie(context.req.raw, sessionCookieName);
  return sessionToken ? sha256(sessionToken) : "";
};

const enforceRateLimit = async (
  context: AppContext,
  params: {
    action: string;
    limit: number;
    windowSeconds: number;
    userId?: string;
  }
) => {
  if (!context.env.DB) {
    return undefined;
  }

  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % params.windowSeconds);
  const subject = params.userId
    ? `user:${params.userId}`
    : `ip:${requestClientIp(context)}`;
  const identifierHash = await sha256(`${params.action}:${subject}`);

  const existing = await context.env.DB.prepare(
    `SELECT window_start, count
     FROM api_rate_limits
     WHERE identifier_hash = ?
       AND action = ?
     LIMIT 1`
  )
    .bind(identifierHash, params.action)
    .first<{ window_start: number; count: number }>();

  if (existing?.window_start === windowStart && existing.count >= params.limit) {
    const retryAfter = Math.max(1, windowStart + params.windowSeconds - now);
    context.header("Retry-After", String(retryAfter));
    return context.json(
      { message: "Too many requests. Try again later.", retryAfter },
      429
    );
  }

  const count = existing?.window_start === windowStart ? existing.count + 1 : 1;
  await context.env.DB.prepare(
    `INSERT INTO api_rate_limits (identifier_hash, action, window_start, count, updated_at)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(identifier_hash, action) DO UPDATE SET
       window_start = excluded.window_start,
       count = excluded.count,
       updated_at = CURRENT_TIMESTAMP`
  )
    .bind(identifierHash, params.action, windowStart, count)
    .run();

  return undefined;
};

const recordArtworkView = async (
  context: AppContext,
  artworkId: string,
  viewer: CurrentUser | undefined
) => {
  if (!context.env.DB) {
    return false;
  }
  const userAgent = context.req.header("User-Agent")?.slice(0, 120) ?? "";
  const subject = viewer
    ? `user:${viewer.id}`
    : `ip:${requestClientIp(context)}:${userAgent}`;
  const viewerHash = await sha256(`artwork-view:${subject}`);
  const viewedOn = new Date().toISOString().slice(0, 10);
  const result = await context.env.DB.prepare(
    `INSERT OR IGNORE INTO artwork_views (artwork_id, viewer_hash, viewed_on)
     VALUES (?, ?, ?)`
  )
    .bind(artworkId, viewerHash, viewedOn)
    .run();

  if (result.meta.changes === 0) {
    return false;
  }

  await context.env.DB.prepare(
    "UPDATE artworks SET view_count = view_count + 1 WHERE id = ?"
  )
    .bind(artworkId)
    .run();
  return true;
};

const toIsoAfterSeconds = (seconds: number) =>
  new Date(Date.now() + seconds * 1000).toISOString();

type CborValue =
  | number
  | string
  | Uint8Array
  | CborValue[]
  | Map<CborValue, CborValue>
  | boolean
  | null
  | undefined;

class CborReader {
  private offset = 0;

  constructor(private readonly bytes: Uint8Array) {}

  read(): CborValue {
    const initial = this.readByte();
    const major = initial >> 5;
    const additional = initial & 31;

    if (major === 0) {
      return this.readLength(additional);
    }
    if (major === 1) {
      return -1 - this.readLength(additional);
    }
    if (major === 2) {
      const length = this.readLength(additional);
      return this.readBytes(length);
    }
    if (major === 3) {
      const length = this.readLength(additional);
      return textDecoder.decode(this.readBytes(length));
    }
    if (major === 4) {
      const length = this.readLength(additional);
      return Array.from({ length }, () => this.read());
    }
    if (major === 5) {
      const length = this.readLength(additional);
      const map = new Map<CborValue, CborValue>();
      for (let index = 0; index < length; index += 1) {
        map.set(this.read(), this.read());
      }
      return map;
    }
    if (major === 7) {
      if (additional === 20) {
        return false;
      }
      if (additional === 21) {
        return true;
      }
      if (additional === 22) {
        return null;
      }
      if (additional === 23) {
        return undefined;
      }
    }
    throw new Error("Unsupported CBOR value");
  }

  private readByte() {
    if (this.offset >= this.bytes.length) {
      throw new Error("Unexpected end of CBOR");
    }
    const byte = this.bytes[this.offset];
    this.offset += 1;
    return byte;
  }

  private readBytes(length: number) {
    if (this.offset + length > this.bytes.length) {
      throw new Error("Unexpected end of CBOR");
    }
    const value = this.bytes.slice(this.offset, this.offset + length);
    this.offset += length;
    return value;
  }

  private readUInt(byteLength: number) {
    let value = 0;
    for (let index = 0; index < byteLength; index += 1) {
      value = value * 256 + this.readByte();
    }
    return value;
  }

  private readLength(additional: number) {
    if (additional < 24) {
      return additional;
    }
    if (additional === 24) {
      return this.readUInt(1);
    }
    if (additional === 25) {
      return this.readUInt(2);
    }
    if (additional === 26) {
      return this.readUInt(4);
    }
    if (additional === 27) {
      return this.readUInt(8);
    }
    throw new Error("Indefinite CBOR values are not supported");
  }
}

const readCbor = (bytes: Uint8Array) => new CborReader(bytes).read();

const cborMapValue = (map: Map<CborValue, CborValue>, key: number | string) => map.get(key);

const cborNumber = (value: CborValue, label: string) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} is not a CBOR number`);
  }
  return value;
};

const cborBytes = (value: CborValue, label: string) => {
  if (!(value instanceof Uint8Array)) {
    throw new Error(`${label} is not CBOR bytes`);
  }
  return value;
};

const webauthnContext = (context: AppContext) => {
  const url = new URL(context.req.url);
  return {
    origin: url.origin,
    rpId: url.hostname
  };
};

const parseAuthenticatorData = (bytes: Uint8Array) => {
  if (bytes.length < 37) {
    throw new Error("Authenticator data is too short");
  }
  return {
    rpIdHash: bytes.slice(0, 32),
    flags: bytes[32],
    signCount: new DataView(bytes.buffer, bytes.byteOffset + 33, 4).getUint32(0, false),
    attestedCredentialData: bytes.slice(37)
  };
};

const verifyAuthenticatorData = async (authenticatorData: Uint8Array, rpId: string) => {
  const parsed = parseAuthenticatorData(authenticatorData);
  const expectedRpIdHash = await sha256Bytes(textEncoder.encode(rpId));
  if (!constantTimeEqual(parsed.rpIdHash, expectedRpIdHash)) {
    throw new Error("Passkey was created for another site.");
  }
  if ((parsed.flags & 0x01) !== 0x01) {
    throw new Error("Passkey user presence was not confirmed.");
  }
  return parsed;
};

const extractAttestedCredentialData = (authenticatorData: ReturnType<typeof parseAuthenticatorData>) => {
  if ((authenticatorData.flags & 0x40) !== 0x40) {
    throw new Error("Passkey attestation is missing credential data.");
  }
  const data = authenticatorData.attestedCredentialData;
  if (data.length < 18) {
    throw new Error("Passkey credential data is incomplete.");
  }
  const credentialIdLength = new DataView(data.buffer, data.byteOffset + 16, 2).getUint16(0, false);
  const credentialIdStart = 18;
  const publicKeyStart = credentialIdStart + credentialIdLength;
  if (data.length <= publicKeyStart) {
    throw new Error("Passkey public key is missing.");
  }
  return {
    credentialId: data.slice(credentialIdStart, publicKeyStart),
    publicKeyCose: data.slice(publicKeyStart)
  };
};

const parseWebauthnClientData = (
  encodedClientData: string,
  expectedType: "webauthn.create" | "webauthn.get",
  expectedChallenge: string,
  expectedOrigin: string
) => {
  const clientDataBytes = fromBase64Url(encodedClientData);
  const clientData = JSON.parse(textDecoder.decode(clientDataBytes)) as {
    type?: unknown;
    challenge?: unknown;
    origin?: unknown;
  };
  if (clientData.type !== expectedType) {
    throw new Error("Passkey response type is invalid.");
  }
  if (clientData.challenge !== expectedChallenge) {
    throw new Error("Passkey challenge is invalid.");
  }
  if (clientData.origin !== expectedOrigin) {
    throw new Error("Passkey origin is invalid.");
  }
  return { clientData, clientDataBytes };
};

const readDerLength = (signature: Uint8Array, offset: number) => {
  let nextOffset = offset;
  let length = signature[nextOffset];
  nextOffset += 1;
  if ((length & 0x80) === 0) {
    return { length, offset: nextOffset };
  }
  const lengthBytes = length & 0x7f;
  length = 0;
  for (let index = 0; index < lengthBytes; index += 1) {
    length = (length << 8) | signature[nextOffset];
    nextOffset += 1;
  }
  return { length, offset: nextOffset };
};

const normalizeDerInteger = (value: Uint8Array, size: number) => {
  let normalized = value;
  while (normalized.length > 0 && normalized[0] === 0) {
    normalized = normalized.slice(1);
  }
  if (normalized.length > size) {
    throw new Error("ECDSA signature integer is too long.");
  }
  const result = new Uint8Array(size);
  result.set(normalized, size - normalized.length);
  return result;
};

const ecdsaDerToRawSignature = (signature: Uint8Array, size = 32) => {
  let offset = 0;
  if (signature[offset] !== 0x30) {
    throw new Error("ECDSA signature is not DER encoded.");
  }
  offset += 1;
  const sequence = readDerLength(signature, offset);
  offset = sequence.offset;
  if (offset + sequence.length !== signature.length) {
    throw new Error("ECDSA signature length is invalid.");
  }
  if (signature[offset] !== 0x02) {
    throw new Error("ECDSA signature is missing r.");
  }
  offset += 1;
  const rLength = readDerLength(signature, offset);
  offset = rLength.offset;
  const r = signature.slice(offset, offset + rLength.length);
  offset += rLength.length;
  if (signature[offset] !== 0x02) {
    throw new Error("ECDSA signature is missing s.");
  }
  offset += 1;
  const sLength = readDerLength(signature, offset);
  offset = sLength.offset;
  const s = signature.slice(offset, offset + sLength.length);
  return concatBytes(normalizeDerInteger(r, size), normalizeDerInteger(s, size));
};

const importCosePublicKey = async (publicKeyCose: Uint8Array) => {
  const cose = readCbor(publicKeyCose);
  if (!(cose instanceof Map)) {
    throw new Error("Passkey public key is invalid.");
  }
  const keyType = cborNumber(cborMapValue(cose, 1), "COSE key type");
  const algorithm = cborNumber(cborMapValue(cose, 3), "COSE algorithm");
  if (keyType === 2 && algorithm === -7) {
    const curve = cborNumber(cborMapValue(cose, -1), "COSE curve");
    if (curve !== 1) {
      throw new Error("Only P-256 passkeys are supported.");
    }
    const x = cborBytes(cborMapValue(cose, -2), "COSE x coordinate");
    const y = cborBytes(cborMapValue(cose, -3), "COSE y coordinate");
    return {
      kind: "ec" as const,
      key: await crypto.subtle.importKey(
        "jwk",
        {
          kty: "EC",
          crv: "P-256",
          x: toBase64Url(x),
          y: toBase64Url(y),
          ext: true
        },
        { name: "ECDSA", namedCurve: "P-256" },
        false,
        ["verify"]
      )
    };
  }
  if (keyType === 3 && algorithm === -257) {
    const n = cborBytes(cborMapValue(cose, -1), "COSE RSA modulus");
    const e = cborBytes(cborMapValue(cose, -2), "COSE RSA exponent");
    return {
      kind: "rsa" as const,
      key: await crypto.subtle.importKey(
        "jwk",
        {
          kty: "RSA",
          n: toBase64Url(n),
          e: toBase64Url(e),
          ext: true
        },
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["verify"]
      )
    };
  }
  throw new Error("Passkey algorithm is not supported.");
};

const verifyCoseSignature = async (params: {
  publicKeyCose: Uint8Array;
  signature: Uint8Array;
  signedData: Uint8Array;
}) => {
  const imported = await importCosePublicKey(params.publicKeyCose);
  if (imported.kind === "ec") {
    if (
      await crypto.subtle.verify(
        { name: "ECDSA", hash: "SHA-256" },
        imported.key,
        toArrayBuffer(params.signature),
        toArrayBuffer(params.signedData)
      )
    ) {
      return true;
    }
    return crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      imported.key,
      toArrayBuffer(ecdsaDerToRawSignature(params.signature)),
      toArrayBuffer(params.signedData)
    );
  }
  return crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    imported.key,
    toArrayBuffer(params.signature),
    toArrayBuffer(params.signedData)
  );
};

const asSortMode = (value: string | null): SortMode => {
  if (
    value === "latest" ||
    value === "popular" ||
    value === "rising" ||
    value === "following" ||
    value === "bookmarks" ||
    value === "subscriptions"
  ) {
    return value;
  }
  return "latest";
};

const asTagPageSort = (value: string | null | undefined): TagPageSort => {
  if (value === "popular" || value === "rising") {
    return value;
  }
  return "latest";
};

const asFollowListMode = (value: string | null | undefined): FollowListMode =>
  value === "following" ? "following" : "followers";

const asCollectionDiscoverySort = (
  value: string | null | undefined
): CollectionDiscoverySort => (value === "largest" ? "largest" : "updated");

const asCreatorDiscoverySort = (
  value: string | null | undefined
): CreatorDiscoverySort =>
  value === "active" || value === "newest" ? value : "popular";

const asRankingPeriod = (value: string | null | undefined): RankingPeriod =>
  value === "weekly" ? "weekly" : "daily";

const tagCounts = (artworks: Artwork[]) => {
  const counts = new Map<string, number>();
  for (const artwork of artworks) {
    for (const tag of artwork.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
};

const decodeTagValue = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const normalizeTagName = (value: string) =>
  decodeTagValue(value)
    .replace(/^#/, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const isValidTagName = (tag: string) =>
  tag.length > 0 && tag.length <= maxTagLength && !/[<>/]/.test(tag);

const uniqueTags = (tags: string[], limit = maxExpandedArtworkTags) => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const rawTag of tags) {
    const tag = normalizeTagName(rawTag);
    if (!isValidTagName(tag) || seen.has(tag)) {
      continue;
    }
    seen.add(tag);
    result.push(tag);
    if (result.length >= limit) {
      break;
    }
  }
  return result;
};

const parseTagInput = (value: string) =>
  uniqueTags(value.split(","), maxExplicitArtworkTags);

const aliasFromRow = (row: TagAliasRow): TagAlias => ({
  sourceTag: row.source_tag,
  targetTag: row.target_tag,
  createdAt: row.created_at
});

const implicationFromRow = (row: TagImplicationRow): TagImplication => ({
  sourceTag: row.source_tag,
  targetTag: row.target_tag,
  createdAt: row.created_at
});

const resolveTagAliases = async (db: D1Database, tags: string[]) => {
  let current = uniqueTags(tags);
  for (let depth = 0; depth < 5 && current.length > 0; depth += 1) {
    const placeholders = current.map(() => "?").join(", ");
    const rows = await db
      .prepare(
        `SELECT source_tag, target_tag
         FROM tag_aliases
         WHERE source_tag IN (${placeholders})`
      )
      .bind(...current)
      .all<{ source_tag: string; target_tag: string }>();
    if (rows.results.length === 0) {
      break;
    }
    const aliasMap = new Map(
      rows.results.map((row) => [row.source_tag, row.target_tag])
    );
    let changed = false;
    current = uniqueTags(
      current.map((tag) => {
        const target = aliasMap.get(tag);
        if (target && target !== tag) {
          changed = true;
          return target;
        }
        return tag;
      })
    );
    if (!changed) {
      break;
    }
  }
  return current;
};

const expandImpliedTags = async (db: D1Database, tags: string[]) => {
  const seen = new Set(uniqueTags(tags));
  let frontier = Array.from(seen);
  for (
    let depth = 0;
    depth < 5 && frontier.length > 0 && seen.size < maxExpandedArtworkTags;
    depth += 1
  ) {
    const placeholders = frontier.map(() => "?").join(", ");
    const rows = await db
      .prepare(
        `SELECT target_tag
         FROM tag_implications
         WHERE source_tag IN (${placeholders})
         ORDER BY target_tag`
      )
      .bind(...frontier)
      .all<{ target_tag: string }>();
    const next: string[] = [];
    for (const row of rows.results) {
      const tag = normalizeTagName(row.target_tag);
      if (!isValidTagName(tag) || seen.has(tag)) {
        continue;
      }
      seen.add(tag);
      next.push(tag);
      if (seen.size >= maxExpandedArtworkTags) {
        break;
      }
    }
    frontier = next;
  }
  return Array.from(seen);
};

const canonicalizeArtworkTags = async (db: D1Database, tags: string[]) => {
  const explicitTags = uniqueTags(tags, maxExplicitArtworkTags);
  const seedTags = explicitTags.length > 0 ? explicitTags : ["original"];
  const aliasedTags = await resolveTagAliases(db, seedTags);
  const expandedTags = await expandImpliedTags(db, aliasedTags);
  return expandedTags.length > 0 ? expandedTags : ["original"];
};

const canonicalizeSingleTag = async (db: D1Database, value: string) => {
  const [tag] = await resolveTagAliases(db, uniqueTags([value], 1));
  return tag ?? "";
};

const artworkTagInsertStatements = (db: D1Database, artworkId: string, tags: string[]) =>
  tags.map((tag) =>
    db
      .prepare("INSERT OR IGNORE INTO artwork_tags (artwork_id, tag) VALUES (?, ?)")
      .bind(artworkId, tag)
  );

const replaceArtworkTags = async (db: D1Database, artworkId: string, tags: string[]) => {
  await db.batch([
    db.prepare("DELETE FROM artwork_tags WHERE artwork_id = ?").bind(artworkId),
    ...artworkTagInsertStatements(db, artworkId, tags)
  ]);
};

const reindexArtworkTags = async (db: D1Database) => {
  const rows = await db
    .prepare("SELECT id, tags_json FROM artworks ORDER BY datetime(created_at) DESC")
    .all<{ id: string; tags_json: string }>();

  for (const row of rows.results) {
    const tags = await canonicalizeArtworkTags(db, parseTags(row.tags_json));
    await db.batch([
      db.prepare("UPDATE artworks SET tags_json = ? WHERE id = ?").bind(
        JSON.stringify(tags),
        row.id
      ),
      db.prepare("DELETE FROM artwork_tags WHERE artwork_id = ?").bind(row.id),
      ...artworkTagInsertStatements(db, row.id, tags)
    ]);
    await upsertArtworkSearchIndex(db, row.id);
  }
};

const getAdminTags = async (db: D1Database): Promise<AdminTagsResponse> => {
  const [aliases, implications, topTags] = await Promise.all([
    db
      .prepare(
        `SELECT source_tag, target_tag, created_at
         FROM tag_aliases
         ORDER BY source_tag
         LIMIT 100`
      )
      .all<TagAliasRow>(),
    db
      .prepare(
        `SELECT source_tag, target_tag, created_at
         FROM tag_implications
         ORDER BY source_tag, target_tag
         LIMIT 100`
      )
      .all<TagImplicationRow>(),
    db
      .prepare(
        `SELECT tag, COUNT(*) AS count
         FROM artwork_tags
         GROUP BY tag
         ORDER BY count DESC, tag
         LIMIT 30`
      )
      .all<TagCountRow>()
  ]);

  return {
    aliases: aliases.results.map(aliasFromRow),
    implications: implications.results.map(implicationFromRow),
    topTags: topTags.results.map((row) => ({ name: row.tag, count: row.count }))
  };
};

const ftsQueryFromSearch = (search: string) => {
  const terms = search
    .trim()
    .split(/\s+/)
    .map((term) => term.replace(/[^\p{L}\p{N}_-]/gu, ""))
    .filter((term) => term.length > 0)
    .slice(0, 8);
  if (terms.length === 0) {
    return "";
  }
  return terms.map((term) => `"${term.replaceAll('"', '""')}"*`).join(" ");
};

const searchArtworkIds = async (db: D1Database, search: string) => {
  const query = ftsQueryFromSearch(search);
  if (!query) {
    return undefined;
  }
  try {
    const result = await db
      .prepare(
        `SELECT artwork_id
         FROM artwork_search
         WHERE artwork_search MATCH ?
         LIMIT 500`
      )
      .bind(query)
      .all<{ artwork_id: string }>();
    return new Set(result.results.map((row) => row.artwork_id));
  } catch (error) {
    console.warn("Unable to search artwork index", error);
    return undefined;
  }
};

const artworkIdsForTag = async (db: D1Database, tag: string) => {
  if (!tag) {
    return undefined;
  }
  try {
    const result = await db
      .prepare(
        `SELECT artwork_id
         FROM artwork_tags
         WHERE tag = ?
         LIMIT 500`
      )
      .bind(tag)
      .all<{ artwork_id: string }>();
    return new Set(result.results.map((row) => row.artwork_id));
  } catch (error) {
    console.warn("Unable to read indexed tag matches", error);
    return undefined;
  }
};

const artworkSearchInsertStatement = (
  db: D1Database,
  params: {
    artworkId: string;
    title: string;
    caption: string;
    tags: string[];
    creator: string;
  }
) =>
  db
    .prepare(
      `INSERT INTO artwork_search (artwork_id, title, caption, tags, creator)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(
      params.artworkId,
      params.title,
      params.caption,
      params.tags.join(" "),
      params.creator
    );

const upsertArtworkSearchIndex = async (db: D1Database, artworkId: string) => {
  const row = await db
    .prepare(
      `SELECT
        artworks.id,
        artworks.title,
        artworks.caption,
        artworks.tags_json,
        creators.display_name,
        creators.handle
       FROM artworks
       JOIN creators ON creators.id = artworks.creator_id
       WHERE artworks.id = ?
       LIMIT 1`
    )
    .bind(artworkId)
    .first<{
      id: string;
      title: string;
      caption: string;
      tags_json: string;
      display_name: string;
      handle: string;
    }>();
  if (!row) {
    return;
  }

  await db.batch([
    db.prepare("DELETE FROM artwork_search WHERE artwork_id = ?").bind(artworkId),
    artworkSearchInsertStatement(db, {
      artworkId,
      title: row.title,
      caption: row.caption,
      tags: parseTags(row.tags_json),
      creator: `${row.display_name} ${row.handle}`
    })
  ]);
};

const reindexCreatorSearchIndex = async (db: D1Database, creatorId: string) => {
  const rows = await db
    .prepare("SELECT id FROM artworks WHERE creator_id = ?")
    .bind(creatorId)
    .all<{ id: string }>();
  for (const row of rows.results) {
    await upsertArtworkSearchIndex(db, row.id);
  }
};

const getPublicArtworkReviewEnabled = async (db: D1Database) => {
  try {
    const row = await db
      .prepare("SELECT value FROM platform_settings WHERE key = ? LIMIT 1")
      .bind(publicArtworkReviewSettingKey)
      .first<{ value: string }>();
    return row?.value === "true";
  } catch (error) {
    console.warn("Unable to read public artwork review setting", error);
    return false;
  }
};

const setPublicArtworkReviewEnabled = async (db: D1Database, enabled: boolean) => {
  await db
    .prepare(
      `INSERT INTO platform_settings (key, value, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = CURRENT_TIMESTAMP`
    )
    .bind(publicArtworkReviewSettingKey, enabled ? "true" : "false")
    .run();
};

const getPendingArtworkReviewCount = async (db: D1Database) => {
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS count
       FROM artworks
       WHERE hidden_at IS NULL
         AND COALESCE(review_status, 'approved') = 'pending'`
    )
    .first<{ count: number }>();
  return row?.count ?? 0;
};

const artworkReviewStatusForUpload = (
  visibility: ArtworkVisibility,
  user: CurrentUser,
  publicArtworkReviewEnabled: boolean
): ArtworkReviewStatus =>
  publicArtworkReviewEnabled && visibility === "public" && !isStaffRole(user.role)
    ? "pending"
    : "approved";

const getSubscribedTags = async (db: D1Database, userId: string | undefined) => {
  if (!userId) {
    return new Set<string>();
  }
  try {
    const result = await db
      .prepare(
        `SELECT tag
         FROM tag_subscriptions
         WHERE user_id = ?
         ORDER BY tag`
      )
      .bind(userId)
      .all<{ tag: string }>();
    return new Set(result.results.map((row) => row.tag));
  } catch (error) {
    console.warn("Unable to read tag subscriptions", error);
    return new Set<string>();
  }
};

const getMutedTags = async (db: D1Database, userId: string | undefined) => {
  if (!userId) {
    return [];
  }
  try {
    const result = await db
      .prepare(
        `SELECT tag
         FROM user_muted_tags
         WHERE user_id = ?
         ORDER BY tag`
      )
      .bind(userId)
      .all<{ tag: string }>();
    return result.results.map((row) => row.tag);
  } catch (error) {
    console.warn("Unable to read muted tags", error);
    return [];
  }
};

const filterAndSort = (
  artworks: Artwork[],
  search: string,
  tag: string,
  rating: MatureFilter,
  sort: SortMode,
  subscribedTags = new Set<string>()
) => {
  let result = [...artworks];
  const normalizedSearch = search.trim().toLowerCase();
  const normalizedTag = tag.trim().toLowerCase();

  if (normalizedSearch) {
    result = result.filter((artwork) => {
      const haystack = [
        artwork.title,
        artwork.caption,
        artwork.creator.displayName,
        artwork.creator.handle,
        ...artwork.tags
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }

  if (normalizedTag) {
    result = result.filter((artwork) =>
      artwork.tags.some((artworkTag) => artworkTag.toLowerCase() === normalizedTag)
    );
  }

  if (rating !== "all") {
    result = result.filter((artwork) => artwork.matureRating === rating);
  }

  if (sort === "bookmarks") {
    return result
      .filter((artwork) => artwork.bookmarked)
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      );
  }

  if (sort === "subscriptions") {
    return result
      .filter((artwork) =>
        artwork.tags.some((artworkTag) => subscribedTags.has(artworkTag.toLowerCase()))
      )
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      );
  }

  if (sort === "popular") {
    return result.sort((left, right) => right.likeCount - left.likeCount);
  }

  if (sort === "rising") {
    return result.sort(
      (left, right) =>
        right.likeCount / Math.max(1, right.viewCount) -
        left.likeCount / Math.max(1, left.viewCount)
    );
  }

  if (sort === "following") {
    return result
      .filter((artwork) => artwork.creator.following)
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      );
  }

  return result.sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
};

type ArtworkRow = {
  id: string;
  title: string;
  caption: string;
  image_url: string;
  thumbnail_url: string;
  width: number;
  height: number;
  dominant_color: string;
  tags_json: string;
  like_count: number;
  bookmark_count: number;
  view_count: number;
  comment_count: number;
  created_at: string;
  mature: number;
  mature_rating: string | null;
  visibility: string | null;
  review_status: string | null;
  creator_id: string;
  creator_handle: string;
  creator_display_name: string;
  creator_avatar_url: string;
  creator_bio: string;
  creator_follower_count: number;
  creator_following: number;
  creator_profile_visibility: string;
};

type ArtworkImageRow = {
  id: string;
  artwork_id: string;
  image_url: string;
  thumbnail_url: string;
  width: number;
  height: number;
  dominant_color: string;
  position: number;
  created_at: string;
};

type CommentRow = {
  id: string;
  user_id: string | null;
  author: string;
  body: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string | null;
};

type ModerationReportRow = {
  id: string;
  reporter_user_id: string;
  reporter_display_name: string | null;
  target_type: string;
  target_id: string;
  target_label: string | null;
  reason: string;
  details: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
};

type AdminAuditLogRow = {
  id: string;
  admin_user_id: string;
  admin_username: string;
  admin_display_name: string;
  action: string;
  target_type: string;
  target_id: string;
  summary: string;
  metadata_json: string;
  created_at: string;
};

type NotificationRow = {
  id: string;
  type: string;
  message: string;
  actor_user_id: string | null;
  actor_username: string | null;
  actor_display_name: string | null;
  actor_avatar_url: string | null;
  artwork_id: string | null;
  comment_id: string | null;
  read_at: string | null;
  created_at: string;
};

type NotificationPreferencesRow = {
  likes_enabled: number;
  comments_enabled: number;
  follows_enabled: number;
  moderation_enabled: number;
};

type CollectionRow = {
  id: string;
  name: string;
  description: string | null;
  visibility: string | null;
  item_count: number;
  artwork_ids: string | null;
  cover_artwork_id: string | null;
  created_at: string;
  updated_at: string | null;
};

type CollectionDetailRow = CollectionRow & {
  creator_id: string;
  creator_handle: string;
  creator_display_name: string;
  creator_avatar_url: string | null;
  creator_bio: string | null;
  creator_follower_count: number | null;
  creator_following: number | null;
  creator_profile_visibility: string;
  creator_suspended_at: string | null;
};

type CollectionPreviewRow = {
  collection_id: string;
  artwork_id: string;
  title: string;
  image_url: string;
  thumbnail_url: string;
  dominant_color: string;
};

type ArtworkSeriesRow = {
  id: string;
  title: string;
  description: string | null;
  visibility: string | null;
  item_count: number;
  artwork_ids: string | null;
  cover_artwork_id: string | null;
  created_at: string;
  updated_at: string | null;
};

type ArtworkSeriesDetailRow = ArtworkSeriesRow & {
  creator_id: string;
  creator_handle: string;
  creator_display_name: string;
  creator_avatar_url: string | null;
  creator_bio: string | null;
  creator_follower_count: number | null;
  creator_following: number | null;
  creator_profile_visibility: string;
  creator_suspended_at: string | null;
};

type ArtworkSeriesPreviewRow = {
  series_id: string;
  artwork_id: string;
  title: string;
  image_url: string;
  thumbnail_url: string;
  dominant_color: string;
};

type ActivityEventRow = {
  id: string;
  actor_user_id: string;
  actor_username: string;
  actor_display_name: string;
  actor_avatar_url: string | null;
  actor_profile_visibility: string;
  type: string;
  artwork_id: string | null;
  comment_id: string | null;
  target_user_id: string | null;
  target_username: string | null;
  target_display_name: string | null;
  target_avatar_url: string | null;
  target_profile_visibility: string | null;
  message: string;
  created_at: string;
};

type TagAliasRow = {
  source_tag: string;
  target_tag: string;
  created_at: string;
};

type TagImplicationRow = {
  source_tag: string;
  target_tag: string;
  created_at: string;
};

type TagCountRow = {
  tag: string;
  count: number;
};

type UserRow = {
  id: string;
  email: string;
  username: string;
  display_name: string;
  password_hash: string;
  role: string;
  email_verified_at: string | null;
  date_of_birth: string | null;
  mature_content_enabled: number;
  bookmark_default_visibility: string;
  profile_visibility: string;
  suspended_at?: string | null;
  suspended_reason?: string | null;
  site_credits?: number | null;
  storage_bonus_credits?: number | null;
  storage_last_login_credit_date?: string | null;
  storage_used_images?: number | null;
  created_at: string;
  updated_at: string;
};

type TotpCredentialRow = {
  user_id: string;
  secret_base32: string;
  enabled_at: string | null;
};

type EmailMfaSettingsRow = {
  user_id: string;
  enabled_at: string;
};

type MfaChallengeRow = {
  id: string;
  user_id: string;
  email_code_hash: string | null;
  client_ip_hash: string;
  user_agent: string;
};

type PasskeyRow = {
  id: string;
  user_id: string;
  credential_id: string;
  name: string;
  public_key_cose: string;
  sign_count: number;
  transports: string;
  created_at: string;
  last_used_at: string | null;
};

type WebauthnChallengeRow = {
  id: string;
  user_id: string | null;
};

type CurrentUser = AuthUser & {
  dateOfBirth: string | null;
  matureContentEnabled: boolean;
  bookmarkDefaultVisibility: BookmarkVisibility;
  profileVisibility: ProfileVisibility;
  createdAt: string;
};

type ProfileUserRow = UserRow & {
  avatar_url: string | null;
  website_url: string | null;
  bio: string | null;
  follower_count: number | null;
  following: number | null;
};

type BlockedUserRow = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  blocked_at: string;
};

type CreatorDiscoveryRow = {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  follower_count: number;
  following: number;
  created_at: string;
  artwork_count: number;
  latest_artwork_at: string | null;
};

type CreatorAnalyticsArtworkRow = ArtworkRow & {
  views_7d: number | null;
};

type DailyAnalyticsRow = {
  day: string;
  count: number;
};

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
};

const parseTags = (value: string) => {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((tag): tag is string => typeof tag === "string");
    }
  } catch {
    return [];
  }
  return [];
};

const asMatureRating = (value: string | null | undefined): MatureRating => {
  if (value === "adult" || value === "restricted") {
    return value;
  }
  return "general";
};

const asMatureFilter = (value: string | null | undefined): MatureFilter => {
  if (value === "adult" || value === "restricted" || value === "general") {
    return value;
  }
  return "all";
};

const asArtworkVisibility = (value: string | null | undefined): ArtworkVisibility => {
  if (value === "private" || value === "unlisted") {
    return value;
  }
  return "public";
};

const matureRatingLabelForMeta = (rating: MatureRating) =>
  rating === "adult" ? "Adult" : rating === "restricted" ? "Restricted" : "General";

const asReportStatus = (value: string | null | undefined): ReportStatus => {
  if (value === "resolved" || value === "dismissed") {
    return value;
  }
  return "open";
};

const asReportReason = (value: string | null | undefined): ReportReason => {
  if (
    value === "spam" ||
    value === "abuse" ||
    value === "illegal" ||
    value === "copyright"
  ) {
    return value;
  }
  return "other";
};

const asReportTargetType = (value: string | null | undefined): ReportTargetType => {
  if (value === "comment" || value === "user") {
    return value;
  }
  return "artwork";
};

const asAdminReportTargetFilter = (
  value: string | null | undefined
): AdminReportTargetFilter =>
  value === "artwork" || value === "comment" || value === "user" ? value : "all";

const asAdminReportReasonFilter = (
  value: string | null | undefined
): AdminReportReasonFilter =>
  value === "spam" ||
  value === "abuse" ||
  value === "illegal" ||
  value === "copyright" ||
  value === "other"
    ? value
    : "all";

const asAdminUserStatusFilter = (
  value: string | null | undefined
): AdminUserStatusFilter =>
  value === "active" ||
  value === "suspended" ||
  value === "unverified" ||
  value === "moderator" ||
  value === "admin"
    ? value
    : "all";

const asNotificationType = (value: string | null | undefined): NotificationType => {
  if (value === "comment" || value === "follow" || value === "moderation") {
    return value;
  }
  return "like";
};

const asCollectionVisibility = (value: string | null | undefined): CollectionVisibility =>
  value === "public" ? "public" : "private";

const asSeriesVisibility = (value: string | null | undefined): SeriesVisibility =>
  value === "public" ? "public" : "private";

const asActivityType = (value: string | null | undefined): ActivityType => {
  if (value === "like" || value === "comment" || value === "follow") {
    return value;
  }
  return "publish";
};

const reportFromRow = (row: ModerationReportRow): ModerationReport => ({
  id: row.id,
  targetType: asReportTargetType(row.target_type),
  targetId: row.target_id,
  targetLabel: row.target_label ?? row.target_id,
  reporter: row.reporter_display_name ?? "Unknown user",
  reason: asReportReason(row.reason),
  details: row.details,
  status: asReportStatus(row.status),
  createdAt: row.created_at,
  resolvedAt: row.resolved_at
});

const safeJsonRecord = (value: string) => {
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
};

const adminAuditLogFromRow = (row: AdminAuditLogRow): AdminAuditLogEntry => ({
  id: row.id,
  admin: {
    id: row.admin_user_id,
    username: row.admin_username,
    displayName: row.admin_display_name
  },
  action: row.action,
  targetType: row.target_type,
  targetId: row.target_id,
  summary: row.summary,
  metadata: safeJsonRecord(row.metadata_json),
  createdAt: row.created_at
});

const notificationFromRow = (row: NotificationRow): UserNotification => ({
  id: row.id,
  type: asNotificationType(row.type),
  message: row.message,
  actor: row.actor_user_id
    ? {
        id: row.actor_user_id,
        username: row.actor_username ?? "",
        displayName: row.actor_display_name ?? "Unknown user",
        avatarUrl: row.actor_avatar_url ?? ""
      }
    : null,
  artworkId: row.artwork_id,
  commentId: row.comment_id,
  readAt: row.read_at,
  createdAt: row.created_at
});

const collectionFromRow = (row: CollectionRow): UserCollection => ({
  id: row.id,
  name: row.name,
  description: row.description ?? "",
  visibility: asCollectionVisibility(row.visibility),
  itemCount: row.item_count,
  artworkIds: row.artwork_ids ? row.artwork_ids.split(",").filter(Boolean) : [],
  coverArtworkId: row.cover_artwork_id ?? null,
  previewArtworks: [],
  createdAt: row.created_at,
  updatedAt: row.updated_at ?? row.created_at
});

const collectionOwnerFromRow = (row: CollectionDetailRow): Creator => ({
  id: row.creator_id,
  handle: row.creator_handle,
  displayName: row.creator_display_name,
  avatarUrl: row.creator_avatar_url ?? "",
  bio: row.creator_bio ?? "",
  followerCount: row.creator_follower_count ?? 0,
  following: false
});

const seriesFromRow = (row: ArtworkSeriesRow): ArtworkSeries => ({
  id: row.id,
  title: row.title,
  description: row.description ?? "",
  visibility: asSeriesVisibility(row.visibility),
  itemCount: row.item_count,
  artworkIds: row.artwork_ids ? row.artwork_ids.split(",").filter(Boolean) : [],
  coverArtworkId: row.cover_artwork_id ?? null,
  previewArtworks: [],
  createdAt: row.created_at,
  updatedAt: row.updated_at ?? row.created_at
});

const seriesOwnerFromRow = (row: ArtworkSeriesDetailRow): Creator => ({
  id: row.creator_id,
  handle: row.creator_handle,
  displayName: row.creator_display_name,
  avatarUrl: row.creator_avatar_url ?? "",
  bio: row.creator_bio ?? "",
  followerCount: row.creator_follower_count ?? 0,
  following: false
});

const encodeCollectionCursor = (
  collectionId: string,
  item: { createdAt: string; id: string }
) =>
  toBase64Url(
    textEncoder.encode(
      JSON.stringify({
        v: 1,
        collectionId,
        createdAt: item.createdAt,
        id: item.id
      })
    )
  );

const decodeCollectionCursor = (value: string | null | undefined, collectionId: string) => {
  const rawValue = value?.trim();
  if (!rawValue) {
    return undefined;
  }
  try {
    const decoded = JSON.parse(textDecoder.decode(fromBase64Url(rawValue))) as {
      v?: unknown;
      collectionId?: unknown;
      createdAt?: unknown;
      id?: unknown;
    };
    if (
      decoded.v === 1 &&
      decoded.collectionId === collectionId &&
      typeof decoded.createdAt === "string" &&
      typeof decoded.id === "string" &&
      decoded.createdAt.length > 0 &&
      decoded.id.length > 0
    ) {
      return {
        createdAt: decoded.createdAt,
        id: decoded.id
      };
    }
  } catch {
    return null;
  }
  return null;
};

const encodeSeriesCursor = (seriesId: string, item: { position: number; id: string }) =>
  toBase64Url(
    textEncoder.encode(
      JSON.stringify({
        v: 1,
        seriesId,
        position: item.position,
        id: item.id
      })
    )
  );

const decodeSeriesCursor = (value: string | null | undefined, seriesId: string) => {
  const rawValue = value?.trim();
  if (!rawValue) {
    return undefined;
  }
  try {
    const decoded = JSON.parse(textDecoder.decode(fromBase64Url(rawValue))) as {
      v?: unknown;
      seriesId?: unknown;
      position?: unknown;
      id?: unknown;
    };
    if (
      decoded.v === 1 &&
      decoded.seriesId === seriesId &&
      typeof decoded.position === "number" &&
      Number.isSafeInteger(decoded.position) &&
      decoded.position >= 0 &&
      typeof decoded.id === "string" &&
      decoded.id.length > 0
    ) {
      return {
        position: decoded.position,
        id: decoded.id
      } satisfies SeriesCursor;
    }
  } catch {
    return null;
  }
  return null;
};

const encodeCollectionDiscoveryCursor = (
  sort: CollectionDiscoverySort,
  query: string,
  item: { updatedAt: string; id: string; itemCount: number }
) =>
  toBase64Url(
    textEncoder.encode(
      JSON.stringify({
        v: 1,
        scope: "collections",
        sort,
        query,
        updatedAt: item.updatedAt,
        id: item.id,
        ...(sort === "largest" ? { itemCount: item.itemCount } : {})
      })
    )
  );

const decodeCollectionDiscoveryCursor = (value: string | null | undefined) => {
  const rawValue = value?.trim();
  if (!rawValue) {
    return undefined;
  }
  try {
    const decoded = JSON.parse(textDecoder.decode(fromBase64Url(rawValue))) as {
      v?: unknown;
      scope?: unknown;
      sort?: unknown;
      query?: unknown;
      updatedAt?: unknown;
      id?: unknown;
      itemCount?: unknown;
    };
    if (
      decoded.v === 1 &&
      decoded.scope === "collections" &&
      typeof decoded.updatedAt === "string" &&
      typeof decoded.id === "string" &&
      decoded.updatedAt.length > 0 &&
      decoded.id.length > 0
    ) {
      const sort = asCollectionDiscoverySort(
        typeof decoded.sort === "string" ? decoded.sort : undefined
      );
      return {
        updatedAt: decoded.updatedAt,
        id: decoded.id,
        sort,
        query: typeof decoded.query === "string" ? decoded.query : "",
        ...(typeof decoded.itemCount === "number" && Number.isFinite(decoded.itemCount)
          ? { itemCount: decoded.itemCount }
          : {})
      } satisfies CollectionDiscoveryCursor;
    }
  } catch {
    return null;
  }
  return null;
};

const encodeCreatorDiscoveryCursor = (
  sort: CreatorDiscoverySort,
  query: string,
  item: {
    createdAt: string;
    id: string;
    followerCount: number;
    latestArtworkAt: string | null;
  }
) =>
  toBase64Url(
    textEncoder.encode(
      JSON.stringify({
        v: 1,
        scope: "creators",
        sort,
        query,
        createdAt: item.createdAt,
        id: item.id,
        ...(sort === "popular" ? { followerCount: item.followerCount } : {}),
        ...(sort === "active" ? { latestArtworkAt: item.latestArtworkAt ?? item.createdAt } : {})
      })
    )
  );

const decodeCreatorDiscoveryCursor = (value: string | null | undefined) => {
  const rawValue = value?.trim();
  if (!rawValue) {
    return undefined;
  }
  try {
    const decoded = JSON.parse(textDecoder.decode(fromBase64Url(rawValue))) as {
      v?: unknown;
      scope?: unknown;
      sort?: unknown;
      query?: unknown;
      createdAt?: unknown;
      id?: unknown;
      followerCount?: unknown;
      latestArtworkAt?: unknown;
    };
    if (
      decoded.v === 1 &&
      decoded.scope === "creators" &&
      typeof decoded.createdAt === "string" &&
      typeof decoded.id === "string" &&
      decoded.createdAt.length > 0 &&
      decoded.id.length > 0
    ) {
      const sort = asCreatorDiscoverySort(
        typeof decoded.sort === "string" ? decoded.sort : undefined
      );
      return {
        createdAt: decoded.createdAt,
        id: decoded.id,
        sort,
        query: typeof decoded.query === "string" ? decoded.query : "",
        ...(typeof decoded.followerCount === "number" && Number.isFinite(decoded.followerCount)
          ? { followerCount: decoded.followerCount }
          : {}),
        ...(typeof decoded.latestArtworkAt === "string" && decoded.latestArtworkAt
          ? { latestArtworkAt: decoded.latestArtworkAt }
          : {})
      } satisfies CreatorDiscoveryCursor;
    }
  } catch {
    return null;
  }
  return null;
};

const activityActorFromRow = (
  row: Pick<
    ActivityEventRow,
    "actor_user_id" | "actor_username" | "actor_display_name" | "actor_avatar_url"
  >
) => ({
  id: row.actor_user_id,
  username: row.actor_username,
  displayName: row.actor_display_name,
  avatarUrl: row.actor_avatar_url ?? ""
});

const activityTargetUserFromRow = (row: ActivityEventRow) =>
  row.target_user_id
    ? {
        id: row.target_user_id,
        username: row.target_username ?? "",
        displayName: row.target_display_name ?? "Unknown user",
        avatarUrl: row.target_avatar_url ?? ""
      }
    : null;

const artworkIsMature = (artwork: Pick<Artwork, "matureRating" | "mature">) =>
  artwork.mature || artwork.matureRating !== "general";

const mediaKeyFromUrl = (url: string) => {
  try {
    const pathname = new URL(url, "https://nehub.local").pathname;
    const prefixes = ["/media/", "/media-thumbnail/", "/media-preview/"];
    const prefix = prefixes.find((item) => pathname.startsWith(item));
    const directKey = pathname.replace(/^\/+/, "");
    const key = prefix
      ? pathname.slice(prefix.length)
      : directKey.startsWith("artworks/")
        ? directKey
        : "";
    return (key.startsWith("artworks/") || key.startsWith("profiles/")) && !key.includes("..")
      ? key
      : "";
  } catch {
    return "";
  }
};

const configuredArtworkMediaBaseUrl = (env?: Partial<ArtworkMediaEnv>) =>
  (env?.PUBLIC_ARTWORK_MEDIA_URL ?? defaultArtworkMediaBaseUrl).trim().replace(/\/+$/, "");

const artworkMediaUrl = (key: string, env?: Partial<ArtworkMediaEnv>) => {
  const baseUrl = configuredArtworkMediaBaseUrl(env);
  const safeKey = key.replace(/^\/+/, "");
  return baseUrl ? `${baseUrl}/${safeKey}` : `/media/${safeKey}`;
};

const normalizedArtworkImageUrl = (url: string, env?: Partial<ArtworkMediaEnv>) => {
  const key = mediaKeyFromUrl(url);
  return key.startsWith("artworks/") ? artworkMediaUrl(key, env) : url;
};

const mediaThumbnailUrl = (url: string) => {
  const key = mediaKeyFromUrl(url);
  return key ? `/media-thumbnail/${key}` : url;
};

const imageFromRow = (row: ArtworkImageRow, env?: Partial<ArtworkMediaEnv>): ArtworkImage => ({
  id: row.id,
  imageUrl: normalizedArtworkImageUrl(row.image_url, env),
  thumbnailUrl: mediaThumbnailUrl(row.image_url || row.thumbnail_url),
  width: row.width,
  height: row.height,
  dominantColor: row.dominant_color,
  position: row.position
});

const fallbackImageFromArtworkRow = (
  row: ArtworkRow,
  env?: Partial<ArtworkMediaEnv>
): ArtworkImage => ({
  id: `${row.id}_cover`,
  imageUrl: normalizedArtworkImageUrl(row.image_url, env),
  thumbnailUrl: mediaThumbnailUrl(row.image_url || row.thumbnail_url),
  width: row.width,
  height: row.height,
  dominantColor: row.dominant_color,
  position: 0
});

const artworkFromRow = (row: ArtworkRow, env?: Partial<ArtworkMediaEnv>): Artwork => ({
  id: row.id,
  title: row.title,
  caption: row.caption,
  imageUrl: normalizedArtworkImageUrl(row.image_url, env),
  thumbnailUrl: mediaThumbnailUrl(row.image_url || row.thumbnail_url),
  width: row.width,
  height: row.height,
  dominantColor: row.dominant_color,
  images: [fallbackImageFromArtworkRow(row, env)],
  tags: parseTags(row.tags_json),
  likeCount: row.like_count,
  liked: false,
  bookmarkCount: row.bookmark_count,
  bookmarked: false,
  bookmarkVisibility: null,
  viewCount: row.view_count,
  commentCount: row.comment_count,
  createdAt: row.created_at,
  mature: Boolean(row.mature) || asMatureRating(row.mature_rating) !== "general",
  matureRating: asMatureRating(row.mature_rating ?? (row.mature ? "restricted" : "general")),
  visibility: asArtworkVisibility(row.visibility),
  reviewStatus: asArtworkReviewStatus(row.review_status),
  creator: {
    id: row.creator_id,
    handle: row.creator_handle,
    displayName: row.creator_display_name,
    avatarUrl: row.creator_avatar_url,
    bio: row.creator_bio,
    followerCount: row.creator_follower_count,
    following: Boolean(row.creator_following)
  }
});

const commentFromRow = (
  row: CommentRow,
  viewerId: string | undefined,
  viewerRole: AuthUser["role"] | undefined,
  artworkOwnerId: string
): Comment => ({
  id: row.id,
  authorId: row.user_id,
  author: row.author,
  body: row.body,
  parentId: row.parent_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  canManage: Boolean(
    isStaffRole(viewerRole) || (viewerId && (viewerId === row.user_id || viewerId === artworkOwnerId))
  )
});

const asUserRole = (value: string | null | undefined): UserRole =>
  value === "admin" || value === "moderator" ? value : "member";

const isStaffRole = (role: UserRole | undefined) => role === "admin" || role === "moderator";

const asArtworkReviewStatus = (value: string | null | undefined): ArtworkReviewStatus => {
  if (value === "pending" || value === "rejected") {
    return value;
  }
  return "approved";
};

const storageCreditTimestamp = () => new Date().toISOString();

const randomIntInclusive = (minimum: number, maximum: number) => {
  const lower = Math.ceil(minimum);
  const upper = Math.floor(maximum);
  const range = upper - lower + 1;
  const [value] = crypto.getRandomValues(new Uint32Array(1));
  return lower + (value % range);
};

const userStorageSelectSql = (userAlias = "users") => `
        ${userAlias}.site_credits,
        ${userAlias}.storage_bonus_credits,
        ${userAlias}.storage_last_login_credit_date,
        (
          SELECT COUNT(artwork_images.id)
          FROM artworks
          JOIN artwork_images ON artwork_images.artwork_id = artworks.id
          WHERE artworks.creator_id = ${userAlias}.id
        ) AS storage_used_images`;

const userStorageFromRow = (
  row: Pick<
    UserRow,
    | "site_credits"
    | "storage_bonus_credits"
    | "storage_last_login_credit_date"
    | "storage_used_images"
  >
): UserStorage => {
  const siteCredits = Math.max(0, Number(row.site_credits ?? 0));
  const creditUnlockedSlots = Math.floor(siteCredits / creditsPerStorageSlot);
  const bonusSlots = Math.max(0, Number(row.storage_bonus_credits ?? 0));
  const usedImages = Math.max(0, Number(row.storage_used_images ?? 0));
  const imageLimit = baseStorageImageLimit + bonusSlots + creditUnlockedSlots;
  return {
    baseLimit: baseStorageImageLimit,
    siteCredits,
    creditsPerSlot: creditsPerStorageSlot,
    creditUnlockedSlots,
    bonusSlots,
    imageLimit,
    usedImages,
    remainingImages: Math.max(0, imageLimit - usedImages),
    lastLoginCreditDate: row.storage_last_login_credit_date ?? null
  };
};

const authUserFromRow = (row: UserRow): AuthUser => ({
  id: row.id,
  email: row.email,
  username: row.username,
  displayName: row.display_name,
  role: asUserRole(row.role),
  emailVerified: Boolean(row.email_verified_at),
  storage: userStorageFromRow(row)
});

const adminUserFromRow = (row: Omit<UserRow, "password_hash">): AdminUserSummary => ({
  id: row.id,
  email: row.email,
  username: row.username,
  displayName: row.display_name,
  role: asUserRole(row.role),
  emailVerified: Boolean(row.email_verified_at),
  suspendedAt: row.suspended_at ?? null,
  createdAt: row.created_at
});

const asBookmarkVisibility = (value: string | null | undefined): BookmarkVisibility =>
  value === "private" ? "private" : "public";

const asProfileVisibility = (value: string | null | undefined): ProfileVisibility => {
  if (value === "members" || value === "private") {
    return value;
  }
  return "public";
};

const currentUserFromRow = (row: UserRow): CurrentUser => ({
  ...authUserFromRow(row),
  dateOfBirth: row.date_of_birth,
  matureContentEnabled: Boolean(row.mature_content_enabled),
  bookmarkDefaultVisibility: asBookmarkVisibility(row.bookmark_default_visibility),
  profileVisibility: asProfileVisibility(row.profile_visibility),
  createdAt: row.created_at
});

const publicAuthUser = (user: AuthUser): AuthUser => ({
  id: user.id,
  email: user.email,
  username: user.username,
  displayName: user.displayName,
  role: user.role,
  emailVerified: user.emailVerified,
  storage: user.storage
});

const ensureCreatorIdentity = async (db: D1Database, user: CurrentUser) => {
  await db
    .prepare(
      `INSERT INTO creators (id, handle, display_name, avatar_url, bio)
       VALUES (?, ?, ?, '', '')
       ON CONFLICT(id) DO UPDATE SET
         handle = excluded.handle,
         display_name = excluded.display_name`
    )
    .bind(user.id, user.username, user.displayName)
    .run();
};

const getUserStorage = async (db: D1Database, userId: string) => {
  const row = await db
    .prepare(
      `SELECT
        ${userStorageSelectSql("users")}
       FROM users
       WHERE users.id = ?
       LIMIT 1`
    )
    .bind(userId)
    .first<
      Pick<
        UserRow,
        | "site_credits"
        | "storage_bonus_credits"
        | "storage_last_login_credit_date"
        | "storage_used_images"
      >
    >();
  return row ? userStorageFromRow(row) : null;
};

const uploadStorageLimitMessage = (storage: UserStorage, requestedImages: number) => {
  if (requestedImages <= storage.remainingImages) {
    return null;
  }
  const requestedLabel = `${requestedImages} image${requestedImages === 1 ? "" : "s"}`;
  const remainingLabel = `${storage.remainingImages} image${storage.remainingImages === 1 ? "" : "s"}`;
  return `Storage limit reached. You can upload ${remainingLabel} now, but selected ${requestedLabel}. Earn site credits from logins or likes received to unlock more slots.`;
};

const awardLoginSiteCredits = async (db: D1Database, userId: string) => {
  const amount = randomIntInclusive(loginSiteCreditMin, loginSiteCreditMax);
  await db
    .prepare(
      `UPDATE users
       SET site_credits = COALESCE(site_credits, 0) + ?,
           storage_last_login_credit_date = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(amount, storageCreditTimestamp(), userId)
    .run();
  return amount;
};

const awardArtworkLikeSiteCredits = async (
  db: D1Database,
  creatorUserId: string,
  likerUserId: string,
  artworkId: string
) => {
  if (creatorUserId === likerUserId) {
    return false;
  }
  const award = await db
    .prepare(
      `INSERT OR IGNORE INTO artwork_like_credit_awards
        (artwork_id, liker_user_id, creator_user_id)
       VALUES (?, ?, ?)`
    )
    .bind(artworkId, likerUserId, creatorUserId)
    .run();
  if ((award.meta.changes ?? 0) === 0) {
    return false;
  }
  await db
    .prepare(
      `UPDATE users
       SET site_credits = COALESCE(site_credits, 0) + ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(artworkLikeSiteCreditReward, creatorUserId)
    .run();
  return true;
};

const requireD1 = (db: D1Database | undefined) => {
  if (!db) {
    throw new Error("D1 database is not bound");
  }
  return db;
};

type TurnstileAction =
  | "register"
  | "login"
  | "resend"
  | "upload"
  | "comment"
  | "report"
  | "password-reset"
  | "password-reset-confirm";

const verifyTurnstile = async (
  context: AppContext,
  token: string,
  expectedAction: TurnstileAction
) => {
  const secret = context.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { ok: false, message: "Turnstile secret is not configured." };
  }

  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);
  formData.append("idempotency_key", crypto.randomUUID());
  const remoteIp =
    context.req.header("CF-Connecting-IP") ?? context.req.header("X-Forwarded-For");
  if (remoteIp) {
    formData.append("remoteip", remoteIp);
  }

  let result: TurnstileResponse;
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData
      }
    );
    result = (await response.json()) as TurnstileResponse;
  } catch (error) {
    console.warn("Unable to verify Turnstile challenge", error);
    return { ok: false, message: "Challenge verification is temporarily unavailable." };
  }

  if (!result.success) {
    return { ok: false, message: "Turnstile challenge failed." };
  }
  if (result.action && result.action !== expectedAction) {
    return { ok: false, message: "Turnstile action did not match this form." };
  }
  return { ok: true };
};

const escapeHeader = (value: string) => value.replace(/[\r\n"]/g, "");

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const buildVerificationEmail = (params: {
  appName: string;
  from: string;
  to: string;
  displayName: string;
  verificationUrl: string;
}) => {
  const subject = `Verify your ${params.appName} account`;
  const senderDomain = params.from.split("@")[1]?.replace(/[^a-zA-Z0-9.-]/g, "") || "localhost";
  const messageId = `${crypto.randomUUID()}@${senderDomain}`;
  const body = [
    `Hi ${params.displayName},`,
    "",
    `Confirm your ${params.appName} account by opening this link:`,
    params.verificationUrl,
    "",
    "This link expires in 24 hours.",
    "",
    "If you did not create this account, you can ignore this email."
  ].join("\n");

  return [
    `From: ${escapeHeader(params.from)}`,
    `To: ${escapeHeader(params.to)}`,
    `Subject: ${escapeHeader(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${messageId}>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    body
  ].join("\r\n");
};

const buildAccountEmail = (params: {
  from: string;
  to: string;
  subject: string;
  lines: string[];
}) => {
  const senderDomain = params.from.split("@")[1]?.replace(/[^a-zA-Z0-9.-]/g, "") || "localhost";
  const messageId = `${crypto.randomUUID()}@${senderDomain}`;

  return [
    `From: ${escapeHeader(params.from)}`,
    `To: ${escapeHeader(params.to)}`,
    `Subject: ${escapeHeader(params.subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${messageId}>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    params.lines.join("\n")
  ].join("\r\n");
};

const sendAccountEmail = async (
  env: Bindings,
  to: string,
  subject: string,
  lines: string[],
  logLabel: string
) => {
  if (!env.EMAIL) {
    console.warn(`${logLabel} email binding is not configured; email was not sent.`);
    return;
  }

  const message = new EmailMessage(
    env.AUTH_EMAIL_FROM,
    to,
    buildAccountEmail({
      from: env.AUTH_EMAIL_FROM,
      to,
      subject,
      lines
    })
  );
  try {
    await env.EMAIL.send(message);
  } catch (error) {
    console.warn(`Unable to send ${logLabel} email`, error);
  }
};

const sendVerificationEmail = async (
  env: Bindings,
  user: AuthUser,
  verificationToken: string
) => {
  const appUrl = env.PUBLIC_APP_URL.replace(/\/$/, "");
  const verificationUrl = `${appUrl}/email-confirmation?kind=verify&token=${encodeURIComponent(
    verificationToken
  )}`;
  if (!env.EMAIL) {
    console.warn("Verification email binding is not configured; email was not sent.");
    return;
  }

  const message = new EmailMessage(
    env.AUTH_EMAIL_FROM,
    user.email,
    buildVerificationEmail({
      appName: env.PUBLIC_APP_NAME,
      from: env.AUTH_EMAIL_FROM,
      to: user.email,
      displayName: user.displayName,
      verificationUrl
    })
  );
  try {
    await env.EMAIL.send(message);
  } catch (error) {
    console.warn("Unable to send verification email", error);
  }
};

const sendPasswordResetEmail = async (
  env: Bindings,
  user: AuthUser,
  resetToken: string
) => {
  const appUrl = env.PUBLIC_APP_URL.replace(/\/$/, "");
  const resetUrl = `${appUrl}/?resetToken=${encodeURIComponent(resetToken)}`;
  await sendAccountEmail(
    env,
    user.email,
    `Reset your ${env.PUBLIC_APP_NAME} password`,
    [
      `Hi ${user.displayName},`,
      "",
      `Reset your ${env.PUBLIC_APP_NAME} password by opening this link:`,
      resetUrl,
      "",
      "This link expires in 1 hour.",
      "",
      "If you did not request this reset, you can ignore this email."
    ],
    "password reset"
  );
};

const sendEmailChangeConfirmation = async (
  env: Bindings,
  user: AuthUser,
  newEmail: string,
  token: string
) => {
  const appUrl = env.PUBLIC_APP_URL.replace(/\/$/, "");
  const confirmationUrl = `${appUrl}/email-confirmation?kind=change&token=${encodeURIComponent(
    token
  )}`;
  await sendAccountEmail(
    env,
    newEmail,
    `Confirm your ${env.PUBLIC_APP_NAME} email change`,
    [
      `Hi ${user.displayName},`,
      "",
      `Confirm this address for your ${env.PUBLIC_APP_NAME} account by opening this link:`,
      confirmationUrl,
      "",
      "This link expires in 2 hours.",
      "",
      "If you did not request this change, you can ignore this email."
    ],
    "email change confirmation"
  );
};

const sendSecurityNoticeEmail = async (
  env: Bindings,
  user: Pick<AuthUser, "email" | "displayName">,
  subject: string,
  lines: string[]
) =>
  sendAccountEmail(
    env,
    user.email,
    `${env.PUBLIC_APP_NAME}: ${subject}`,
    [`Hi ${user.displayName},`, "", ...lines],
    "security notice"
  );

const wantsJsonResponse = (context: AppContext) =>
  context.req.query("format") === "json" ||
  context.req.header("Accept")?.toLowerCase().includes("application/json");

const emailConfirmationRedirect = (
  context: AppContext,
  kind: EmailConfirmationKind,
  status: EmailConfirmationStatus
) => context.redirect(`/email-confirmation?kind=${kind}&status=${status}`, 302);

const emailConfirmationJson = (
  context: AppContext,
  kind: EmailConfirmationKind,
  status: EmailConfirmationStatus,
  message: string,
  responseStatus: 200 | 400 | 503 =
    status === "confirmed" ? 200 : status === "unavailable" ? 503 : 400
) =>
  context.json<EmailConfirmationResponse>(
    {
      kind,
      status,
      message
    },
    responseStatus
  );

const completeLogin = async (
  context: AppContext,
  user: UserRow,
  options: { authMethod: "password" | "passkey"; messagePrefix?: string }
) => {
  const db = requireD1(context.env.DB);
  const notifyNewLocation =
    options.authMethod !== "passkey" &&
    (await shouldSendNewLocationNotice(db, context, user.id));
  const earnedCredits = await awardLoginSiteCredits(db, user.id);
  const responseUser = (await getUserRowById(db, user.id)) ?? user;

  let sessionToken: string;
  let csrfToken: string;
  try {
    sessionToken = await createSession(db, context, user.id);
    context.header("Set-Cookie", sessionCookie(context, sessionToken), { append: true });
    csrfToken = await issueCsrfToken(context, sessionToken);
  } catch (error) {
    console.error("Unable to create login session", error);
    context.header("Set-Cookie", clearSessionCookie(context), { append: true });
    context.header("Set-Cookie", clearCsrfCookie(context), { append: true });
    return context.json({ message: "Unable to create login session." }, 500);
  }

  if (notifyNewLocation) {
    await sendSecurityNoticeEmail(context.env, authUserFromRow(responseUser), "New sign-in", [
      `A password sign-in to your ${context.env.PUBLIC_APP_NAME} account completed from a new network location.`,
      "",
      `Browser: ${requestUserAgent(context)}`,
      "",
      "If this was not you, change your password and review your account security settings."
    ]);
  }

  const prefix = options.messagePrefix ?? "Signed in";
  return context.json<AuthResponse>({
    user: authUserFromRow(responseUser),
    csrfToken,
    message: `${prefix}. You earned ${earnedCredits} site credit${earnedCredits === 1 ? "" : "s"}.`
  });
};

const createVerificationToken = async (db: D1Database, userId: string) => {
  const token = randomToken(32);
  await db
    .prepare(
      `INSERT INTO email_verification_tokens
        (id, user_id, token_hash, expires_at)
       VALUES (?, ?, ?, ?)`
    )
    .bind(
      `evt_${crypto.randomUUID().replaceAll("-", "")}`,
      userId,
      await sha256(token),
      toIsoAfterSeconds(verificationTokenDurationSeconds)
    )
    .run();
  return token;
};

const createPasswordResetToken = async (db: D1Database, userId: string) => {
  const token = randomToken(32);
  await db.batch([
    db.prepare(
      `UPDATE password_reset_tokens
       SET consumed_at = CURRENT_TIMESTAMP
       WHERE user_id = ?
         AND consumed_at IS NULL`
    ).bind(userId),
    db.prepare(
      `INSERT INTO password_reset_tokens
        (id, user_id, token_hash, expires_at)
       VALUES (?, ?, ?, ?)`
    ).bind(
      `prt_${crypto.randomUUID().replaceAll("-", "")}`,
      userId,
      await sha256(token),
      toIsoAfterSeconds(passwordResetTokenDurationSeconds)
    )
  ]);
  return token;
};

const createEmailChangeToken = async (
  db: D1Database,
  userId: string,
  newEmail: string
) => {
  const token = randomToken(32);
  await db.batch([
    db.prepare(
      `UPDATE email_change_tokens
       SET consumed_at = CURRENT_TIMESTAMP
       WHERE user_id = ?
         AND consumed_at IS NULL`
    ).bind(userId),
    db.prepare(
      `INSERT INTO email_change_tokens
        (id, user_id, new_email, token_hash, expires_at)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(
      `ect_${crypto.randomUUID().replaceAll("-", "")}`,
      userId,
      newEmail,
      await sha256(token),
      toIsoAfterSeconds(emailChangeTokenDurationSeconds)
    )
  ]);
  return token;
};

const createSession = async (db: D1Database, context: AppContext, userId: string) => {
  const token = randomToken(32);
  const sessionId = `ses_${crypto.randomUUID().replaceAll("-", "")}`;
  const sessionHash = await sha256(token);
  const expiresAt = toIsoAfterSeconds(sessionDurationSeconds);
  try {
    await db
      .prepare(
        `INSERT INTO auth_sessions
          (id, user_id, session_hash, expires_at, user_agent, client_ip_hash)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
        sessionId,
        userId,
        sessionHash,
        expiresAt,
        requestUserAgent(context),
        await sha256(requestClientIp(context))
      )
      .run();
  } catch (error) {
    if (!isMissingColumnError(error, ["user_agent", "client_ip_hash"])) {
      throw error;
    }
    console.warn(
      "auth_sessions metadata columns are missing; run the latest D1 migrations."
    );
    await db
      .prepare(
        `INSERT INTO auth_sessions
          (id, user_id, session_hash, expires_at)
         VALUES (?, ?, ?, ?)`
      )
      .bind(sessionId, userId, sessionHash, expiresAt)
      .run();
  }
  return token;
};

type AuthSessionRow = {
  id: string;
  session_hash: string;
  user_agent: string;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
};

const accountSessionFromRow = (
  row: AuthSessionRow,
  activeSessionHash: string
): AccountSession => ({
  id: row.id,
  current: row.session_hash === activeSessionHash,
  userAgent: row.user_agent || "Unknown browser",
  createdAt: row.created_at,
  lastSeenAt: row.last_seen_at,
  expiresAt: row.expires_at
});

const getAccountSessions = async (
  db: D1Database,
  userId: string,
  activeSessionHash: string
) => {
  const rows = await db
    .prepare(
      `SELECT id, session_hash, user_agent, created_at, last_seen_at, expires_at
       FROM auth_sessions
       WHERE user_id = ?
         AND datetime(expires_at) > datetime('now')
       ORDER BY datetime(last_seen_at) DESC, datetime(created_at) DESC`
    )
    .bind(userId)
    .all<AuthSessionRow>();

  return rows.results.map((row) => accountSessionFromRow(row, activeSessionHash));
};

const getCurrentUser = async (db: D1Database | undefined, request: Request) => {
  if (!db) {
    return undefined;
  }

  const token = getCookie(request, sessionCookieName);
  if (!token) {
    return undefined;
  }

  const tokenHash = await sha256(token);
  const row = await db
    .prepare(
      `SELECT
        users.id,
        users.email,
        users.username,
        users.display_name,
        users.password_hash,
        users.role,
        users.email_verified_at,
        users.date_of_birth,
        users.mature_content_enabled,
        users.bookmark_default_visibility,
        users.profile_visibility,
        users.suspended_at,
        users.suspended_reason,
        ${userStorageSelectSql("users")},
        users.created_at,
        users.updated_at
       FROM auth_sessions
       JOIN users ON users.id = auth_sessions.user_id
       WHERE auth_sessions.session_hash = ?
         AND datetime(auth_sessions.expires_at) > datetime('now')
       LIMIT 1`
    )
    .bind(tokenHash)
    .first<UserRow>();

  if (!row) {
    return undefined;
  }
  if (row.suspended_at) {
    return undefined;
  }

  await db
    .prepare("UPDATE auth_sessions SET last_seen_at = CURRENT_TIMESTAMP WHERE session_hash = ?")
    .bind(tokenHash)
    .run();

  return currentUserFromRow(row);
};

const parseJson = async <T>(context: AppContext, schema: z.ZodType<T>) => {
  const body = await context.req.json().catch(() => undefined);
  return schema.safeParse(body);
};

const authUnavailable = (context: AppContext) =>
  context.json({ message: "D1 database is required for accounts." }, 503);

const isUniqueConstraintError = (error: unknown) =>
  error instanceof Error &&
  /unique|constraint|users\.email|users\.username/i.test(error.message);

const isMissingColumnError = (error: unknown, columnNames: string[]) =>
  error instanceof Error &&
  columnNames.some((columnName) =>
    new RegExp(`no such column: .*\\b${columnName}\\b|table .* has no column named ${columnName}`, "i").test(
      error.message
    )
  );

const maskEmail = (email: string) => {
  const [localPart, domain = ""] = email.split("@");
  const visibleLocal = localPart.length <= 2 ? localPart.slice(0, 1) : localPart.slice(0, 2);
  return `${visibleLocal}${"*".repeat(Math.max(2, localPart.length - visibleLocal.length))}@${domain}`;
};

const passkeySummaryFromRow = (row: PasskeyRow): PasskeySummary => ({
  id: row.id,
  name: row.name,
  createdAt: row.created_at,
  lastUsedAt: row.last_used_at
});

const getPasskeySummaries = async (db: D1Database, userId: string) => {
  const rows = await db
    .prepare(
      `SELECT id, user_id, credential_id, name, public_key_cose, sign_count, transports, created_at, last_used_at
       FROM user_passkeys
       WHERE user_id = ?
       ORDER BY datetime(created_at) DESC`
    )
    .bind(userId)
    .all<PasskeyRow>();
  return rows.results.map((row) => passkeySummaryFromRow(row));
};

const getEnabledMfaMethods = async (db: D1Database, userId: string): Promise<MfaMethod[]> => {
  const [totp, email] = await Promise.all([
    db
      .prepare("SELECT user_id, secret_base32, enabled_at FROM user_totp_credentials WHERE user_id = ? AND enabled_at IS NOT NULL LIMIT 1")
      .bind(userId)
      .first<TotpCredentialRow>(),
    db
      .prepare("SELECT user_id, enabled_at FROM user_email_mfa_settings WHERE user_id = ? LIMIT 1")
      .bind(userId)
      .first<EmailMfaSettingsRow>()
  ]);
  return [totp ? "totp" : null, email ? "email" : null].filter(Boolean) as MfaMethod[];
};

const getSecuritySettings = async (db: D1Database, userId: string): Promise<SecuritySettingsResponse> => {
  const [methods, passkeys] = await Promise.all([
    getEnabledMfaMethods(db, userId),
    getPasskeySummaries(db, userId)
  ]);
  return {
    twoStep: {
      totpEnabled: methods.includes("totp"),
      emailEnabled: methods.includes("email")
    },
    passkeys
  };
};

const currentClientIpHash = async (context: AppContext) => sha256(requestClientIp(context));

const shouldSendNewLocationNotice = async (db: D1Database, context: AppContext, userId: string) => {
  try {
    const ipHash = await currentClientIpHash(context);
    const row = await db
      .prepare(
        `SELECT
           COUNT(*) AS known_count,
           SUM(CASE WHEN client_ip_hash = ? THEN 1 ELSE 0 END) AS matching_count
         FROM auth_sessions
         WHERE user_id = ?
           AND client_ip_hash <> ''
           AND datetime(expires_at) > datetime('now')`
      )
      .bind(ipHash, userId)
      .first<{ known_count: number; matching_count: number | null }>();
    const knownCount = Number(row?.known_count ?? 0);
    const matchingCount = Number(row?.matching_count ?? 0);
    return knownCount > 0 && matchingCount === 0;
  } catch (error) {
    if (isMissingColumnError(error, ["client_ip_hash"])) {
      return false;
    }
    throw error;
  }
};

const createWebauthnChallenge = async (
  db: D1Database,
  kind: "registration" | "authentication",
  userId: string | null
) => {
  const challenge = randomToken(32);
  await db
    .prepare(
      `INSERT INTO webauthn_challenges
        (id, user_id, challenge_hash, kind, expires_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(
      `wch_${crypto.randomUUID().replaceAll("-", "")}`,
      userId,
      await sha256(challenge),
      kind,
      toIsoAfterSeconds(webauthnChallengeDurationSeconds)
    )
    .run();
  return challenge;
};

const getWebauthnChallenge = async (
  db: D1Database,
  challenge: string,
  kind: "registration" | "authentication",
  userId?: string
) => {
  const query = userId
    ? `SELECT id, user_id
       FROM webauthn_challenges
       WHERE challenge_hash = ?
         AND kind = ?
         AND user_id = ?
         AND consumed_at IS NULL
         AND datetime(expires_at) > datetime('now')
       LIMIT 1`
    : `SELECT id, user_id
       FROM webauthn_challenges
       WHERE challenge_hash = ?
         AND kind = ?
         AND consumed_at IS NULL
         AND datetime(expires_at) > datetime('now')
       LIMIT 1`;
  const statement = db.prepare(query);
  return userId
    ? statement.bind(await sha256(challenge), kind, userId).first<WebauthnChallengeRow>()
    : statement.bind(await sha256(challenge), kind).first<WebauthnChallengeRow>();
};

const consumeWebauthnChallenge = async (db: D1Database, challengeId: string) => {
  await db
    .prepare("UPDATE webauthn_challenges SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(challengeId)
    .run();
};

const sendMfaEmail = async (env: Bindings, user: AuthUser, code: string) =>
  sendAccountEmail(
    env,
    user.email,
    `${env.PUBLIC_APP_NAME}: sign-in code`,
    [
      `Hi ${user.displayName},`,
      "",
      `Your ${env.PUBLIC_APP_NAME} sign-in code is: ${code}`,
      "",
      "This code expires in 10 minutes.",
      "",
      "If you did not try to sign in, change your password immediately."
    ],
    "sign-in code"
  );

const createMfaChallenge = async (
  db: D1Database,
  context: AppContext,
  user: UserRow,
  methods: MfaMethod[]
) => {
  const id = `mfa_${crypto.randomUUID().replaceAll("-", "")}`;
  const token = randomToken(32);
  let emailCodeHash: string | null = null;
  let emailSentAt: string | null = null;
  if (methods.includes("email")) {
    const code = generateNumericCode(6);
    emailCodeHash = await sha256(`${id}:${code}`);
    emailSentAt = new Date().toISOString();
    await sendMfaEmail(context.env, authUserFromRow(user), code);
  }

  await db
    .prepare(
      `INSERT INTO auth_mfa_challenges
        (id, user_id, token_hash, email_code_hash, email_sent_at, client_ip_hash, user_agent, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      user.id,
      await sha256(token),
      emailCodeHash,
      emailSentAt,
      await currentClientIpHash(context),
      requestUserAgent(context),
      toIsoAfterSeconds(mfaChallengeDurationSeconds)
    )
    .run();

  return {
    mfaRequired: true,
    mfaToken: token,
    methods,
    maskedEmail: maskEmail(user.email),
    message: methods.includes("email")
      ? "Enter your authenticator or email code to finish signing in."
      : "Enter your authenticator code to finish signing in."
  } satisfies AuthLoginResponse;
};

const requireAdmin = async (context: AppContext) => {
  if (!context.env.DB) {
    return { response: authUnavailable(context) };
  }

  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return { response: context.json({ message: "Sign in as an administrator." }, 401) };
  }
  if (user.role !== "admin") {
    return { response: context.json({ message: "Administrator access is required." }, 403) };
  }
  return { db: context.env.DB, user };
};

const requireStaff = async (context: AppContext) => {
  if (!context.env.DB) {
    return { response: authUnavailable(context) };
  }

  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return { response: context.json({ message: "Sign in as a moderator." }, 401) };
  }
  if (!isStaffRole(user.role)) {
    return { response: context.json({ message: "Moderator access is required." }, 403) };
  }
  return { db: context.env.DB, user };
};

const createAdminAuditLog = async (
  db: D1Database,
  admin: AuthUser,
  params: {
    action: string;
    targetType: string;
    targetId: string;
    summary: string;
    metadata?: Record<string, unknown>;
  }
) =>
  db
    .prepare(
      `INSERT INTO admin_audit_log
        (id, admin_user_id, action, target_type, target_id, summary, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      `aud_${crypto.randomUUID().replaceAll("-", "")}`,
      admin.id,
      params.action,
      params.targetType,
      params.targetId,
      params.summary.slice(0, 240),
      JSON.stringify(params.metadata ?? {})
    )
    .run();

const parseRestrictedRegions = (value: string | undefined) =>
  new Set(
    (value ?? "")
      .split(",")
      .map((region) => region.trim().toUpperCase())
      .filter(Boolean)
  );

const requestCountry = (context: AppContext) => {
  const cfCountry = context.req.raw.cf?.country;
  const headerCountry = context.req.header("CF-IPCountry");
  const hostname = new URL(context.req.url).hostname;
  const localRequest =
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  const country =
    localRequest && typeof headerCountry === "string"
      ? headerCountry
      : typeof cfCountry === "string"
        ? cfCountry
        : typeof headerCountry === "string"
          ? headerCountry
          : "";
  return /^[A-Z]{2}$/i.test(country) ? country.toUpperCase() : null;
};

const isAdultDate = (dateOfBirth: string | null) => {
  if (!dateOfBirth || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    return false;
  }
  const birthDate = new Date(`${dateOfBirth}T00:00:00.000Z`);
  if (Number.isNaN(birthDate.getTime()) || birthDate.getTime() > Date.now()) {
    return false;
  }
  const today = new Date();
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const monthDelta = today.getUTCMonth() - birthDate.getUTCMonth();
  if (
    monthDelta < 0 ||
    (monthDelta === 0 && today.getUTCDate() < birthDate.getUTCDate())
  ) {
    age -= 1;
  }
  return age >= 18;
};

const matureAccessFor = (
  context: AppContext,
  user: CurrentUser | undefined
): MatureAccess => {
  const country = requestCountry(context);
  const restrictedRegion = country
    ? parseRestrictedRegions(context.env.MATURE_RESTRICTED_REGIONS).has(country)
    : false;
  const signedIn = Boolean(user);
  const ageVerified = Boolean(user && isAdultDate(user.dateOfBirth));
  const enabled = Boolean(user?.matureContentEnabled);
  const allowed = signedIn && ageVerified && enabled && !restrictedRegion;
  const reason: MatureAccess["reason"] = allowed
    ? "allowed"
    : restrictedRegion
      ? "region_restricted"
      : !signedIn
        ? "sign_in_required"
        : !ageVerified
          ? "age_verification_required"
          : "disabled";

  return {
    allowed,
    signedIn,
    ageVerified,
    enabled,
    restrictedRegion,
    country,
    reason
  };
};

const filterMatureArtworks = (artworks: Artwork[], matureAccess: MatureAccess) =>
  matureAccess.allowed ? artworks : artworks.filter((artwork) => !artworkIsMature(artwork));

const canViewProfileVisibility = (
  visibility: ProfileVisibility,
  ownerId: string,
  viewer: CurrentUser | undefined
) => {
  if (isStaffRole(viewer?.role) || viewer?.id === ownerId) {
    return true;
  }
  if (visibility === "public") {
    return true;
  }
  return visibility === "members" && Boolean(viewer);
};

const profileVisibilitySql = (userAlias: string) =>
  `(
    ${userAlias}.profile_visibility = 'public'
    OR (? IS NOT NULL AND ${userAlias}.profile_visibility = 'members')
    OR ${userAlias}.id = ?
    OR ? IN ('admin', 'moderator')
  )`;

const canViewCreatorProfile = async (
  db: D1Database,
  creatorId: string,
  viewer: CurrentUser | undefined
) => {
  const row = await db
    .prepare("SELECT profile_visibility FROM users WHERE id = ? LIMIT 1")
    .bind(creatorId)
    .first<{ profile_visibility: string }>();
  return row
    ? canViewProfileVisibility(asProfileVisibility(row.profile_visibility), creatorId, viewer)
    : false;
};

const artworkSelect = `
  SELECT
    artworks.id,
    artworks.title,
    artworks.caption,
    artworks.image_url,
    artworks.thumbnail_url,
    artworks.width,
    artworks.height,
    artworks.dominant_color,
    artworks.tags_json,
    artworks.like_count,
    artworks.bookmark_count,
    artworks.view_count,
    artworks.comment_count,
    artworks.created_at,
    artworks.mature,
    artworks.mature_rating,
    artworks.visibility,
    artworks.review_status,
    creators.id AS creator_id,
    creators.handle AS creator_handle,
    creators.display_name AS creator_display_name,
    creators.avatar_url AS creator_avatar_url,
    creators.bio AS creator_bio,
    creators.follower_count AS creator_follower_count,
    creators.following AS creator_following,
    creator_user.profile_visibility AS creator_profile_visibility
  FROM artworks
  JOIN creators ON creators.id = artworks.creator_id
  JOIN users AS creator_user ON creator_user.id = artworks.creator_id
`;

const bookmarkedArtworkSelect = artworkSelect.replace(
  "creator_user.profile_visibility AS creator_profile_visibility",
  "creator_user.profile_visibility AS creator_profile_visibility,\n    user_bookmarks.created_at AS bookmark_created_at"
);

const collectionArtworkSelect = artworkSelect.replace(
  "creator_user.profile_visibility AS creator_profile_visibility",
  "creator_user.profile_visibility AS creator_profile_visibility,\n    collection_items.created_at AS collection_item_created_at"
);

const seriesArtworkSelect = artworkSelect.replace(
  "creator_user.profile_visibility AS creator_profile_visibility",
  "creator_user.profile_visibility AS creator_profile_visibility,\n    artwork_series_items.position AS series_item_position"
);

const analyticsArtworkSelect = artworkSelect.replace(
  "creator_user.profile_visibility AS creator_profile_visibility",
  `creator_user.profile_visibility AS creator_profile_visibility,
    (
      SELECT COUNT(*)
      FROM artwork_views
      WHERE artwork_views.artwork_id = artworks.id
        AND date(artwork_views.viewed_on) >= date('now', '-6 days')
    ) AS views_7d`
);

const withArtworkImages = async (
  db: D1Database,
  artworks: Artwork[],
  env?: Partial<ArtworkMediaEnv>
) => {
  if (artworks.length === 0) {
    return artworks;
  }

  try {
    const placeholders = artworks.map(() => "?").join(", ");
    const result = await db
      .prepare(
        `SELECT
          id,
          artwork_id,
          image_url,
          thumbnail_url,
          width,
          height,
          dominant_color,
          position,
          created_at
         FROM artwork_images
         WHERE artwork_id IN (${placeholders})
         ORDER BY artwork_id, position`
      )
      .bind(...artworks.map((artwork) => artwork.id))
      .all<ArtworkImageRow>();
    const imagesByArtworkId = new Map<string, ArtworkImage[]>();
    for (const row of result.results) {
      const images = imagesByArtworkId.get(row.artwork_id) ?? [];
      images.push(imageFromRow(row, env));
      imagesByArtworkId.set(row.artwork_id, images);
    }
    return artworks.map((artwork) => {
      const images = imagesByArtworkId.get(artwork.id);
      if (!images?.length) {
        return artwork;
      }
      const cover = images[0];
      return {
        ...artwork,
        imageUrl: cover.imageUrl,
        thumbnailUrl: cover.thumbnailUrl,
        width: cover.width,
        height: cover.height,
        dominantColor: cover.dominantColor,
        images
      };
    });
  } catch (error) {
    console.warn("Unable to read artwork images", error);
    return artworks;
  }
};

const profileVisibilityBindValues = (viewer: CurrentUser | undefined) => [
  viewer?.id ?? null,
  viewer?.id ?? "",
  viewer?.role ?? "member"
] as const;

const publicArtworkVisibilitySql = "COALESCE(artworks.visibility, 'public') = 'public'";

const ownerAwareArtworkVisibilitySql = () =>
  `(COALESCE(artworks.visibility, 'public') = 'public'
    OR artworks.creator_id = ?
    OR ? IN ('admin', 'moderator'))`;

const directArtworkVisibilitySql = () =>
  `(COALESCE(artworks.visibility, 'public') IN ('public', 'unlisted')
    OR artworks.creator_id = ?
    OR ? IN ('admin', 'moderator'))`;

const artworkVisibilityBindValues = (viewer: CurrentUser | undefined) => [
  viewer?.id ?? "",
  viewer?.role ?? "member"
] as const;

const canViewDirectArtworkVisibility = (
  visibility: ArtworkVisibility,
  creatorId: string,
  viewer: CurrentUser | undefined
) => visibility !== "private" || viewer?.id === creatorId || isStaffRole(viewer?.role);

const galleryAccessWhere = (
  viewer: CurrentUser | undefined,
  matureAccess: MatureAccess,
  rating: MatureFilter
) => {
  const clauses = [
    "artworks.hidden_at IS NULL",
    "COALESCE(artworks.review_status, 'approved') = 'approved'",
    publicArtworkVisibilitySql,
    profileVisibilitySql("creator_user")
  ];
  const bindings: Array<string | number | null> = [...profileVisibilityBindValues(viewer)];

  if (viewer) {
    clauses.push(
      `NOT EXISTS (
        SELECT 1
        FROM user_blocks
        WHERE (blocker_user_id = ? AND blocked_user_id = artworks.creator_id)
           OR (blocker_user_id = artworks.creator_id AND blocked_user_id = ?)
      )`
    );
    bindings.push(viewer.id, viewer.id);
    clauses.push(
      `NOT EXISTS (
        SELECT 1
        FROM artwork_tags AS muted_artwork_tags
        JOIN user_muted_tags
          ON user_muted_tags.tag = muted_artwork_tags.tag
         AND user_muted_tags.user_id = ?
        WHERE muted_artwork_tags.artwork_id = artworks.id
          AND artworks.creator_id <> ?
      )`
    );
    bindings.push(viewer.id, viewer.id);
  }

  if (!matureAccess.allowed || rating === "general") {
    clauses.push("artworks.mature = 0");
    clauses.push("COALESCE(artworks.mature_rating, 'general') = 'general'");
  } else if (rating !== "all") {
    clauses.push("COALESCE(artworks.mature_rating, 'general') = ?");
    bindings.push(rating);
  }

  return { clauses, bindings };
};

const getD1Artworks = async (db: D1Database, viewer?: CurrentUser) => {
  const result = await db
    .prepare(
      `${artworkSelect}
       WHERE artworks.hidden_at IS NULL
         AND ${publicArtworkVisibilitySql}
         AND ${profileVisibilitySql("creator_user")}
       ORDER BY datetime(artworks.created_at) DESC`
    )
    .bind(...profileVisibilityBindValues(viewer))
    .all<ArtworkRow>();
  return withArtworkImages(db, result.results.map((row) => artworkFromRow(row)));
};

const withViewerBookmarks = async (
  db: D1Database,
  viewerId: string | undefined,
  artworks: Artwork[]
) => {
  if (!viewerId || artworks.length === 0) {
    return artworks;
  }

  try {
    const placeholders = artworks.map(() => "?").join(", ");
    const result = await db
      .prepare(
        `SELECT artwork_id, visibility
         FROM user_bookmarks
         WHERE user_id = ?
           AND artwork_id IN (${placeholders})`
      )
      .bind(viewerId, ...artworks.map((artwork) => artwork.id))
      .all<{ artwork_id: string; visibility: string }>();
    const bookmarkVisibilityById = new Map(
      result.results.map((row) => [row.artwork_id, asBookmarkVisibility(row.visibility)])
    );
    return artworks.map((artwork) => ({
      ...artwork,
      bookmarked: bookmarkVisibilityById.has(artwork.id),
      bookmarkVisibility: bookmarkVisibilityById.get(artwork.id) ?? null
    }));
  } catch (error) {
    console.warn("Unable to read viewer bookmarks", error);
    return artworks;
  }
};

const withViewerLikes = async (
  db: D1Database,
  viewerId: string | undefined,
  artworks: Artwork[]
) => {
  if (!viewerId || artworks.length === 0) {
    return artworks;
  }

  try {
    const placeholders = artworks.map(() => "?").join(", ");
    const result = await db
      .prepare(
        `SELECT artwork_id
         FROM artwork_likes
         WHERE user_id = ?
           AND artwork_id IN (${placeholders})`
      )
      .bind(viewerId, ...artworks.map((artwork) => artwork.id))
      .all<{ artwork_id: string }>();
    const likedIds = new Set(result.results.map((row) => row.artwork_id));
    return artworks.map((artwork) => ({
      ...artwork,
      liked: likedIds.has(artwork.id)
    }));
  } catch (error) {
    console.warn("Unable to read viewer likes", error);
    return artworks;
  }
};

const withViewerCreatorFollowing = async (
  db: D1Database,
  viewerId: string | undefined,
  creators: Creator[]
) => {
  if (!viewerId || creators.length === 0) {
    return creators;
  }

  const placeholders = creators.map(() => "?").join(", ");
  const result = await db
    .prepare(
      `SELECT followed_creator_id
       FROM follows
       WHERE follower_creator_id = ?
         AND followed_creator_id IN (${placeholders})`
    )
    .bind(viewerId, ...creators.map((creator) => creator.id))
    .all<{ followed_creator_id: string }>();
  const followedIds = new Set(result.results.map((row) => row.followed_creator_id));
  return creators.map((creator) => ({
    ...creator,
    following: followedIds.has(creator.id)
  }));
};

const withViewerArtworkFollowing = async (
  db: D1Database,
  viewerId: string | undefined,
  artworks: Artwork[]
) => {
  const creatorMap = new Map(artworks.map((artwork) => [artwork.creator.id, artwork.creator]));
  const creators = await withViewerCreatorFollowing(db, viewerId, Array.from(creatorMap.values()));
  const followingByCreatorId = new Map(creators.map((creator) => [creator.id, creator.following]));
  return artworks.map((artwork) => ({
    ...artwork,
    creator: {
      ...artwork.creator,
      following: followingByCreatorId.get(artwork.creator.id) ?? false
    }
  }));
};

const engagementRateForArtwork = (artwork: Artwork) =>
  Math.round(
    ((artwork.likeCount + artwork.bookmarkCount + artwork.commentCount) /
      Math.max(1, artwork.viewCount)) *
      1000
  ) / 10;

const analyticsItemsFromRows = async (
  db: D1Database,
  viewer: CurrentUser,
  rows: CreatorAnalyticsArtworkRow[]
) => {
  if (rows.length === 0) {
    return [];
  }
  const views7dByArtworkId = new Map(
    rows.map((row) => [row.id, Number(row.views_7d ?? 0)])
  );
  const artworksWithImages = await withArtworkImages(db, rows.map((row) => artworkFromRow(row)));
  const followedArtworks = await withViewerArtworkFollowing(db, viewer.id, artworksWithImages);
  const likedArtworks = await withViewerLikes(db, viewer.id, followedArtworks);
  const bookmarkedArtworks = await withViewerBookmarks(db, viewer.id, likedArtworks);
  return bookmarkedArtworks.map((artwork) => ({
    artwork,
    views7d: views7dByArtworkId.get(artwork.id) ?? 0,
    engagementRate: engagementRateForArtwork(artwork)
  }));
};

const lastUtcDateKeys = (days: number) => {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  });
};

const dailyCountMap = (rows: DailyAnalyticsRow[]) =>
  new Map(rows.map((row) => [row.day, Number(row.count ?? 0)]));

const viewerFollowsCreator = async (
  db: D1Database,
  viewerId: string | undefined,
  creatorId: string
) => {
  if (!viewerId || viewerId === creatorId) {
    return false;
  }
  const row = await db
    .prepare(
      `SELECT followed_creator_id
       FROM follows
       WHERE follower_creator_id = ?
         AND followed_creator_id = ?
       LIMIT 1`
    )
    .bind(viewerId, creatorId)
    .first<{ followed_creator_id: string }>();
  return Boolean(row);
};

const viewerBlocksUser = async (
  db: D1Database,
  viewerId: string | undefined,
  userId: string
) => {
  if (!viewerId || viewerId === userId) {
    return false;
  }
  const row = await db
    .prepare(
      `SELECT blocked_user_id
       FROM user_blocks
       WHERE blocker_user_id = ?
         AND blocked_user_id = ?
       LIMIT 1`
    )
    .bind(viewerId, userId)
    .first<{ blocked_user_id: string }>();
  return Boolean(row);
};

const userBlockedPair = async (db: D1Database, leftUserId: string, rightUserId: string) => {
  if (leftUserId === rightUserId) {
    return false;
  }
  const row = await db
    .prepare(
      `SELECT blocker_user_id
       FROM user_blocks
       WHERE (blocker_user_id = ? AND blocked_user_id = ?)
          OR (blocker_user_id = ? AND blocked_user_id = ?)
       LIMIT 1`
    )
    .bind(leftUserId, rightUserId, rightUserId, leftUserId)
    .first<{ blocker_user_id: string }>();
  return Boolean(row);
};

const hiddenUserIdsForViewer = async (db: D1Database, viewerId: string | undefined) => {
  if (!viewerId) {
    return new Set<string>();
  }
  const result = await db
    .prepare(
      `SELECT blocker_user_id, blocked_user_id
       FROM user_blocks
       WHERE blocker_user_id = ?
          OR blocked_user_id = ?`
    )
    .bind(viewerId, viewerId)
    .all<{ blocker_user_id: string; blocked_user_id: string }>();
  const hiddenIds = new Set<string>();
  for (const row of result.results) {
    hiddenIds.add(row.blocker_user_id === viewerId ? row.blocked_user_id : row.blocker_user_id);
  }
  return hiddenIds;
};

const getD1Creators = async (db: D1Database, viewer?: CurrentUser) => {
  const result = await db
    .prepare(
      `SELECT
        creators.id,
        creators.handle,
        creators.display_name,
        creators.avatar_url,
        creators.bio,
        creators.follower_count,
        creators.following
      FROM creators
      JOIN users AS creator_user ON creator_user.id = creators.id
      WHERE ${profileVisibilitySql("creator_user")}
      ORDER BY follower_count DESC`
    )
    .bind(...profileVisibilityBindValues(viewer))
    .all<{
      id: string;
      handle: string;
      display_name: string;
      avatar_url: string;
      bio: string;
      follower_count: number;
      following: number;
    }>();

  const creators = result.results.map(
    (row): Creator => ({
      id: row.id,
      handle: row.handle,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      bio: row.bio,
      followerCount: row.follower_count,
      following: Boolean(row.following)
    })
  );
  return withViewerCreatorFollowing(db, viewer?.id, creators);
};

const maybeGetD1Gallery = async (db: D1Database | undefined, viewer?: CurrentUser) => {
  if (!db) {
    return undefined;
  }

  try {
    const [rawArtworks, creators] = await Promise.all([
      getD1Artworks(db, viewer),
      getD1Creators(db, viewer)
    ]);
    const hiddenUserIds = await hiddenUserIdsForViewer(db, viewer?.id);
    const visibleRawArtworks = rawArtworks.filter(
      (artwork) => !hiddenUserIds.has(artwork.creator.id)
    );
    const visibleCreators = creators.filter((creator) => !hiddenUserIds.has(creator.id));
    const followedArtworks = await withViewerArtworkFollowing(db, viewer?.id, visibleRawArtworks);
    const likedArtworks = await withViewerLikes(db, viewer?.id, followedArtworks);
    const artworks = await withViewerBookmarks(db, viewer?.id, likedArtworks);
    if (artworks.length === 0) {
      return undefined;
    }
    return { artworks, creators: visibleCreators };
  } catch (error) {
    console.warn("Unable to read gallery from D1", error);
    return undefined;
  }
};

const emptyLatestGalleryPage = async (db: D1Database, viewer: CurrentUser | undefined) => {
  const rawCreators = await getD1Creators(db, viewer);
  const hiddenUserIds = await hiddenUserIdsForViewer(db, viewer?.id);
  return {
    artworks: [],
    creators: rawCreators.filter((creator) => !hiddenUserIds.has(creator.id)),
    tags: [],
    nextCursor: null,
    totalCount: 0,
    source: "empty" as const
  };
};

const risingScoreSql =
  "(artworks.like_count * 1000000) / CASE WHEN artworks.view_count < 1 THEN 1 ELSE artworks.view_count END";

const sortedGalleryOrderSql = (sort: KeysetGallerySort) => {
  if (sort === "popular") {
    return "artworks.like_count DESC, datetime(artworks.created_at) DESC, artworks.id DESC";
  }
  if (sort === "rising") {
    return `${risingScoreSql} DESC, datetime(artworks.created_at) DESC, artworks.id DESC`;
  }
  return "datetime(artworks.created_at) DESC, artworks.id DESC";
};

const appendGalleryCursorWhere = (
  sort: KeysetGallerySort,
  cursor: GalleryCursor,
  clauses: string[],
  bindings: Array<string | number | null>
) => {
  if (sort === "popular") {
    clauses.push(
      `(artworks.like_count < ?
        OR (
          artworks.like_count = ?
          AND (
            datetime(artworks.created_at) < datetime(?)
            OR (
              datetime(artworks.created_at) = datetime(?)
              AND artworks.id < ?
            )
          )
        ))`
    );
    bindings.push(cursor.score ?? 0, cursor.score ?? 0, cursor.createdAt, cursor.createdAt, cursor.id);
    return;
  }
  if (sort === "rising") {
    clauses.push(
      `(${risingScoreSql} < ?
        OR (
          ${risingScoreSql} = ?
          AND (
            datetime(artworks.created_at) < datetime(?)
            OR (
              datetime(artworks.created_at) = datetime(?)
              AND artworks.id < ?
            )
          )
        ))`
    );
    bindings.push(cursor.score ?? 0, cursor.score ?? 0, cursor.createdAt, cursor.createdAt, cursor.id);
    return;
  }
  clauses.push(
    `(datetime(artworks.created_at) < datetime(?)
      OR (
        datetime(artworks.created_at) = datetime(?)
        AND artworks.id < ?
      ))`
  );
  bindings.push(cursor.createdAt, cursor.createdAt, cursor.id);
};

const getSortedGalleryPage = async (
  db: D1Database,
  sort: KeysetGallerySort,
  viewer: CurrentUser | undefined,
  matureAccess: MatureAccess,
  rating: MatureFilter,
  search: string,
  tag: string,
  limit: number,
  cursor: GalleryCursor | undefined
) => {
  if (!matureAccess.allowed && rating !== "all" && rating !== "general") {
    return emptyLatestGalleryPage(db, viewer);
  }

  const normalizedSearch = search.trim();
  const ftsQuery = ftsQueryFromSearch(normalizedSearch);
  if (normalizedSearch && !ftsQuery) {
    return emptyLatestGalleryPage(db, viewer);
  }

  const baseWhere = galleryAccessWhere(viewer, matureAccess, rating);
  if (sort === "following" || sort === "bookmarks" || sort === "subscriptions") {
    if (!viewer) {
      return emptyLatestGalleryPage(db, viewer);
    }
    if (sort === "following") {
      baseWhere.clauses.push(
        `EXISTS (
          SELECT 1
          FROM follows
          WHERE follows.follower_creator_id = ?
            AND follows.followed_creator_id = artworks.creator_id
        )`
      );
      baseWhere.bindings.push(viewer.id);
    } else if (sort === "bookmarks") {
      baseWhere.clauses.push(
        `EXISTS (
          SELECT 1
          FROM user_bookmarks
          WHERE user_bookmarks.user_id = ?
            AND user_bookmarks.artwork_id = artworks.id
        )`
      );
      baseWhere.bindings.push(viewer.id);
    } else {
      baseWhere.clauses.push(
        `EXISTS (
          SELECT 1
          FROM artwork_tags AS subscribed_artwork_tags
          JOIN tag_subscriptions
            ON tag_subscriptions.tag = subscribed_artwork_tags.tag
           AND tag_subscriptions.user_id = ?
          WHERE subscribed_artwork_tags.artwork_id = artworks.id
        )`
      );
      baseWhere.bindings.push(viewer.id);
    }
  }
  if (ftsQuery) {
    baseWhere.clauses.push(
      `EXISTS (
        SELECT 1
        FROM artwork_search
        WHERE artwork_search.artwork_id = artworks.id
          AND artwork_search MATCH ?
      )`
    );
    baseWhere.bindings.push(ftsQuery);
  }
  if (tag) {
    baseWhere.clauses.push(
      `EXISTS (
        SELECT 1
        FROM artwork_tags AS filtered_tags
        WHERE filtered_tags.artwork_id = artworks.id
          AND filtered_tags.tag = ?
      )`
    );
    baseWhere.bindings.push(tag);
  }
  const pageClauses = [...baseWhere.clauses];
  const pageBindings = [...baseWhere.bindings];
  if (cursor) {
    appendGalleryCursorWhere(sort, cursor, pageClauses, pageBindings);
  }
  const whereSql = baseWhere.clauses.join("\n         AND ");
  const pageWhereSql = pageClauses.join("\n         AND ");
  const pageResult = await db
    .prepare(
      `${artworkSelect}
       WHERE ${pageWhereSql}
       ORDER BY ${sortedGalleryOrderSql(sort)}
       LIMIT ?`
    )
    .bind(...pageBindings, limit + 1)
    .all<ArtworkRow>();
  const pageRows = pageResult.results.slice(0, limit);
  const hasMore = pageResult.results.length > limit;

  const [totalRow, tagRows, rawCreators] = await Promise.all([
    db
      .prepare(
        `SELECT COUNT(*) AS count
         FROM artworks
         JOIN creators ON creators.id = artworks.creator_id
         JOIN users AS creator_user ON creator_user.id = artworks.creator_id
         WHERE ${whereSql}`
      )
      .bind(...baseWhere.bindings)
      .first<{ count: number }>(),
    db
      .prepare(
        `SELECT artwork_tags.tag, COUNT(*) AS count
         FROM artwork_tags
         JOIN artworks ON artworks.id = artwork_tags.artwork_id
         JOIN creators ON creators.id = artworks.creator_id
         JOIN users AS creator_user ON creator_user.id = artworks.creator_id
         WHERE ${whereSql}
         GROUP BY artwork_tags.tag
         ORDER BY count DESC, artwork_tags.tag
         LIMIT 80`
      )
      .bind(...baseWhere.bindings)
      .all<TagCountRow>(),
    getD1Creators(db, viewer)
  ]);

  const artworksWithImages = await withArtworkImages(db, pageRows.map((row) => artworkFromRow(row)));
  const followedArtworks = await withViewerArtworkFollowing(db, viewer?.id, artworksWithImages);
  const likedArtworks = await withViewerLikes(db, viewer?.id, followedArtworks);
  const artworks = await withViewerBookmarks(db, viewer?.id, likedArtworks);
  const hiddenUserIds = await hiddenUserIdsForViewer(db, viewer?.id);
  const creators = rawCreators.filter((creator) => !hiddenUserIds.has(creator.id));
  const lastArtwork = artworks.at(-1);

  return {
    artworks,
    creators,
    tags: tagRows.results.map((row) => ({ name: row.tag, count: row.count })),
    nextCursor: hasMore && lastArtwork ? encodeGalleryCursor(sort, lastArtwork) : null,
    totalCount: totalRow?.count ?? 0,
    source: (totalRow?.count ?? 0) > 0 ? "d1" as const : "empty" as const
  };
};

const getRelatedTagsForTag = async (
  db: D1Database,
  viewer: CurrentUser | undefined,
  matureAccess: MatureAccess,
  rating: MatureFilter,
  tag: string
) => {
  if (!matureAccess.allowed && rating !== "all" && rating !== "general") {
    return [];
  }

  const baseWhere = galleryAccessWhere(viewer, matureAccess, rating);
  const whereSql = baseWhere.clauses.join("\n         AND ");
  const result = await db
    .prepare(
      `SELECT related_tags.tag AS name, COUNT(*) AS count
       FROM artwork_tags AS related_tags
       JOIN artworks ON artworks.id = related_tags.artwork_id
       JOIN creators ON creators.id = artworks.creator_id
       JOIN users AS creator_user ON creator_user.id = artworks.creator_id
       WHERE ${whereSql}
         AND related_tags.tag <> ?
         AND EXISTS (
           SELECT 1
           FROM artwork_tags AS source_tags
           WHERE source_tags.artwork_id = artworks.id
             AND source_tags.tag = ?
         )
       GROUP BY related_tags.tag
       ORDER BY count DESC, related_tags.tag
       LIMIT 24`
    )
    .bind(...baseWhere.bindings, tag, tag)
    .all<TagRelatedItem>();
  return result.results;
};

const getRelatedArtworksForArtwork = async (
  db: D1Database,
  artwork: Artwork,
  viewer: CurrentUser | undefined,
  matureAccess: MatureAccess | undefined,
  limit = 8
) => {
  if (!matureAccess) {
    return [];
  }

  const relatedTags = artwork.tags.slice(0, 8);
  const tagPlaceholders = relatedTags.map(() => "?").join(", ");
  const tagJoin = relatedTags.length
    ? `LEFT JOIN artwork_tags AS matched_tags
       ON matched_tags.artwork_id = artworks.id
      AND matched_tags.tag IN (${tagPlaceholders})`
    : "";
  const baseWhere = galleryAccessWhere(
    viewer,
    matureAccess,
    matureAccess.allowed ? "all" : "general"
  );
  baseWhere.clauses.push("artworks.id <> ?");
  baseWhere.bindings.push(artwork.id);
  const havingSql = relatedTags.length
    ? "HAVING COUNT(matched_tags.tag) > 0 OR artworks.creator_id = ?"
    : "HAVING artworks.creator_id = ?";
  const orderSql = relatedTags.length ? "COUNT(matched_tags.tag) DESC," : "";
  const result = await db
    .prepare(
      `${artworkSelect}
       ${tagJoin}
       WHERE ${baseWhere.clauses.join("\n         AND ")}
       GROUP BY artworks.id
       ${havingSql}
       ORDER BY
         ${orderSql}
         CASE WHEN artworks.creator_id = ? THEN 1 ELSE 0 END DESC,
         artworks.like_count DESC,
         datetime(artworks.created_at) DESC,
         artworks.id DESC
       LIMIT ?`
    )
    .bind(
      ...relatedTags,
      ...baseWhere.bindings,
      artwork.creator.id,
      artwork.creator.id,
      limit
    )
    .all<ArtworkRow>();

  const artworksWithImages = await withArtworkImages(db, result.results.map((row) => artworkFromRow(row)));
  const followedArtworks = await withViewerArtworkFollowing(db, viewer?.id, artworksWithImages);
  const likedArtworks = await withViewerLikes(db, viewer?.id, followedArtworks);
  return withViewerBookmarks(db, viewer?.id, likedArtworks);
};

const getArtworkFromD1 = async (
  db: D1Database,
  id: string,
  viewer?: CurrentUser,
  matureAccess?: MatureAccess
) => {
  const artwork = await db
    .prepare(
      `${artworkSelect}
       WHERE artworks.id = ?
         AND (artworks.hidden_at IS NULL OR ? IN ('admin', 'moderator'))
         AND (
           COALESCE(artworks.review_status, 'approved') = 'approved'
           OR artworks.creator_id = ?
           OR ? IN ('admin', 'moderator')
         )
         AND ${directArtworkVisibilitySql()}
         AND ${profileVisibilitySql("creator_user")}
       LIMIT 1`
    )
    .bind(
      id,
      viewer?.role ?? "member",
      viewer?.id ?? "",
      viewer?.role ?? "member",
      ...artworkVisibilityBindValues(viewer),
      ...profileVisibilityBindValues(viewer)
    )
    .first<ArtworkRow>();
  if (!artwork) {
    return undefined;
  }

  const comments = await db
    .prepare(
      `SELECT id, user_id, author, body, parent_id, created_at, updated_at
       FROM comments
       WHERE artwork_id = ?
         AND deleted_at IS NULL
       ORDER BY datetime(created_at) DESC
       LIMIT 30`
    )
    .bind(id)
    .all<CommentRow>();

  const [artworkWithImages] = await withArtworkImages(db, [artworkFromRow(artwork)]);
  const [artworkWithFollowing] = await withViewerArtworkFollowing(db, viewer?.id, [
    artworkWithImages
  ]);
  const [artworkWithLikes] = await withViewerLikes(db, viewer?.id, [
    artworkWithFollowing
  ]);
  const [artworkWithBookmarks] = await withViewerBookmarks(db, viewer?.id, [artworkWithLikes]);

  return {
    artwork: artworkWithBookmarks,
    comments: comments.results.map((comment) =>
      commentFromRow(comment, viewer?.id, viewer?.role, artwork.creator_id)
    ),
    relatedArtworks: await getRelatedArtworksForArtwork(
      db,
      artworkWithBookmarks,
      viewer,
      matureAccess
    )
  };
};

const profileFromRow = (
  row: ProfileUserRow,
  ownProfile: boolean
): UserProfileResponse["profile"] => ({
  id: row.id,
  username: row.username,
  displayName: row.display_name,
  avatarUrl: row.avatar_url ?? "",
  websiteUrl: row.website_url ?? "",
  bio: row.bio ?? "",
  followerCount: row.follower_count ?? 0,
  following: Boolean(row.following),
  blocked: false,
  profileVisibility: asProfileVisibility(row.profile_visibility),
  joinedAt: row.created_at,
  ownProfile
});

const blockedUserFromRow = (row: BlockedUserRow): BlockedUser => ({
  id: row.id,
  username: row.username,
  displayName: row.display_name,
  avatarUrl: row.avatar_url ?? "",
  blockedAt: row.blocked_at
});

const getBlockedUsers = async (db: D1Database, userId: string) => {
  const result = await db
    .prepare(
      `SELECT
        users.id,
        users.username,
        users.display_name,
        creators.avatar_url,
        user_blocks.created_at AS blocked_at
       FROM user_blocks
       JOIN users ON users.id = user_blocks.blocked_user_id
       LEFT JOIN creators ON creators.id = users.id
       WHERE user_blocks.blocker_user_id = ?
       ORDER BY user_blocks.created_at DESC
       LIMIT 100`
    )
    .bind(userId)
    .all<BlockedUserRow>();
  return result.results.map(blockedUserFromRow);
};

const getProfileUser = async (db: D1Database, username: string) =>
  db
    .prepare(
      `SELECT
        users.id,
        users.email,
        users.username,
        users.display_name,
        users.password_hash,
        users.role,
        users.email_verified_at,
        users.date_of_birth,
        users.mature_content_enabled,
        users.bookmark_default_visibility,
        users.profile_visibility,
        users.suspended_at,
        users.suspended_reason,
        ${userStorageSelectSql("users")},
        users.created_at,
        users.updated_at,
        creators.avatar_url,
        creators.website_url,
        creators.bio,
        creators.follower_count,
        creators.following
       FROM users
       LEFT JOIN creators ON creators.id = users.id
       WHERE lower(users.username) = ?
       LIMIT 1`
    )
    .bind(username.toLowerCase())
    .first<ProfileUserRow>();

const getUserRowById = async (db: D1Database, id: string) =>
  db
    .prepare(
      `SELECT
        id,
        email,
        username,
        display_name,
        password_hash,
        role,
        email_verified_at,
        date_of_birth,
        mature_content_enabled,
        bookmark_default_visibility,
        profile_visibility,
        suspended_at,
        suspended_reason,
        ${userStorageSelectSql("users")},
        created_at,
        updated_at
       FROM users
       WHERE id = ?
       LIMIT 1`
    )
    .bind(id)
    .first<UserRow>();

const getUserRowByEmail = async (db: D1Database, email: string) =>
  db
    .prepare(
      `SELECT
        id,
        email,
        username,
        display_name,
        password_hash,
        role,
        email_verified_at,
        date_of_birth,
        mature_content_enabled,
        bookmark_default_visibility,
        profile_visibility,
        suspended_at,
        suspended_reason,
        ${userStorageSelectSql("users")},
        created_at,
        updated_at
       FROM users
       WHERE lower(email) = ?
       LIMIT 1`
    )
    .bind(email.toLowerCase())
    .first<UserRow>();

const isDefaultAdminBootstrapPassword = async (
  env: Bindings,
  row: UserRow,
  password: string
) =>
  row.id === defaultAdminUserId &&
  row.role === "admin" &&
  Boolean(env.ADMIN_BOOTSTRAP_PASSWORD) &&
  constantTimeStringEqual(password, env.ADMIN_BOOTSTRAP_PASSWORD ?? "");

const verifyUserPassword = async (env: Bindings, row: UserRow, password: string) =>
  (await isDefaultAdminBootstrapPassword(env, row, password)) ||
  verifyPassword(password, row.password_hash);

const getArtworksByCreator = async (
  db: D1Database,
  creatorId: string,
  viewer?: CurrentUser
) => {
  const result = await db
    .prepare(
      `${artworkSelect}
       WHERE artworks.creator_id = ?
         AND artworks.hidden_at IS NULL
         AND ${ownerAwareArtworkVisibilitySql()}
         AND ${profileVisibilitySql("creator_user")}
       ORDER BY datetime(artworks.created_at) DESC`
    )
    .bind(creatorId, ...artworkVisibilityBindValues(viewer), ...profileVisibilityBindValues(viewer))
    .all<ArtworkRow>();
  const artworks = await withArtworkImages(db, result.results.map((row) => artworkFromRow(row)));
  const followedArtworks = await withViewerArtworkFollowing(db, viewer?.id, artworks);
  const likedArtworks = await withViewerLikes(db, viewer?.id, followedArtworks);
  return withViewerBookmarks(db, viewer?.id, likedArtworks);
};

const profilePageLimit = 12;
type ProfileSection =
  | "artworks"
  | "publicBookmarks"
  | "privateBookmarks"
  | "publicCollections"
  | "publicSeries";

const profileSectionFromQuery = (value: string | null | undefined): ProfileSection => {
  if (
    value === "publicBookmarks" ||
    value === "privateBookmarks" ||
    value === "publicCollections" ||
    value === "publicSeries"
  ) {
    return value;
  }
  return "artworks";
};

const profileSectionKey = (section: ProfileSection) =>
  section === "publicBookmarks"
    ? "public"
    : section === "privateBookmarks"
      ? "private"
      : section === "publicCollections"
        ? "collections"
        : section === "publicSeries"
          ? "series"
        : "works";

const encodeProfileCursor = (
  section: ProfileSection,
  item: { createdAt: string; id: string }
) =>
  toBase64Url(
    textEncoder.encode(
      JSON.stringify({
        v: 1,
        section: profileSectionKey(section),
        createdAt: item.createdAt,
        id: item.id
      })
    )
  );

const decodeProfileCursor = (value: string | null | undefined, section: ProfileSection) => {
  const rawValue = value?.trim();
  if (!rawValue) {
    return undefined;
  }
  try {
    const decoded = JSON.parse(textDecoder.decode(fromBase64Url(rawValue))) as {
      v?: unknown;
      section?: unknown;
      createdAt?: unknown;
      id?: unknown;
    };
    if (
      decoded.v === 1 &&
      decoded.section === profileSectionKey(section) &&
      typeof decoded.createdAt === "string" &&
      typeof decoded.id === "string" &&
      decoded.createdAt.length > 0 &&
      decoded.id.length > 0
    ) {
      return {
        createdAt: decoded.createdAt,
        id: decoded.id
      };
    }
  } catch {
    return null;
  }
  return null;
};

const encodeFollowListCursor = (
  username: string,
  mode: FollowListMode,
  item: { followedAt: string; id: string }
) =>
  toBase64Url(
    textEncoder.encode(
      JSON.stringify({
        v: 1,
        username: username.toLowerCase(),
        mode,
        followedAt: item.followedAt,
        id: item.id
      })
    )
  );

const decodeFollowListCursor = (
  value: string | null | undefined,
  username: string,
  mode: FollowListMode
) => {
  const rawValue = value?.trim();
  if (!rawValue) {
    return undefined;
  }
  try {
    const decoded = JSON.parse(textDecoder.decode(fromBase64Url(rawValue))) as {
      v?: unknown;
      username?: unknown;
      mode?: unknown;
      followedAt?: unknown;
      id?: unknown;
    };
    if (
      decoded.v === 1 &&
      decoded.username === username.toLowerCase() &&
      decoded.mode === mode &&
      typeof decoded.followedAt === "string" &&
      typeof decoded.id === "string" &&
      decoded.followedAt.length > 0 &&
      decoded.id.length > 0
    ) {
      return {
        mode,
        username: username.toLowerCase(),
        followedAt: decoded.followedAt,
        id: decoded.id
      };
    }
  } catch {
    return null;
  }
  return null;
};

const profileCursorWhere = (
  cursor: { createdAt: string; id: string } | undefined,
  bindings: Array<string | number | null>,
  createdAtExpression = "artworks.created_at",
  idExpression = "artworks.id"
) => {
  if (!cursor) {
    return "";
  }
  bindings.push(cursor.createdAt, cursor.createdAt, cursor.id);
  return `AND (
    datetime(${createdAtExpression}) < datetime(?)
    OR (
      datetime(${createdAtExpression}) = datetime(?)
      AND ${idExpression} < ?
    )
  )`;
};

const finishProfileArtworkPage = async (
  db: D1Database,
  viewer: CurrentUser | undefined,
  section: ProfileSection,
  rows: ArtworkRow[]
) => {
  const pageRows = rows.slice(0, profilePageLimit);
  const hasMore = rows.length > profilePageLimit;
  const artworksWithImages = await withArtworkImages(db, pageRows.map((row) => artworkFromRow(row)));
  const followedArtworks = await withViewerArtworkFollowing(db, viewer?.id, artworksWithImages);
  const likedArtworks = await withViewerLikes(db, viewer?.id, followedArtworks);
  const artworks = await withViewerBookmarks(db, viewer?.id, likedArtworks);
  const lastArtwork = artworks.at(-1);
  return {
    artworks,
    nextCursor: hasMore && lastArtwork ? encodeProfileCursor(section, lastArtwork) : null
  };
};

const getArtworkPageByCreator = async (
  db: D1Database,
  creatorId: string,
  viewer: CurrentUser | undefined,
  matureAccess: MatureAccess,
  cursor: { createdAt: string; id: string } | undefined
) => {
  const baseWhere = profileContentAccessWhere(viewer, matureAccess);
  baseWhere.clauses.push("artworks.creator_id = ?");
  baseWhere.bindings.push(creatorId);
  const cursorSql = profileCursorWhere(cursor, baseWhere.bindings);
  const whereSql = baseWhere.clauses.join("\n         AND ");
  const result = await db
    .prepare(
      `${artworkSelect}
       WHERE ${whereSql}
         ${cursorSql}
       ORDER BY datetime(artworks.created_at) DESC, artworks.id DESC
       LIMIT ?`
    )
    .bind(...baseWhere.bindings, profilePageLimit + 1)
    .all<ArtworkRow>();
  return finishProfileArtworkPage(db, viewer, "artworks", result.results);
};

const getBookmarkedArtworks = async (
  db: D1Database,
  userId: string,
  visibility: BookmarkVisibility,
  viewer?: CurrentUser
) => {
  const result = await db
    .prepare(
      `${artworkSelect}
       JOIN user_bookmarks ON user_bookmarks.artwork_id = artworks.id
       WHERE user_bookmarks.user_id = ?
         AND user_bookmarks.visibility = ?
         AND artworks.hidden_at IS NULL
         AND ${profileVisibilitySql("creator_user")}
       ORDER BY datetime(user_bookmarks.created_at) DESC`
    )
    .bind(userId, visibility, ...profileVisibilityBindValues(viewer))
    .all<ArtworkRow>();
  const artworks = await withArtworkImages(db, result.results.map((row) => artworkFromRow(row)));
  const followedArtworks = await withViewerArtworkFollowing(db, viewer?.id, artworks);
  const likedArtworks = await withViewerLikes(db, viewer?.id, followedArtworks);
  return withViewerBookmarks(db, viewer?.id, likedArtworks);
};

const getBookmarkedArtworkPage = async (
  db: D1Database,
  userId: string,
  visibility: BookmarkVisibility,
  viewer: CurrentUser | undefined,
  matureAccess: MatureAccess,
  cursor: { createdAt: string; id: string } | undefined
) => {
  const section = visibility === "private" ? "privateBookmarks" : "publicBookmarks";
  const baseWhere = profileContentAccessWhere(viewer, matureAccess);
  baseWhere.clauses.push("user_bookmarks.user_id = ?");
  baseWhere.clauses.push("user_bookmarks.visibility = ?");
  baseWhere.bindings.push(userId, visibility);
  const cursorSql = profileCursorWhere(
    cursor,
    baseWhere.bindings,
    "user_bookmarks.created_at",
    "artworks.id"
  );
  const whereSql = baseWhere.clauses.join("\n         AND ");
  const result = await db
    .prepare(
      `${bookmarkedArtworkSelect}
       JOIN user_bookmarks ON user_bookmarks.artwork_id = artworks.id
       WHERE ${whereSql}
         ${cursorSql}
       ORDER BY datetime(user_bookmarks.created_at) DESC, artworks.id DESC
       LIMIT ?`
    )
    .bind(...baseWhere.bindings, profilePageLimit + 1)
    .all<ArtworkRow & { bookmark_created_at: string }>();
  const pageRows = result.results.slice(0, profilePageLimit);
  const hasMore = result.results.length > profilePageLimit;
  const artworksWithImages = await withArtworkImages(db, pageRows.map((row) => artworkFromRow(row)));
  const followedArtworks = await withViewerArtworkFollowing(db, viewer?.id, artworksWithImages);
  const likedArtworks = await withViewerLikes(db, viewer?.id, followedArtworks);
  const artworks = await withViewerBookmarks(db, viewer?.id, likedArtworks);
  const lastRow = pageRows.at(-1);
  return {
    artworks,
    nextCursor:
      hasMore && lastRow
        ? encodeProfileCursor(section, { createdAt: lastRow.bookmark_created_at, id: lastRow.id })
        : null
  };
};

const getPublicCollectionPageByCreator = async (
  db: D1Database,
  creatorId: string,
  viewer: CurrentUser | undefined,
  matureAccess: MatureAccess,
  cursor: { createdAt: string; id: string } | undefined
) => {
  const bindings: Array<string | number | null> = [creatorId, "public"];
  const cursorSql = profileCursorWhere(cursor, bindings, "collections.created_at", "collections.id");
  const result = await db
    .prepare(
      `SELECT
        collections.id,
        collections.name,
        collections.description,
        collections.visibility,
        collections.created_at,
        collections.updated_at,
        collections.cover_artwork_id,
        COUNT(collection_items.artwork_id) AS item_count,
        GROUP_CONCAT(collection_items.artwork_id) AS artwork_ids
       FROM collections
       LEFT JOIN collection_items ON collection_items.collection_id = collections.id
       WHERE collections.creator_id = ?
         AND collections.visibility = ?
         ${cursorSql}
       GROUP BY collections.id
       ORDER BY datetime(collections.created_at) DESC, collections.id DESC
       LIMIT ?`
    )
    .bind(...bindings, profilePageLimit + 1)
    .all<CollectionRow>();
  const pageRows = result.results.slice(0, profilePageLimit);
  const lastRow = pageRows.at(-1);
  const collections = await withCollectionPreviews(
    db,
    pageRows.map(collectionFromRow),
    viewer,
    matureAccess
  );
  return {
    collections,
    nextCursor:
      result.results.length > profilePageLimit && lastRow
        ? encodeProfileCursor("publicCollections", {
            createdAt: lastRow.created_at,
            id: lastRow.id
          })
        : null
  };
};

const getPublicSeriesPageByCreator = async (
  db: D1Database,
  creatorId: string,
  viewer: CurrentUser | undefined,
  matureAccess: MatureAccess,
  cursor: { createdAt: string; id: string } | undefined
) => {
  const bindings: Array<string | number | null> = [creatorId, "public"];
  const cursorSql = profileCursorWhere(
    cursor,
    bindings,
    "artwork_series.created_at",
    "artwork_series.id"
  );
  const result = await db
    .prepare(
      `SELECT
        artwork_series.id,
        artwork_series.title,
        artwork_series.description,
        artwork_series.visibility,
        artwork_series.created_at,
        artwork_series.updated_at,
        artwork_series.cover_artwork_id,
        COUNT(artwork_series_items.artwork_id) AS item_count,
        GROUP_CONCAT(artwork_series_items.artwork_id) AS artwork_ids
       FROM artwork_series
       LEFT JOIN artwork_series_items ON artwork_series_items.series_id = artwork_series.id
       WHERE artwork_series.creator_id = ?
         AND artwork_series.visibility = ?
         ${cursorSql}
       GROUP BY artwork_series.id
       ORDER BY datetime(artwork_series.created_at) DESC, artwork_series.id DESC
       LIMIT ?`
    )
    .bind(...bindings, profilePageLimit + 1)
    .all<ArtworkSeriesRow>();
  const pageRows = result.results.slice(0, profilePageLimit);
  const lastRow = pageRows.at(-1);
  const series = await withSeriesPreviews(
    db,
    pageRows.map(seriesFromRow),
    viewer,
    matureAccess
  );
  return {
    series,
    nextCursor:
      result.results.length > profilePageLimit && lastRow
        ? encodeProfileCursor("publicSeries", {
            createdAt: lastRow.created_at,
            id: lastRow.id
          })
        : null
  };
};

const profileContentAccessWhere = (
  viewer: CurrentUser | undefined,
  matureAccess: MatureAccess
) => {
  const baseWhere = galleryAccessWhere(viewer, matureAccess, matureAccess.allowed ? "all" : "general");
  const visibilityIndex = baseWhere.clauses.indexOf(publicArtworkVisibilitySql);
  if (visibilityIndex >= 0) {
    baseWhere.clauses[visibilityIndex] = ownerAwareArtworkVisibilitySql();
    baseWhere.bindings.splice(0, 0, ...artworkVisibilityBindValues(viewer));
  }
  return baseWhere;
};

const getCreatorArtworkStats = async (
  db: D1Database,
  creatorId: string,
  viewer: CurrentUser | undefined,
  matureAccess: MatureAccess
) => {
  const baseWhere = profileContentAccessWhere(viewer, matureAccess);
  baseWhere.clauses.push("artworks.creator_id = ?");
  baseWhere.bindings.push(creatorId);
  const whereSql = baseWhere.clauses.join("\n         AND ");
  return db
    .prepare(
      `SELECT
        COUNT(*) AS artworks,
        COALESCE(SUM(artworks.like_count), 0) AS total_likes,
        COALESCE(SUM(artworks.view_count), 0) AS total_views
       FROM artworks
       JOIN creators ON creators.id = artworks.creator_id
       JOIN users AS creator_user ON creator_user.id = artworks.creator_id
       WHERE ${whereSql}`
    )
    .bind(...baseWhere.bindings)
    .first<{ artworks: number; total_likes: number | null; total_views: number | null }>();
};

const getBookmarkCountForProfile = async (
  db: D1Database,
  userId: string,
  visibility: BookmarkVisibility,
  viewer: CurrentUser | undefined,
  matureAccess: MatureAccess
) => {
  const baseWhere = profileContentAccessWhere(viewer, matureAccess);
  baseWhere.clauses.push("user_bookmarks.user_id = ?");
  baseWhere.clauses.push("user_bookmarks.visibility = ?");
  baseWhere.bindings.push(userId, visibility);
  const whereSql = baseWhere.clauses.join("\n         AND ");
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS count
       FROM user_bookmarks
       JOIN artworks ON artworks.id = user_bookmarks.artwork_id
       JOIN creators ON creators.id = artworks.creator_id
       JOIN users AS creator_user ON creator_user.id = artworks.creator_id
       WHERE ${whereSql}`
    )
    .bind(...baseWhere.bindings)
    .first<{ count: number }>();
  return row?.count ?? 0;
};

const getPublicCollectionCountForProfile = async (db: D1Database, userId: string) => {
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS count
       FROM collections
       WHERE creator_id = ?
         AND visibility = 'public'`
    )
    .bind(userId)
    .first<{ count: number }>();
  return row?.count ?? 0;
};

const getPublicSeriesCountForProfile = async (db: D1Database, userId: string) => {
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS count
       FROM artwork_series
       WHERE creator_id = ?
         AND visibility = 'public'`
    )
    .bind(userId)
    .first<{ count: number }>();
  return row?.count ?? 0;
};

const getFollowingCountForProfile = async (db: D1Database, userId: string) => {
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS count
       FROM follows
       JOIN users ON users.id = follows.followed_creator_id
       WHERE follows.follower_creator_id = ?
         AND users.suspended_at IS NULL`
    )
    .bind(userId)
    .first<{ count: number }>();
  return row?.count ?? 0;
};

const getProfileFollowPage = async (
  db: D1Database,
  profileUserId: string,
  username: string,
  mode: FollowListMode,
  viewer: CurrentUser | undefined,
  limit: number,
  cursor: FollowListCursor | undefined
) => {
  const relationColumn =
    mode === "followers" ? "follows.follower_creator_id" : "follows.followed_creator_id";
  const profileColumn =
    mode === "followers" ? "follows.followed_creator_id" : "follows.follower_creator_id";
  const baseClauses = [
    `${profileColumn} = ?`,
    "relation_user.suspended_at IS NULL",
    profileVisibilitySql("relation_user")
  ];
  const baseBindings: Array<string | number | null> = [
    profileUserId,
    ...profileVisibilityBindValues(viewer)
  ];

  if (viewer) {
    baseClauses.push(
      `NOT EXISTS (
        SELECT 1
        FROM user_blocks
        WHERE (blocker_user_id = ? AND blocked_user_id = relation_user.id)
           OR (blocker_user_id = relation_user.id AND blocked_user_id = ?)
      )`
    );
    baseBindings.push(viewer.id, viewer.id);
  }

  const pageClauses = [...baseClauses];
  const pageBindings = [...baseBindings];
  if (cursor) {
    pageClauses.push(
      `(datetime(follows.created_at) < datetime(?)
        OR (
          datetime(follows.created_at) = datetime(?)
          AND relation_user.id < ?
        ))`
    );
    pageBindings.push(cursor.followedAt, cursor.followedAt, cursor.id);
  }

  const pageWhereSql = pageClauses.join("\n         AND ");
  const countWhereSql = baseClauses.join("\n         AND ");
  const [rows, totalRow] = await Promise.all([
    db
      .prepare(
        `SELECT
          relation_user.id,
          creators.handle,
          creators.display_name,
          creators.avatar_url,
          creators.bio,
          creators.follower_count,
          creators.following,
          follows.created_at AS followed_at
         FROM follows
         JOIN users AS relation_user ON relation_user.id = ${relationColumn}
         JOIN creators ON creators.id = relation_user.id
         WHERE ${pageWhereSql}
         ORDER BY datetime(follows.created_at) DESC, relation_user.id DESC
         LIMIT ?`
      )
      .bind(...pageBindings, limit + 1)
      .all<{
        id: string;
        handle: string;
        display_name: string;
        avatar_url: string | null;
        bio: string | null;
        follower_count: number | null;
        following: number | null;
        followed_at: string;
      }>(),
    db
      .prepare(
        `SELECT COUNT(*) AS count
         FROM follows
         JOIN users AS relation_user ON relation_user.id = ${relationColumn}
         JOIN creators ON creators.id = relation_user.id
         WHERE ${countWhereSql}`
      )
      .bind(...baseBindings)
      .first<{ count: number }>()
  ]);

  const pageRows = rows.results.slice(0, limit);
  const hasMore = rows.results.length > limit;
  const creators = await withViewerCreatorFollowing(
    db,
    viewer?.id,
    pageRows.map((row) => ({
      id: row.id,
      handle: row.handle,
      displayName: row.display_name,
      avatarUrl: row.avatar_url ?? "",
      bio: row.bio ?? "",
      followerCount: row.follower_count ?? 0,
      following: Boolean(row.following)
    }))
  );
  const users: ProfileFollowListItem[] = pageRows.map((row, index) => ({
    creator: creators[index],
    followedAt: row.followed_at
  }));
  const lastRow = pageRows.at(-1);

  return {
    users,
    nextCursor:
      hasMore && lastRow
        ? encodeFollowListCursor(username, mode, {
            followedAt: lastRow.followed_at,
            id: lastRow.id
          })
        : null,
    totalCount: totalRow?.count ?? 0
  };
};

const getRankingItems = async (
  db: D1Database,
  artworks: Artwork[],
  period: RankingPeriod,
  limit: number
) => {
  if (artworks.length === 0) {
    return [];
  }

  const interval = period === "weekly" ? "-7 days" : "-1 day";
  const placeholders = artworks.map(() => "?").join(", ");
  const result = await db
    .prepare(
      `SELECT artwork_id, COUNT(*) AS score
       FROM artwork_likes
       WHERE artwork_id IN (${placeholders})
         AND datetime(created_at) >= datetime('now', ?)
       GROUP BY artwork_id`
    )
    .bind(...artworks.map((artwork) => artwork.id), interval)
    .all<{ artwork_id: string; score: number }>();
  const scoreByArtworkId = new Map(result.results.map((row) => [row.artwork_id, row.score]));

  return [...artworks]
    .map((artwork) => ({
      artwork,
      score: scoreByArtworkId.get(artwork.id) ?? 0
    }))
    .filter((item) => item.score > 0 || item.artwork.likeCount > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.artwork.likeCount - left.artwork.likeCount ||
        new Date(right.artwork.createdAt).getTime() - new Date(left.artwork.createdAt).getTime()
    )
    .slice(0, limit);
};

const getArtworksByIds = async (
  db: D1Database,
  ids: string[],
  viewer?: CurrentUser
) => {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) {
    return new Map<string, Artwork>();
  }

  const placeholders = uniqueIds.map(() => "?").join(", ");
  const result = await db
    .prepare(
      `${artworkSelect}
       WHERE artworks.id IN (${placeholders})
         AND artworks.hidden_at IS NULL
         AND ${publicArtworkVisibilitySql}
         AND ${profileVisibilitySql("creator_user")}`
    )
    .bind(...uniqueIds, ...profileVisibilityBindValues(viewer))
    .all<ArtworkRow>();
  const artworks = await withArtworkImages(db, result.results.map((row) => artworkFromRow(row)));
  const followedArtworks = await withViewerArtworkFollowing(db, viewer?.id, artworks);
  const likedArtworks = await withViewerLikes(db, viewer?.id, followedArtworks);
  const bookmarkedArtworks = await withViewerBookmarks(db, viewer?.id, likedArtworks);
  return new Map(bookmarkedArtworks.map((artwork) => [artwork.id, artwork]));
};

const ensureCreatorProfile = async (
  db: D1Database,
  user: CurrentUser,
  profile: { username: string; displayName: string; avatarUrl: string; websiteUrl: string; bio: string }
) => {
  await db
    .prepare(
      `INSERT INTO creators (id, handle, display_name, avatar_url, bio, website_url)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         handle = excluded.handle,
         display_name = excluded.display_name,
         avatar_url = excluded.avatar_url,
         bio = excluded.bio,
         website_url = excluded.website_url`
    )
    .bind(user.id, profile.username, profile.displayName, profile.avatarUrl, profile.bio, profile.websiteUrl)
    .run();
};

const defaultNotificationPreferences: NotificationPreferences = {
  likes: true,
  comments: true,
  follows: true,
  moderation: true
};

const notificationPreferencesFromRow = (
  row: NotificationPreferencesRow | null | undefined
): NotificationPreferences => ({
  likes: row ? Boolean(row.likes_enabled) : defaultNotificationPreferences.likes,
  comments: row ? Boolean(row.comments_enabled) : defaultNotificationPreferences.comments,
  follows: row ? Boolean(row.follows_enabled) : defaultNotificationPreferences.follows,
  moderation: row ? Boolean(row.moderation_enabled) : defaultNotificationPreferences.moderation
});

const getNotificationPreferences = async (
  db: D1Database,
  userId: string
): Promise<NotificationPreferences> => {
  const row = await db
    .prepare(
      `SELECT likes_enabled, comments_enabled, follows_enabled, moderation_enabled
       FROM user_notification_preferences
       WHERE user_id = ?
       LIMIT 1`
    )
    .bind(userId)
    .first<NotificationPreferencesRow>();
  return notificationPreferencesFromRow(row);
};

const setNotificationPreferences = async (
  db: D1Database,
  userId: string,
  preferences: NotificationPreferences
) => {
  await db
    .prepare(
      `INSERT INTO user_notification_preferences
        (user_id, likes_enabled, comments_enabled, follows_enabled, moderation_enabled)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         likes_enabled = excluded.likes_enabled,
         comments_enabled = excluded.comments_enabled,
         follows_enabled = excluded.follows_enabled,
         moderation_enabled = excluded.moderation_enabled,
         updated_at = CURRENT_TIMESTAMP`
    )
    .bind(
      userId,
      preferences.likes ? 1 : 0,
      preferences.comments ? 1 : 0,
      preferences.follows ? 1 : 0,
      preferences.moderation ? 1 : 0
    )
    .run();
};

const notificationPreferenceEnabled = (
  preferences: NotificationPreferences,
  type: NotificationType
) => {
  if (type === "like") {
    return preferences.likes;
  }
  if (type === "comment") {
    return preferences.comments;
  }
  if (type === "follow") {
    return preferences.follows;
  }
  return preferences.moderation;
};

const createNotification = async (
  db: D1Database,
  params: {
    userId: string;
    actorUserId?: string | null;
    type: NotificationType;
    artworkId?: string | null;
    commentId?: string | null;
    message: string;
  }
) => {
  if (params.actorUserId && params.actorUserId === params.userId) {
    return;
  }
  try {
    const preferences = await getNotificationPreferences(db, params.userId);
    if (!notificationPreferenceEnabled(preferences, params.type)) {
      return;
    }
    await db
      .prepare(
        `INSERT INTO notifications
          (id, user_id, actor_user_id, type, artwork_id, comment_id, message)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        `ntf_${crypto.randomUUID().replaceAll("-", "")}`,
        params.userId,
        params.actorUserId ?? null,
        params.type,
        params.artworkId ?? null,
        params.commentId ?? null,
        params.message
      )
      .run();
  } catch (error) {
    console.warn("Unable to create notification", error);
  }
};

const createActivityEvent = async (
  db: D1Database,
  params: {
    actorUserId: string;
    type: ActivityType;
    artworkId?: string | null;
    commentId?: string | null;
    targetUserId?: string | null;
    message: string;
  }
) => {
  try {
    await db
      .prepare(
        `INSERT INTO activity_events
          (id, actor_user_id, type, artwork_id, comment_id, target_user_id, message)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        `act_${crypto.randomUUID().replaceAll("-", "")}`,
        params.actorUserId,
        params.type,
        params.artworkId ?? null,
        params.commentId ?? null,
        params.targetUserId ?? null,
        params.message
      )
      .run();
  } catch (error) {
    console.warn("Unable to create activity event", error);
  }
};

const collectionPreviewFromRow = (row: CollectionPreviewRow): CollectionPreviewArtwork => ({
  id: row.artwork_id,
  title: row.title,
  thumbnailUrl: mediaThumbnailUrl(row.image_url || row.thumbnail_url),
  dominantColor: row.dominant_color
});

const withCollectionPreviews = async (
  db: D1Database,
  collections: UserCollection[],
  viewer: CurrentUser | undefined,
  matureAccess: MatureAccess | undefined
) => {
  if (collections.length === 0 || !matureAccess) {
    return collections;
  }
  const placeholders = collections.map(() => "?").join(", ");
  const collectionsById = new Map(collections.map((collection) => [collection.id, collection]));
  const baseWhere = galleryAccessWhere(
    viewer,
    matureAccess,
    matureAccess.allowed ? "all" : "general"
  );
  baseWhere.clauses.push(`collection_items.collection_id IN (${placeholders})`);
  baseWhere.bindings.push(...collections.map((collection) => collection.id));
  const whereSql = baseWhere.clauses.join("\n           AND ");
  const rows = await db
    .prepare(
      `SELECT
        collection_id,
        artwork_id,
        title,
        image_url,
        thumbnail_url,
        dominant_color
       FROM (
        SELECT
          collection_items.collection_id,
          artworks.id AS artwork_id,
          artworks.title,
          artworks.image_url,
          artworks.thumbnail_url,
          artworks.dominant_color,
          ROW_NUMBER() OVER (
            PARTITION BY collection_items.collection_id
            ORDER BY datetime(collection_items.created_at) DESC, artworks.id DESC
          ) AS preview_rank
        FROM collection_items
        JOIN artworks ON artworks.id = collection_items.artwork_id
        JOIN creators ON creators.id = artworks.creator_id
        JOIN users AS creator_user ON creator_user.id = artworks.creator_id
        WHERE ${whereSql}
       )
       WHERE preview_rank <= 3
       ORDER BY collection_id, preview_rank`
    )
    .bind(...baseWhere.bindings)
    .all<CollectionPreviewRow>();

  const previewsByCollectionId = new Map<string, CollectionPreviewArtwork[]>();
  for (const row of rows.results) {
    const previews = previewsByCollectionId.get(row.collection_id) ?? [];
    previews.push(collectionPreviewFromRow(row));
    previewsByCollectionId.set(row.collection_id, previews);
  }

  const coverIds = Array.from(
    new Set(
      collections
        .map((collection) => collection.coverArtworkId)
        .filter((artworkId): artworkId is string => Boolean(artworkId))
    )
  );
  const coverByCollectionId = new Map<string, CollectionPreviewArtwork>();
  if (coverIds.length > 0) {
    const coverWhere = galleryAccessWhere(
      viewer,
      matureAccess,
      matureAccess.allowed ? "all" : "general"
    );
    coverWhere.clauses.push(`collection_items.collection_id IN (${placeholders})`);
    coverWhere.clauses.push(`artworks.id IN (${coverIds.map(() => "?").join(", ")})`);
    coverWhere.bindings.push(...collections.map((collection) => collection.id), ...coverIds);
    const coverRows = await db
      .prepare(
        `SELECT
          collection_items.collection_id,
          artworks.id AS artwork_id,
          artworks.title,
          artworks.image_url,
          artworks.thumbnail_url,
          artworks.dominant_color
         FROM collection_items
         JOIN artworks ON artworks.id = collection_items.artwork_id
         JOIN creators ON creators.id = artworks.creator_id
         JOIN users AS creator_user ON creator_user.id = artworks.creator_id
         WHERE ${coverWhere.clauses.join("\n           AND ")}`
      )
      .bind(...coverWhere.bindings)
      .all<CollectionPreviewRow>();
    for (const row of coverRows.results) {
      const collection = collectionsById.get(row.collection_id);
      if (collection?.coverArtworkId === row.artwork_id) {
        coverByCollectionId.set(row.collection_id, collectionPreviewFromRow(row));
      }
    }
  }

  return collections.map((collection) => ({
    ...collection,
    previewArtworks: [
      ...(coverByCollectionId.has(collection.id)
        ? [coverByCollectionId.get(collection.id) as CollectionPreviewArtwork]
        : []),
      ...(previewsByCollectionId.get(collection.id) ?? []).filter(
        (artwork) => artwork.id !== collection.coverArtworkId
      )
    ].slice(0, 3)
  }));
};

const getUserCollections = async (
  db: D1Database,
  userId: string,
  viewer?: CurrentUser,
  matureAccess?: MatureAccess
) => {
  const result = await db
    .prepare(
      `SELECT
        collections.id,
        collections.name,
        collections.description,
        collections.visibility,
        collections.created_at,
        collections.updated_at,
        collections.cover_artwork_id,
        COUNT(collection_items.artwork_id) AS item_count,
        GROUP_CONCAT(collection_items.artwork_id) AS artwork_ids
       FROM collections
       LEFT JOIN collection_items ON collection_items.collection_id = collections.id
       WHERE collections.creator_id = ?
       GROUP BY collections.id
       ORDER BY datetime(collections.created_at) DESC`
    )
    .bind(userId)
    .all<CollectionRow>();
  return withCollectionPreviews(
    db,
    result.results.map(collectionFromRow),
    viewer,
    matureAccess
  );
};

const getCollectionSummaryById = async (db: D1Database, collectionId: string) =>
  db
    .prepare(
      `SELECT
        collections.id,
        collections.name,
        collections.description,
        collections.visibility,
        collections.created_at,
        collections.updated_at,
        collections.cover_artwork_id,
        COUNT(collection_items.artwork_id) AS item_count,
        GROUP_CONCAT(collection_items.artwork_id) AS artwork_ids,
        collections.creator_id,
        creators.handle AS creator_handle,
        creators.display_name AS creator_display_name,
        creators.avatar_url AS creator_avatar_url,
        creators.bio AS creator_bio,
        creators.follower_count AS creator_follower_count,
        creators.following AS creator_following,
        owner.profile_visibility AS creator_profile_visibility,
        owner.suspended_at AS creator_suspended_at
       FROM collections
       JOIN users AS owner ON owner.id = collections.creator_id
       JOIN creators ON creators.id = collections.creator_id
       LEFT JOIN collection_items ON collection_items.collection_id = collections.id
       WHERE collections.id = ?
       GROUP BY collections.id
       LIMIT 1`
    )
    .bind(collectionId)
    .first<CollectionDetailRow>();

const getCollectionArtworkPage = async (
  db: D1Database,
  collectionId: string,
  viewer: CurrentUser | undefined,
  matureAccess: MatureAccess,
  limit: number,
  cursor: { createdAt: string; id: string } | undefined
) => {
  const baseWhere = galleryAccessWhere(
    viewer,
    matureAccess,
    matureAccess.allowed ? "all" : "general"
  );
  baseWhere.clauses.push("collection_items.collection_id = ?");
  baseWhere.bindings.push(collectionId);

  const pageClauses = [...baseWhere.clauses];
  const pageBindings = [...baseWhere.bindings];
  if (cursor) {
    pageClauses.push(
      `(datetime(collection_items.created_at) < datetime(?)
        OR (
          datetime(collection_items.created_at) = datetime(?)
          AND artworks.id < ?
        ))`
    );
    pageBindings.push(cursor.createdAt, cursor.createdAt, cursor.id);
  }

  const whereSql = baseWhere.clauses.join("\n         AND ");
  const pageWhereSql = pageClauses.join("\n         AND ");
  const [pageResult, totalRow] = await Promise.all([
    db
      .prepare(
        `${collectionArtworkSelect}
         JOIN collection_items ON collection_items.artwork_id = artworks.id
         WHERE ${pageWhereSql}
         ORDER BY datetime(collection_items.created_at) DESC, artworks.id DESC
         LIMIT ?`
      )
      .bind(...pageBindings, limit + 1)
      .all<ArtworkRow & { collection_item_created_at: string }>(),
    db
      .prepare(
        `SELECT COUNT(*) AS count
         FROM collection_items
         JOIN artworks ON artworks.id = collection_items.artwork_id
         JOIN creators ON creators.id = artworks.creator_id
         JOIN users AS creator_user ON creator_user.id = artworks.creator_id
         WHERE ${whereSql}`
      )
      .bind(...baseWhere.bindings)
      .first<{ count: number }>()
  ]);

  const pageRows = pageResult.results.slice(0, limit);
  const hasMore = pageResult.results.length > limit;
  const artworksWithImages = await withArtworkImages(db, pageRows.map((row) => artworkFromRow(row)));
  const followedArtworks = await withViewerArtworkFollowing(db, viewer?.id, artworksWithImages);
  const likedArtworks = await withViewerLikes(db, viewer?.id, followedArtworks);
  const artworks = await withViewerBookmarks(db, viewer?.id, likedArtworks);
  const lastRow = pageRows.at(-1);

  return {
    artworks,
    nextCursor:
      hasMore && lastRow
        ? encodeCollectionCursor(collectionId, {
            createdAt: lastRow.collection_item_created_at,
            id: lastRow.id
          })
        : null,
    totalCount: totalRow?.count ?? 0
  };
};

const seriesPreviewFromRow = (row: ArtworkSeriesPreviewRow): SeriesPreviewArtwork => ({
  id: row.artwork_id,
  title: row.title,
  thumbnailUrl: mediaThumbnailUrl(row.image_url || row.thumbnail_url),
  dominantColor: row.dominant_color
});

const withSeriesPreviews = async (
  db: D1Database,
  seriesItems: ArtworkSeries[],
  viewer: CurrentUser | undefined,
  matureAccess: MatureAccess | undefined
) => {
  if (seriesItems.length === 0 || !matureAccess) {
    return seriesItems;
  }
  const placeholders = seriesItems.map(() => "?").join(", ");
  const seriesById = new Map(seriesItems.map((series) => [series.id, series]));
  const baseWhere = galleryAccessWhere(
    viewer,
    matureAccess,
    matureAccess.allowed ? "all" : "general"
  );
  baseWhere.clauses.push(`artwork_series_items.series_id IN (${placeholders})`);
  baseWhere.bindings.push(...seriesItems.map((series) => series.id));
  const rows = await db
    .prepare(
      `SELECT
        series_id,
        artwork_id,
        title,
        image_url,
        thumbnail_url,
        dominant_color
       FROM (
        SELECT
          artwork_series_items.series_id,
          artworks.id AS artwork_id,
          artworks.title,
          artworks.image_url,
          artworks.thumbnail_url,
          artworks.dominant_color,
          ROW_NUMBER() OVER (
            PARTITION BY artwork_series_items.series_id
            ORDER BY artwork_series_items.position ASC, artworks.id ASC
          ) AS preview_rank
        FROM artwork_series_items
        JOIN artworks ON artworks.id = artwork_series_items.artwork_id
        JOIN creators ON creators.id = artworks.creator_id
        JOIN users AS creator_user ON creator_user.id = artworks.creator_id
        WHERE ${baseWhere.clauses.join("\n           AND ")}
       )
       WHERE preview_rank <= 3
       ORDER BY series_id, preview_rank`
    )
    .bind(...baseWhere.bindings)
    .all<ArtworkSeriesPreviewRow>();

  const previewsBySeriesId = new Map<string, SeriesPreviewArtwork[]>();
  for (const row of rows.results) {
    const previews = previewsBySeriesId.get(row.series_id) ?? [];
    previews.push(seriesPreviewFromRow(row));
    previewsBySeriesId.set(row.series_id, previews);
  }

  const coverIds = Array.from(
    new Set(
      seriesItems
        .map((series) => series.coverArtworkId)
        .filter((artworkId): artworkId is string => Boolean(artworkId))
    )
  );
  const coverBySeriesId = new Map<string, SeriesPreviewArtwork>();
  if (coverIds.length > 0) {
    const coverWhere = galleryAccessWhere(
      viewer,
      matureAccess,
      matureAccess.allowed ? "all" : "general"
    );
    coverWhere.clauses.push(`artwork_series_items.series_id IN (${placeholders})`);
    coverWhere.clauses.push(`artworks.id IN (${coverIds.map(() => "?").join(", ")})`);
    coverWhere.bindings.push(...seriesItems.map((series) => series.id), ...coverIds);
    const coverRows = await db
      .prepare(
        `SELECT
          artwork_series_items.series_id,
          artworks.id AS artwork_id,
          artworks.title,
          artworks.image_url,
          artworks.thumbnail_url,
          artworks.dominant_color
         FROM artwork_series_items
         JOIN artworks ON artworks.id = artwork_series_items.artwork_id
         JOIN creators ON creators.id = artworks.creator_id
         JOIN users AS creator_user ON creator_user.id = artworks.creator_id
         WHERE ${coverWhere.clauses.join("\n           AND ")}`
      )
      .bind(...coverWhere.bindings)
      .all<ArtworkSeriesPreviewRow>();
    for (const row of coverRows.results) {
      const series = seriesById.get(row.series_id);
      if (series?.coverArtworkId === row.artwork_id) {
        coverBySeriesId.set(row.series_id, seriesPreviewFromRow(row));
      }
    }
  }

  return seriesItems.map((series) => ({
    ...series,
    previewArtworks: [
      ...(coverBySeriesId.has(series.id)
        ? [coverBySeriesId.get(series.id) as SeriesPreviewArtwork]
        : []),
      ...(previewsBySeriesId.get(series.id) ?? []).filter(
        (artwork) => artwork.id !== series.coverArtworkId
      )
    ].slice(0, 3)
  }));
};

const getUserSeries = async (
  db: D1Database,
  userId: string,
  viewer?: CurrentUser,
  matureAccess?: MatureAccess
) => {
  const result = await db
    .prepare(
      `SELECT
        artwork_series.id,
        artwork_series.title,
        artwork_series.description,
        artwork_series.visibility,
        artwork_series.created_at,
        artwork_series.updated_at,
        artwork_series.cover_artwork_id,
        COUNT(artwork_series_items.artwork_id) AS item_count,
        GROUP_CONCAT(artwork_series_items.artwork_id) AS artwork_ids
       FROM artwork_series
       LEFT JOIN artwork_series_items ON artwork_series_items.series_id = artwork_series.id
       WHERE artwork_series.creator_id = ?
       GROUP BY artwork_series.id
       ORDER BY datetime(artwork_series.created_at) DESC`
    )
    .bind(userId)
    .all<ArtworkSeriesRow>();
  return withSeriesPreviews(
    db,
    result.results.map(seriesFromRow),
    viewer,
    matureAccess
  );
};

const getSeriesSummaryById = async (db: D1Database, seriesId: string) =>
  db
    .prepare(
      `SELECT
        artwork_series.id,
        artwork_series.title,
        artwork_series.description,
        artwork_series.visibility,
        artwork_series.created_at,
        artwork_series.updated_at,
        artwork_series.cover_artwork_id,
        COUNT(artwork_series_items.artwork_id) AS item_count,
        GROUP_CONCAT(artwork_series_items.artwork_id) AS artwork_ids,
        artwork_series.creator_id,
        creators.handle AS creator_handle,
        creators.display_name AS creator_display_name,
        creators.avatar_url AS creator_avatar_url,
        creators.bio AS creator_bio,
        creators.follower_count AS creator_follower_count,
        creators.following AS creator_following,
        owner.profile_visibility AS creator_profile_visibility,
        owner.suspended_at AS creator_suspended_at
       FROM artwork_series
       JOIN users AS owner ON owner.id = artwork_series.creator_id
       JOIN creators ON creators.id = artwork_series.creator_id
       LEFT JOIN artwork_series_items ON artwork_series_items.series_id = artwork_series.id
       WHERE artwork_series.id = ?
       GROUP BY artwork_series.id
       LIMIT 1`
    )
    .bind(seriesId)
    .first<ArtworkSeriesDetailRow>();

const getSeriesArtworkPage = async (
  db: D1Database,
  seriesId: string,
  viewer: CurrentUser | undefined,
  matureAccess: MatureAccess,
  limit: number,
  cursor: SeriesCursor | undefined
) => {
  const baseWhere = galleryAccessWhere(
    viewer,
    matureAccess,
    matureAccess.allowed ? "all" : "general"
  );
  baseWhere.clauses.push("artwork_series_items.series_id = ?");
  baseWhere.bindings.push(seriesId);

  const pageClauses = [...baseWhere.clauses];
  const pageBindings = [...baseWhere.bindings];
  if (cursor) {
    pageClauses.push(
      `(artwork_series_items.position > ?
        OR (
          artwork_series_items.position = ?
          AND artworks.id > ?
        ))`
    );
    pageBindings.push(cursor.position, cursor.position, cursor.id);
  }

  const whereSql = baseWhere.clauses.join("\n         AND ");
  const pageWhereSql = pageClauses.join("\n         AND ");
  const [pageResult, totalRow] = await Promise.all([
    db
      .prepare(
        `${seriesArtworkSelect}
         JOIN artwork_series_items ON artwork_series_items.artwork_id = artworks.id
         WHERE ${pageWhereSql}
         ORDER BY artwork_series_items.position ASC, artworks.id ASC
         LIMIT ?`
      )
      .bind(...pageBindings, limit + 1)
      .all<ArtworkRow & { series_item_position: number }>(),
    db
      .prepare(
        `SELECT COUNT(*) AS count
         FROM artwork_series_items
         JOIN artworks ON artworks.id = artwork_series_items.artwork_id
         JOIN creators ON creators.id = artworks.creator_id
         JOIN users AS creator_user ON creator_user.id = artworks.creator_id
         WHERE ${whereSql}`
      )
      .bind(...baseWhere.bindings)
      .first<{ count: number }>()
  ]);

  const pageRows = pageResult.results.slice(0, limit);
  const hasMore = pageResult.results.length > limit;
  const artworksWithImages = await withArtworkImages(db, pageRows.map((row) => artworkFromRow(row)));
  const followedArtworks = await withViewerArtworkFollowing(db, viewer?.id, artworksWithImages);
  const likedArtworks = await withViewerLikes(db, viewer?.id, followedArtworks);
  const artworks = await withViewerBookmarks(db, viewer?.id, likedArtworks);
  const lastRow = pageRows.at(-1);

  return {
    artworks,
    nextCursor:
      hasMore && lastRow
        ? encodeSeriesCursor(seriesId, {
            position: lastRow.series_item_position,
            id: lastRow.id
          })
        : null,
    totalCount: totalRow?.count ?? 0
  };
};

const escapeSqlLike = (value: string) => value.replace(/[\\%_]/g, (match) => `\\${match}`);

const normalizeCollectionDiscoveryQuery = (value: string | null | undefined) =>
  (value ?? "").trim().replace(/\s+/g, " ").slice(0, 120);

const collectionDiscoveryCursorIsValid = (
  sort: CollectionDiscoverySort,
  query: string,
  cursor: CollectionDiscoveryCursor | undefined
) => {
  if (!cursor) {
    return true;
  }
  if (cursor.sort && cursor.sort !== sort) {
    return false;
  }
  if ((cursor.query ?? "") !== query) {
    return false;
  }
  return sort === "largest" ? typeof cursor.itemCount === "number" : true;
};

const collectionDiscoveryOrderSql = (sort: CollectionDiscoverySort) =>
  sort === "largest"
    ? `item_count DESC,
       datetime(COALESCE(collections.updated_at, collections.created_at)) DESC,
       collections.id DESC`
    : `datetime(COALESCE(collections.updated_at, collections.created_at)) DESC,
       collections.id DESC`;

const appendCollectionDiscoveryCursorHaving = (
  sort: CollectionDiscoverySort,
  cursor: CollectionDiscoveryCursor,
  clauses: string[],
  bindings: Array<string | number | null>
) => {
  if (sort === "largest") {
    clauses.push(
      `(COUNT(collection_items.artwork_id) < ?
        OR (
          COUNT(collection_items.artwork_id) = ?
          AND (
            datetime(COALESCE(collections.updated_at, collections.created_at)) < datetime(?)
            OR (
              datetime(COALESCE(collections.updated_at, collections.created_at)) = datetime(?)
              AND collections.id < ?
            )
          )
        ))`
    );
    bindings.push(
      cursor.itemCount ?? 0,
      cursor.itemCount ?? 0,
      cursor.updatedAt,
      cursor.updatedAt,
      cursor.id
    );
    return;
  }
  clauses.push(
    `(datetime(COALESCE(collections.updated_at, collections.created_at)) < datetime(?)
      OR (
        datetime(COALESCE(collections.updated_at, collections.created_at)) = datetime(?)
        AND collections.id < ?
      ))`
  );
  bindings.push(cursor.updatedAt, cursor.updatedAt, cursor.id);
};

const collectionDiscoveryWhere = (viewer: CurrentUser | undefined, query: string) => {
  const clauses = [
    "collections.visibility = 'public'",
    "owner.suspended_at IS NULL",
    profileVisibilitySql("owner")
  ];
  const bindings: Array<string | number | null> = [...profileVisibilityBindValues(viewer)];

  if (query) {
    const pattern = `%${escapeSqlLike(query.toLowerCase())}%`;
    clauses.push(
      `(lower(collections.name) LIKE ? ESCAPE '\\'
        OR lower(collections.description) LIKE ? ESCAPE '\\'
        OR lower(creators.handle) LIKE ? ESCAPE '\\'
        OR lower(creators.display_name) LIKE ? ESCAPE '\\')`
    );
    bindings.push(pattern, pattern, pattern, pattern);
  }

  if (viewer) {
    clauses.push(
      `NOT EXISTS (
        SELECT 1
        FROM user_blocks
        WHERE (blocker_user_id = ? AND blocked_user_id = collections.creator_id)
           OR (blocker_user_id = collections.creator_id AND blocked_user_id = ?)
      )`
    );
    bindings.push(viewer.id, viewer.id);
  }

  return { clauses, bindings };
};

const getPublicCollectionDiscoveryPage = async (
  db: D1Database,
  viewer: CurrentUser | undefined,
  matureAccess: MatureAccess,
  sort: CollectionDiscoverySort,
  query: string,
  limit: number,
  cursor: CollectionDiscoveryCursor | undefined
) => {
  const baseWhere = collectionDiscoveryWhere(viewer, query);
  const pageHavingClauses: string[] = [];
  const pageBindings = [...baseWhere.bindings];
  if (cursor) {
    appendCollectionDiscoveryCursorHaving(sort, cursor, pageHavingClauses, pageBindings);
  }

  const whereSql = baseWhere.clauses.join("\n         AND ");
  const pageHavingSql = pageHavingClauses.length
    ? `HAVING ${pageHavingClauses.join("\n           AND ")}`
    : "";
  const [pageResult, totalRow] = await Promise.all([
    db
      .prepare(
        `SELECT
          collections.id,
          collections.name,
          collections.description,
          collections.visibility,
          collections.created_at,
          collections.updated_at,
          collections.cover_artwork_id,
          COUNT(collection_items.artwork_id) AS item_count,
          GROUP_CONCAT(collection_items.artwork_id) AS artwork_ids,
          collections.creator_id,
          creators.handle AS creator_handle,
          creators.display_name AS creator_display_name,
          creators.avatar_url AS creator_avatar_url,
          creators.bio AS creator_bio,
          creators.follower_count AS creator_follower_count,
          creators.following AS creator_following,
          owner.profile_visibility AS creator_profile_visibility,
          owner.suspended_at AS creator_suspended_at
         FROM collections
         JOIN users AS owner ON owner.id = collections.creator_id
         JOIN creators ON creators.id = collections.creator_id
         LEFT JOIN collection_items ON collection_items.collection_id = collections.id
         WHERE ${whereSql}
         GROUP BY collections.id
         ${pageHavingSql}
         ORDER BY ${collectionDiscoveryOrderSql(sort)}
         LIMIT ?`
      )
      .bind(...pageBindings, limit + 1)
      .all<CollectionDetailRow>(),
    db
      .prepare(
        `SELECT COUNT(*) AS count
         FROM collections
         JOIN users AS owner ON owner.id = collections.creator_id
         JOIN creators ON creators.id = collections.creator_id
         WHERE ${whereSql}`
      )
      .bind(...baseWhere.bindings)
      .first<{ count: number }>()
  ]);

  const pageRows = pageResult.results.slice(0, limit);
  const collections = await withCollectionPreviews(
    db,
    pageRows.map(collectionFromRow),
    viewer,
    matureAccess
  );
  const followedOwnerIds = new Set<string>();
  if (viewer && pageRows.length > 0) {
    const uniqueOwnerIds = Array.from(new Set(pageRows.map((row) => row.creator_id)));
    const placeholders = uniqueOwnerIds.map(() => "?").join(", ");
    const followed = await db
      .prepare(
        `SELECT followed_creator_id
         FROM follows
         WHERE follower_creator_id = ?
           AND followed_creator_id IN (${placeholders})`
      )
      .bind(viewer.id, ...uniqueOwnerIds)
      .all<{ followed_creator_id: string }>();
    for (const row of followed.results) {
      followedOwnerIds.add(row.followed_creator_id);
    }
  }

  const items: CollectionDiscoveryItem[] = collections.map((collection, index) => ({
    collection,
    owner: {
      ...collectionOwnerFromRow(pageRows[index]),
      following: followedOwnerIds.has(pageRows[index].creator_id)
    }
  }));
  const lastRow = pageRows.at(-1);

  return {
    collections: items,
    nextCursor:
      pageResult.results.length > limit && lastRow
        ? encodeCollectionDiscoveryCursor(sort, query, {
            updatedAt: lastRow.updated_at ?? lastRow.created_at,
            id: lastRow.id,
            itemCount: lastRow.item_count
          })
        : null,
    totalCount: totalRow?.count ?? 0
  };
};

const normalizeCreatorDiscoveryQuery = (value: string | null | undefined) =>
  (value ?? "").trim().replace(/\s+/g, " ").slice(0, 120);

const creatorDiscoveryCursorIsValid = (
  sort: CreatorDiscoverySort,
  query: string,
  cursor: CreatorDiscoveryCursor | undefined
) => {
  if (!cursor) {
    return true;
  }
  if (cursor.sort && cursor.sort !== sort) {
    return false;
  }
  if ((cursor.query ?? "") !== query) {
    return false;
  }
  if (sort === "popular") {
    return typeof cursor.followerCount === "number";
  }
  if (sort === "active") {
    return typeof cursor.latestArtworkAt === "string";
  }
  return true;
};

const creatorArtworkStatsJoinSql = (matureAccess: MatureAccess) =>
  `LEFT JOIN (
     SELECT
       artworks.creator_id,
       COUNT(*) AS artwork_count,
       MAX(artworks.created_at) AS latest_artwork_at
     FROM artworks
     WHERE artworks.hidden_at IS NULL
       AND ${publicArtworkVisibilitySql}
       ${
         matureAccess.allowed
           ? ""
           : "AND artworks.mature = 0 AND COALESCE(artworks.mature_rating, 'general') = 'general'"
       }
     GROUP BY artworks.creator_id
   ) AS artwork_stats ON artwork_stats.creator_id = creators.id`;

const creatorDiscoveryActiveExpression =
  "COALESCE(artwork_stats.latest_artwork_at, creators.created_at)";

const creatorDiscoveryOrderSql = (sort: CreatorDiscoverySort) => {
  if (sort === "active") {
    return `datetime(${creatorDiscoveryActiveExpression}) DESC, creators.id DESC`;
  }
  if (sort === "newest") {
    return "datetime(creators.created_at) DESC, creators.id DESC";
  }
  return "creators.follower_count DESC, datetime(creators.created_at) DESC, creators.id DESC";
};

const appendCreatorDiscoveryCursorWhere = (
  sort: CreatorDiscoverySort,
  cursor: CreatorDiscoveryCursor,
  clauses: string[],
  bindings: Array<string | number | null>
) => {
  if (sort === "popular") {
    clauses.push(
      `(creators.follower_count < ?
        OR (
          creators.follower_count = ?
          AND (
            datetime(creators.created_at) < datetime(?)
            OR (
              datetime(creators.created_at) = datetime(?)
              AND creators.id < ?
            )
          )
        ))`
    );
    bindings.push(
      cursor.followerCount ?? 0,
      cursor.followerCount ?? 0,
      cursor.createdAt,
      cursor.createdAt,
      cursor.id
    );
    return;
  }
  if (sort === "active") {
    const latestArtworkAt = cursor.latestArtworkAt ?? cursor.createdAt;
    clauses.push(
      `(datetime(${creatorDiscoveryActiveExpression}) < datetime(?)
        OR (
          datetime(${creatorDiscoveryActiveExpression}) = datetime(?)
          AND creators.id < ?
        ))`
    );
    bindings.push(latestArtworkAt, latestArtworkAt, cursor.id);
    return;
  }
  clauses.push(
    `(datetime(creators.created_at) < datetime(?)
      OR (
        datetime(creators.created_at) = datetime(?)
        AND creators.id < ?
      ))`
  );
  bindings.push(cursor.createdAt, cursor.createdAt, cursor.id);
};

const creatorDiscoveryWhere = (viewer: CurrentUser | undefined, query: string) => {
  const clauses = ["owner.suspended_at IS NULL", profileVisibilitySql("owner")];
  const bindings: Array<string | number | null> = [...profileVisibilityBindValues(viewer)];

  if (query) {
    const pattern = `%${escapeSqlLike(query.toLowerCase())}%`;
    clauses.push(
      `(lower(creators.handle) LIKE ? ESCAPE '\\'
        OR lower(creators.display_name) LIKE ? ESCAPE '\\'
        OR lower(creators.bio) LIKE ? ESCAPE '\\')`
    );
    bindings.push(pattern, pattern, pattern);
  }

  if (viewer) {
    clauses.push(
      `NOT EXISTS (
        SELECT 1
        FROM user_blocks
        WHERE (blocker_user_id = ? AND blocked_user_id = creators.id)
           OR (blocker_user_id = creators.id AND blocked_user_id = ?)
      )`
    );
    bindings.push(viewer.id, viewer.id);
  }

  return { clauses, bindings };
};

const creatorFromDiscoveryRow = (row: CreatorDiscoveryRow): Creator => ({
  id: row.id,
  handle: row.handle,
  displayName: row.display_name,
  avatarUrl: row.avatar_url,
  bio: row.bio,
  followerCount: row.follower_count,
  following: Boolean(row.following)
});

const getCreatorPreviewArtworks = async (
  db: D1Database,
  creatorIds: string[],
  viewer: CurrentUser | undefined,
  matureAccess: MatureAccess
) => {
  const previews = new Map<string, CreatorPreviewArtwork[]>();
  if (creatorIds.length === 0) {
    return previews;
  }

  const placeholders = creatorIds.map(() => "?").join(", ");
  const baseWhere = galleryAccessWhere(
    viewer,
    matureAccess,
    matureAccess.allowed ? "all" : "general"
  );
  baseWhere.clauses.push(`artworks.creator_id IN (${placeholders})`);
  baseWhere.bindings.push(...creatorIds);
  const whereSql = baseWhere.clauses.join("\n           AND ");
  const result = await db
    .prepare(
      `SELECT creator_id, id, title, thumbnail_url, dominant_color
       FROM (
         SELECT
           artworks.creator_id,
           artworks.id,
           artworks.title,
           artworks.thumbnail_url,
           artworks.dominant_color,
           ROW_NUMBER() OVER (
             PARTITION BY artworks.creator_id
             ORDER BY datetime(artworks.created_at) DESC, artworks.id DESC
           ) AS row_number
         FROM artworks
         JOIN creators ON creators.id = artworks.creator_id
         JOIN users AS creator_user ON creator_user.id = artworks.creator_id
         WHERE ${whereSql}
       )
       WHERE row_number <= 4
       ORDER BY creator_id, row_number`
    )
    .bind(...baseWhere.bindings)
    .all<{
      creator_id: string;
      id: string;
      title: string;
      thumbnail_url: string;
      dominant_color: string;
    }>();

  for (const row of result.results) {
    const items = previews.get(row.creator_id) ?? [];
    items.push({
      id: row.id,
      title: row.title,
      thumbnailUrl: row.thumbnail_url,
      dominantColor: row.dominant_color
    });
    previews.set(row.creator_id, items);
  }

  return previews;
};

const getCreatorDiscoveryPage = async (
  db: D1Database,
  viewer: CurrentUser | undefined,
  matureAccess: MatureAccess,
  sort: CreatorDiscoverySort,
  query: string,
  limit: number,
  cursor: CreatorDiscoveryCursor | undefined
) => {
  const baseWhere = creatorDiscoveryWhere(viewer, query);
  const pageClauses = [...baseWhere.clauses];
  const pageBindings = [...baseWhere.bindings];
  if (cursor) {
    appendCreatorDiscoveryCursorWhere(sort, cursor, pageClauses, pageBindings);
  }

  const statsJoin = creatorArtworkStatsJoinSql(matureAccess);
  const whereSql = baseWhere.clauses.join("\n         AND ");
  const pageWhereSql = pageClauses.join("\n         AND ");
  const [pageResult, totalRow] = await Promise.all([
    db
      .prepare(
        `SELECT
          creators.id,
          creators.handle,
          creators.display_name,
          creators.avatar_url,
          creators.bio,
          creators.follower_count,
          creators.following,
          creators.created_at,
          COALESCE(artwork_stats.artwork_count, 0) AS artwork_count,
          artwork_stats.latest_artwork_at
         FROM creators
         JOIN users AS owner ON owner.id = creators.id
         ${statsJoin}
         WHERE ${pageWhereSql}
         ORDER BY ${creatorDiscoveryOrderSql(sort)}
         LIMIT ?`
      )
      .bind(...pageBindings, limit + 1)
      .all<CreatorDiscoveryRow>(),
    db
      .prepare(
        `SELECT COUNT(*) AS count
         FROM creators
         JOIN users AS owner ON owner.id = creators.id
         WHERE ${whereSql}`
      )
      .bind(...baseWhere.bindings)
      .first<{ count: number }>()
  ]);

  const pageRows = pageResult.results.slice(0, limit);
  const creatorIds = pageRows.map((row) => row.id);
  const [creators, previewArtworksByCreator] = await Promise.all([
    withViewerCreatorFollowing(db, viewer?.id, pageRows.map(creatorFromDiscoveryRow)),
    getCreatorPreviewArtworks(db, creatorIds, viewer, matureAccess)
  ]);
  const items: CreatorDiscoveryItem[] = pageRows.map((row, index) => ({
    creator: creators[index],
    artworkCount: row.artwork_count,
    latestArtworkAt: row.latest_artwork_at,
    previewArtworks: previewArtworksByCreator.get(row.id) ?? []
  }));
  const lastRow = pageRows.at(-1);

  return {
    creators: items,
    nextCursor:
      pageResult.results.length > limit && lastRow
        ? encodeCreatorDiscoveryCursor(sort, query, {
            createdAt: lastRow.created_at,
            id: lastRow.id,
            followerCount: lastRow.follower_count,
            latestArtworkAt: lastRow.latest_artwork_at
          })
        : null,
    totalCount: totalRow?.count ?? 0
  };
};

const normalizeUploadFiles = (value: unknown) => {
  const values = Array.isArray(value) ? value : [value];
  return values.filter((item): item is File => item instanceof File);
};

app.get("/api/auth/config", (context) =>
  context.json<AuthConfigResponse>({
    turnstileSiteKey: context.env.PUBLIC_TURNSTILE_SITE_KEY
  })
);

app.get("/api/auth/session", async (context) => {
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  const sessionToken = getCookie(context.req.raw, sessionCookieName);
  const csrfToken = user && sessionToken ? await issueCsrfToken(context, sessionToken) : null;
  if (!user) {
    context.header("Set-Cookie", clearSessionCookie(context), { append: true });
    context.header("Set-Cookie", clearCsrfCookie(context), { append: true });
  }
  return context.json<AuthSessionResponse>({
    user: user ? publicAuthUser(user) : null,
    csrfToken
  });
});

app.get("/api/search/suggestions", async (context) => {
  const query = (context.req.query("q") ?? "").trim().slice(0, 80);
  const limit = Math.min(
    10,
    Math.max(3, Number.parseInt(context.req.query("limit") ?? "6", 10) || 6)
  );
  if (!context.env.DB || query.length < 2) {
    return context.json<SearchSuggestionsResponse>({
      query,
      tags: [],
      creators: [],
      artworks: []
    });
  }

  const db = context.env.DB;
  const viewer = await getCurrentUser(db, context.req.raw);
  const matureAccess = matureAccessFor(context, viewer);
  const loweredQuery = query.toLowerCase();
  const pattern = `%${escapeSqlLike(loweredQuery)}%`;
  const prefixPattern = `${escapeSqlLike(loweredQuery)}%`;
  const normalizedTag = normalizeTagName(query);
  const artworkWhere = galleryAccessWhere(viewer, matureAccess, "all");
  const artworkWhereSql = artworkWhere.clauses.join("\n         AND ");
  const tagWhere = galleryAccessWhere(viewer, matureAccess, "all");
  const tagWhereSql = tagWhere.clauses.join("\n         AND ");
  const creatorClauses = [
    "creator_user.suspended_at IS NULL",
    profileVisibilitySql("creator_user"),
    `(lower(creators.handle) LIKE ? ESCAPE '\\'
      OR lower(creators.display_name) LIKE ? ESCAPE '\\')`
  ];
  const creatorBindings: Array<string | number | null> = [
    ...profileVisibilityBindValues(viewer),
    pattern,
    pattern
  ];
  if (viewer) {
    creatorClauses.push(
      `NOT EXISTS (
        SELECT 1
        FROM user_blocks
        WHERE (blocker_user_id = ? AND blocked_user_id = creators.id)
           OR (blocker_user_id = creators.id AND blocked_user_id = ?)
      )`
    );
    creatorBindings.push(viewer.id, viewer.id);
  }

  const [tagRows, creatorRows, artworkRows] = await Promise.all([
    db
      .prepare(
        `SELECT artwork_tags.tag AS name, COUNT(DISTINCT artworks.id) AS count
         FROM artwork_tags
         JOIN artworks ON artworks.id = artwork_tags.artwork_id
         JOIN creators ON creators.id = artworks.creator_id
         JOIN users AS creator_user ON creator_user.id = artworks.creator_id
         WHERE ${tagWhereSql}
           AND lower(artwork_tags.tag) LIKE ? ESCAPE '\\'
         GROUP BY artwork_tags.tag
         ORDER BY
           CASE
             WHEN lower(artwork_tags.tag) = ? THEN 0
             WHEN lower(artwork_tags.tag) LIKE ? ESCAPE '\\' THEN 1
             ELSE 2
           END,
           count DESC,
           artwork_tags.tag
         LIMIT ?`
      )
      .bind(
        ...tagWhere.bindings,
        pattern,
        normalizedTag,
        prefixPattern,
        limit
      )
      .all<{ name: string; count: number }>(),
    db
      .prepare(
        `SELECT
          creators.id,
          creators.handle,
          creators.display_name,
          creators.avatar_url,
          creators.bio,
          creators.follower_count,
          creators.following
         FROM creators
         JOIN users AS creator_user ON creator_user.id = creators.id
         WHERE ${creatorClauses.join("\n           AND ")}
         ORDER BY
           CASE
             WHEN lower(creators.handle) = ? THEN 0
             WHEN lower(creators.handle) LIKE ? ESCAPE '\\' THEN 1
             WHEN lower(creators.display_name) LIKE ? ESCAPE '\\' THEN 2
             ELSE 3
           END,
           creators.follower_count DESC,
           creators.handle
         LIMIT ?`
      )
      .bind(...creatorBindings, loweredQuery, prefixPattern, prefixPattern, limit)
      .all<{
        id: string;
        handle: string;
        display_name: string;
        avatar_url: string;
        bio: string;
        follower_count: number;
        following: number;
      }>(),
    db
      .prepare(
        `${artworkSelect}
         WHERE ${artworkWhereSql}
           AND (
             lower(artworks.title) LIKE ? ESCAPE '\\'
             OR lower(artworks.caption) LIKE ? ESCAPE '\\'
           )
         ORDER BY
           CASE
             WHEN lower(artworks.title) = ? THEN 0
             WHEN lower(artworks.title) LIKE ? ESCAPE '\\' THEN 1
             ELSE 2
           END,
           datetime(artworks.created_at) DESC,
           artworks.id DESC
         LIMIT ?`
      )
      .bind(
        ...artworkWhere.bindings,
        pattern,
        pattern,
        loweredQuery,
        prefixPattern,
        limit
      )
      .all<ArtworkRow>()
  ]);

  const creators = await withViewerCreatorFollowing(
    db,
    viewer?.id,
    creatorRows.results.map((row) => ({
      id: row.id,
      handle: row.handle,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      bio: row.bio,
      followerCount: row.follower_count,
      following: Boolean(row.following)
    }))
  );
  const artworks = await withArtworkImages(
    db,
    artworkRows.results.map((row) => artworkFromRow(row))
  );

  return context.json<SearchSuggestionsResponse>({
    query,
    tags: tagRows.results.map((row) => ({ name: row.name, count: row.count })),
    creators,
    artworks: artworks.map((artwork) => ({
      id: artwork.id,
      title: artwork.title,
      thumbnailUrl: artwork.thumbnailUrl,
      creator: {
        username: artwork.creator.handle,
        displayName: artwork.creator.displayName
      },
      matureRating: artwork.matureRating
    }))
  });
});

app.get("/api/notifications", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to view notifications." }, 401);
  }

  const [rows, unread] = await Promise.all([
    context.env.DB.prepare(
      `SELECT
        notifications.id,
        notifications.type,
        notifications.message,
        notifications.actor_user_id,
        actor.username AS actor_username,
        actor.display_name AS actor_display_name,
        actor_creator.avatar_url AS actor_avatar_url,
        notifications.artwork_id,
        notifications.comment_id,
        notifications.read_at,
        notifications.created_at
       FROM notifications
       LEFT JOIN users AS actor ON actor.id = notifications.actor_user_id
       LEFT JOIN creators AS actor_creator ON actor_creator.id = notifications.actor_user_id
       WHERE notifications.user_id = ?
       ORDER BY datetime(notifications.created_at) DESC
       LIMIT 30`
    )
      .bind(user.id)
      .all<NotificationRow>(),
    context.env.DB.prepare(
      "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND read_at IS NULL"
    )
      .bind(user.id)
      .first<{ count: number }>()
  ]);

  return context.json<NotificationsResponse>({
    notifications: rows.results.map(notificationFromRow),
    unreadCount: unread?.count ?? 0
  });
});

app.post("/api/notifications/read", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to update notifications." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "notifications:read",
    userId: user.id,
    ...rateLimitDefaults.notifications
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }
  const parsed = context.req.header("content-type")?.includes("application/json")
    ? markNotificationsReadSchema.safeParse(await context.req.json().catch(() => ({})))
    : markNotificationsReadSchema.safeParse({});
  if (!parsed.success) {
    return context.json({ message: "Notification update is invalid." }, 400);
  }

  if (parsed.data.id) {
    await context.env.DB.prepare(
      `UPDATE notifications
       SET read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
       WHERE id = ?
         AND user_id = ?`
    )
      .bind(parsed.data.id, user.id)
      .run();
  } else {
    await context.env.DB.prepare(
      `UPDATE notifications
       SET read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
       WHERE user_id = ?
         AND read_at IS NULL`
    )
      .bind(user.id)
      .run();
  }

  const unread = await context.env.DB.prepare(
    "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND read_at IS NULL"
  )
    .bind(user.id)
    .first<{ count: number }>();

  return context.json<MarkNotificationsReadResponse>({
    unreadCount: unread?.count ?? 0,
    message: "Notifications updated."
  });
});

app.get("/api/activity", async (context) => {
  if (!context.env.DB) {
    return context.json<ActivityResponse>({
      activities: [],
      nextCursor: null,
      scope: "global",
      matureAccess: matureAccessFor(context, undefined)
    });
  }

  const viewer = await getCurrentUser(context.env.DB, context.req.raw);
  const requestedScope = context.req.query("scope") === "global" ? "global" : "following";
  const scope = viewer ? requestedScope : "global";
  if (requestedScope === "following" && !viewer) {
    return context.json({ message: "Sign in to view followed activity." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: `activity:${scope}`,
    userId: viewer?.id,
    ...rateLimitDefaults.activity
  });
  if (rateLimitError) {
    return rateLimitError;
  }

  const limit = Math.min(
    40,
    Math.max(6, Number.parseInt(context.req.query("limit") ?? "12", 10) || 12)
  );
  const offset = Math.max(0, Number.parseInt(context.req.query("cursor") ?? "0", 10) || 0);
  const matureAccess = matureAccessFor(context, viewer);
  const hiddenUserIds = await hiddenUserIdsForViewer(context.env.DB, viewer?.id);
  const where =
    scope === "following"
      ? `WHERE activity_events.actor_user_id IN (
           SELECT followed_creator_id
           FROM follows
           WHERE follower_creator_id = ?
         )`
      : "";
  const rows = await context.env.DB.prepare(
    `SELECT
      activity_events.id,
      activity_events.actor_user_id,
      actor.username AS actor_username,
      actor.display_name AS actor_display_name,
      actor_creator.avatar_url AS actor_avatar_url,
      actor.profile_visibility AS actor_profile_visibility,
      activity_events.type,
      activity_events.artwork_id,
      activity_events.comment_id,
      activity_events.target_user_id,
      target.username AS target_username,
      target.display_name AS target_display_name,
      target_creator.avatar_url AS target_avatar_url,
      target.profile_visibility AS target_profile_visibility,
      activity_events.message,
      activity_events.created_at
     FROM activity_events
     JOIN users AS actor ON actor.id = activity_events.actor_user_id
     LEFT JOIN creators AS actor_creator ON actor_creator.id = actor.id
     LEFT JOIN users AS target ON target.id = activity_events.target_user_id
     LEFT JOIN creators AS target_creator ON target_creator.id = target.id
     ${where}
       ${where ? "AND" : "WHERE"} actor.suspended_at IS NULL
       AND (target.id IS NULL OR target.suspended_at IS NULL)
     ORDER BY datetime(activity_events.created_at) DESC
     LIMIT ?
     OFFSET ?`
  )
    .bind(...(scope === "following" && viewer ? [viewer.id] : []), limit * 3, offset)
    .all<ActivityEventRow>();

  const artworkIds = rows.results
    .map((row) => row.artwork_id)
    .filter((id): id is string => Boolean(id));
  const artworkMap = await getArtworksByIds(context.env.DB, artworkIds, viewer);
  const activities: ActivityItem[] = [];

  for (const row of rows.results) {
    if (hiddenUserIds.has(row.actor_user_id) || (row.target_user_id && hiddenUserIds.has(row.target_user_id))) {
      continue;
    }
    if (
      !canViewProfileVisibility(
        asProfileVisibility(row.actor_profile_visibility),
        row.actor_user_id,
        viewer
      )
    ) {
      continue;
    }
    if (
      row.target_user_id &&
      !canViewProfileVisibility(
        asProfileVisibility(row.target_profile_visibility),
        row.target_user_id,
        viewer
      )
    ) {
      continue;
    }
    const artwork = row.artwork_id ? artworkMap.get(row.artwork_id) ?? null : null;
    if (row.artwork_id && !artwork) {
      continue;
    }
    if (artwork && artworkIsMature(artwork) && !matureAccess.allowed) {
      continue;
    }
    activities.push({
      id: row.id,
      type: asActivityType(row.type),
      actor: activityActorFromRow(row),
      targetUser: activityTargetUserFromRow(row),
      artwork,
      commentId: row.comment_id,
      message: row.message,
      createdAt: row.created_at
    });
    if (activities.length >= limit) {
      break;
    }
  }

  return context.json<ActivityResponse>({
    activities,
    nextCursor: rows.results.length > limit ? String(offset + rows.results.length) : null,
    scope,
    matureAccess
  });
});

app.get("/api/creators", async (context) => {
  const sort = asCreatorDiscoverySort(context.req.query("sort"));
  const query = normalizeCreatorDiscoveryQuery(context.req.query("q"));
  const limit = Math.min(
    60,
    Math.max(12, Number.parseInt(context.req.query("limit") ?? "24", 10) || 24)
  );
  const viewer = await getCurrentUser(context.env.DB, context.req.raw);
  const matureAccess = matureAccessFor(context, viewer);

  if (!context.env.DB) {
    return context.json<CreatorDiscoveryResponse>({
      creators: [],
      nextCursor: null,
      totalCount: 0,
      sort,
      query,
      matureAccess
    });
  }

  const cursor = decodeCreatorDiscoveryCursor(context.req.query("cursor"));
  if (cursor === null || !creatorDiscoveryCursorIsValid(sort, query, cursor)) {
    return context.json({ message: "Creator cursor is invalid." }, 400);
  }

  const page = await getCreatorDiscoveryPage(
    context.env.DB,
    viewer,
    matureAccess,
    sort,
    query,
    limit,
    cursor
  );

  return context.json<CreatorDiscoveryResponse>({
    ...page,
    sort,
    query,
    matureAccess
  });
});

app.get("/api/tags/subscriptions", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to view followed tags." }, 401);
  }
  const tags = await getSubscribedTags(context.env.DB, user.id);
  return context.json<TagSubscriptionsResponse>({
    tags: Array.from(tags)
  });
});

app.get("/api/tags/:tag", async (context) => {
  const sort = asTagPageSort(context.req.query("sort"));
  const rating = asMatureFilter(context.req.query("rating"));
  const limit = Math.min(
    60,
    Math.max(12, Number.parseInt(context.req.query("limit") ?? "36", 10) || 36)
  );
  const rawCursor = context.req.query("cursor") ?? "";
  const viewer = await getCurrentUser(context.env.DB, context.req.raw);
  const matureAccess = matureAccessFor(context, viewer);
  const rawTag = context.req.param("tag");

  if (!context.env.DB) {
    return context.json<TagDetailResponse>({
      tag: normalizeTagName(rawTag),
      subscribed: false,
      artworks: [],
      relatedTags: [],
      nextCursor: null,
      totalCount: 0,
      sort,
      rating,
      matureAccess
    });
  }

  const tag = await canonicalizeSingleTag(context.env.DB, rawTag);
  if (!isValidTagName(tag)) {
    return context.json({ message: "Tag is invalid." }, 400);
  }

  const galleryCursor = decodeGalleryCursor(rawCursor);
  if (galleryCursor === "legacy" || galleryCursor === null || !galleryCursorIsValidForSort(sort, galleryCursor)) {
    return context.json({ message: "Tag cursor is invalid." }, 400);
  }

  const [galleryPage, subscribedTags, relatedTags] = await Promise.all([
    getSortedGalleryPage(
      context.env.DB,
      sort,
      viewer,
      matureAccess,
      rating,
      "",
      tag,
      limit,
      galleryCursor
    ),
    getSubscribedTags(context.env.DB, viewer?.id),
    getRelatedTagsForTag(context.env.DB, viewer, matureAccess, rating, tag)
  ]);

  return context.json<TagDetailResponse>({
    tag,
    subscribed: subscribedTags.has(tag),
    artworks: galleryPage.artworks,
    relatedTags,
    nextCursor: galleryPage.nextCursor,
    totalCount: galleryPage.totalCount,
    sort,
    rating,
    matureAccess
  });
});

app.post("/api/tags/:tag/subscribe", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to follow tags." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "tags:subscribe",
    userId: user.id,
    ...rateLimitDefaults.social
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const tag = await canonicalizeSingleTag(context.env.DB, context.req.param("tag"));
  if (!tag || tag.length > 64) {
    return context.json({ message: "Tag is invalid." }, 400);
  }

  const existing = await context.env.DB.prepare(
    `SELECT tag
     FROM tag_subscriptions
     WHERE user_id = ?
       AND tag = ?
     LIMIT 1`
  )
    .bind(user.id, tag)
    .first<{ tag: string }>();

  const subscribed = !existing;
  if (existing) {
    await context.env.DB.prepare(
      "DELETE FROM tag_subscriptions WHERE user_id = ? AND tag = ?"
    )
      .bind(user.id, tag)
      .run();
  } else {
    await context.env.DB.prepare(
      "INSERT OR IGNORE INTO tag_subscriptions (user_id, tag) VALUES (?, ?)"
    )
      .bind(user.id, tag)
      .run();
  }

  return context.json<TagSubscriptionResponse>({
    tag,
    subscribed,
    message: subscribed ? `Following #${tag}.` : `Unfollowed #${tag}.`
  });
});

app.get("/api/collections", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to view collections." }, 401);
  }
  return context.json<CollectionsResponse>({
    collections: await getUserCollections(context.env.DB, user.id, user, matureAccessFor(context, user))
  });
});

app.get("/api/collections/discover", async (context) => {
  const sort = asCollectionDiscoverySort(context.req.query("sort"));
  const query = normalizeCollectionDiscoveryQuery(context.req.query("q"));
  if (!context.env.DB) {
    return context.json<CollectionDiscoveryResponse>({
      collections: [],
      nextCursor: null,
      totalCount: 0,
      sort,
      query,
      matureAccess: matureAccessFor(context, undefined)
    });
  }

  const viewer = await getCurrentUser(context.env.DB, context.req.raw);
  const rateLimitError = await enforceRateLimit(context, {
    action: "collections:discover",
    userId: viewer?.id,
    ...rateLimitDefaults.collections
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const cursor = decodeCollectionDiscoveryCursor(context.req.query("cursor"));
  if (cursor === null || !collectionDiscoveryCursorIsValid(sort, query, cursor)) {
    return context.json({ message: "Collection cursor is invalid." }, 400);
  }

  const limit = Math.min(
    36,
    Math.max(6, Number.parseInt(context.req.query("limit") ?? "24", 10) || 24)
  );
  const matureAccess = matureAccessFor(context, viewer);
  const page = await getPublicCollectionDiscoveryPage(
    context.env.DB,
    viewer,
    matureAccess,
    sort,
    query,
    limit,
    cursor
  );

  return context.json<CollectionDiscoveryResponse>({
    ...page,
    sort,
    query,
    matureAccess
  });
});

app.post("/api/collections", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to create collections." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "collections:create",
    userId: user.id,
    ...rateLimitDefaults.collections
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }
  const parsed = await parseJson(context, collectionSchema);
  if (!parsed.success) {
    return context.json({ message: "Collection name is invalid." }, 400);
  }

  await ensureCreatorIdentity(context.env.DB, user);
  const id = `col_${crypto.randomUUID().replaceAll("-", "")}`;
  await context.env.DB.prepare(
    `INSERT INTO collections
      (id, creator_id, name, description, visibility, updated_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
  )
    .bind(id, user.id, parsed.data.name, parsed.data.description, parsed.data.visibility)
    .run();

  const collection = (await getUserCollections(
    context.env.DB,
    user.id,
    user,
    matureAccessFor(context, user)
  )).find(
    (item) => item.id === id
  );
  if (!collection) {
    return context.json({ message: "Collection could not be loaded." }, 500);
  }
  return context.json<CollectionResponse>(
    {
      collection,
      message: "Collection created."
    },
    201
  );
});

app.get("/api/collections/:id", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }

  const collectionId = context.req.param("id");
  const cursor = decodeCollectionCursor(context.req.query("cursor"), collectionId);
  if (cursor === null) {
    return context.json({ message: "Collection cursor is invalid." }, 400);
  }
  const viewer = await getCurrentUser(context.env.DB, context.req.raw);
  const collectionRow = await getCollectionSummaryById(context.env.DB, collectionId);
  if (!collectionRow || collectionRow.creator_suspended_at) {
    return context.json({ message: "Collection not found." }, 404);
  }

  const canManage = viewer?.id === collectionRow.creator_id;
  if (!canManage) {
    if (asCollectionVisibility(collectionRow.visibility) !== "public") {
      return context.json({ message: "Collection not found." }, viewer ? 404 : 401);
    }
    if (
      !canViewProfileVisibility(
        asProfileVisibility(collectionRow.creator_profile_visibility),
        collectionRow.creator_id,
        viewer
      )
    ) {
      return context.json(
        {
          message:
            asProfileVisibility(collectionRow.creator_profile_visibility) === "members"
              ? "Sign in to view this collection."
              : "Collection not found."
        },
        viewer ? 403 : 401
      );
    }
    if (viewer && (await userBlockedPair(context.env.DB, viewer.id, collectionRow.creator_id))) {
      return context.json({ message: "Collection not found." }, 404);
    }
  }

  const limit = Math.min(
    36,
    Math.max(6, Number.parseInt(context.req.query("limit") ?? "24", 10) || 24)
  );
  const matureAccess = matureAccessFor(context, viewer);
  const collectionSummary = collectionFromRow(collectionRow);
  const [page, following, collectionPreviews] = await Promise.all([
    getCollectionArtworkPage(context.env.DB, collectionId, viewer, matureAccess, limit, cursor),
    viewerFollowsCreator(context.env.DB, viewer?.id, collectionRow.creator_id),
    withCollectionPreviews(context.env.DB, [collectionSummary], viewer, matureAccess)
  ]);
  return context.json<CollectionDetailResponse>({
    collection: collectionPreviews[0] ?? collectionSummary,
    owner: {
      ...collectionOwnerFromRow(collectionRow),
      following
    },
    artworks: page.artworks,
    nextCursor: page.nextCursor,
    totalCount: page.totalCount,
    canManage,
    matureAccess
  });
});

app.put("/api/collections/:id", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to update collections." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "collections:update",
    userId: user.id,
    ...rateLimitDefaults.collections
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }
  const parsed = await parseJson(context, collectionUpdateSchema);
  if (!parsed.success) {
    return context.json({ message: "Collection settings are invalid." }, 400);
  }

  const collectionId = context.req.param("id");
  const existingCollection = await context.env.DB.prepare(
    "SELECT id, cover_artwork_id FROM collections WHERE id = ? AND creator_id = ? LIMIT 1"
  )
    .bind(collectionId, user.id)
    .first<{ id: string; cover_artwork_id: string | null }>();
  if (!existingCollection) {
    return context.json({ message: "Collection not found." }, 404);
  }
  const requestedCoverArtworkId = parsed.data.coverArtworkId;
  const nextCoverArtworkId =
    requestedCoverArtworkId === undefined
      ? existingCollection.cover_artwork_id
      : requestedCoverArtworkId;
  if (nextCoverArtworkId) {
    const coverItem = await context.env.DB.prepare(
      `SELECT collection_items.artwork_id
       FROM collection_items
       JOIN artworks ON artworks.id = collection_items.artwork_id
       WHERE collection_items.collection_id = ?
         AND collection_items.artwork_id = ?
         AND artworks.hidden_at IS NULL
       LIMIT 1`
    )
      .bind(collectionId, nextCoverArtworkId)
      .first<{ artwork_id: string }>();
    if (!coverItem) {
      return context.json({ message: "Choose a cover artwork from this collection." }, 400);
    }
  }

  const result = await context.env.DB.prepare(
    `UPDATE collections
     SET name = ?,
         description = ?,
         visibility = ?,
         cover_artwork_id = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?
       AND creator_id = ?`
  )
    .bind(
      parsed.data.name,
      parsed.data.description,
      parsed.data.visibility,
      nextCoverArtworkId,
      collectionId,
      user.id
    )
    .run();
  if (result.meta.changes === 0) {
    return context.json({ message: "Collection not found." }, 404);
  }

  const collection = (await getUserCollections(
    context.env.DB,
    user.id,
    user,
    matureAccessFor(context, user)
  )).find(
    (item) => item.id === collectionId
  );
  if (!collection) {
    return context.json({ message: "Collection could not be loaded." }, 500);
  }
  return context.json<CollectionResponse>({
    collection,
    message: "Collection updated."
  });
});

app.delete("/api/collections/:id", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to delete collections." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "collections:delete",
    userId: user.id,
    ...rateLimitDefaults.collections
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const collectionId = context.req.param("id");
  const existing = await context.env.DB.prepare(
    "SELECT id FROM collections WHERE id = ? AND creator_id = ? LIMIT 1"
  )
    .bind(collectionId, user.id)
    .first<{ id: string }>();
  if (!existing) {
    return context.json({ message: "Collection not found." }, 404);
  }

  await context.env.DB.prepare("DELETE FROM collection_items WHERE collection_id = ?")
    .bind(collectionId)
    .run();
  await context.env.DB.prepare("DELETE FROM collections WHERE id = ? AND creator_id = ?")
    .bind(collectionId, user.id)
    .run();

  return context.json<DeleteCollectionResponse>({
    deleted: true,
    collectionId,
    message: "Collection deleted."
  });
});

app.post("/api/collections/:id/items", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to update collections." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "collections:items",
    userId: user.id,
    ...rateLimitDefaults.collections
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }
  const parsed = await parseJson(context, collectionItemSchema);
  if (!parsed.success) {
    return context.json({ message: "Collection item is invalid." }, 400);
  }

  const collectionId = context.req.param("id");
  const collection = await context.env.DB.prepare(
    "SELECT id FROM collections WHERE id = ? AND creator_id = ? LIMIT 1"
  )
    .bind(collectionId, user.id)
    .first<{ id: string }>();
  if (!collection) {
    return context.json({ message: "Collection not found." }, 404);
  }

  const artwork = await context.env.DB.prepare(
    `SELECT id, creator_id, mature, mature_rating
     FROM artworks
     WHERE id = ?
       AND hidden_at IS NULL
     LIMIT 1`
  )
    .bind(parsed.data.artworkId)
    .first<{ id: string; creator_id: string; mature: number; mature_rating: string | null }>();
  if (!artwork) {
    return context.json({ message: "Artwork not found." }, 404);
  }
  if (!(await canViewCreatorProfile(context.env.DB, artwork.creator_id, user))) {
    return context.json({ message: "Artwork not found." }, 404);
  }
  if (await userBlockedPair(context.env.DB, user.id, artwork.creator_id)) {
    return context.json({ message: "Artwork not found." }, 404);
  }
  if (
    (Boolean(artwork.mature) || asMatureRating(artwork.mature_rating) !== "general") &&
    !matureAccessFor(context, user).allowed
  ) {
    return context.json({ message: "Artwork not found." }, 404);
  }

  const existing = await context.env.DB.prepare(
    `SELECT artwork_id
     FROM collection_items
     WHERE collection_id = ?
       AND artwork_id = ?
     LIMIT 1`
  )
    .bind(collectionId, artwork.id)
    .first<{ artwork_id: string }>();
  const added = !existing;
  if (existing) {
    await context.env.DB.batch([
      context.env.DB.prepare(
        "DELETE FROM collection_items WHERE collection_id = ? AND artwork_id = ?"
      ).bind(collectionId, artwork.id),
      context.env.DB.prepare(
        `UPDATE collections
         SET cover_artwork_id = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?
           AND cover_artwork_id = ?`
      ).bind(collectionId, artwork.id)
    ]);
  } else {
    await context.env.DB.prepare(
      "INSERT OR IGNORE INTO collection_items (collection_id, artwork_id) VALUES (?, ?)"
    )
      .bind(collectionId, artwork.id)
      .run();
  }

  const updatedCollection = (await getUserCollections(
    context.env.DB,
    user.id,
    user,
    matureAccessFor(context, user)
  )).find(
    (item) => item.id === collectionId
  );
  const updatedArtwork = await getArtworkFromD1(context.env.DB, artwork.id, user);
  if (!updatedCollection || !updatedArtwork) {
    return context.json({ message: "Collection could not be loaded." }, 500);
  }

  return context.json<CollectionItemResponse>({
    collection: updatedCollection,
    artwork: updatedArtwork.artwork,
    added,
    message: added ? "Artwork added to collection." : "Artwork removed from collection."
  });
});

app.get("/api/series", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to view series." }, 401);
  }
  return context.json<ArtworkSeriesListResponse>({
    series: await getUserSeries(context.env.DB, user.id, user, matureAccessFor(context, user))
  });
});

app.post("/api/series", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to create series." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "series:create",
    userId: user.id,
    ...rateLimitDefaults.collections
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }
  const parsed = await parseJson(context, seriesSchema);
  if (!parsed.success) {
    return context.json({ message: "Series details are invalid." }, 400);
  }

  await ensureCreatorIdentity(context.env.DB, user);
  const id = `ser_${crypto.randomUUID().replaceAll("-", "")}`;
  await context.env.DB.prepare(
    `INSERT INTO artwork_series
      (id, creator_id, title, description, visibility, updated_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
  )
    .bind(id, user.id, parsed.data.title, parsed.data.description, parsed.data.visibility)
    .run();

  const series = (await getUserSeries(
    context.env.DB,
    user.id,
    user,
    matureAccessFor(context, user)
  )).find((item) => item.id === id);
  if (!series) {
    return context.json({ message: "Series could not be loaded." }, 500);
  }
  return context.json<ArtworkSeriesResponse>(
    {
      series,
      message: "Series created."
    },
    201
  );
});

app.get("/api/series/:id", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }

  const seriesId = context.req.param("id");
  const cursor = decodeSeriesCursor(context.req.query("cursor"), seriesId);
  if (cursor === null) {
    return context.json({ message: "Series cursor is invalid." }, 400);
  }
  const viewer = await getCurrentUser(context.env.DB, context.req.raw);
  const seriesRow = await getSeriesSummaryById(context.env.DB, seriesId);
  if (!seriesRow || seriesRow.creator_suspended_at) {
    return context.json({ message: "Series not found." }, 404);
  }

  const canManage = viewer?.id === seriesRow.creator_id;
  if (!canManage) {
    if (asSeriesVisibility(seriesRow.visibility) !== "public") {
      return context.json({ message: "Series not found." }, viewer ? 404 : 401);
    }
    if (
      !canViewProfileVisibility(
        asProfileVisibility(seriesRow.creator_profile_visibility),
        seriesRow.creator_id,
        viewer
      )
    ) {
      return context.json(
        {
          message:
            asProfileVisibility(seriesRow.creator_profile_visibility) === "members"
              ? "Sign in to view this series."
              : "Series not found."
        },
        viewer ? 403 : 401
      );
    }
    if (viewer && (await userBlockedPair(context.env.DB, viewer.id, seriesRow.creator_id))) {
      return context.json({ message: "Series not found." }, 404);
    }
  }

  const limit = Math.min(
    36,
    Math.max(6, Number.parseInt(context.req.query("limit") ?? "24", 10) || 24)
  );
  const matureAccess = matureAccessFor(context, viewer);
  const seriesSummary = seriesFromRow(seriesRow);
  const [page, following, seriesPreviews] = await Promise.all([
    getSeriesArtworkPage(context.env.DB, seriesId, viewer, matureAccess, limit, cursor),
    viewerFollowsCreator(context.env.DB, viewer?.id, seriesRow.creator_id),
    withSeriesPreviews(context.env.DB, [seriesSummary], viewer, matureAccess)
  ]);
  return context.json<ArtworkSeriesDetailResponse>({
    series: seriesPreviews[0] ?? seriesSummary,
    owner: {
      ...seriesOwnerFromRow(seriesRow),
      following
    },
    artworks: page.artworks,
    nextCursor: page.nextCursor,
    totalCount: page.totalCount,
    canManage,
    matureAccess
  });
});

app.put("/api/series/:id", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to update series." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "series:update",
    userId: user.id,
    ...rateLimitDefaults.collections
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }
  const parsed = await parseJson(context, seriesUpdateSchema);
  if (!parsed.success) {
    return context.json({ message: "Series settings are invalid." }, 400);
  }

  const seriesId = context.req.param("id");
  const existingSeries = await context.env.DB.prepare(
    "SELECT id, cover_artwork_id FROM artwork_series WHERE id = ? AND creator_id = ? LIMIT 1"
  )
    .bind(seriesId, user.id)
    .first<{ id: string; cover_artwork_id: string | null }>();
  if (!existingSeries) {
    return context.json({ message: "Series not found." }, 404);
  }
  const requestedCoverArtworkId = parsed.data.coverArtworkId;
  const nextCoverArtworkId =
    requestedCoverArtworkId === undefined
      ? existingSeries.cover_artwork_id
      : requestedCoverArtworkId;
  if (nextCoverArtworkId) {
    const coverItem = await context.env.DB.prepare(
      `SELECT artwork_series_items.artwork_id
       FROM artwork_series_items
       JOIN artworks ON artworks.id = artwork_series_items.artwork_id
       WHERE artwork_series_items.series_id = ?
         AND artwork_series_items.artwork_id = ?
         AND artworks.creator_id = ?
         AND artworks.hidden_at IS NULL
       LIMIT 1`
    )
      .bind(seriesId, nextCoverArtworkId, user.id)
      .first<{ artwork_id: string }>();
    if (!coverItem) {
      return context.json({ message: "Choose a cover artwork from this series." }, 400);
    }
  }

  const result = await context.env.DB.prepare(
    `UPDATE artwork_series
     SET title = ?,
         description = ?,
         visibility = ?,
         cover_artwork_id = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?
       AND creator_id = ?`
  )
    .bind(
      parsed.data.title,
      parsed.data.description,
      parsed.data.visibility,
      nextCoverArtworkId,
      seriesId,
      user.id
    )
    .run();
  if (result.meta.changes === 0) {
    return context.json({ message: "Series not found." }, 404);
  }

  const series = (await getUserSeries(
    context.env.DB,
    user.id,
    user,
    matureAccessFor(context, user)
  )).find((item) => item.id === seriesId);
  if (!series) {
    return context.json({ message: "Series could not be loaded." }, 500);
  }
  return context.json<ArtworkSeriesResponse>({
    series,
    message: "Series updated."
  });
});

app.delete("/api/series/:id", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to delete series." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "series:delete",
    userId: user.id,
    ...rateLimitDefaults.collections
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const seriesId = context.req.param("id");
  const existing = await context.env.DB.prepare(
    "SELECT id FROM artwork_series WHERE id = ? AND creator_id = ? LIMIT 1"
  )
    .bind(seriesId, user.id)
    .first<{ id: string }>();
  if (!existing) {
    return context.json({ message: "Series not found." }, 404);
  }

  await context.env.DB.prepare("DELETE FROM artwork_series_items WHERE series_id = ?")
    .bind(seriesId)
    .run();
  await context.env.DB.prepare("DELETE FROM artwork_series WHERE id = ? AND creator_id = ?")
    .bind(seriesId, user.id)
    .run();

  return context.json<DeleteArtworkSeriesResponse>({
    deleted: true,
    seriesId,
    message: "Series deleted."
  });
});

app.post("/api/series/:id/items", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to update series." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "series:items",
    userId: user.id,
    ...rateLimitDefaults.collections
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }
  const parsed = await parseJson(context, seriesItemSchema);
  if (!parsed.success) {
    return context.json({ message: "Series item is invalid." }, 400);
  }

  const seriesId = context.req.param("id");
  const series = await context.env.DB.prepare(
    "SELECT id FROM artwork_series WHERE id = ? AND creator_id = ? LIMIT 1"
  )
    .bind(seriesId, user.id)
    .first<{ id: string }>();
  if (!series) {
    return context.json({ message: "Series not found." }, 404);
  }

  const artwork = await context.env.DB.prepare(
    `SELECT id, creator_id
     FROM artworks
     WHERE id = ?
       AND hidden_at IS NULL
     LIMIT 1`
  )
    .bind(parsed.data.artworkId)
    .first<{ id: string; creator_id: string }>();
  if (!artwork || artwork.creator_id !== user.id) {
    return context.json({ message: "Add only your own visible artworks to a series." }, 404);
  }

  const existing = await context.env.DB.prepare(
    `SELECT artwork_id, position
     FROM artwork_series_items
     WHERE series_id = ?
       AND artwork_id = ?
     LIMIT 1`
  )
    .bind(seriesId, artwork.id)
    .first<{ artwork_id: string; position: number }>();
  const requestedPosition = parsed.data.position;
  let added = false;
  let message = "Artwork removed from series.";
  if (existing && requestedPosition === undefined) {
    await context.env.DB.batch([
      context.env.DB.prepare(
        "DELETE FROM artwork_series_items WHERE series_id = ? AND artwork_id = ?"
      ).bind(seriesId, artwork.id),
      context.env.DB.prepare(
        `UPDATE artwork_series
         SET cover_artwork_id = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?
           AND cover_artwork_id = ?`
      ).bind(seriesId, artwork.id)
    ]);
  } else if (existing) {
    await context.env.DB.prepare(
      `UPDATE artwork_series_items
       SET position = ?
       WHERE series_id = ?
         AND artwork_id = ?`
    )
      .bind(requestedPosition, seriesId, artwork.id)
      .run();
    await context.env.DB.prepare("UPDATE artwork_series SET updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(seriesId)
      .run();
    added = true;
    message = "Series order updated.";
  } else {
    const nextPosition =
      requestedPosition ??
      ((await context.env.DB.prepare(
        "SELECT COALESCE(MAX(position), -1) + 1 AS next_position FROM artwork_series_items WHERE series_id = ?"
      )
        .bind(seriesId)
        .first<{ next_position: number }>())?.next_position ?? 0);
    await context.env.DB.batch([
      context.env.DB.prepare(
        `INSERT INTO artwork_series_items (series_id, artwork_id, position)
         VALUES (?, ?, ?)`
      ).bind(seriesId, artwork.id, nextPosition),
      context.env.DB.prepare("UPDATE artwork_series SET updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(seriesId)
    ]);
    added = true;
    message = "Artwork added to series.";
  }

  const updatedSeries = (await getUserSeries(
    context.env.DB,
    user.id,
    user,
    matureAccessFor(context, user)
  )).find((item) => item.id === seriesId);
  const updatedArtwork = await getArtworkFromD1(context.env.DB, artwork.id, user);
  if (!updatedSeries || !updatedArtwork) {
    return context.json({ message: "Series could not be loaded." }, 500);
  }

  return context.json<ArtworkSeriesItemResponse>({
    series: updatedSeries,
    artwork: updatedArtwork.artwork,
    added,
    message
  });
});

app.post("/api/auth/register", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }

  const parsed = await parseJson(context, registerSchema);
  if (!parsed.success) {
    return context.json({ message: "Registration details are invalid." }, 400);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "auth:register",
    ...rateLimitDefaults.auth
  });
  if (rateLimitError) {
    return rateLimitError;
  }

  const turnstile = await verifyTurnstile(context, parsed.data.turnstileToken, "register");
  if (!turnstile.ok) {
    return context.json({ message: turnstile.message }, 403);
  }

  const email = parsed.data.email.toLowerCase();
  const username = parsed.data.username.toLowerCase();
  const displayName = parsed.data.displayName;
  const userId = `usr_${crypto.randomUUID().replaceAll("-", "")}`;

  try {
    await context.env.DB.prepare(
      `INSERT INTO users
        (id, email, username, display_name, password_hash)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(
        userId,
        email,
        username,
        displayName,
        await hashPassword(parsed.data.password)
      )
      .run();
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return context.json({ message: "That email or username is already in use." }, 409);
    }
    throw error;
  }

  const user = await context.env.DB.prepare(
    `SELECT
      id,
      email,
      username,
      display_name,
      password_hash,
      role,
      email_verified_at,
      date_of_birth,
      mature_content_enabled,
      bookmark_default_visibility,
      profile_visibility,
      suspended_at,
      suspended_reason,
      ${userStorageSelectSql("users")},
      created_at,
      updated_at
     FROM users
     WHERE id = ?
     LIMIT 1`
  )
    .bind(userId)
    .first<UserRow>();

  if (!user) {
    return context.json({ message: "Account could not be loaded." }, 500);
  }

  const authUser = authUserFromRow(user);
  const verificationToken = await createVerificationToken(context.env.DB, authUser.id);
  await sendVerificationEmail(context.env, authUser, verificationToken);
  const sessionToken = await createSession(context.env.DB, context, authUser.id);
  context.header("Set-Cookie", sessionCookie(context, sessionToken), { append: true });
  const csrfToken = await issueCsrfToken(context, sessionToken);

  return context.json<AuthResponse>(
    {
      user: authUser,
      csrfToken,
      message: "Account created. Check your email to verify it."
    },
    201
  );
});

app.post("/api/auth/login", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }

  const parsed = await parseJson(context, loginSchema);
  if (!parsed.success) {
    return context.json({ message: "Login details are invalid." }, 400);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "auth:login",
    ...rateLimitDefaults.auth
  });
  if (rateLimitError) {
    return rateLimitError;
  }

  const turnstile = await verifyTurnstile(context, parsed.data.turnstileToken, "login");
  if (!turnstile.ok) {
    return context.json({ message: turnstile.message }, 403);
  }

  const identifier = parsed.data.identifier.toLowerCase();
  const user = await context.env.DB.prepare(
    `SELECT
      id,
      email,
      username,
      display_name,
      password_hash,
      role,
      email_verified_at,
      date_of_birth,
      mature_content_enabled,
      bookmark_default_visibility,
      profile_visibility,
      suspended_at,
      suspended_reason,
      ${userStorageSelectSql("users")},
      created_at,
      updated_at
     FROM users
     WHERE email = ? OR username = ?
     LIMIT 1`
  )
    .bind(identifier, identifier)
    .first<UserRow>();

  const validStoredPassword = user
    ? await verifyPassword(parsed.data.password, user.password_hash)
    : false;
  const validBootstrapPassword =
    user && !validStoredPassword
      ? await isDefaultAdminBootstrapPassword(context.env, user, parsed.data.password)
      : false;
  if (user && validBootstrapPassword) {
    try {
      await context.env.DB.prepare(
        "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      )
        .bind(await hashPassword(parsed.data.password), user.id)
        .run();
    } catch (error) {
      console.warn("Unable to persist default admin bootstrap password hash", error);
    }
  }

  if (!user || (!validStoredPassword && !validBootstrapPassword)) {
    return context.json({ message: "Email, username, or password is incorrect." }, 401);
  }
  if (user.suspended_at) {
    return context.json({ message: "This account is suspended." }, 403);
  }

  const mfaMethods = await getEnabledMfaMethods(context.env.DB, user.id);
  if (mfaMethods.length > 0) {
    return context.json<AuthLoginResponse>(
      await createMfaChallenge(context.env.DB, context, user, mfaMethods)
    );
  }

  return completeLogin(context, user, { authMethod: "password" });
});

app.post("/api/auth/mfa/verify", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }

  const parsed = await parseJson(context, mfaVerifySchema);
  if (!parsed.success) {
    return context.json({ message: "Verification code is invalid." }, 400);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "auth:mfa-verify",
    ...rateLimitDefaults.auth
  });
  if (rateLimitError) {
    return rateLimitError;
  }

  const challenge = await context.env.DB.prepare(
    `SELECT id, user_id, email_code_hash, client_ip_hash, user_agent
     FROM auth_mfa_challenges
     WHERE token_hash = ?
       AND consumed_at IS NULL
       AND datetime(expires_at) > datetime('now')
     LIMIT 1`
  )
    .bind(await sha256(parsed.data.mfaToken))
    .first<MfaChallengeRow>();
  if (!challenge) {
    return context.json({ message: "Verification challenge is invalid or expired." }, 400);
  }

  const user = await getUserRowById(context.env.DB, challenge.user_id);
  if (!user || user.suspended_at) {
    return context.json({ message: "Verification challenge is invalid or expired." }, 400);
  }
  const methods = await getEnabledMfaMethods(context.env.DB, user.id);
  if (!methods.includes(parsed.data.method)) {
    return context.json({ message: "Verification method is not enabled." }, 400);
  }

  let verified = false;
  if (parsed.data.method === "email") {
    const expectedHash = await sha256(`${challenge.id}:${parsed.data.code}`);
    verified = Boolean(
      challenge.email_code_hash &&
        (await constantTimeStringEqual(challenge.email_code_hash, expectedHash))
    );
  } else {
    const totp = await context.env.DB.prepare(
      "SELECT user_id, secret_base32, enabled_at FROM user_totp_credentials WHERE user_id = ? AND enabled_at IS NOT NULL LIMIT 1"
    )
      .bind(user.id)
      .first<TotpCredentialRow>();
    verified = totp ? await verifyTotpCode(totp.secret_base32, parsed.data.code) : false;
  }

  if (!verified) {
    return context.json({ message: "Verification code is incorrect." }, 403);
  }

  await context.env.DB.prepare(
    "UPDATE auth_mfa_challenges SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?"
  )
    .bind(challenge.id)
    .run();

  return completeLogin(context, user, { authMethod: "password" });
});

app.post("/api/auth/passkey/options", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "auth:passkey-options",
    ...rateLimitDefaults.auth
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const challenge = await createWebauthnChallenge(context.env.DB, "authentication", null);
  const { rpId } = webauthnContext(context);
  return context.json<PasskeyAuthenticationOptionsResponse>({
    publicKey: {
      challenge,
      rpId,
      timeout: 300_000,
      userVerification: "preferred"
    }
  });
});

app.post("/api/auth/passkey/verify", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const parsed = await parseJson(context, passkeyAuthenticationSchema);
  if (!parsed.success) {
    return context.json({ message: "Passkey response is invalid." }, 400);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "auth:passkey-verify",
    ...rateLimitDefaults.auth
  });
  if (rateLimitError) {
    return rateLimitError;
  }

  const clientDataPreview = JSON.parse(
    textDecoder.decode(fromBase64Url(parsed.data.response.clientDataJSON))
  ) as { challenge?: unknown };
  if (typeof clientDataPreview.challenge !== "string") {
    return context.json({ message: "Passkey challenge is invalid." }, 400);
  }
  const challengeRow = await getWebauthnChallenge(
    context.env.DB,
    clientDataPreview.challenge,
    "authentication"
  );
  if (!challengeRow) {
    return context.json({ message: "Passkey challenge is invalid or expired." }, 400);
  }

  const credentialId = parsed.data.rawId;
  const row = await context.env.DB.prepare(
    `SELECT
      user_passkeys.id AS passkey_id,
      user_passkeys.user_id,
      user_passkeys.credential_id,
      user_passkeys.name,
      user_passkeys.public_key_cose,
      user_passkeys.sign_count,
      user_passkeys.transports,
      user_passkeys.created_at AS passkey_created_at,
      user_passkeys.last_used_at,
      users.id,
      users.email,
      users.username,
      users.display_name,
      users.password_hash,
      users.role,
      users.email_verified_at,
      users.date_of_birth,
      users.mature_content_enabled,
      users.bookmark_default_visibility,
      users.profile_visibility,
      users.suspended_at,
      users.suspended_reason,
      ${userStorageSelectSql("users")},
      users.created_at,
      users.updated_at
     FROM user_passkeys
     JOIN users ON users.id = user_passkeys.user_id
     WHERE user_passkeys.credential_id = ?
     LIMIT 1`
  )
    .bind(credentialId)
    .first<
      UserRow & {
        passkey_id: string;
        credential_id: string;
        public_key_cose: string;
        sign_count: number;
      }
    >();
  if (!row || row.suspended_at) {
    return context.json({ message: "Passkey is not registered." }, 401);
  }

  try {
    const { origin, rpId } = webauthnContext(context);
    const { clientDataBytes } = parseWebauthnClientData(
      parsed.data.response.clientDataJSON,
      "webauthn.get",
      clientDataPreview.challenge,
      origin
    );
    const authenticatorDataBytes = fromBase64Url(parsed.data.response.authenticatorData);
    const authenticatorData = await verifyAuthenticatorData(authenticatorDataBytes, rpId);
    const signedData = concatBytes(
      authenticatorDataBytes,
      await sha256Bytes(clientDataBytes)
    );
    const signatureValid = await verifyCoseSignature({
      publicKeyCose: fromBase64Url(row.public_key_cose),
      signature: fromBase64Url(parsed.data.response.signature),
      signedData
    });
    if (!signatureValid) {
      return context.json({ message: "Passkey signature is invalid." }, 403);
    }
    if (row.sign_count > 0 && authenticatorData.signCount > 0 && authenticatorData.signCount <= row.sign_count) {
      return context.json({ message: "Passkey counter is invalid." }, 403);
    }
    await context.env.DB.batch([
      context.env.DB.prepare(
        `UPDATE user_passkeys
         SET sign_count = ?,
             last_used_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      ).bind(Math.max(row.sign_count, authenticatorData.signCount), row.passkey_id),
      context.env.DB.prepare(
        "UPDATE webauthn_challenges SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?"
      ).bind(challengeRow.id)
    ]);
  } catch (error) {
    console.warn("Passkey verification failed", error);
    return context.json({ message: "Passkey could not be verified." }, 400);
  }

  return completeLogin(context, row, {
    authMethod: "passkey",
    messagePrefix: "Signed in with passkey"
  });
});

app.post("/api/auth/password-reset/request", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }

  const parsed = await parseJson(context, passwordResetRequestSchema);
  if (!parsed.success) {
    return context.json({ message: "Reset request details are invalid." }, 400);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "auth:password-reset-request",
    ...rateLimitDefaults.resend
  });
  if (rateLimitError) {
    return rateLimitError;
  }

  const turnstile = await verifyTurnstile(context, parsed.data.turnstileToken, "password-reset");
  if (!turnstile.ok) {
    return context.json({ message: turnstile.message }, 403);
  }

  const user = await getUserRowByEmail(context.env.DB, parsed.data.email);
  if (user && !user.suspended_at) {
    const authUser = authUserFromRow(user);
    const resetToken = await createPasswordResetToken(context.env.DB, user.id);
    await sendPasswordResetEmail(context.env, authUser, resetToken);
  }

  return context.json<PasswordResetRequestResponse>({
    message: "If that email belongs to an account, a reset link has been sent."
  });
});

app.post("/api/auth/password-reset/confirm", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }

  const parsed = await parseJson(context, passwordResetConfirmSchema);
  if (!parsed.success) {
    return context.json({ message: "Reset details are invalid." }, 400);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "auth:password-reset-confirm",
    ...rateLimitDefaults.auth
  });
  if (rateLimitError) {
    return rateLimitError;
  }

  const turnstile = await verifyTurnstile(
    context,
    parsed.data.turnstileToken,
    "password-reset-confirm"
  );
  if (!turnstile.ok) {
    return context.json({ message: turnstile.message }, 403);
  }

  const tokenHash = await sha256(parsed.data.token);
  const row = await context.env.DB.prepare(
    `SELECT
      password_reset_tokens.id AS token_id,
      users.id,
      users.email,
      users.username,
      users.display_name,
      users.password_hash,
      users.role,
      users.email_verified_at,
      users.date_of_birth,
      users.mature_content_enabled,
      users.bookmark_default_visibility,
      users.profile_visibility,
      users.suspended_at,
      users.suspended_reason,
      users.created_at,
      users.updated_at
     FROM password_reset_tokens
     JOIN users ON users.id = password_reset_tokens.user_id
     WHERE password_reset_tokens.token_hash = ?
       AND password_reset_tokens.consumed_at IS NULL
       AND datetime(password_reset_tokens.expires_at) > datetime('now')
     LIMIT 1`
  )
    .bind(tokenHash)
    .first<UserRow & { token_id: string }>();

  if (!row || row.suspended_at) {
    return context.json({ message: "Reset link is invalid or expired." }, 400);
  }

  await context.env.DB.batch([
    context.env.DB.prepare(
      "UPDATE password_reset_tokens SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(row.token_id),
    context.env.DB.prepare(
      `UPDATE users
       SET password_hash = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(await hashPassword(parsed.data.newPassword), row.id),
    context.env.DB.prepare("DELETE FROM auth_sessions WHERE user_id = ?").bind(row.id)
  ]);

  await sendSecurityNoticeEmail(context.env, authUserFromRow(row), "Password reset completed", [
    "Your account password was changed using a password reset link.",
    "",
    "All existing sessions were signed out. If this was not you, request another reset immediately."
  ]);

  context.header("Set-Cookie", clearSessionCookie(context), { append: true });
  context.header("Set-Cookie", clearCsrfCookie(context), { append: true });
  return context.json<PasswordResetConfirmResponse>({
    message: "Password reset. Sign in with your new password."
  });
});

app.post("/api/auth/logout", async (context) => {
  if (context.env.DB) {
    const token = getCookie(context.req.raw, sessionCookieName);
    if (token) {
      const csrfError = await validateCsrf(context);
      if (csrfError) {
        return csrfError;
      }
      await context.env.DB.prepare("DELETE FROM auth_sessions WHERE session_hash = ?")
        .bind(await sha256(token))
        .run();
    }
  }

  context.header("Set-Cookie", clearSessionCookie(context), { append: true });
  context.header("Set-Cookie", clearCsrfCookie(context), { append: true });
  return context.json({ message: "Signed out." });
});

app.post("/api/auth/resend-verification", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }

  const parsed = await parseJson(context, resendVerificationSchema);
  if (!parsed.success) {
    return context.json({ message: "Turnstile challenge is required." }, 400);
  }

  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to resend verification." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "auth:resend-verification",
    userId: user.id,
    ...rateLimitDefaults.resend
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  if (user.emailVerified) {
    return context.json({ message: "Your email is already verified.", user: publicAuthUser(user) });
  }

  const turnstile = await verifyTurnstile(context, parsed.data.turnstileToken, "resend");
  if (!turnstile.ok) {
    return context.json({ message: turnstile.message }, 403);
  }

  const verificationToken = await createVerificationToken(context.env.DB, user.id);
  await sendVerificationEmail(context.env, user, verificationToken);
  return context.json({ message: "Verification email sent.", user: publicAuthUser(user) });
});

app.get("/api/auth/verify-email", async (context) => {
  const wantsJson = wantsJsonResponse(context);
  if (!context.env.DB) {
    if (wantsJson) {
      return emailConfirmationJson(
        context,
        "verify",
        "unavailable",
        "D1 database is required for accounts."
      );
    }
    return emailConfirmationRedirect(context, "verify", "unavailable");
  }

  const token = context.req.query("token");
  if (!token) {
    if (wantsJson) {
      return emailConfirmationJson(
        context,
        "verify",
        "invalid",
        "Email confirmation token is missing."
      );
    }
    return emailConfirmationRedirect(context, "verify", "invalid");
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "auth:verify-email",
    limit: 30,
    windowSeconds: 15 * minuteSeconds
  });
  if (rateLimitError) {
    return wantsJson ? rateLimitError : emailConfirmationRedirect(context, "verify", "unavailable");
  }

  const tokenHash = await sha256(token);
  const row = await context.env.DB.prepare(
    `SELECT
      email_verification_tokens.id AS token_id,
      users.id,
      users.email,
      users.username,
      users.display_name,
      users.password_hash,
      users.role,
      users.email_verified_at,
      users.date_of_birth,
      users.mature_content_enabled,
      users.bookmark_default_visibility,
      users.profile_visibility,
      users.created_at,
      users.updated_at
     FROM email_verification_tokens
     JOIN users ON users.id = email_verification_tokens.user_id
     WHERE email_verification_tokens.token_hash = ?
       AND email_verification_tokens.consumed_at IS NULL
       AND datetime(email_verification_tokens.expires_at) > datetime('now')
     LIMIT 1`
  )
    .bind(tokenHash)
    .first<UserRow & { token_id: string }>();

  if (!row) {
    if (wantsJson) {
      return emailConfirmationJson(
        context,
        "verify",
        "invalid",
        "Email confirmation link is invalid or expired."
      );
    }
    return emailConfirmationRedirect(context, "verify", "invalid");
  }

  await context.env.DB.batch([
    context.env.DB.prepare(
      "UPDATE email_verification_tokens SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(row.token_id),
    context.env.DB.prepare(
      `UPDATE users
       SET email_verified_at = COALESCE(email_verified_at, CURRENT_TIMESTAMP),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(row.id)
  ]);

  if (wantsJson) {
    return emailConfirmationJson(
      context,
      "verify",
      "confirmed",
      "Email confirmation complete. Your account is verified."
    );
  }
  return emailConfirmationRedirect(context, "verify", "confirmed");
});

app.get("/api/analytics/creator", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }

  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to view analytics." }, 401);
  }

  const rateLimitError = await enforceRateLimit(context, {
    action: "analytics:creator",
    userId: user.id,
    ...rateLimitDefaults.analytics
  });
  if (rateLimitError) {
    return rateLimitError;
  }

  const [
    summaryRow,
    topRows,
    recentRows,
    viewRows,
    likeRows,
    bookmarkRows,
    commentRows
  ] = await Promise.all([
    context.env.DB
      .prepare(
        `SELECT
          creators.follower_count AS followers,
          COUNT(artworks.id) AS artworks,
          COALESCE(SUM(CASE
            WHEN artworks.id IS NOT NULL AND artworks.hidden_at IS NULL THEN 1
            ELSE 0
          END), 0) AS public_artworks,
          COALESCE(SUM(CASE
            WHEN artworks.mature = 1 OR COALESCE(artworks.mature_rating, 'general') <> 'general' THEN 1
            ELSE 0
          END), 0) AS mature_artworks,
          COALESCE(SUM(artworks.view_count), 0) AS total_views,
          COALESCE(SUM(artworks.like_count), 0) AS likes,
          COALESCE(SUM(artworks.bookmark_count), 0) AS bookmarks,
          COALESCE(SUM(artworks.comment_count), 0) AS comments
         FROM creators
         LEFT JOIN artworks ON artworks.creator_id = creators.id
         WHERE creators.id = ?
         GROUP BY creators.id, creators.follower_count`
      )
      .bind(user.id)
      .first<{
        followers: number | null;
        artworks: number;
        public_artworks: number | null;
        mature_artworks: number | null;
        total_views: number | null;
        likes: number | null;
        bookmarks: number | null;
        comments: number | null;
      }>(),
    context.env.DB
      .prepare(
        `${analyticsArtworkSelect}
         WHERE artworks.creator_id = ?
         ORDER BY views_7d DESC,
           artworks.view_count DESC,
           artworks.like_count DESC,
           datetime(artworks.created_at) DESC
         LIMIT 8`
      )
      .bind(user.id)
      .all<CreatorAnalyticsArtworkRow>(),
    context.env.DB
      .prepare(
        `${analyticsArtworkSelect}
         WHERE artworks.creator_id = ?
         ORDER BY datetime(artworks.created_at) DESC
         LIMIT 8`
      )
      .bind(user.id)
      .all<CreatorAnalyticsArtworkRow>(),
    context.env.DB
      .prepare(
        `SELECT artwork_views.viewed_on AS day, COUNT(*) AS count
         FROM artwork_views
         JOIN artworks ON artworks.id = artwork_views.artwork_id
         WHERE artworks.creator_id = ?
           AND date(artwork_views.viewed_on) >= date('now', '-29 days')
         GROUP BY artwork_views.viewed_on`
      )
      .bind(user.id)
      .all<DailyAnalyticsRow>(),
    context.env.DB
      .prepare(
        `SELECT substr(artwork_likes.created_at, 1, 10) AS day, COUNT(*) AS count
         FROM artwork_likes
         JOIN artworks ON artworks.id = artwork_likes.artwork_id
         WHERE artworks.creator_id = ?
           AND date(artwork_likes.created_at) >= date('now', '-29 days')
         GROUP BY substr(artwork_likes.created_at, 1, 10)`
      )
      .bind(user.id)
      .all<DailyAnalyticsRow>(),
    context.env.DB
      .prepare(
        `SELECT substr(user_bookmarks.created_at, 1, 10) AS day, COUNT(*) AS count
         FROM user_bookmarks
         JOIN artworks ON artworks.id = user_bookmarks.artwork_id
         WHERE artworks.creator_id = ?
           AND date(user_bookmarks.created_at) >= date('now', '-29 days')
         GROUP BY substr(user_bookmarks.created_at, 1, 10)`
      )
      .bind(user.id)
      .all<DailyAnalyticsRow>(),
    context.env.DB
      .prepare(
        `SELECT substr(comments.created_at, 1, 10) AS day, COUNT(*) AS count
         FROM comments
         JOIN artworks ON artworks.id = comments.artwork_id
         WHERE artworks.creator_id = ?
           AND comments.deleted_at IS NULL
           AND date(comments.created_at) >= date('now', '-29 days')
         GROUP BY substr(comments.created_at, 1, 10)`
      )
      .bind(user.id)
      .all<DailyAnalyticsRow>()
  ]);

  const viewsByDay = dailyCountMap(viewRows.results);
  const likesByDay = dailyCountMap(likeRows.results);
  const bookmarksByDay = dailyCountMap(bookmarkRows.results);
  const commentsByDay = dailyCountMap(commentRows.results);
  const daily = lastUtcDateKeys(30).map((date) => ({
    date,
    views: viewsByDay.get(date) ?? 0,
    likes: likesByDay.get(date) ?? 0,
    bookmarks: bookmarksByDay.get(date) ?? 0,
    comments: commentsByDay.get(date) ?? 0
  }));
  const views7d = daily.slice(-7).reduce((total, day) => total + day.views, 0);
  const views30d = daily.reduce((total, day) => total + day.views, 0);
  const [topArtworks, recentArtworks] = await Promise.all([
    analyticsItemsFromRows(context.env.DB, user, topRows.results),
    analyticsItemsFromRows(context.env.DB, user, recentRows.results)
  ]);

  return context.json<CreatorAnalyticsResponse>({
    summary: {
      artworks: summaryRow?.artworks ?? 0,
      publicArtworks: summaryRow?.public_artworks ?? 0,
      matureArtworks: summaryRow?.mature_artworks ?? 0,
      followers: summaryRow?.followers ?? 0,
      totalViews: summaryRow?.total_views ?? 0,
      views7d,
      views30d,
      likes: summaryRow?.likes ?? 0,
      bookmarks: summaryRow?.bookmarks ?? 0,
      comments: summaryRow?.comments ?? 0
    },
    daily,
    topArtworks,
    recentArtworks,
    generatedAt: new Date().toISOString()
  });
});

app.get("/api/admin/stats", async (context) => {
  const admin = await requireAdmin(context);
  if (admin.response) {
    return admin.response;
  }

  const [accountRows, contentRows, recentUsers] = await Promise.all([
    admin.db
      .prepare(
        `SELECT
          COUNT(*) AS total_users,
          SUM(CASE WHEN email_verified_at IS NOT NULL THEN 1 ELSE 0 END) AS verified_users,
          SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS admins,
          SUM(CASE WHEN role = 'moderator' THEN 1 ELSE 0 END) AS moderators,
          SUM(CASE WHEN suspended_at IS NOT NULL THEN 1 ELSE 0 END) AS suspended_users
         FROM users`
      )
      .first<{
        total_users: number;
        verified_users: number | null;
        admins: number | null;
        moderators: number | null;
        suspended_users: number | null;
      }>(),
    admin.db
      .prepare(
        `SELECT
          COUNT(*) AS artworks,
          COALESCE(SUM(like_count), 0) AS likes,
          COALESCE(SUM(view_count), 0) AS views,
          COUNT(DISTINCT creator_id) AS creators
         FROM artworks`
      )
      .first<{
        artworks: number;
        likes: number | null;
        views: number | null;
        creators: number;
      }>(),
    admin.db
      .prepare(
        `SELECT
          id,
          email,
          username,
          display_name,
          role,
          email_verified_at,
          date_of_birth,
          mature_content_enabled,
          bookmark_default_visibility,
          profile_visibility,
          suspended_at,
          suspended_reason,
          created_at,
          updated_at
         FROM users
         ORDER BY datetime(created_at) DESC
         LIMIT 8`
      )
      .all<Omit<UserRow, "password_hash">>()
  ]);

  const [sessionCount, pendingVerificationCount] = await Promise.all([
    admin.db
      .prepare(
        `SELECT COUNT(*) AS count
         FROM auth_sessions
         WHERE datetime(expires_at) > datetime('now')`
      )
      .first<{ count: number }>(),
    admin.db
      .prepare(
        `SELECT COUNT(*) AS count
         FROM email_verification_tokens
         WHERE consumed_at IS NULL
           AND datetime(expires_at) > datetime('now')`
      )
      .first<{ count: number }>()
  ]);

  return context.json<AdminStatsResponse>({
    accounts: {
      totalUsers: accountRows?.total_users ?? 0,
      verifiedUsers: accountRows?.verified_users ?? 0,
      admins: accountRows?.admins ?? 0,
      moderators: accountRows?.moderators ?? 0,
      suspendedUsers: accountRows?.suspended_users ?? 0,
      activeSessions: sessionCount?.count ?? 0,
      pendingVerifications: pendingVerificationCount?.count ?? 0
    },
    content: {
      artworks: contentRows?.artworks ?? 0,
      creators: contentRows?.creators ?? 0,
      likes: contentRows?.likes ?? 0,
      views: contentRows?.views ?? 0
    },
    storage: {
      d1: Boolean(context.env.DB),
      r2: Boolean(context.env.ARTWORKS),
      email: Boolean(context.env.EMAIL)
    },
    recentUsers: recentUsers.results.map(adminUserFromRow)
  });
});

app.get("/api/admin/users", async (context) => {
  const admin = await requireAdmin(context);
  if (admin.response) {
    return admin.response;
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "admin:users",
    userId: admin.user.id,
    ...rateLimitDefaults.admin
  });
  if (rateLimitError) {
    return rateLimitError;
  }

  const query = (context.req.query("q") ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
  const status = asAdminUserStatusFilter(context.req.query("status"));
  const limit = Math.min(
    100,
    Math.max(10, Number.parseInt(context.req.query("limit") ?? "40", 10) || 40)
  );
  const clauses: string[] = [];
  const bindings: Array<string | number | null> = [];

  if (query) {
    const pattern = `%${escapeSqlLike(query.toLowerCase())}%`;
    clauses.push(
      `(lower(email) LIKE ? ESCAPE '\\'
        OR lower(username) LIKE ? ESCAPE '\\'
        OR lower(display_name) LIKE ? ESCAPE '\\')`
    );
    bindings.push(pattern, pattern, pattern);
  }
  if (status === "active") {
    clauses.push("suspended_at IS NULL");
  } else if (status === "suspended") {
    clauses.push("suspended_at IS NOT NULL");
  } else if (status === "unverified") {
    clauses.push("email_verified_at IS NULL");
  } else if (status === "moderator") {
    clauses.push("role = 'moderator'");
  } else if (status === "admin") {
    clauses.push("role = 'admin'");
  }

  const whereSql = clauses.length ? `WHERE ${clauses.join("\n       AND ")}` : "";
  const [rows, totalRow] = await Promise.all([
    admin.db
      .prepare(
        `SELECT
          id,
          email,
          username,
          display_name,
          role,
          email_verified_at,
          date_of_birth,
          mature_content_enabled,
          bookmark_default_visibility,
          profile_visibility,
          suspended_at,
          suspended_reason,
          created_at,
          updated_at
         FROM users
         ${whereSql}
         ORDER BY datetime(created_at) DESC, id DESC
         LIMIT ?`
      )
      .bind(...bindings, limit)
      .all<Omit<UserRow, "password_hash">>(),
    admin.db
      .prepare(
        `SELECT COUNT(*) AS count
         FROM users
         ${whereSql}`
      )
      .bind(...bindings)
      .first<{ count: number }>()
  ]);

  return context.json<AdminUsersResponse>({
    users: rows.results.map(adminUserFromRow),
    query,
    status,
    limit,
    totalCount: totalRow?.count ?? 0
  });
});

app.post("/api/admin/users/:id/role", async (context) => {
  const admin = await requireAdmin(context);
  if (admin.response) {
    return admin.response;
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "admin:user-role",
    userId: admin.user.id,
    ...rateLimitDefaults.admin
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const parsed = await parseJson(context, userRoleSchema);
  if (!parsed.success) {
    return context.json({ message: "Role is invalid." }, 400);
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const id = context.req.param("id");
  const target = await admin.db
    .prepare(
      `SELECT
        id,
        email,
        username,
        display_name,
        role,
        email_verified_at,
        date_of_birth,
        mature_content_enabled,
        bookmark_default_visibility,
        profile_visibility,
        suspended_at,
        suspended_reason,
        created_at,
        updated_at
       FROM users
       WHERE id = ?
       LIMIT 1`
    )
    .bind(id)
    .first<Omit<UserRow, "password_hash">>();
  if (!target) {
    return context.json({ message: "User not found." }, 404);
  }
  if (target.id === admin.user.id) {
    return context.json({ message: "You cannot change your own role here." }, 400);
  }

  const previousRole = asUserRole(target.role);
  const nextRole = parsed.data.role;
  if (previousRole === "admin" && nextRole !== "admin") {
    const adminCount = await admin.db
      .prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'")
      .first<{ count: number }>();
    if ((adminCount?.count ?? 0) <= 1) {
      return context.json({ message: "At least one administrator is required." }, 400);
    }
  }

  await admin.db
    .prepare(
      `UPDATE users
       SET role = ?,
           suspended_at = CASE WHEN ? IN ('admin', 'moderator') THEN NULL ELSE suspended_at END,
           suspended_reason = CASE WHEN ? IN ('admin', 'moderator') THEN NULL ELSE suspended_reason END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(nextRole, nextRole, nextRole, id)
    .run();

  await createAdminAuditLog(admin.db, admin.user, {
    action: "user.role",
    targetType: "user",
    targetId: id,
    summary: `Changed @${target.username} from ${previousRole} to ${nextRole}.`,
    metadata: {
      username: target.username,
      previousRole,
      role: nextRole
    }
  });

  const updated = await admin.db
    .prepare(
      `SELECT
        id,
        email,
        username,
        display_name,
        role,
        email_verified_at,
        date_of_birth,
        mature_content_enabled,
        bookmark_default_visibility,
        profile_visibility,
        suspended_at,
        suspended_reason,
        created_at,
        updated_at
       FROM users
       WHERE id = ?
       LIMIT 1`
    )
    .bind(id)
    .first<Omit<UserRow, "password_hash">>();
  if (!updated) {
    return context.json({ message: "User not found." }, 404);
  }

  return context.json<AdminUserActionResponse>({
    user: adminUserFromRow(updated),
    message: `User role updated to ${nextRole}.`
  });
});

app.get("/api/admin/audit-log", async (context) => {
  const admin = await requireAdmin(context);
  if (admin.response) {
    return admin.response;
  }

  const limit = Math.min(
    100,
    Math.max(10, Number.parseInt(context.req.query("limit") ?? "40", 10) || 40)
  );
  const result = await admin.db
    .prepare(
      `SELECT
        admin_audit_log.id,
        admin_audit_log.admin_user_id,
        users.username AS admin_username,
        users.display_name AS admin_display_name,
        admin_audit_log.action,
        admin_audit_log.target_type,
        admin_audit_log.target_id,
        admin_audit_log.summary,
        admin_audit_log.metadata_json,
        admin_audit_log.created_at
       FROM admin_audit_log
       JOIN users ON users.id = admin_audit_log.admin_user_id
       ORDER BY datetime(admin_audit_log.created_at) DESC, admin_audit_log.id DESC
       LIMIT ?`
    )
    .bind(limit)
    .all<AdminAuditLogRow>();

  return context.json<AdminAuditLogResponse>({
    entries: result.results.map(adminAuditLogFromRow)
  });
});

app.get("/api/admin/artwork-review-settings", async (context) => {
  const admin = await requireAdmin(context);
  if (admin.response) {
    return admin.response;
  }
  const [publicArtworkReviewEnabled, pendingCount] = await Promise.all([
    getPublicArtworkReviewEnabled(admin.db),
    getPendingArtworkReviewCount(admin.db)
  ]);
  return context.json<AdminArtworkReviewSettingsResponse>({
    publicArtworkReviewEnabled,
    pendingCount
  });
});

app.put("/api/admin/artwork-review-settings", async (context) => {
  const admin = await requireAdmin(context);
  if (admin.response) {
    return admin.response;
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "admin:artwork-review-settings",
    userId: admin.user.id,
    ...rateLimitDefaults.admin
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const parsed = await parseJson(context, artworkReviewSettingsSchema);
  if (!parsed.success) {
    return context.json({ message: "Review setting is invalid." }, 400);
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  await setPublicArtworkReviewEnabled(admin.db, parsed.data.publicArtworkReviewEnabled);
  await createAdminAuditLog(admin.db, admin.user, {
    action: "artwork.review_setting",
    targetType: "platform",
    targetId: publicArtworkReviewSettingKey,
    summary: `${parsed.data.publicArtworkReviewEnabled ? "Enabled" : "Disabled"} public artwork review.`,
    metadata: {
      publicArtworkReviewEnabled: parsed.data.publicArtworkReviewEnabled
    }
  });
  return context.json<AdminArtworkReviewSettingsResponse>({
    publicArtworkReviewEnabled: parsed.data.publicArtworkReviewEnabled,
    pendingCount: await getPendingArtworkReviewCount(admin.db),
    message: parsed.data.publicArtworkReviewEnabled
      ? "Public artwork review enabled."
      : "Public artwork review disabled."
  });
});

app.get("/api/admin/artwork-reviews", async (context) => {
  const admin = await requireStaff(context);
  if (admin.response) {
    return admin.response;
  }
  const limit = Math.min(
    100,
    Math.max(10, Number.parseInt(context.req.query("limit") ?? "40", 10) || 40)
  );
  const [publicArtworkReviewEnabled, totalRow, rows] = await Promise.all([
    getPublicArtworkReviewEnabled(admin.db),
    admin.db
      .prepare(
        `SELECT COUNT(*) AS count
         FROM artworks
         WHERE hidden_at IS NULL
           AND COALESCE(review_status, 'approved') = 'pending'`
      )
      .first<{ count: number }>(),
    admin.db
      .prepare(
        `${artworkSelect}
         WHERE artworks.hidden_at IS NULL
           AND COALESCE(artworks.review_status, 'approved') = 'pending'
         ORDER BY datetime(artworks.created_at) ASC, artworks.id ASC
         LIMIT ?`
      )
      .bind(limit)
      .all<ArtworkRow>()
  ]);
  return context.json<AdminArtworkReviewsResponse>({
    publicArtworkReviewEnabled,
    artworks: await withArtworkImages(admin.db, rows.results.map((row) => artworkFromRow(row))),
    totalCount: totalRow?.count ?? 0,
    limit
  });
});

app.post("/api/admin/artworks/:id/review", async (context) => {
  const admin = await requireStaff(context);
  if (admin.response) {
    return admin.response;
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "admin:artwork-review",
    userId: admin.user.id,
    ...rateLimitDefaults.admin
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const parsed = await parseJson(context, artworkReviewSchema);
  if (!parsed.success) {
    return context.json({ message: "Review action is invalid." }, 400);
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const id = context.req.param("id");
  const artwork = await admin.db
    .prepare(
      `SELECT
        artworks.id,
        artworks.creator_id,
        artworks.title,
        artworks.visibility,
        artworks.review_status,
        users.display_name AS creator_display_name
       FROM artworks
       JOIN users ON users.id = artworks.creator_id
       WHERE artworks.id = ?
         AND artworks.hidden_at IS NULL
       LIMIT 1`
    )
    .bind(id)
    .first<{
      id: string;
      creator_id: string;
      title: string;
      visibility: string | null;
      review_status: string | null;
      creator_display_name: string;
    }>();
  if (!artwork) {
    return context.json({ message: "Artwork not found." }, 404);
  }

  const nextStatus: ArtworkReviewStatus = parsed.data.action === "approve" ? "approved" : "rejected";
  await admin.db.batch([
    admin.db
      .prepare(
        `UPDATE artworks
         SET review_status = ?,
             reviewed_by_user_id = ?,
             reviewed_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      )
      .bind(nextStatus, admin.user.id, id),
    parsed.data.action === "approve" && asArtworkVisibility(artwork.visibility) === "public"
      ? admin.db.prepare(
          `INSERT INTO activity_events (id, actor_user_id, type, artwork_id, message, created_at)
           SELECT ?, ?, 'publish', ?, ?, CURRENT_TIMESTAMP
           WHERE NOT EXISTS (
             SELECT 1
             FROM activity_events
             WHERE artwork_id = ?
               AND type = 'publish'
           )`
        ).bind(
          `act_${crypto.randomUUID().replaceAll("-", "")}`,
          artwork.creator_id,
          id,
          `${artwork.creator_display_name} published "${artwork.title}".`,
          id
        )
      : admin.db.prepare("DELETE FROM activity_events WHERE artwork_id = ? AND type = 'publish'").bind(id)
  ]);

  await createAdminAuditLog(admin.db, admin.user, {
    action: parsed.data.action === "approve" ? "artwork.review_approve" : "artwork.review_reject",
    targetType: "artwork",
    targetId: id,
    summary: `${parsed.data.action === "approve" ? "Approved" : "Rejected"} artwork "${artwork.title}".`,
    metadata: {
      creatorId: artwork.creator_id,
      title: artwork.title,
      previousStatus: asArtworkReviewStatus(artwork.review_status),
      reviewStatus: nextStatus
    }
  });
  await createNotification(admin.db, {
    userId: artwork.creator_id,
    actorUserId: admin.user.id,
    type: "moderation",
    artworkId: id,
    message:
      parsed.data.action === "approve"
        ? `Your artwork "${artwork.title}" was approved and published.`
        : `Your artwork "${artwork.title}" was not approved for public publishing.`
  });

  const updated = await getArtworkFromD1(admin.db, id, admin.user);
  if (!updated) {
    return context.json({ message: "Artwork not found." }, 404);
  }

  return context.json<AdminArtworkReviewActionResponse>({
    artwork: updated.artwork,
    message: parsed.data.action === "approve" ? "Artwork approved and published." : "Artwork rejected."
  });
});

app.post("/api/admin/users/:id/suspension", async (context) => {
  const admin = await requireAdmin(context);
  if (admin.response) {
    return admin.response;
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "admin:user-suspension",
    userId: admin.user.id,
    ...rateLimitDefaults.admin
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const parsed = await parseJson(context, userSuspensionSchema);
  if (!parsed.success) {
    return context.json({ message: "Suspension details are invalid." }, 400);
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const id = context.req.param("id");
  const target = await admin.db
    .prepare(
      `SELECT
        id,
        email,
        username,
        display_name,
        role,
        email_verified_at,
        date_of_birth,
        mature_content_enabled,
        bookmark_default_visibility,
        profile_visibility,
        suspended_at,
        suspended_reason,
        created_at,
        updated_at
       FROM users
       WHERE id = ?
       LIMIT 1`
    )
    .bind(id)
    .first<Omit<UserRow, "password_hash">>();
  if (!target) {
    return context.json({ message: "User not found." }, 404);
  }
  if (target.id === admin.user.id) {
    return context.json({ message: "You cannot suspend yourself." }, 400);
  }
  if (isStaffRole(asUserRole(target.role))) {
    return context.json({ message: "Staff accounts cannot be suspended here." }, 400);
  }

  if (parsed.data.suspended) {
    await admin.db.batch([
      admin.db
        .prepare(
          `UPDATE users
           SET suspended_at = COALESCE(suspended_at, CURRENT_TIMESTAMP),
               suspended_reason = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`
        )
        .bind(parsed.data.reason, id),
      admin.db.prepare("DELETE FROM auth_sessions WHERE user_id = ?").bind(id)
    ]);
    await createAdminAuditLog(admin.db, admin.user, {
      action: "user.suspend",
      targetType: "user",
      targetId: id,
      summary: `Suspended user @${target.username}.`,
      metadata: {
        username: target.username,
        reason: parsed.data.reason
      }
    });
  } else {
    await admin.db
      .prepare(
        `UPDATE users
         SET suspended_at = NULL,
             suspended_reason = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      )
      .bind(id)
      .run();
    await createAdminAuditLog(admin.db, admin.user, {
      action: "user.restore",
      targetType: "user",
      targetId: id,
      summary: `Restored user @${target.username}.`,
      metadata: {
        username: target.username
      }
    });
  }

  const updated = await admin.db
    .prepare(
      `SELECT
        id,
        email,
        username,
        display_name,
        role,
        email_verified_at,
        date_of_birth,
        mature_content_enabled,
        bookmark_default_visibility,
        profile_visibility,
        suspended_at,
        suspended_reason,
        created_at,
        updated_at
       FROM users
       WHERE id = ?
       LIMIT 1`
    )
    .bind(id)
    .first<Omit<UserRow, "password_hash">>();
  if (!updated) {
    return context.json({ message: "User not found." }, 404);
  }

  return context.json<AdminUserActionResponse>({
    user: adminUserFromRow(updated),
    message: parsed.data.suspended ? "User suspended." : "User restored."
  });
});

app.get("/api/admin/tags", async (context) => {
  const admin = await requireAdmin(context);
  if (admin.response) {
    return admin.response;
  }

  return context.json<AdminTagsResponse>(await getAdminTags(admin.db));
});

app.post("/api/admin/tags/aliases", async (context) => {
  const admin = await requireAdmin(context);
  if (admin.response) {
    return admin.response;
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "admin:tag-alias",
    userId: admin.user.id,
    ...rateLimitDefaults.admin
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const parsed = await parseJson(context, tagRuleSchema);
  if (!parsed.success) {
    return context.json({ message: "Tag alias is invalid." }, 400);
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const sourceTag = normalizeTagName(parsed.data.sourceTag);
  const targetTag = await canonicalizeSingleTag(admin.db, parsed.data.targetTag);
  if (!isValidTagName(sourceTag) || !isValidTagName(targetTag)) {
    return context.json({ message: "Tag alias is invalid." }, 400);
  }
  if (sourceTag === targetTag) {
    return context.json({ message: "Alias source and target must differ." }, 400);
  }

  await admin.db
    .prepare(
      `INSERT INTO tag_aliases (source_tag, target_tag, created_by)
       VALUES (?, ?, ?)
       ON CONFLICT(source_tag) DO UPDATE SET
         target_tag = excluded.target_tag,
         created_by = excluded.created_by,
         updated_at = CURRENT_TIMESTAMP`
    )
    .bind(sourceTag, targetTag, admin.user.id)
    .run();
  await reindexArtworkTags(admin.db);
  await createAdminAuditLog(admin.db, admin.user, {
    action: "tag.alias.upsert",
    targetType: "tag_alias",
    targetId: sourceTag,
    summary: `Mapped #${sourceTag} to #${targetTag}.`,
    metadata: { sourceTag, targetTag }
  });

  return context.json<AdminTagRuleResponse>({
    tags: await getAdminTags(admin.db),
    message: `#${sourceTag} now resolves to #${targetTag}.`
  });
});

app.delete("/api/admin/tags/aliases/:sourceTag", async (context) => {
  const admin = await requireAdmin(context);
  if (admin.response) {
    return admin.response;
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "admin:tag-alias-delete",
    userId: admin.user.id,
    ...rateLimitDefaults.admin
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const sourceTag = normalizeTagName(context.req.param("sourceTag"));
  if (!isValidTagName(sourceTag)) {
    return context.json({ message: "Tag alias is invalid." }, 400);
  }
  await admin.db
    .prepare("DELETE FROM tag_aliases WHERE source_tag = ?")
    .bind(sourceTag)
    .run();
  await createAdminAuditLog(admin.db, admin.user, {
    action: "tag.alias.delete",
    targetType: "tag_alias",
    targetId: sourceTag,
    summary: `Removed alias for #${sourceTag}.`,
    metadata: { sourceTag }
  });

  return context.json<AdminTagRuleResponse>({
    tags: await getAdminTags(admin.db),
    message: `Alias for #${sourceTag} removed.`
  });
});

app.post("/api/admin/tags/implications", async (context) => {
  const admin = await requireAdmin(context);
  if (admin.response) {
    return admin.response;
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "admin:tag-implication",
    userId: admin.user.id,
    ...rateLimitDefaults.admin
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const parsed = await parseJson(context, tagRuleSchema);
  if (!parsed.success) {
    return context.json({ message: "Tag implication is invalid." }, 400);
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const sourceTag = await canonicalizeSingleTag(admin.db, parsed.data.sourceTag);
  const targetTag = await canonicalizeSingleTag(admin.db, parsed.data.targetTag);
  if (!isValidTagName(sourceTag) || !isValidTagName(targetTag)) {
    return context.json({ message: "Tag implication is invalid." }, 400);
  }
  if (sourceTag === targetTag) {
    return context.json({ message: "Implication source and target must differ." }, 400);
  }
  const reverse = await admin.db
    .prepare(
      `SELECT source_tag
       FROM tag_implications
       WHERE source_tag = ?
         AND target_tag = ?
       LIMIT 1`
    )
    .bind(targetTag, sourceTag)
    .first<{ source_tag: string }>();
  if (reverse) {
    return context.json({ message: "That implication would create a direct cycle." }, 400);
  }

  await admin.db
    .prepare(
      `INSERT OR IGNORE INTO tag_implications (source_tag, target_tag, created_by)
       VALUES (?, ?, ?)`
    )
    .bind(sourceTag, targetTag, admin.user.id)
    .run();
  await reindexArtworkTags(admin.db);
  await createAdminAuditLog(admin.db, admin.user, {
    action: "tag.implication.create",
    targetType: "tag_implication",
    targetId: `${sourceTag}->${targetTag}`,
    summary: `Added implication #${sourceTag} -> #${targetTag}.`,
    metadata: { sourceTag, targetTag }
  });

  return context.json<AdminTagRuleResponse>({
    tags: await getAdminTags(admin.db),
    message: `#${sourceTag} now implies #${targetTag}.`
  });
});

app.delete(
  "/api/admin/tags/implications/:sourceTag/:targetTag",
  async (context) => {
    const admin = await requireAdmin(context);
    if (admin.response) {
      return admin.response;
    }
    const rateLimitError = await enforceRateLimit(context, {
      action: "admin:tag-implication-delete",
      userId: admin.user.id,
      ...rateLimitDefaults.admin
    });
    if (rateLimitError) {
      return rateLimitError;
    }
    const csrfError = await validateCsrf(context);
    if (csrfError) {
      return csrfError;
    }

    const sourceTag = normalizeTagName(context.req.param("sourceTag"));
    const targetTag = normalizeTagName(context.req.param("targetTag"));
    if (!isValidTagName(sourceTag) || !isValidTagName(targetTag)) {
      return context.json({ message: "Tag implication is invalid." }, 400);
    }
    await admin.db
      .prepare(
        "DELETE FROM tag_implications WHERE source_tag = ? AND target_tag = ?"
      )
      .bind(sourceTag, targetTag)
      .run();
    await createAdminAuditLog(admin.db, admin.user, {
      action: "tag.implication.delete",
      targetType: "tag_implication",
      targetId: `${sourceTag}->${targetTag}`,
      summary: `Removed implication #${sourceTag} -> #${targetTag}.`,
      metadata: { sourceTag, targetTag }
    });

    return context.json<AdminTagRuleResponse>({
      tags: await getAdminTags(admin.db),
      message: `Implication #${sourceTag} -> #${targetTag} removed.`
    });
  }
);

app.get("/api/admin/reports", async (context) => {
  const admin = await requireStaff(context);
  if (admin.response) {
    return admin.response;
  }

  const status = asReportStatus(context.req.query("status"));
  const targetType = asAdminReportTargetFilter(context.req.query("targetType"));
  const reason = asAdminReportReasonFilter(context.req.query("reason"));
  const limit = Math.min(
    100,
    Math.max(10, Number.parseInt(context.req.query("limit") ?? "50", 10) || 50)
  );
  const clauses = ["moderation_reports.status = ?"];
  const bindings: Array<string | number | null> = [status];
  if (targetType !== "all") {
    clauses.push("moderation_reports.target_type = ?");
    bindings.push(targetType);
  }
  if (reason !== "all") {
    clauses.push("moderation_reports.reason = ?");
    bindings.push(reason);
  }
  const whereSql = clauses.join("\n         AND ");
  const [result, totalRow] = await Promise.all([
    admin.db
      .prepare(
        `SELECT
          moderation_reports.id,
          moderation_reports.reporter_user_id,
          reporter.display_name AS reporter_display_name,
          moderation_reports.target_type,
          moderation_reports.target_id,
          CASE
            WHEN moderation_reports.target_type = 'artwork' THEN artworks.title
            WHEN moderation_reports.target_type = 'comment' THEN substr(comments.body, 1, 80)
            WHEN moderation_reports.target_type = 'user' THEN target_user.display_name || ' (@' || target_user.username || ')'
            ELSE moderation_reports.target_id
          END AS target_label,
          moderation_reports.reason,
          moderation_reports.details,
          moderation_reports.status,
          moderation_reports.created_at,
          moderation_reports.resolved_at
         FROM moderation_reports
         LEFT JOIN users AS reporter ON reporter.id = moderation_reports.reporter_user_id
         LEFT JOIN artworks ON moderation_reports.target_type = 'artwork'
           AND artworks.id = moderation_reports.target_id
         LEFT JOIN comments ON moderation_reports.target_type = 'comment'
           AND comments.id = moderation_reports.target_id
         LEFT JOIN users AS target_user ON moderation_reports.target_type = 'user'
           AND target_user.id = moderation_reports.target_id
         WHERE ${whereSql}
         ORDER BY datetime(moderation_reports.created_at) DESC
         LIMIT ?`
      )
      .bind(...bindings, limit)
      .all<ModerationReportRow>(),
    admin.db
      .prepare(
        `SELECT COUNT(*) AS count
         FROM moderation_reports
         WHERE ${whereSql}`
      )
      .bind(...bindings)
      .first<{ count: number }>()
  ]);

  return context.json<AdminReportsResponse>({
    reports: result.results.map(reportFromRow),
    status,
    targetType,
    reason,
    limit,
    totalCount: totalRow?.count ?? 0
  });
});

app.post("/api/admin/reports/:id/resolve", async (context) => {
  const admin = await requireStaff(context);
  if (admin.response) {
    return admin.response;
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "admin:resolve-report",
    userId: admin.user.id,
    ...rateLimitDefaults.admin
  });
  if (rateLimitError) {
    return rateLimitError;
  }

  const parsed = await parseJson(context, resolveReportSchema);
  if (!parsed.success) {
    return context.json({ message: "Report resolution is invalid." }, 400);
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const id = context.req.param("id");
  await admin.db
    .prepare(
      `UPDATE moderation_reports
       SET status = ?,
           resolved_at = CURRENT_TIMESTAMP,
           resolved_by = ?
       WHERE id = ?`
    )
    .bind(parsed.data.status, admin.user.id, id)
    .run();

  const row = await admin.db
    .prepare(
      `SELECT
        moderation_reports.id,
        moderation_reports.reporter_user_id,
        reporter.display_name AS reporter_display_name,
        moderation_reports.target_type,
        moderation_reports.target_id,
        CASE
          WHEN moderation_reports.target_type = 'artwork' THEN artworks.title
          WHEN moderation_reports.target_type = 'comment' THEN substr(comments.body, 1, 80)
          WHEN moderation_reports.target_type = 'user' THEN target_user.display_name || ' (@' || target_user.username || ')'
          ELSE moderation_reports.target_id
        END AS target_label,
        moderation_reports.reason,
        moderation_reports.details,
        moderation_reports.status,
        moderation_reports.created_at,
        moderation_reports.resolved_at
       FROM moderation_reports
       LEFT JOIN users AS reporter ON reporter.id = moderation_reports.reporter_user_id
       LEFT JOIN artworks ON moderation_reports.target_type = 'artwork'
         AND artworks.id = moderation_reports.target_id
       LEFT JOIN comments ON moderation_reports.target_type = 'comment'
         AND comments.id = moderation_reports.target_id
       LEFT JOIN users AS target_user ON moderation_reports.target_type = 'user'
         AND target_user.id = moderation_reports.target_id
       WHERE moderation_reports.id = ?
       LIMIT 1`
    )
    .bind(id)
    .first<ModerationReportRow>();

  if (!row) {
    return context.json({ message: "Report not found." }, 404);
  }
  await createAdminAuditLog(admin.db, admin.user, {
    action: `report.${parsed.data.status}`,
    targetType: "report",
    targetId: id,
    summary: `${parsed.data.status === "resolved" ? "Resolved" : "Dismissed"} ${row.target_type} report for ${row.target_label ?? row.target_id}.`,
    metadata: {
      reportStatus: parsed.data.status,
      targetType: row.target_type,
      targetId: row.target_id,
      reason: row.reason
    }
  });

  await createNotification(admin.db, {
    userId: row.reporter_user_id,
    actorUserId: admin.user.id,
    type: "moderation",
    artworkId: row.target_type === "artwork" ? row.target_id : null,
    commentId: row.target_type === "comment" ? row.target_id : null,
    message: `Your report about "${row.target_label ?? row.target_id}" was ${parsed.data.status}.`
  });

  return context.json<ReportResponse>({
    report: reportFromRow(row),
    message: parsed.data.status === "resolved" ? "Report resolved." : "Report dismissed."
  });
});

app.post("/api/admin/artworks/:id/moderation", async (context) => {
  const admin = await requireStaff(context);
  if (admin.response) {
    return admin.response;
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "admin:artwork-moderation",
    userId: admin.user.id,
    ...rateLimitDefaults.admin
  });
  if (rateLimitError) {
    return rateLimitError;
  }

  const parsed = await parseJson(context, artworkModerationSchema);
  if (!parsed.success) {
    return context.json({ message: "Moderation action is invalid." }, 400);
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const id = context.req.param("id");
  const artwork = await admin.db
    .prepare("SELECT id, creator_id, title, hidden_at FROM artworks WHERE id = ? LIMIT 1")
    .bind(id)
    .first<{ id: string; creator_id: string; title: string; hidden_at: string | null }>();
  if (!artwork) {
    return context.json({ message: "Artwork not found." }, 404);
  }

  if (parsed.data.action === "hide") {
    await admin.db
      .prepare("UPDATE artworks SET hidden_at = COALESCE(hidden_at, CURRENT_TIMESTAMP) WHERE id = ?")
      .bind(id)
      .run();
    await createAdminAuditLog(admin.db, admin.user, {
      action: "artwork.hide",
      targetType: "artwork",
      targetId: id,
      summary: `Hid artwork "${artwork.title}".`,
      metadata: {
        creatorId: artwork.creator_id,
        title: artwork.title
      }
    });
    await createNotification(admin.db, {
      userId: artwork.creator_id,
      actorUserId: admin.user.id,
      type: "moderation",
      artworkId: id,
      message: `Your artwork "${artwork.title}" was hidden by moderation.`
    });
    return context.json<AdminModerationActionResponse>({
      action: "hide_artwork",
      targetId: id,
      message: "Artwork hidden from public feeds."
    });
  }

  await admin.db
    .prepare("UPDATE artworks SET hidden_at = NULL WHERE id = ?")
    .bind(id)
    .run();
  await createAdminAuditLog(admin.db, admin.user, {
    action: "artwork.restore",
    targetType: "artwork",
    targetId: id,
    summary: `Restored artwork "${artwork.title}".`,
    metadata: {
      creatorId: artwork.creator_id,
      title: artwork.title
    }
  });
  await createNotification(admin.db, {
    userId: artwork.creator_id,
    actorUserId: admin.user.id,
    type: "moderation",
    artworkId: id,
    message: `Your artwork "${artwork.title}" was restored by moderation.`
  });
  return context.json<AdminModerationActionResponse>({
    action: "restore_artwork",
    targetId: id,
    message: "Artwork restored to public feeds."
  });
});

app.get("/api/users/:username/profile", async (context) => {
  if (!context.env.DB) {
    return context.json({ message: "D1 database is required." }, 503);
  }

  const username = decodeURIComponent(context.req.param("username")).replace(/^@/, "");
  const sectionQuery = context.req.query("section");
  const requestedSection = profileSectionFromQuery(sectionQuery);
  const requestedCursor = decodeProfileCursor(context.req.query("cursor"), requestedSection);
  if (requestedCursor === null) {
    return context.json({ message: "Profile cursor is invalid." }, 400);
  }
  const viewer = await getCurrentUser(context.env.DB, context.req.raw);
  const matureAccess = matureAccessFor(context, viewer);
  const profileUser = await getProfileUser(context.env.DB, username);
  if (!profileUser) {
    return context.json({ message: "User not found." }, 404);
  }
  if (profileUser.suspended_at) {
    return context.json({ message: "User not found." }, 404);
  }

  const ownProfile = viewer?.id === profileUser.id;
  const viewerBlockedProfile = await viewerBlocksUser(context.env.DB, viewer?.id, profileUser.id);
  const profileBlockedViewer =
    viewer && !ownProfile ? await viewerBlocksUser(context.env.DB, profileUser.id, viewer.id) : false;
  if (profileBlockedViewer) {
    return context.json({ message: "User not found." }, 404);
  }
  if (
    !canViewProfileVisibility(
      asProfileVisibility(profileUser.profile_visibility),
      profileUser.id,
      viewer
    )
  ) {
    return context.json(
      {
        message:
          asProfileVisibility(profileUser.profile_visibility) === "members"
            ? "Sign in to view this profile."
            : "This profile is private."
      },
      viewer ? 403 : 401
    );
  }
  if (viewerBlockedProfile) {
    return context.json<UserProfileResponse>({
      profile: {
        ...profileFromRow(profileUser, ownProfile),
        blocked: true,
        following: false
      },
      artworks: [],
      publicBookmarks: [],
      privateBookmarks: [],
      publicCollections: [],
      publicSeries: [],
      nextCursors: {
        artworks: null,
        publicBookmarks: null,
        privateBookmarks: null,
        publicCollections: null,
        publicSeries: null
      },
      stats: {
        artworks: 0,
        publicBookmarks: 0,
        privateBookmarks: 0,
        publicCollections: 0,
        publicSeries: 0,
        following: 0,
        totalLikes: 0,
        totalViews: 0
      },
      matureAccess
    });
  }

  const emptyPage = { artworks: [] as Artwork[], nextCursor: null as string | null };
  const emptyCollectionPage = {
    collections: [] as UserCollection[],
    nextCursor: null as string | null
  };
  const emptySeriesPage = {
    series: [] as ArtworkSeries[],
    nextCursor: null as string | null
  };
  const loadAllSections = !sectionQuery;
  const [
    artworkPage,
    publicBookmarkPage,
    privateBookmarkPage,
    publicCollectionPage,
    publicSeriesPage,
    artworkStats,
    publicBookmarkCount,
    privateBookmarkCount,
    publicCollectionCount,
    publicSeriesCount,
    followingCount
  ] = await Promise.all([
    loadAllSections || requestedSection === "artworks"
      ? getArtworkPageByCreator(
          context.env.DB,
          profileUser.id,
          viewer,
          matureAccess,
          requestedSection === "artworks" ? requestedCursor : undefined
        )
      : Promise.resolve(emptyPage),
    loadAllSections || requestedSection === "publicBookmarks"
      ? getBookmarkedArtworkPage(
          context.env.DB,
          profileUser.id,
          "public",
          viewer,
          matureAccess,
          requestedSection === "publicBookmarks" ? requestedCursor : undefined
        )
      : Promise.resolve(emptyPage),
    ownProfile && (loadAllSections || requestedSection === "privateBookmarks")
      ? getBookmarkedArtworkPage(
          context.env.DB,
          profileUser.id,
          "private",
          viewer,
          matureAccess,
          requestedSection === "privateBookmarks" ? requestedCursor : undefined
        )
      : Promise.resolve(emptyPage),
    loadAllSections || requestedSection === "publicCollections"
      ? getPublicCollectionPageByCreator(
          context.env.DB,
          profileUser.id,
          viewer,
          matureAccess,
          requestedSection === "publicCollections" ? requestedCursor : undefined
        )
      : Promise.resolve(emptyCollectionPage),
    loadAllSections || requestedSection === "publicSeries"
      ? getPublicSeriesPageByCreator(
          context.env.DB,
          profileUser.id,
          viewer,
          matureAccess,
          requestedSection === "publicSeries" ? requestedCursor : undefined
        )
      : Promise.resolve(emptySeriesPage),
    getCreatorArtworkStats(context.env.DB, profileUser.id, viewer, matureAccess),
    getBookmarkCountForProfile(context.env.DB, profileUser.id, "public", viewer, matureAccess),
    ownProfile
      ? getBookmarkCountForProfile(context.env.DB, profileUser.id, "private", viewer, matureAccess)
      : Promise.resolve(0),
    getPublicCollectionCountForProfile(context.env.DB, profileUser.id),
    getPublicSeriesCountForProfile(context.env.DB, profileUser.id),
    getFollowingCountForProfile(context.env.DB, profileUser.id)
  ]);
  const following = await viewerFollowsCreator(context.env.DB, viewer?.id, profileUser.id);

  return context.json<UserProfileResponse>({
    profile: {
      ...profileFromRow(profileUser, ownProfile),
      following,
      blocked: false
    },
    artworks: artworkPage.artworks,
    publicBookmarks: publicBookmarkPage.artworks,
    privateBookmarks: privateBookmarkPage.artworks,
    publicCollections: publicCollectionPage.collections,
    publicSeries: publicSeriesPage.series,
    nextCursors: {
      artworks: artworkPage.nextCursor,
      publicBookmarks: publicBookmarkPage.nextCursor,
      privateBookmarks: privateBookmarkPage.nextCursor,
      publicCollections: publicCollectionPage.nextCursor,
      publicSeries: publicSeriesPage.nextCursor
    },
    stats: {
      artworks: artworkStats?.artworks ?? 0,
      publicBookmarks: publicBookmarkCount,
      privateBookmarks: privateBookmarkCount,
      publicCollections: publicCollectionCount,
      publicSeries: publicSeriesCount,
      following: followingCount,
      totalLikes: artworkStats?.total_likes ?? 0,
      totalViews: artworkStats?.total_views ?? 0
    },
    matureAccess
  });
});

app.get("/api/users/:username/follows", async (context) => {
  if (!context.env.DB) {
    return context.json({ message: "D1 database is required." }, 503);
  }

  const username = decodeURIComponent(context.req.param("username")).replace(/^@/, "");
  const mode = asFollowListMode(context.req.query("mode"));
  const viewer = await getCurrentUser(context.env.DB, context.req.raw);
  const profileUser = await getProfileUser(context.env.DB, username);
  if (!profileUser || profileUser.suspended_at) {
    return context.json({ message: "User not found." }, 404);
  }

  const cursor = decodeFollowListCursor(context.req.query("cursor"), profileUser.username, mode);
  if (cursor === null) {
    return context.json({ message: "Follow list cursor is invalid." }, 400);
  }
  const ownProfile = viewer?.id === profileUser.id;
  const profileBlockedViewer =
    viewer && !ownProfile ? await viewerBlocksUser(context.env.DB, profileUser.id, viewer.id) : false;
  if (profileBlockedViewer) {
    return context.json({ message: "User not found." }, 404);
  }
  if (
    !canViewProfileVisibility(
      asProfileVisibility(profileUser.profile_visibility),
      profileUser.id,
      viewer
    )
  ) {
    return context.json(
      {
        message:
          asProfileVisibility(profileUser.profile_visibility) === "members"
            ? "Sign in to view this profile."
            : "This profile is private."
      },
      viewer ? 403 : 401
    );
  }
  if (await viewerBlocksUser(context.env.DB, viewer?.id, profileUser.id)) {
    return context.json({ message: "User not found." }, 404);
  }

  const rateLimitError = await enforceRateLimit(context, {
    action: `users:follows:${mode}`,
    userId: viewer?.id,
    ...rateLimitDefaults.profile
  });
  if (rateLimitError) {
    return rateLimitError;
  }

  const limit = Math.min(
    60,
    Math.max(12, Number.parseInt(context.req.query("limit") ?? "24", 10) || 24)
  );
  const [page, following] = await Promise.all([
    getProfileFollowPage(
      context.env.DB,
      profileUser.id,
      profileUser.username,
      mode,
      viewer,
      limit,
      cursor
    ),
    viewerFollowsCreator(context.env.DB, viewer?.id, profileUser.id)
  ]);

  return context.json<ProfileFollowListResponse>({
    profile: {
      ...profileFromRow(profileUser, ownProfile),
      following,
      blocked: false
    },
    mode,
    users: page.users,
    nextCursor: page.nextCursor,
    totalCount: page.totalCount
  });
});

app.post("/api/users/:username/follow", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }

  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to follow creators." }, 401);
  }
  if (!user.emailVerified) {
    return context.json({ message: "Verify your email before following creators." }, 403);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "users:follow",
    userId: user.id,
    ...rateLimitDefaults.social
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const username = decodeURIComponent(context.req.param("username")).replace(/^@/, "");
  const profileUser = await getProfileUser(context.env.DB, username);
  if (!profileUser) {
    return context.json({ message: "User not found." }, 404);
  }
  if (profileUser.id === user.id) {
    return context.json({ message: "You cannot follow yourself." }, 400);
  }
  if (await userBlockedPair(context.env.DB, user.id, profileUser.id)) {
    return context.json({ message: "You cannot follow this creator." }, 403);
  }
  if (
    !canViewProfileVisibility(
      asProfileVisibility(profileUser.profile_visibility),
      profileUser.id,
      user
    )
  ) {
    return context.json({ message: "This profile is private." }, 403);
  }

  await ensureCreatorIdentity(context.env.DB, user);
  await context.env.DB.prepare(
    `INSERT INTO creators (id, handle, display_name, avatar_url, bio)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       handle = excluded.handle,
       display_name = excluded.display_name,
       avatar_url = excluded.avatar_url,
       bio = excluded.bio`
  )
    .bind(
      profileUser.id,
      profileUser.username,
      profileUser.display_name,
      profileUser.avatar_url ?? "",
      profileUser.bio ?? ""
    )
    .run();

  const existing = await context.env.DB.prepare(
    `SELECT followed_creator_id
     FROM follows
     WHERE follower_creator_id = ?
       AND followed_creator_id = ?
     LIMIT 1`
  )
    .bind(user.id, profileUser.id)
    .first<{ followed_creator_id: string }>();

  const following = !existing;
  if (existing) {
    await context.env.DB.batch([
      context.env.DB.prepare(
        "DELETE FROM follows WHERE follower_creator_id = ? AND followed_creator_id = ?"
      ).bind(user.id, profileUser.id),
      context.env.DB.prepare(
        "UPDATE creators SET follower_count = MAX(follower_count - 1, 0) WHERE id = ?"
      ).bind(profileUser.id)
    ]);
  } else {
    await context.env.DB.batch([
      context.env.DB.prepare(
        "INSERT INTO follows (follower_creator_id, followed_creator_id) VALUES (?, ?)"
      ).bind(user.id, profileUser.id),
      context.env.DB.prepare(
        "UPDATE creators SET follower_count = follower_count + 1 WHERE id = ?"
      ).bind(profileUser.id)
    ]);
    await createNotification(context.env.DB, {
      userId: profileUser.id,
      actorUserId: user.id,
      type: "follow",
      message: `${user.displayName} followed you.`
    });
    await createActivityEvent(context.env.DB, {
      actorUserId: user.id,
      type: "follow",
      targetUserId: profileUser.id,
      message: `${user.displayName} followed ${profileUser.display_name}.`
    });
  }

  const updated = await getProfileUser(context.env.DB, profileUser.username);
  return context.json<FollowResponse>({
    following,
    followerCount: updated?.follower_count ?? 0,
    message: following ? "Creator followed." : "Creator unfollowed."
  });
});

app.post("/api/users/:username/block", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }

  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to block users." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "users:block",
    userId: user.id,
    ...rateLimitDefaults.social
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const username = decodeURIComponent(context.req.param("username")).replace(/^@/, "");
  const profileUser = await getProfileUser(context.env.DB, username);
  if (!profileUser) {
    return context.json({ message: "User not found." }, 404);
  }
  if (profileUser.id === user.id) {
    return context.json({ message: "You cannot block yourself." }, 400);
  }

  const existing = await viewerBlocksUser(context.env.DB, user.id, profileUser.id);
  const wasFollowing = await viewerFollowsCreator(context.env.DB, user.id, profileUser.id);
  const wasFollowedByProfile = await viewerFollowsCreator(context.env.DB, profileUser.id, user.id);
  const blocked = !existing;
  if (existing) {
    await context.env.DB.prepare(
      "DELETE FROM user_blocks WHERE blocker_user_id = ? AND blocked_user_id = ?"
    )
      .bind(user.id, profileUser.id)
      .run();
  } else {
    await context.env.DB.batch([
      context.env.DB.prepare(
        "INSERT OR IGNORE INTO user_blocks (blocker_user_id, blocked_user_id) VALUES (?, ?)"
      ).bind(user.id, profileUser.id),
      context.env.DB.prepare(
        "DELETE FROM follows WHERE follower_creator_id = ? AND followed_creator_id = ?"
      ).bind(user.id, profileUser.id),
      context.env.DB.prepare(
        "DELETE FROM follows WHERE follower_creator_id = ? AND followed_creator_id = ?"
      ).bind(profileUser.id, user.id),
      ...(wasFollowing
        ? [
            context.env.DB.prepare(
              "UPDATE creators SET follower_count = MAX(follower_count - 1, 0) WHERE id = ?"
            ).bind(profileUser.id)
          ]
        : []),
      ...(wasFollowedByProfile
        ? [
            context.env.DB.prepare(
              "UPDATE creators SET follower_count = MAX(follower_count - 1, 0) WHERE id = ?"
            ).bind(user.id)
          ]
        : [])
    ]);
  }

  const updated = await getProfileUser(context.env.DB, profileUser.username);
  return context.json<BlockResponse>({
    blocked,
    following: false,
    followerCount: updated?.follower_count ?? 0,
    message: blocked ? "User blocked." : "User unblocked."
  });
});

app.post("/api/users/:username/report", async (context) => {
  if (!context.env.DB) {
    return context.json({ message: "D1 database is required." }, 503);
  }
  const db = context.env.DB;
  const user = await getCurrentUser(db, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to report profiles." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "reports:user",
    userId: user.id,
    ...rateLimitDefaults.reports
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }
  const parsed = await parseJson(context, protectedReportSchema);
  if (!parsed.success) {
    return context.json({ message: "Report details are invalid." }, 400);
  }
  const turnstile = await verifyTurnstile(context, parsed.data.turnstileToken, "report");
  if (!turnstile.ok) {
    return context.json({ message: turnstile.message }, 403);
  }

  const profileUser = await getProfileUser(context.env.DB, context.req.param("username"));
  if (!profileUser || profileUser.suspended_at) {
    return context.json({ message: "User not found." }, 404);
  }
  if (profileUser.id === user.id) {
    return context.json({ message: "You cannot report yourself." }, 400);
  }
  if (
    !(await canViewCreatorProfile(context.env.DB, profileUser.id, user)) ||
    (await userBlockedPair(context.env.DB, user.id, profileUser.id))
  ) {
    return context.json({ message: "User not found." }, 404);
  }

  const reportId = `rep_${crypto.randomUUID().replaceAll("-", "")}`;
  await context.env.DB.prepare(
    `INSERT INTO moderation_reports
       (id, reporter_user_id, target_type, target_id, reason, details)
     VALUES (?, ?, 'user', ?, ?, ?)`
  )
    .bind(reportId, user.id, profileUser.id, parsed.data.reason, parsed.data.details)
    .run();

  return context.json<ReportResponse>(
    {
      report: {
        id: reportId,
        targetType: "user",
        targetId: profileUser.id,
        targetLabel: `${profileUser.display_name} (@${profileUser.username})`,
        reporter: user.displayName,
        reason: parsed.data.reason,
        details: parsed.data.details,
        status: "open",
        createdAt: new Date().toISOString(),
        resolvedAt: null
      },
      message: "Profile report submitted."
    },
    201
  );
});

app.get("/api/settings/profile", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to edit your profile." }, 401);
  }

  const profileUser = await getProfileUser(context.env.DB, user.username);
  return context.json<ProfileSettingsResponse>({
    user: publicAuthUser(user),
    profile: {
      username: user.username,
      displayName: user.displayName,
      avatarUrl: profileUser?.avatar_url ?? "",
      websiteUrl: profileUser?.website_url ?? "",
      bio: profileUser?.bio ?? ""
    }
  });
});

app.put("/api/settings/profile", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to edit your profile." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "settings:profile",
    userId: user.id,
    ...rateLimitDefaults.profile
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const parsed = await parseJson(context, profileSettingsSchema);
  if (!parsed.success) {
    return context.json({ message: "Profile details are invalid." }, 400);
  }

  try {
    await context.env.DB.prepare(
      `UPDATE users
       SET username = ?, display_name = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
      .bind(parsed.data.username, parsed.data.displayName, user.id)
      .run();
    await ensureCreatorProfile(context.env.DB, user, parsed.data);
    await reindexCreatorSearchIndex(context.env.DB, user.id);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return context.json({ message: "That username is already in use." }, 409);
    }
    throw error;
  }

  const updated = await getProfileUser(context.env.DB, parsed.data.username);
  if (!updated) {
    return context.json({ message: "Profile could not be loaded." }, 500);
  }

  return context.json<ProfileSettingsResponse>({
    user: authUserFromRow(updated),
    profile: {
      username: updated.username,
      displayName: updated.display_name,
      avatarUrl: updated.avatar_url ?? "",
      websiteUrl: updated.website_url ?? "",
      bio: updated.bio ?? ""
    }
  });
});

app.post("/api/settings/profile/avatar", async (context) => {
  if (!context.env.DB || !context.env.ARTWORKS) {
    return context.json(
      { message: "D1 and R2 bindings are required to upload profile pictures." },
      503
    );
  }
  const db = context.env.DB;
  const user = await getCurrentUser(db, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to edit your profile." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "settings:profile-avatar",
    userId: user.id,
    ...rateLimitDefaults.profile
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const body = await context.req.parseBody({ all: true });
  const files = normalizeUploadFiles(body.avatar ?? body.file ?? body.files);
  if (files.length !== 1) {
    return context.json({ message: "Choose exactly one profile picture." }, 400);
  }

  const file = files[0];
  if (file.size > maxAvatarUploadBytes) {
    return context.json({ message: "Profile picture must be 4 MB or smaller." }, 413);
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const metadata = readUploadImageMetadata(bytes);
  if (!metadata) {
    return context.json({ message: "Profile picture must be JPEG, PNG, WebP, or GIF." }, 415);
  }
  if (file.type && allowedUploadTypes.has(file.type) && file.type !== metadata.contentType) {
    return context.json({ message: "Profile picture content does not match its file type." }, 415);
  }
  const extension = allowedUploadTypes.get(metadata.contentType);
  if (!extension) {
    return context.json({ message: "Profile picture must be JPEG, PNG, WebP, or GIF." }, 415);
  }

  const previousProfile = await getProfileUser(db, user.username);
  const previousKey = mediaKeyFromUrl(previousProfile?.avatar_url ?? "");
  const objectKey = `profiles/${user.id}/avatar-${crypto.randomUUID().replaceAll("-", "")}.${extension}`;
  const objectUrl = `/media/${objectKey}`;
  await context.env.ARTWORKS.put(objectKey, bytes, {
    httpMetadata: {
      contentType: metadata.contentType
    },
    customMetadata: {
      userId: user.id,
      width: String(metadata.width),
      height: String(metadata.height)
    }
  });

  await ensureCreatorProfile(db, user, {
    username: user.username,
    displayName: user.displayName,
    avatarUrl: objectUrl,
    websiteUrl: previousProfile?.website_url ?? "",
    bio: previousProfile?.bio ?? ""
  });
  await reindexCreatorSearchIndex(db, user.id);

  if (
    previousKey &&
    previousKey !== objectKey &&
    previousKey.startsWith(`profiles/${user.id}/`)
  ) {
    context.env.ARTWORKS.delete(previousKey).catch((error) => {
      console.warn("Unable to delete replaced profile picture", error);
    });
  }

  const updated = await getProfileUser(db, user.username);
  if (!updated) {
    return context.json({ message: "Profile could not be loaded." }, 500);
  }

  return context.json<ProfileSettingsResponse>({
    user: authUserFromRow(updated),
    profile: {
      username: updated.username,
      displayName: updated.display_name,
      avatarUrl: updated.avatar_url ?? "",
      websiteUrl: updated.website_url ?? "",
      bio: updated.bio ?? ""
    },
    message: "Profile picture uploaded."
  });
});

app.get("/api/settings/privacy-security", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to edit privacy settings." }, 401);
  }

  return context.json<PrivacySecuritySettingsResponse>({
    user: publicAuthUser(user),
    privacy: {
      bookmarkDefaultVisibility: user.bookmarkDefaultVisibility,
      profileVisibility: user.profileVisibility,
      dateOfBirth: user.dateOfBirth,
      matureContentEnabled: user.matureContentEnabled,
      mutedTags: await getMutedTags(context.env.DB, user.id)
    },
    matureAccess: matureAccessFor(context, user)
  });
});

app.put("/api/settings/privacy-security", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to edit privacy settings." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "settings:privacy-security",
    userId: user.id,
    ...rateLimitDefaults.profile
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const parsed = await parseJson(context, privacySecuritySchema);
  if (!parsed.success) {
    return context.json({ message: "Privacy settings are invalid." }, 400);
  }
  if (parsed.data.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(parsed.data.dateOfBirth)) {
    return context.json({ message: "Date of birth is invalid." }, 400);
  }
  const matureContentEnabled =
    parsed.data.matureContentEnabled && isAdultDate(parsed.data.dateOfBirth);
  const mutedTags = (
    await resolveTagAliases(context.env.DB, uniqueTags(parsed.data.mutedTags, 80))
  ).sort((left, right) => left.localeCompare(right));
  const db = context.env.DB;

  await db.batch([
    db.prepare(
      `UPDATE users
       SET bookmark_default_visibility = ?,
           profile_visibility = ?,
           date_of_birth = ?,
           mature_content_enabled = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(
      parsed.data.bookmarkDefaultVisibility,
      parsed.data.profileVisibility,
      parsed.data.dateOfBirth,
      matureContentEnabled ? 1 : 0,
      user.id
    ),
    db.prepare("DELETE FROM user_muted_tags WHERE user_id = ?").bind(user.id),
    ...mutedTags.map((tag) =>
      db.prepare(
        "INSERT OR IGNORE INTO user_muted_tags (user_id, tag) VALUES (?, ?)"
      ).bind(user.id, tag)
    )
  ]);

  const updated = await getCurrentUser(context.env.DB, context.req.raw);
  if (!updated) {
    return context.json({ message: "Settings could not be loaded." }, 500);
  }

  return context.json<PrivacySecuritySettingsResponse>({
    user: publicAuthUser(updated),
    privacy: {
      bookmarkDefaultVisibility: updated.bookmarkDefaultVisibility,
      profileVisibility: updated.profileVisibility,
      dateOfBirth: updated.dateOfBirth,
      matureContentEnabled: updated.matureContentEnabled,
      mutedTags: await getMutedTags(context.env.DB, updated.id)
    },
    matureAccess: matureAccessFor(context, updated)
  });
});

app.get("/api/settings/security", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to manage account security." }, 401);
  }
  return context.json<SecuritySettingsResponse>(await getSecuritySettings(context.env.DB, user.id));
});

app.post("/api/settings/security/totp/start", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to manage account security." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "settings:totp-start",
    userId: user.id,
    ...rateLimitDefaults.auth
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const existing = await context.env.DB.prepare(
    "SELECT user_id, secret_base32, enabled_at FROM user_totp_credentials WHERE user_id = ? AND enabled_at IS NOT NULL LIMIT 1"
  )
    .bind(user.id)
    .first<TotpCredentialRow>();
  if (existing) {
    return context.json({ message: "Disable the existing authenticator before setting up a new one." }, 409);
  }

  const secret = generateTotpSecret();
  await context.env.DB.prepare(
    `INSERT INTO user_totp_credentials (user_id, secret_base32, enabled_at)
     VALUES (?, ?, NULL)
     ON CONFLICT(user_id) DO UPDATE SET
       secret_base32 = excluded.secret_base32,
       enabled_at = NULL,
       updated_at = CURRENT_TIMESTAMP`
  )
    .bind(user.id, secret)
    .run();
  const issuer = context.env.PUBLIC_APP_NAME;
  const label = `${issuer}:${user.email}`;
  const otpauthUrl = `otpauth://totp/${encodeURIComponent(label)}?secret=${encodeURIComponent(
    secret
  )}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
  return context.json<TotpSetupResponse>({
    secret,
    otpauthUrl,
    message: "Authenticator setup started."
  });
});

app.post("/api/settings/security/totp/confirm", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to manage account security." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "settings:totp-confirm",
    userId: user.id,
    ...rateLimitDefaults.auth
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }
  const parsed = await parseJson(context, totpConfirmSchema);
  if (!parsed.success) {
    return context.json({ message: "Authenticator code is invalid." }, 400);
  }

  const credential = await context.env.DB.prepare(
    "SELECT user_id, secret_base32, enabled_at FROM user_totp_credentials WHERE user_id = ? LIMIT 1"
  )
    .bind(user.id)
    .first<TotpCredentialRow>();
  if (!credential || !(await verifyTotpCode(credential.secret_base32, parsed.data.code))) {
    return context.json({ message: "Authenticator code is incorrect." }, 403);
  }
  await context.env.DB.prepare(
    `UPDATE user_totp_credentials
     SET enabled_at = COALESCE(enabled_at, CURRENT_TIMESTAMP),
         updated_at = CURRENT_TIMESTAMP
     WHERE user_id = ?`
  )
    .bind(user.id)
    .run();
  return context.json<SecuritySettingsResponse>({
    ...(await getSecuritySettings(context.env.DB, user.id)),
    message: "Authenticator app enabled."
  });
});

app.delete("/api/settings/security/totp", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to manage account security." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "settings:totp-disable",
    userId: user.id,
    ...rateLimitDefaults.auth
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }
  await context.env.DB.prepare("DELETE FROM user_totp_credentials WHERE user_id = ?")
    .bind(user.id)
    .run();
  return context.json<SecuritySettingsResponse>({
    ...(await getSecuritySettings(context.env.DB, user.id)),
    message: "Authenticator app disabled."
  });
});

app.put("/api/settings/security/email", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to manage account security." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "settings:email-mfa",
    userId: user.id,
    ...rateLimitDefaults.auth
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }
  const parsed = await parseJson(context, emailMfaSettingsSchema);
  if (!parsed.success) {
    return context.json({ message: "Email verification setting is invalid." }, 400);
  }
  if (parsed.data.enabled && !user.emailVerified) {
    return context.json({ message: "Verify your email before enabling email codes." }, 403);
  }
  if (parsed.data.enabled) {
    await context.env.DB.prepare(
      "INSERT OR IGNORE INTO user_email_mfa_settings (user_id) VALUES (?)"
    )
      .bind(user.id)
      .run();
  } else {
    await context.env.DB.prepare("DELETE FROM user_email_mfa_settings WHERE user_id = ?")
      .bind(user.id)
      .run();
  }
  return context.json<SecuritySettingsResponse>({
    ...(await getSecuritySettings(context.env.DB, user.id)),
    message: parsed.data.enabled ? "Email sign-in codes enabled." : "Email sign-in codes disabled."
  });
});

app.post("/api/settings/security/passkeys/options", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to manage passkeys." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "settings:passkey-options",
    userId: user.id,
    ...rateLimitDefaults.auth
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }
  const parsed = await parseJson(context, passkeyRegistrationOptionsSchema);
  if (!parsed.success) {
    return context.json({ message: "Passkey details are invalid." }, 400);
  }
  const challenge = await createWebauthnChallenge(context.env.DB, "registration", user.id);
  const { rpId } = webauthnContext(context);
  const existingPasskeys = await context.env.DB.prepare(
    `SELECT id, user_id, credential_id, name, public_key_cose, sign_count, transports, created_at, last_used_at
     FROM user_passkeys
     WHERE user_id = ?`
  )
    .bind(user.id)
    .all<PasskeyRow>();
  return context.json<PasskeyRegistrationOptionsResponse>({
    publicKey: {
      challenge,
      rp: {
        id: rpId,
        name: context.env.PUBLIC_APP_NAME
      },
      user: {
        id: toBase64Url(textEncoder.encode(user.id)),
        name: user.email,
        displayName: user.displayName
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 }
      ],
      timeout: 300_000,
      attestation: "none",
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred"
      },
      excludeCredentials: existingPasskeys.results.map((passkey) => ({
        type: "public-key",
        id: passkey.credential_id,
        transports: passkey.transports ? passkey.transports.split(",").filter(Boolean) : undefined
      }))
    }
  });
});

app.post("/api/settings/security/passkeys", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to manage passkeys." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "settings:passkey-register",
    userId: user.id,
    ...rateLimitDefaults.auth
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }
  const parsed = await parseJson(context, passkeyRegistrationSchema);
  if (!parsed.success) {
    return context.json({ message: "Passkey response is invalid." }, 400);
  }

  const clientDataPreview = JSON.parse(
    textDecoder.decode(fromBase64Url(parsed.data.response.clientDataJSON))
  ) as { challenge?: unknown };
  if (typeof clientDataPreview.challenge !== "string") {
    return context.json({ message: "Passkey challenge is invalid." }, 400);
  }
  const challengeRow = await getWebauthnChallenge(
    context.env.DB,
    clientDataPreview.challenge,
    "registration",
    user.id
  );
  if (!challengeRow) {
    return context.json({ message: "Passkey challenge is invalid or expired." }, 400);
  }

  try {
    const { origin, rpId } = webauthnContext(context);
    parseWebauthnClientData(
      parsed.data.response.clientDataJSON,
      "webauthn.create",
      clientDataPreview.challenge,
      origin
    );
    const attestationObject = readCbor(fromBase64Url(parsed.data.response.attestationObject));
    if (!(attestationObject instanceof Map)) {
      throw new Error("Passkey attestation is invalid.");
    }
    const authDataBytes = cborBytes(cborMapValue(attestationObject, "authData"), "authData");
    const authenticatorData = await verifyAuthenticatorData(authDataBytes, rpId);
    const credentialData = extractAttestedCredentialData(authenticatorData);
    if (!constantTimeEqual(credentialData.credentialId, fromBase64Url(parsed.data.rawId))) {
      throw new Error("Passkey credential ID did not match.");
    }
    await context.env.DB.batch([
      context.env.DB.prepare(
        `INSERT INTO user_passkeys
          (id, user_id, credential_id, name, public_key_cose, sign_count, transports)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        `pky_${crypto.randomUUID().replaceAll("-", "")}`,
        user.id,
        toBase64Url(credentialData.credentialId),
        parsed.data.name,
        toBase64Url(credentialData.publicKeyCose),
        authenticatorData.signCount,
        parsed.data.transports.join(",")
      ),
      context.env.DB.prepare(
        "UPDATE webauthn_challenges SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?"
      ).bind(challengeRow.id)
    ]);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return context.json({ message: "That passkey is already registered." }, 409);
    }
    console.warn("Passkey registration failed", error);
    return context.json({ message: "Passkey could not be registered." }, 400);
  }

  return context.json<SecuritySettingsResponse>({
    ...(await getSecuritySettings(context.env.DB, user.id)),
    message: "Passkey added."
  });
});

app.delete("/api/settings/security/passkeys/:id", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to manage passkeys." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "settings:passkey-delete",
    userId: user.id,
    ...rateLimitDefaults.auth
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }
  const id = context.req.param("id");
  await context.env.DB.prepare("DELETE FROM user_passkeys WHERE id = ? AND user_id = ?")
    .bind(id, user.id)
    .run();
  return context.json<SecuritySettingsResponse>({
    ...(await getSecuritySettings(context.env.DB, user.id)),
    message: "Passkey removed."
  });
});

app.get("/api/settings/notification-preferences", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to manage notification preferences." }, 401);
  }

  return context.json<NotificationPreferencesResponse>({
    preferences: await getNotificationPreferences(context.env.DB, user.id)
  });
});

app.put("/api/settings/notification-preferences", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to manage notification preferences." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "settings:notification-preferences",
    userId: user.id,
    ...rateLimitDefaults.profile
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const parsed = await parseJson(context, notificationPreferencesSchema);
  if (!parsed.success) {
    return context.json({ message: "Notification preferences are invalid." }, 400);
  }

  await setNotificationPreferences(context.env.DB, user.id, parsed.data);
  return context.json<NotificationPreferencesResponse>({
    preferences: await getNotificationPreferences(context.env.DB, user.id),
    message: "Notification preferences saved."
  });
});

app.get("/api/settings/blocked-users", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to manage blocked users." }, 401);
  }

  return context.json<BlockedUsersResponse>({
    users: await getBlockedUsers(context.env.DB, user.id)
  });
});

app.delete("/api/settings/blocked-users/:username", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to manage blocked users." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "settings:blocked-users",
    userId: user.id,
    ...rateLimitDefaults.profile
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const username = decodeURIComponent(context.req.param("username")).replace(/^@/, "");
  const blockedUser = await getProfileUser(context.env.DB, username);
  if (!blockedUser) {
    return context.json({ message: "Blocked user not found." }, 404);
  }

  await context.env.DB.prepare(
    "DELETE FROM user_blocks WHERE blocker_user_id = ? AND blocked_user_id = ?"
  )
    .bind(user.id, blockedUser.id)
    .run();

  return context.json<UnblockUserResponse>({
    users: await getBlockedUsers(context.env.DB, user.id),
    message: `${blockedUser.display_name} is unblocked.`
  });
});

app.get("/api/settings/export", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to export your account data." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "settings:export",
    userId: user.id,
    ...rateLimitDefaults.profile
  });
  if (rateLimitError) {
    return rateLimitError;
  }

  const db = context.env.DB;
  const matureAccess = matureAccessFor(context, user);
  const profile = await getProfileUser(db, user.username);
  const artworkRows = await db
    .prepare(
      `${artworkSelect}
       WHERE artworks.creator_id = ?
       ORDER BY datetime(artworks.created_at) DESC, artworks.id DESC`
    )
    .bind(user.id)
    .all<ArtworkRow>();
  const artworksWithImages = await withArtworkImages(
    db,
    artworkRows.results.map((row) => artworkFromRow(row))
  );
  const artworksWithFollowing = await withViewerArtworkFollowing(db, user.id, artworksWithImages);
  const artworksWithLikes = await withViewerLikes(db, user.id, artworksWithFollowing);
  const artworks = await withViewerBookmarks(db, user.id, artworksWithLikes);
  const comments = await db
    .prepare(
      `SELECT id, artwork_id, body, parent_id, created_at, updated_at, deleted_at
       FROM comments
       WHERE user_id = ?
       ORDER BY datetime(created_at) DESC`
    )
    .bind(user.id)
    .all<{
      id: string;
      artwork_id: string;
      body: string;
      parent_id: string | null;
      created_at: string;
      updated_at: string | null;
      deleted_at: string | null;
    }>();
  const bookmarks = await db
    .prepare(
      `SELECT artwork_id, visibility, created_at
       FROM user_bookmarks
       WHERE user_id = ?
       ORDER BY datetime(created_at) DESC`
    )
    .bind(user.id)
    .all<{ artwork_id: string; visibility: string; created_at: string }>();
  const following = await db
    .prepare(
      `SELECT
        users.id AS user_id,
        users.username,
        users.display_name,
        follows.created_at AS followed_at
       FROM follows
       JOIN users ON users.id = follows.followed_creator_id
       WHERE follows.follower_creator_id = ?
       ORDER BY datetime(follows.created_at) DESC`
    )
    .bind(user.id)
    .all<{ user_id: string; username: string; display_name: string; followed_at: string }>();
  const followers = await db
    .prepare(
      `SELECT
        users.id AS user_id,
        users.username,
        users.display_name,
        follows.created_at AS followed_at
       FROM follows
       JOIN users ON users.id = follows.follower_creator_id
       WHERE follows.followed_creator_id = ?
       ORDER BY datetime(follows.created_at) DESC`
    )
    .bind(user.id)
    .all<{ user_id: string; username: string; display_name: string; followed_at: string }>();
  const mutedTags = await getMutedTags(db, user.id);

  context.header("cache-control", protectedMediaCacheControl);
  context.header(
    "content-disposition",
    `attachment; filename="${escapeHeader(user.username)}-nehub-export.json"`
  );
  return context.json<AccountExportResponse>({
    exportedAt: new Date().toISOString(),
    user: publicAuthUser(user),
    profile: {
      username: profile?.username ?? user.username,
      displayName: profile?.display_name ?? user.displayName,
      avatarUrl: profile?.avatar_url ?? "",
      websiteUrl: profile?.website_url ?? "",
      bio: profile?.bio ?? "",
      joinedAt: profile?.created_at ?? user.createdAt
    },
    privacy: {
      bookmarkDefaultVisibility: user.bookmarkDefaultVisibility,
      profileVisibility: user.profileVisibility,
      dateOfBirth: user.dateOfBirth,
      matureContentEnabled: user.matureContentEnabled,
      mutedTags
    },
    notificationPreferences: await getNotificationPreferences(db, user.id),
    artworks,
    comments: comments.results.map((comment) => ({
      id: comment.id,
      artworkId: comment.artwork_id,
      body: comment.body,
      parentId: comment.parent_id,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      deletedAt: comment.deleted_at
    })),
    bookmarks: bookmarks.results.map((bookmark) => ({
      artworkId: bookmark.artwork_id,
      visibility: asBookmarkVisibility(bookmark.visibility),
      createdAt: bookmark.created_at
    })),
    following: following.results.map((connection) => ({
      userId: connection.user_id,
      username: connection.username,
      displayName: connection.display_name,
      followedAt: connection.followed_at
    })),
    followers: followers.results.map((connection) => ({
      userId: connection.user_id,
      username: connection.username,
      displayName: connection.display_name,
      followedAt: connection.followed_at
    })),
    blockedUsers: await getBlockedUsers(db, user.id),
    collections: await getUserCollections(db, user.id, user, matureAccess),
    series: await getUserSeries(db, user.id, user, matureAccess)
  });
});

app.post("/api/settings/account/deactivate", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to deactivate your account." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "settings:account-deactivate",
    userId: user.id,
    ...rateLimitDefaults.auth
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }
  const parsed = await parseJson(context, accountDeactivationSchema);
  if (!parsed.success) {
    return context.json({ message: "Account deactivation details are invalid." }, 400);
  }

  const row = await getUserRowById(context.env.DB, user.id);
  if (!row || row.suspended_at) {
    return context.json({ message: "Account not found." }, 404);
  }
  const validPassword = await verifyUserPassword(context.env, row, parsed.data.currentPassword);
  if (!validPassword) {
    return context.json({ message: "Current password is incorrect." }, 403);
  }

  const followedRows = await context.env.DB
    .prepare("SELECT followed_creator_id FROM follows WHERE follower_creator_id = ?")
    .bind(user.id)
    .all<{ followed_creator_id: string }>();
  const db = context.env.DB;
  await db.batch([
    ...followedRows.results.map((follow) =>
      db.prepare(
        "UPDATE creators SET follower_count = MAX(follower_count - 1, 0) WHERE id = ?"
      ).bind(follow.followed_creator_id)
    ),
    db.prepare(
      `UPDATE users
       SET suspended_at = COALESCE(suspended_at, CURRENT_TIMESTAMP),
           suspended_reason = 'Self-deactivated account.',
           profile_visibility = 'private',
           mature_content_enabled = 0,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(user.id),
    db.prepare("UPDATE creators SET follower_count = 0 WHERE id = ?").bind(user.id),
    db.prepare("DELETE FROM follows WHERE follower_creator_id = ? OR followed_creator_id = ?")
      .bind(user.id, user.id),
    db.prepare("DELETE FROM auth_sessions WHERE user_id = ?").bind(user.id)
  ]);
  context.header("Set-Cookie", clearSessionCookie(context), { append: true });
  context.header("Set-Cookie", clearCsrfCookie(context), { append: true });
  await sendSecurityNoticeEmail(context.env, publicAuthUser(user), "Account deactivated", [
    "Your NEHub account was deactivated from Privacy & Security.",
    "Your public profile and works are now hidden, and all sessions were signed out."
  ]);

  return context.json<AccountDeactivationResponse>({
    deactivated: true,
    message: "Account deactivated. Your profile and works are hidden, and all sessions were signed out."
  });
});

app.put("/api/settings/password", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to change your password." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "settings:password",
    userId: user.id,
    ...rateLimitDefaults.auth
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }
  const parsed = await parseJson(context, passwordChangeSchema);
  if (!parsed.success) {
    return context.json({ message: "Password details are invalid." }, 400);
  }
  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return context.json({ message: "Choose a different new password." }, 400);
  }

  const row = await getUserRowById(context.env.DB, user.id);
  if (!row || row.suspended_at) {
    return context.json({ message: "Account not found." }, 404);
  }

  const validPassword = await verifyUserPassword(context.env, row, parsed.data.currentPassword);
  if (!validPassword) {
    return context.json({ message: "Current password is incorrect." }, 403);
  }

  const sessionToken = getCookie(context.req.raw, sessionCookieName);
  const sessionHash = sessionToken ? await sha256(sessionToken) : "";
  const newHash = await hashPassword(parsed.data.newPassword);
  await context.env.DB.batch([
    context.env.DB.prepare(
      `UPDATE users
       SET password_hash = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(newHash, user.id),
    context.env.DB.prepare(
      `DELETE FROM auth_sessions
       WHERE user_id = ?
         AND session_hash <> ?`
    ).bind(user.id, sessionHash)
  ]);

  const csrfToken = sessionToken ? await issueCsrfToken(context, sessionToken) : "";
  return context.json<PasswordChangeResponse>({
    user: publicAuthUser(user),
    csrfToken,
    message: "Password changed. Other sessions were signed out."
  });
});

app.post("/api/settings/email/request", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to change your email." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "settings:email-change",
    userId: user.id,
    ...rateLimitDefaults.resend
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const parsed = await parseJson(context, emailChangeRequestSchema);
  if (!parsed.success) {
    return context.json({ message: "Email change details are invalid." }, 400);
  }
  const newEmail = parsed.data.email.toLowerCase();
  if (newEmail === user.email.toLowerCase()) {
    return context.json({ message: "Enter a different email address." }, 400);
  }

  const row = await getUserRowById(context.env.DB, user.id);
  if (!row || row.suspended_at) {
    return context.json({ message: "Account not found." }, 404);
  }
  if (!(await verifyUserPassword(context.env, row, parsed.data.currentPassword))) {
    return context.json({ message: "Current password is incorrect." }, 403);
  }

  const existing = await getUserRowByEmail(context.env.DB, newEmail);
  if (existing && existing.id !== user.id) {
    return context.json({ message: "That email is already in use." }, 409);
  }

  const token = await createEmailChangeToken(context.env.DB, user.id, newEmail);
  await sendEmailChangeConfirmation(context.env, publicAuthUser(user), newEmail, token);
  await sendSecurityNoticeEmail(context.env, publicAuthUser(user), "Email change requested", [
    `A confirmation link was sent to ${newEmail}.`,
    "",
    "Your account email will not change until that link is opened. If this was not you, change your password."
  ]);

  return context.json<EmailChangeRequestResponse>({
    pendingEmail: newEmail,
    message: "Confirmation email sent to the new address."
  });
});

app.get("/api/settings/email/confirm", async (context) => {
  const wantsJson = wantsJsonResponse(context);
  if (!context.env.DB) {
    if (wantsJson) {
      return emailConfirmationJson(
        context,
        "change",
        "unavailable",
        "D1 database is required for accounts."
      );
    }
    return emailConfirmationRedirect(context, "change", "unavailable");
  }

  const emailChangeInvalid = () =>
    wantsJson
      ? emailConfirmationJson(
          context,
          "change",
          "invalid",
          "Email change link is invalid or expired."
        )
      : emailConfirmationRedirect(context, "change", "invalid");

  const token = context.req.query("token");
  if (!token) {
    return emailChangeInvalid();
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "settings:email-confirm",
    limit: 30,
    windowSeconds: 15 * minuteSeconds
  });
  if (rateLimitError) {
    return wantsJson ? rateLimitError : emailConfirmationRedirect(context, "change", "unavailable");
  }

  const tokenHash = await sha256(token);
  const row = await context.env.DB.prepare(
    `SELECT
      email_change_tokens.id AS token_id,
      email_change_tokens.new_email,
      users.id,
      users.email,
      users.username,
      users.display_name,
      users.password_hash,
      users.role,
      users.email_verified_at,
      users.date_of_birth,
      users.mature_content_enabled,
      users.bookmark_default_visibility,
      users.profile_visibility,
      users.suspended_at,
      users.suspended_reason,
      users.created_at,
      users.updated_at
     FROM email_change_tokens
     JOIN users ON users.id = email_change_tokens.user_id
     WHERE email_change_tokens.token_hash = ?
       AND email_change_tokens.consumed_at IS NULL
       AND datetime(email_change_tokens.expires_at) > datetime('now')
     LIMIT 1`
  )
    .bind(tokenHash)
    .first<UserRow & { token_id: string; new_email: string }>();

  if (!row || row.suspended_at) {
    return emailChangeInvalid();
  }

  const existing = await getUserRowByEmail(context.env.DB, row.new_email);
  if (existing && existing.id !== row.id) {
    return emailChangeInvalid();
  }

  const activeSessionHash = await currentSessionHash(context);
  await context.env.DB.batch([
    context.env.DB.prepare(
      "UPDATE email_change_tokens SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(row.token_id),
    context.env.DB.prepare(
      `UPDATE email_change_tokens
       SET consumed_at = CURRENT_TIMESTAMP
       WHERE user_id = ?
         AND consumed_at IS NULL`
    ).bind(row.id),
    context.env.DB.prepare(
      `UPDATE users
       SET email = ?,
           email_verified_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(row.new_email, row.id),
    activeSessionHash
      ? context.env.DB.prepare(
          "DELETE FROM auth_sessions WHERE user_id = ? AND session_hash <> ?"
        ).bind(row.id, activeSessionHash)
      : context.env.DB.prepare("DELETE FROM auth_sessions WHERE user_id = ?").bind(row.id)
  ]);

  await sendSecurityNoticeEmail(context.env, authUserFromRow(row), "Email changed", [
    `Your account email was changed to ${row.new_email}.`,
    "",
    "Other active sessions were signed out."
  ]);
  await sendSecurityNoticeEmail(
    context.env,
    { ...authUserFromRow(row), email: row.new_email },
    "Email changed",
    [
      "This address is now the verified email for your account.",
      "",
      "If this was not you, reset your password immediately."
    ]
  );

  if (wantsJson) {
    return emailConfirmationJson(
      context,
      "change",
      "confirmed",
      "Email change confirmed. Your sign-in email was updated successfully."
    );
  }
  return emailConfirmationRedirect(context, "change", "confirmed");
});

app.get("/api/settings/sessions", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to view active sessions." }, 401);
  }

  return context.json<AuthSessionsResponse>({
    sessions: await getAccountSessions(
      context.env.DB,
      user.id,
      await currentSessionHash(context)
    )
  });
});

app.post("/api/settings/sessions/revoke-others", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to manage active sessions." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "settings:sessions-revoke",
    userId: user.id,
    ...rateLimitDefaults.auth
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const sessionToken = getCookie(context.req.raw, sessionCookieName);
  const activeSessionHash = sessionToken ? await sha256(sessionToken) : "";
  await context.env.DB.prepare(
    `DELETE FROM auth_sessions
     WHERE user_id = ?
       AND session_hash <> ?`
  )
    .bind(user.id, activeSessionHash)
    .run();

  return context.json<RevokeSessionsResponse>({
    sessions: await getAccountSessions(context.env.DB, user.id, activeSessionHash),
    csrfToken: sessionToken ? await issueCsrfToken(context, sessionToken) : "",
    message: "Other sessions were signed out."
  });
});

app.delete("/api/settings/sessions/:id", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to manage active sessions." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "settings:session-revoke",
    userId: user.id,
    ...rateLimitDefaults.auth
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const id = context.req.param("id");
  if (!/^ses_[a-z0-9]+$/i.test(id)) {
    return context.json({ message: "Session not found." }, 404);
  }
  const sessionToken = getCookie(context.req.raw, sessionCookieName);
  const activeSessionHash = sessionToken ? await sha256(sessionToken) : "";
  const target = await context.env.DB.prepare(
    `SELECT session_hash
     FROM auth_sessions
     WHERE id = ?
       AND user_id = ?
     LIMIT 1`
  )
    .bind(id, user.id)
    .first<{ session_hash: string }>();
  if (!target) {
    return context.json({ message: "Session not found." }, 404);
  }
  if (target.session_hash === activeSessionHash) {
    return context.json({ message: "Use sign out to end the current session." }, 400);
  }

  await context.env.DB.prepare(
    `DELETE FROM auth_sessions
     WHERE id = ?
       AND user_id = ?`
  )
    .bind(id, user.id)
    .run();

  return context.json<RevokeSessionsResponse>({
    sessions: await getAccountSessions(context.env.DB, user.id, activeSessionHash),
    csrfToken: sessionToken ? await issueCsrfToken(context, sessionToken) : "",
    message: "Session revoked."
  });
});

app.get("/api/health", (context) =>
  context.json({
    ok: true,
    app: context.env.PUBLIC_APP_NAME,
    storage: {
      d1: Boolean(context.env.DB),
      r2: Boolean(context.env.ARTWORKS)
    }
  })
);

app.get("/api/gallery", async (context) => {
  const sort = asSortMode(context.req.query("sort") ?? null);
  const search = context.req.query("q") ?? "";
  const tag = context.req.query("tag") ?? "";
  const rating = asMatureFilter(context.req.query("rating") ?? null);
  const limit = Math.min(
    60,
    Math.max(12, Number.parseInt(context.req.query("limit") ?? "36", 10) || 36)
  );
  const rawCursor = context.req.query("cursor") ?? "";
  const viewer = await getCurrentUser(context.env.DB, context.req.raw);
  const matureAccess = matureAccessFor(context, viewer);
  const galleryCursor = decodeGalleryCursor(rawCursor);
  const canonicalTag =
    tag && context.env.DB ? await canonicalizeSingleTag(context.env.DB, tag) : tag;

  if (
    context.env.DB &&
    isKeysetGallerySort(sort) &&
    galleryCursor !== "legacy"
  ) {
    if (galleryCursor === null || !galleryCursorIsValidForSort(sort, galleryCursor)) {
      return context.json({ message: "Gallery cursor is invalid." }, 400);
    }
    const galleryPage = await getSortedGalleryPage(
      context.env.DB,
      sort,
      viewer,
      matureAccess,
      rating,
      search,
      canonicalTag,
      limit,
      galleryCursor
    );
    return context.json<GalleryResponse>({
      ...galleryPage,
      matureAccess
    });
  }

  const offset = Math.max(0, Number.parseInt(rawCursor || "0", 10) || 0);
  const d1Gallery = await maybeGetD1Gallery(context.env.DB, viewer);
  let allArtworks = filterMatureArtworks(d1Gallery?.artworks ?? [], matureAccess);
  const creators = d1Gallery?.creators ?? [];
  const subscribedTags =
    sort === "subscriptions" && context.env.DB
      ? await getSubscribedTags(context.env.DB, viewer?.id)
      : new Set<string>();
  const [searchIds, tagIds] = context.env.DB
    ? await Promise.all([
        searchArtworkIds(context.env.DB, search),
        artworkIdsForTag(context.env.DB, canonicalTag)
      ])
    : [undefined, undefined];
  if (searchIds) {
    allArtworks = allArtworks.filter((artwork) => searchIds.has(artwork.id));
  }
  if (tagIds) {
    allArtworks = allArtworks.filter((artwork) => tagIds.has(artwork.id));
  }
  const filteredArtworks = filterAndSort(
    allArtworks,
    searchIds ? "" : search,
    tagIds ? "" : canonicalTag,
    rating,
    sort,
    subscribedTags
  );
  const artworks = filteredArtworks.slice(offset, offset + limit);
  const nextOffset = offset + artworks.length;

  return context.json<GalleryResponse>({
    artworks,
    creators,
    tags: tagCounts(allArtworks),
    nextCursor: nextOffset < filteredArtworks.length ? String(nextOffset) : null,
    totalCount: filteredArtworks.length,
    source: d1Gallery ? "d1" : "empty",
    matureAccess
  });
});

app.get("/api/rankings", async (context) => {
  if (!context.env.DB) {
    return context.json<RankingResponse>({
      period: asRankingPeriod(context.req.query("period")),
      rankings: [],
      matureAccess: matureAccessFor(context, undefined)
    });
  }

  const period = asRankingPeriod(context.req.query("period"));
  const limit = Math.min(
    50,
    Math.max(5, Number.parseInt(context.req.query("limit") ?? "10", 10) || 10)
  );
  const viewer = await getCurrentUser(context.env.DB, context.req.raw);
  const matureAccess = matureAccessFor(context, viewer);
  const d1Gallery = await maybeGetD1Gallery(context.env.DB, viewer);
  const artworks = filterMatureArtworks(d1Gallery?.artworks ?? [], matureAccess);

  return context.json<RankingResponse>({
    period,
    rankings: await getRankingItems(context.env.DB, artworks, period, limit),
    matureAccess
  });
});

app.get("/api/artworks/:id", async (context) => {
  const id = context.req.param("id");

  if (context.env.DB) {
    try {
      const viewer = await getCurrentUser(context.env.DB, context.req.raw);
      const matureAccess = matureAccessFor(context, viewer);
      const d1Artwork = await getArtworkFromD1(context.env.DB, id, viewer, matureAccess);
      if (d1Artwork) {
        if (
          viewer &&
          (await userBlockedPair(context.env.DB, viewer.id, d1Artwork.artwork.creator.id))
        ) {
          return context.json({ message: "Artwork not found" }, 404);
        }
        if (artworkIsMature(d1Artwork.artwork) && !matureAccess.allowed) {
          return context.json({ message: "Artwork not found" }, 404);
        }
        const viewRecorded = await recordArtworkView(context, d1Artwork.artwork.id, viewer);
        const artwork = viewRecorded
          ? {
              ...d1Artwork.artwork,
              viewCount: d1Artwork.artwork.viewCount + 1
            }
          : d1Artwork.artwork;
        return context.json<ArtworkResponse>({ ...d1Artwork, artwork, source: "d1" });
      }
    } catch (error) {
      console.warn("Unable to read artwork from D1", error);
    }
  }

  return context.json({ message: "Artwork not found" }, 404);
});

app.post("/api/artworks/:id/report", async (context) => {
  const id = context.req.param("id");

  if (!context.env.DB) {
    return context.json({ message: "D1 database is required." }, 503);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to report artwork." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "reports:artwork",
    userId: user.id,
    ...rateLimitDefaults.reports
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }
  const parsed = await parseJson(context, protectedReportSchema);
  if (!parsed.success) {
    return context.json({ message: "Report details are invalid." }, 400);
  }
  const turnstile = await verifyTurnstile(context, parsed.data.turnstileToken, "report");
  if (!turnstile.ok) {
    return context.json({ message: turnstile.message }, 403);
  }

  const artwork = await context.env.DB.prepare(
    `SELECT id, creator_id, title, mature, mature_rating, visibility
     FROM artworks
     WHERE id = ?
       AND hidden_at IS NULL
     LIMIT 1`
  )
    .bind(id)
    .first<{
      id: string;
      creator_id: string;
      title: string;
      mature: number;
      mature_rating: string | null;
      visibility: string | null;
    }>();
  if (!artwork) {
    return context.json({ message: "Artwork not found" }, 404);
  }
  if (
    !canViewDirectArtworkVisibility(
      asArtworkVisibility(artwork.visibility),
      artwork.creator_id,
      user
    )
  ) {
    return context.json({ message: "Artwork not found" }, 404);
  }
  if (!(await canViewCreatorProfile(context.env.DB, artwork.creator_id, user))) {
    return context.json({ message: "Artwork not found" }, 404);
  }
  if (artwork.creator_id === user.id) {
    return context.json({ message: "You cannot report your own artwork." }, 400);
  }
  if (await userBlockedPair(context.env.DB, user.id, artwork.creator_id)) {
    return context.json({ message: "Artwork not found" }, 404);
  }
  if (
    (Boolean(artwork.mature) || asMatureRating(artwork.mature_rating) !== "general") &&
    !matureAccessFor(context, user).allowed
  ) {
    return context.json({ message: "Artwork not found" }, 404);
  }

  const reportId = `rpt_${crypto.randomUUID().replaceAll("-", "")}`;
  await context.env.DB.prepare(
    `INSERT INTO moderation_reports
      (id, reporter_user_id, target_type, target_id, reason, details)
     VALUES (?, ?, 'artwork', ?, ?, ?)`
  )
    .bind(reportId, user.id, artwork.id, parsed.data.reason, parsed.data.details)
    .run();

  return context.json<ReportResponse>(
    {
      report: {
        id: reportId,
        targetType: "artwork",
        targetId: artwork.id,
        targetLabel: artwork.title,
        reporter: user.displayName,
        reason: parsed.data.reason,
        details: parsed.data.details,
        status: "open",
        createdAt: new Date().toISOString(),
        resolvedAt: null
      },
      message: "Report submitted."
    },
    201
  );
});

app.put("/api/artworks/:id", async (context) => {
  const id = context.req.param("id");

  if (!context.env.DB) {
    return context.json({ message: "D1 database is required." }, 503);
  }
  const db = context.env.DB;
  const user = await getCurrentUser(db, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to edit artwork." }, 401);
  }
  if (!user.emailVerified && user.role !== "admin") {
    return context.json({ message: "Verify your email before editing artwork." }, 403);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "artworks:update",
    userId: user.id,
    ...rateLimitDefaults.social
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const parsed = await parseJson(context, artworkUpdateSchema);
  if (!parsed.success) {
    return context.json({ message: "Artwork details are invalid." }, 400);
  }

  const artwork = await context.env.DB.prepare(
    `SELECT id, creator_id
     FROM artworks
     WHERE id = ?
       AND hidden_at IS NULL
     LIMIT 1`
  )
    .bind(id)
    .first<{ id: string; creator_id: string }>();
  if (!artwork) {
    return context.json({ message: "Artwork not found" }, 404);
  }
  if (artwork.creator_id !== user.id && user.role !== "admin") {
    return context.json({ message: "You can only edit your own artwork." }, 403);
  }
  if (parsed.data.matureRating !== "general" && !matureAccessFor(context, user).allowed) {
    return context.json({ message: "Verify your age before marking artwork mature." }, 403);
  }

  const tags = await canonicalizeArtworkTags(context.env.DB, parseTagInput(parsed.data.tags));
  const publicArtworkReviewEnabled = await getPublicArtworkReviewEnabled(context.env.DB);
  const reviewStatus = artworkReviewStatusForUpload(
    parsed.data.visibility,
    user,
    publicArtworkReviewEnabled
  );
  await context.env.DB.batch([
    context.env.DB.prepare(
      `UPDATE artworks
       SET title = ?,
           caption = ?,
           tags_json = ?,
           mature = ?,
           mature_rating = ?,
           visibility = ?,
           review_status = ?,
           reviewed_by_user_id = CASE WHEN ? = 'pending' THEN NULL ELSE reviewed_by_user_id END,
           reviewed_at = CASE WHEN ? = 'pending' THEN NULL ELSE reviewed_at END
       WHERE id = ?`
    )
      .bind(
        parsed.data.title,
        parsed.data.caption,
        JSON.stringify(tags),
        parsed.data.matureRating === "general" ? 0 : 1,
        parsed.data.matureRating,
        parsed.data.visibility,
        reviewStatus,
        reviewStatus,
        reviewStatus,
        id
      ),
    context.env.DB.prepare("DELETE FROM artwork_tags WHERE artwork_id = ?").bind(id),
    ...artworkTagInsertStatements(context.env.DB, id, tags),
    parsed.data.visibility === "public" && reviewStatus === "approved"
      ? context.env.DB.prepare(
          `INSERT INTO activity_events (id, actor_user_id, type, artwork_id, message, created_at)
           SELECT ?, ?, 'publish', ?, ?, CURRENT_TIMESTAMP
           WHERE NOT EXISTS (
             SELECT 1
             FROM activity_events
             WHERE artwork_id = ?
               AND type = 'publish'
           )`
        ).bind(
          `act_${crypto.randomUUID().replaceAll("-", "")}`,
          artwork.creator_id,
          id,
          `${user.displayName} published "${parsed.data.title}".`,
          id
        )
      : context.env.DB.prepare(
          "DELETE FROM activity_events WHERE artwork_id = ? AND type = 'publish'"
        ).bind(id)
  ]);
  await upsertArtworkSearchIndex(context.env.DB, id);

  const updated = await getArtworkFromD1(context.env.DB, id, user);
  if (!updated) {
    return context.json({ message: "Artwork not found" }, 404);
  }

  return context.json<UpdateArtworkResponse>({
    artwork: updated.artwork,
    message: reviewStatus === "pending" ? "Artwork submitted for review." : "Artwork updated."
  });
});

app.post("/api/artworks/:id/images", async (context) => {
  const id = context.req.param("id");

  if (!context.env.DB || !context.env.ARTWORKS) {
    return context.json(
      { message: "D1 and R2 bindings are required to add artwork images." },
      503
    );
  }
  const db = context.env.DB;
  const user = await getCurrentUser(db, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to edit artwork." }, 401);
  }
  if (!user.emailVerified && user.role !== "admin") {
    return context.json({ message: "Verify your email before editing artwork." }, 403);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "artworks:upload",
    userId: user.id,
    ...rateLimitDefaults.uploads
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const artwork = await db.prepare(
    `SELECT id, creator_id, title
     FROM artworks
     WHERE id = ?
       AND hidden_at IS NULL
     LIMIT 1`
  )
    .bind(id)
    .first<{ id: string; creator_id: string; title: string }>();
  if (!artwork) {
    return context.json({ message: "Artwork not found" }, 404);
  }
  if (artwork.creator_id !== user.id && user.role !== "admin") {
    return context.json({ message: "You can only edit your own artwork." }, 403);
  }

  const existingRows = await db.prepare(
    `SELECT
       id,
       artwork_id,
       image_url,
       thumbnail_url,
       width,
       height,
       dominant_color,
       position,
       created_at
     FROM artwork_images
     WHERE artwork_id = ?
     ORDER BY position`
  )
    .bind(id)
    .all<ArtworkImageRow>();
  const existingImages = existingRows.results;
  if (existingImages.length >= maxUploadFiles) {
    return context.json({ message: `Artwork already has ${maxUploadFiles} images.` }, 400);
  }

  const body = await context.req.parseBody({ all: true });
  const files = normalizeUploadFiles(body.files ?? body.file);
  const remainingSlots = maxUploadFiles - existingImages.length;
  if (files.length === 0) {
    return context.json({ message: "At least one artwork image is required." }, 400);
  }
  if (files.length > remainingSlots) {
    return context.json({ message: `Add ${remainingSlots} image${remainingSlots === 1 ? "" : "s"} or fewer.` }, 400);
  }
  const storage = await getUserStorage(db, artwork.creator_id);
  if (!storage) {
    return context.json({ message: "Artwork owner could not be loaded." }, 404);
  }
  const storageLimitMessage = uploadStorageLimitMessage(storage, files.length);
  if (storageLimitMessage) {
    return context.json({ message: storageLimitMessage }, 400);
  }

  const preparedImages: PreparedUploadImage[] = [];
  for (const [index, file] of files.entries()) {
    if (file.size > maxUploadBytes) {
      return context.json({ message: "Each artwork image must be 10 MB or smaller." }, 413);
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const metadata = readUploadImageMetadata(bytes);
    if (!metadata) {
      return context.json({ message: "Artwork images must be JPEG, PNG, WebP, or GIF." }, 415);
    }
    if (file.type && allowedUploadTypes.has(file.type) && file.type !== metadata.contentType) {
      return context.json({ message: "Artwork image content does not match its file type." }, 415);
    }
    const extension = allowedUploadTypes.get(metadata.contentType);
    if (!extension) {
      return context.json({ message: "Artwork images must be JPEG, PNG, WebP, or GIF." }, 415);
    }
    preparedImages.push({
      ...metadata,
      bytes,
      extension,
      position: existingImages.length + index
    });
  }

  const now = new Date().toISOString();
  const newImages: ArtworkImage[] = [];
  for (const image of preparedImages) {
    const imageId = `img_${crypto.randomUUID().replaceAll("-", "")}`;
    const objectKey = `artworks/${id}/${imageId}.${image.extension}`;
    const objectUrl = artworkMediaUrl(objectKey, context.env);
    await context.env.ARTWORKS.put(objectKey, image.bytes, {
      httpMetadata: {
        contentType: image.contentType
      },
      customMetadata: {
        artworkId: id,
        imageId,
        title: artwork.title,
        width: String(image.width),
        height: String(image.height)
      }
    });
    newImages.push({
      id: imageId,
      imageUrl: objectUrl,
      thumbnailUrl: mediaThumbnailUrl(objectUrl),
      width: image.width,
      height: image.height,
      dominantColor: image.dominantColor,
      position: image.position
    });
  }

  const insertStatements = newImages.map((image) =>
    db.prepare(
      `INSERT INTO artwork_images (
        id,
        artwork_id,
        image_url,
        thumbnail_url,
        width,
        height,
        dominant_color,
        position,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      image.id,
      id,
      image.imageUrl,
      image.thumbnailUrl,
      image.width,
      image.height,
      image.dominantColor,
      image.position,
      now
    )
  );
  if (existingImages.length === 0) {
    const firstImage = newImages[0];
    if (!firstImage) {
      return context.json({ message: "Artwork image could not be stored." }, 500);
    }
    insertStatements.push(
      db.prepare(
        `UPDATE artworks
         SET image_url = ?,
             thumbnail_url = ?,
             width = ?,
             height = ?,
             dominant_color = ?
         WHERE id = ?`
      ).bind(
        firstImage.imageUrl,
        firstImage.thumbnailUrl,
        firstImage.width,
        firstImage.height,
        firstImage.dominantColor,
        id
      )
    );
  }

  await db.batch(insertStatements);

  const updated = await getArtworkFromD1(db, id, user);
  if (!updated) {
    return context.json({ message: "Artwork not found" }, 404);
  }

  const responseUserRow = await getUserRowById(db, user.id);
  const responseUser = responseUserRow ? currentUserFromRow(responseUserRow) : user;
  return context.json<AddArtworkImagesResponse>({
    artwork: updated.artwork,
    user: publicAuthUser(responseUser),
    message: `${newImages.length} image${newImages.length === 1 ? "" : "s"} added.`
  });
});

app.put("/api/artworks/:id/images/order", async (context) => {
  const id = context.req.param("id");

  if (!context.env.DB) {
    return context.json({ message: "D1 database is required." }, 503);
  }
  const db = context.env.DB;
  const user = await getCurrentUser(db, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to edit artwork." }, 401);
  }
  if (!user.emailVerified && user.role !== "admin") {
    return context.json({ message: "Verify your email before editing artwork." }, 403);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "artworks:update",
    userId: user.id,
    ...rateLimitDefaults.social
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const parsed = await parseJson(context, artworkImageOrderSchema);
  if (!parsed.success) {
    return context.json({ message: "Image order is invalid." }, 400);
  }
  if (new Set(parsed.data.imageIds).size !== parsed.data.imageIds.length) {
    return context.json({ message: "Image order cannot contain duplicates." }, 400);
  }

  const artwork = await db.prepare(
    `SELECT id, creator_id
     FROM artworks
     WHERE id = ?
       AND hidden_at IS NULL
     LIMIT 1`
  )
    .bind(id)
    .first<{ id: string; creator_id: string }>();
  if (!artwork) {
    return context.json({ message: "Artwork not found" }, 404);
  }
  if (artwork.creator_id !== user.id && user.role !== "admin") {
    return context.json({ message: "You can only edit your own artwork." }, 403);
  }

  const imageRows = await db.prepare(
    `SELECT
       id,
       artwork_id,
       image_url,
       thumbnail_url,
       width,
       height,
       dominant_color,
       position,
       created_at
     FROM artwork_images
     WHERE artwork_id = ?
     ORDER BY position`
  )
    .bind(id)
    .all<ArtworkImageRow>();
  const images = imageRows.results;
  if (images.length < 2) {
    return context.json({ message: "Artwork needs multiple images to reorder." }, 400);
  }
  if (images.length !== parsed.data.imageIds.length) {
    return context.json({ message: "Include every artwork image exactly once." }, 400);
  }

  const imagesById = new Map(images.map((image) => [image.id, image]));
  if (!parsed.data.imageIds.every((imageId) => imagesById.has(imageId))) {
    return context.json({ message: "Image order contains an image that is not in this artwork." }, 400);
  }

  const currentOrder = images.map((image) => image.id);
  const unchanged = currentOrder.every(
    (imageId, index) => parsed.data.imageIds[index] === imageId
  );
  const cover = imagesById.get(parsed.data.imageIds[0]);
  if (!cover) {
    return context.json({ message: "Cover image could not be resolved." }, 400);
  }

  if (!unchanged) {
    await db.batch([
      ...parsed.data.imageIds.map((imageId, position) =>
        db.prepare(
          "UPDATE artwork_images SET position = ? WHERE artwork_id = ? AND id = ?"
        ).bind(position, id, imageId)
      ),
      db.prepare(
        `UPDATE artworks
         SET image_url = ?,
             thumbnail_url = ?,
             width = ?,
             height = ?,
             dominant_color = ?
         WHERE id = ?`
      ).bind(
        cover.image_url,
        mediaThumbnailUrl(cover.image_url || cover.thumbnail_url),
        cover.width,
        cover.height,
        cover.dominant_color,
        id
      )
    ]);
  }

  const updated = await getArtworkFromD1(db, id, user);
  if (!updated) {
    return context.json({ message: "Artwork not found" }, 404);
  }

  return context.json<ReorderArtworkImagesResponse>({
    artwork: updated.artwork,
    message: unchanged ? "Image order unchanged." : "Image order updated."
  });
});

app.put("/api/artworks/:id/images/:imageId", async (context) => {
  const id = context.req.param("id");
  const imageId = context.req.param("imageId");

  if (!context.env.DB || !context.env.ARTWORKS) {
    return context.json(
      { message: "D1 and R2 bindings are required to replace artwork images." },
      503
    );
  }
  const db = context.env.DB;
  const user = await getCurrentUser(db, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to edit artwork." }, 401);
  }
  if (!user.emailVerified && user.role !== "admin") {
    return context.json({ message: "Verify your email before editing artwork." }, 403);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "artworks:upload",
    userId: user.id,
    ...rateLimitDefaults.uploads
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const artwork = await db.prepare(
    `SELECT id, creator_id, title
     FROM artworks
     WHERE id = ?
       AND hidden_at IS NULL
     LIMIT 1`
  )
    .bind(id)
    .first<{ id: string; creator_id: string; title: string }>();
  if (!artwork) {
    return context.json({ message: "Artwork not found" }, 404);
  }
  if (artwork.creator_id !== user.id && user.role !== "admin") {
    return context.json({ message: "You can only edit your own artwork." }, 403);
  }

  const image = await db.prepare(
    `SELECT
       id,
       artwork_id,
       image_url,
       thumbnail_url,
       width,
       height,
       dominant_color,
       position,
       created_at
     FROM artwork_images
     WHERE artwork_id = ?
       AND id = ?
     LIMIT 1`
  )
    .bind(id, imageId)
    .first<ArtworkImageRow>();
  if (!image) {
    return context.json({ message: "Artwork image not found." }, 404);
  }

  const body = await context.req.parseBody({ all: true });
  const files = normalizeUploadFiles(body.files ?? body.file);
  if (files.length !== 1) {
    return context.json({ message: "Choose exactly one replacement image." }, 400);
  }

  const file = files[0];
  if (file.size > maxUploadBytes) {
    return context.json({ message: "Artwork image must be 10 MB or smaller." }, 413);
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const metadata = readUploadImageMetadata(bytes);
  if (!metadata) {
    return context.json({ message: "Artwork images must be JPEG, PNG, WebP, or GIF." }, 415);
  }
  if (file.type && allowedUploadTypes.has(file.type) && file.type !== metadata.contentType) {
    return context.json({ message: "Artwork image content does not match its file type." }, 415);
  }
  const extension = allowedUploadTypes.get(metadata.contentType);
  if (!extension) {
    return context.json({ message: "Artwork images must be JPEG, PNG, WebP, or GIF." }, 415);
  }

  const objectKey = `artworks/${id}/${imageId}-${crypto.randomUUID().replaceAll("-", "")}.${extension}`;
  const objectUrl = artworkMediaUrl(objectKey, context.env);
  await context.env.ARTWORKS.put(objectKey, bytes, {
    httpMetadata: {
      contentType: metadata.contentType
    },
    customMetadata: {
      artworkId: id,
      imageId,
      title: artwork.title,
      width: String(metadata.width),
      height: String(metadata.height)
    }
  });

  const updateStatements = [
    db.prepare(
      `UPDATE artwork_images
       SET image_url = ?,
           thumbnail_url = ?,
           width = ?,
           height = ?,
           dominant_color = ?
       WHERE artwork_id = ?
         AND id = ?`
    ).bind(
      objectUrl,
      mediaThumbnailUrl(objectUrl),
      metadata.width,
      metadata.height,
      metadata.dominantColor,
      id,
      imageId
    )
  ];
  if (image.position === 0) {
    updateStatements.push(
      db.prepare(
        `UPDATE artworks
         SET image_url = ?,
             thumbnail_url = ?,
             width = ?,
             height = ?,
             dominant_color = ?
         WHERE id = ?`
      ).bind(
        objectUrl,
        mediaThumbnailUrl(objectUrl),
        metadata.width,
        metadata.height,
        metadata.dominantColor,
        id
      )
    );
  }

  await db.batch(updateStatements);

  const mediaKeys = new Set(
    [image.image_url, image.thumbnail_url].map(mediaKeyFromUrl).filter(Boolean)
  );
  await Promise.all(
    Array.from(mediaKeys).map((key) =>
      context.env.ARTWORKS?.delete(key).catch((error) => {
        console.warn("Unable to delete replaced artwork image object", key, error);
      })
    )
  );

  const updated = await getArtworkFromD1(db, id, user);
  if (!updated) {
    return context.json({ message: "Artwork not found" }, 404);
  }

  return context.json<ReplaceArtworkImageResponse>({
    artwork: updated.artwork,
    imageId,
    message: "Image replaced."
  });
});

app.delete("/api/artworks/:id/images/:imageId", async (context) => {
  const id = context.req.param("id");
  const imageId = context.req.param("imageId");

  if (!context.env.DB) {
    return context.json({ message: "D1 database is required." }, 503);
  }
  const db = context.env.DB;
  const user = await getCurrentUser(db, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to edit artwork." }, 401);
  }
  if (!user.emailVerified && user.role !== "admin") {
    return context.json({ message: "Verify your email before editing artwork." }, 403);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "artworks:update",
    userId: user.id,
    ...rateLimitDefaults.social
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const artwork = await db.prepare(
    `SELECT id, creator_id
     FROM artworks
     WHERE id = ?
       AND hidden_at IS NULL
     LIMIT 1`
  )
    .bind(id)
    .first<{ id: string; creator_id: string }>();
  if (!artwork) {
    return context.json({ message: "Artwork not found" }, 404);
  }
  if (artwork.creator_id !== user.id && user.role !== "admin") {
    return context.json({ message: "You can only edit your own artwork." }, 403);
  }

  const imageRows = await db.prepare(
    `SELECT
       id,
       artwork_id,
       image_url,
       thumbnail_url,
       width,
       height,
       dominant_color,
       position,
       created_at
     FROM artwork_images
     WHERE artwork_id = ?
     ORDER BY position`
  )
    .bind(id)
    .all<ArtworkImageRow>();
  const images = imageRows.results;
  if (images.length < 2) {
    return context.json({ message: "Artwork must keep at least one image." }, 400);
  }

  const image = images.find((item) => item.id === imageId);
  if (!image) {
    return context.json({ message: "Artwork image not found." }, 404);
  }
  const remainingImages = images.filter((item) => item.id !== imageId);
  const cover = remainingImages[0];
  if (!cover) {
    return context.json({ message: "Artwork must keep at least one image." }, 400);
  }

  const mediaKeys = new Set(
    [image.image_url, image.thumbnail_url].map(mediaKeyFromUrl).filter(Boolean)
  );
  if (context.env.ARTWORKS) {
    await Promise.all(
      Array.from(mediaKeys).map((key) =>
        context.env.ARTWORKS?.delete(key).catch((error) => {
          console.warn("Unable to delete artwork image object", key, error);
        })
      )
    );
  }

  await db.batch([
    db.prepare("DELETE FROM artwork_images WHERE artwork_id = ? AND id = ?").bind(id, imageId),
    ...remainingImages.map((remainingImage, position) =>
      db.prepare("UPDATE artwork_images SET position = ? WHERE artwork_id = ? AND id = ?").bind(
        position,
        id,
        remainingImage.id
      )
    ),
    db.prepare(
      `UPDATE artworks
       SET image_url = ?,
           thumbnail_url = ?,
           width = ?,
           height = ?,
           dominant_color = ?
       WHERE id = ?`
    ).bind(
      cover.image_url,
      mediaThumbnailUrl(cover.image_url || cover.thumbnail_url),
      cover.width,
      cover.height,
      cover.dominant_color,
      id
    )
  ]);

  const updated = await getArtworkFromD1(db, id, user);
  if (!updated) {
    return context.json({ message: "Artwork not found" }, 404);
  }

  const responseUserRow = await getUserRowById(db, user.id);
  const responseUser = responseUserRow ? currentUserFromRow(responseUserRow) : user;
  return context.json<DeleteArtworkImageResponse>({
    deleted: true,
    imageId,
    artwork: updated.artwork,
    user: publicAuthUser(responseUser),
    message: "Image removed."
  });
});

app.post("/api/artworks/:id/like", async (context) => {
  const id = context.req.param("id");

  if (!context.env.DB) {
    return context.json({ message: "D1 database is required." }, 503);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to like artwork." }, 401);
  }
  if (!user.emailVerified) {
    return context.json({ message: "Verify your email before liking artwork." }, 403);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "artworks:like",
    userId: user.id,
    ...rateLimitDefaults.social
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const artworkExists = await context.env.DB.prepare(
    `SELECT id, creator_id, title, mature, mature_rating, visibility
     FROM artworks
     WHERE id = ?
       AND hidden_at IS NULL
     LIMIT 1`
  )
    .bind(id)
    .first<{
      id: string;
      creator_id: string;
      title: string;
      mature: number;
      mature_rating: string | null;
      visibility: string | null;
    }>();
  if (!artworkExists) {
    return context.json({ message: "Artwork not found" }, 404);
  }
  if (
    !canViewDirectArtworkVisibility(
      asArtworkVisibility(artworkExists.visibility),
      artworkExists.creator_id,
      user
    )
  ) {
    return context.json({ message: "Artwork not found" }, 404);
  }
  if (!(await canViewCreatorProfile(context.env.DB, artworkExists.creator_id, user))) {
    return context.json({ message: "Artwork not found" }, 404);
  }
  if (await userBlockedPair(context.env.DB, user.id, artworkExists.creator_id)) {
    return context.json({ message: "Artwork not found" }, 404);
  }
  if (
    (Boolean(artworkExists.mature) || asMatureRating(artworkExists.mature_rating) !== "general") &&
    !matureAccessFor(context, user).allowed
  ) {
    return context.json({ message: "Artwork not found" }, 404);
  }

  const existing = await context.env.DB.prepare(
    `SELECT artwork_id
     FROM artwork_likes
     WHERE user_id = ?
       AND artwork_id = ?
     LIMIT 1`
  )
    .bind(user.id, id)
    .first<{ artwork_id: string }>();

  let likeAdded = false;
  try {
    if (existing) {
      await context.env.DB.batch([
        context.env.DB.prepare(
          "DELETE FROM artwork_likes WHERE user_id = ? AND artwork_id = ?"
        ).bind(user.id, id),
        context.env.DB.prepare(
          "UPDATE artworks SET like_count = MAX(like_count - 1, 0) WHERE id = ?"
        ).bind(id)
      ]);
    } else {
      const likeResult = await context.env.DB.prepare(
        "INSERT OR IGNORE INTO artwork_likes (user_id, artwork_id) VALUES (?, ?)"
      )
        .bind(user.id, id)
        .run();
      if ((likeResult.meta.changes ?? 0) > 0) {
        likeAdded = true;
        await context.env.DB.prepare(
          "UPDATE artworks SET like_count = like_count + 1 WHERE id = ?"
        )
          .bind(id)
          .run();
        await awardArtworkLikeSiteCredits(
          context.env.DB,
          artworkExists.creator_id,
          user.id,
          artworkExists.id
        );
      }
    }
    if (likeAdded) {
      await createNotification(context.env.DB, {
        userId: artworkExists.creator_id,
        actorUserId: user.id,
        type: "like",
        artworkId: artworkExists.id,
        message: `${user.displayName} liked "${artworkExists.title}".`
      });
      await createActivityEvent(context.env.DB, {
        actorUserId: user.id,
        type: "like",
        artworkId: artworkExists.id,
        message: `${user.displayName} liked "${artworkExists.title}".`
      });
    }
    const updated = await getArtworkFromD1(context.env.DB, id, user);
    if (updated) {
      return context.json({
        artwork: updated.artwork,
        message: existing ? "Like removed." : "Artwork liked."
      });
    }
  } catch (error) {
    console.warn("Unable to persist like", error);
  }

  return context.json({ message: "Artwork not found" }, 404);
});

app.post("/api/artworks/:id/comments", async (context) => {
  const id = context.req.param("id");

  if (!context.env.DB) {
    return context.json({ message: "D1 database is required." }, 503);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to comment." }, 401);
  }
  if (!user.emailVerified) {
    return context.json({ message: "Verify your email before commenting." }, 403);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "comments:create",
    userId: user.id,
    ...rateLimitDefaults.comments
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const parsed = await parseJson(context, protectedCommentSchema);
  if (!parsed.success) {
    return context.json({ message: "Comment is invalid." }, 400);
  }
  const turnstile = await verifyTurnstile(context, parsed.data.turnstileToken, "comment");
  if (!turnstile.ok) {
    return context.json({ message: turnstile.message }, 403);
  }

  const artwork = await context.env.DB.prepare(
    `SELECT id, creator_id, title, mature, mature_rating, visibility
     FROM artworks
     WHERE id = ?
       AND hidden_at IS NULL
     LIMIT 1`
  )
    .bind(id)
    .first<{
      id: string;
      creator_id: string;
      title: string;
      mature: number;
      mature_rating: string | null;
      visibility: string | null;
    }>();
  if (!artwork) {
    return context.json({ message: "Artwork not found" }, 404);
  }
  if (
    !canViewDirectArtworkVisibility(
      asArtworkVisibility(artwork.visibility),
      artwork.creator_id,
      user
    )
  ) {
    return context.json({ message: "Artwork not found" }, 404);
  }
  if (!(await canViewCreatorProfile(context.env.DB, artwork.creator_id, user))) {
    return context.json({ message: "Artwork not found" }, 404);
  }
  if (
    (Boolean(artwork.mature) || asMatureRating(artwork.mature_rating) !== "general") &&
    !matureAccessFor(context, user).allowed
  ) {
    return context.json({ message: "Artwork not found" }, 404);
  }
  if (await userBlockedPair(context.env.DB, user.id, artwork.creator_id)) {
    return context.json({ message: "Artwork not found" }, 404);
  }

  let parentComment: { id: string; user_id: string | null } | null = null;
  if (parsed.data.parentId) {
    const parent = await context.env.DB.prepare(
      "SELECT id, user_id FROM comments WHERE id = ? AND artwork_id = ? AND deleted_at IS NULL LIMIT 1"
    )
      .bind(parsed.data.parentId, id)
      .first<{ id: string; user_id: string | null }>();
    if (!parent) {
      return context.json({ message: "Parent comment not found." }, 404);
    }
    parentComment = parent;
  }

  const commentId = `cmt_${crypto.randomUUID().replaceAll("-", "")}`;
  await context.env.DB.batch([
    context.env.DB.prepare(
      `INSERT INTO comments (id, artwork_id, user_id, author, body, parent_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(commentId, id, user.id, user.displayName, parsed.data.body, parsed.data.parentId ?? null),
    context.env.DB.prepare(
      "UPDATE artworks SET comment_count = comment_count + 1 WHERE id = ?"
    ).bind(id)
  ]);
  await createNotification(context.env.DB, {
    userId: artwork.creator_id,
    actorUserId: user.id,
    type: "comment",
    artworkId: artwork.id,
    commentId,
    message: `${user.displayName} commented on "${artwork.title}".`
  });
  if (parentComment?.user_id && parentComment.user_id !== artwork.creator_id) {
    await createNotification(context.env.DB, {
      userId: parentComment.user_id,
      actorUserId: user.id,
      type: "comment",
      artworkId: artwork.id,
      commentId,
      message: `${user.displayName} replied to your comment on "${artwork.title}".`
    });
  }
  await createActivityEvent(context.env.DB, {
    actorUserId: user.id,
    type: "comment",
    artworkId: artwork.id,
    commentId,
    message: parsed.data.parentId
      ? `${user.displayName} replied on "${artwork.title}".`
      : `${user.displayName} commented on "${artwork.title}".`
  });

  const updated = await getArtworkFromD1(context.env.DB, id, user);
  const comment = updated?.comments.find((item) => item.id === commentId);
  if (!updated || !comment) {
    return context.json({ message: "Comment could not be loaded." }, 500);
  }

  return context.json<CommentResponse>(
    {
      comment,
      artwork: updated.artwork,
      message: "Comment posted."
    },
    201
  );
});

app.delete("/api/comments/:id", async (context) => {
  const id = context.req.param("id");

  if (!context.env.DB) {
    return context.json({ message: "D1 database is required." }, 503);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to delete comments." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "comments:delete",
    userId: user.id,
    ...rateLimitDefaults.comments
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const comment = await context.env.DB.prepare(
    `SELECT
      comments.id,
      comments.artwork_id,
      comments.user_id,
      comments.body,
      artworks.title AS artwork_title,
      artworks.creator_id AS artwork_creator_id
     FROM comments
     JOIN artworks ON artworks.id = comments.artwork_id
     WHERE comments.id = ?
       AND comments.deleted_at IS NULL
       AND artworks.hidden_at IS NULL
     LIMIT 1`
  )
    .bind(id)
    .first<{
      id: string;
      artwork_id: string;
      user_id: string | null;
      body: string;
      artwork_title: string;
      artwork_creator_id: string;
    }>();
  if (!comment) {
    return context.json({ message: "Comment not found." }, 404);
  }
  if (!(await canViewCreatorProfile(context.env.DB, comment.artwork_creator_id, user))) {
    return context.json({ message: "Comment not found." }, 404);
  }
  if (
    !isStaffRole(user.role) &&
    user.id !== comment.user_id &&
    user.id !== comment.artwork_creator_id
  ) {
    return context.json({ message: "You cannot delete this comment." }, 403);
  }

  await context.env.DB.batch([
    context.env.DB.prepare(
      "UPDATE comments SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(id),
    context.env.DB.prepare(
      "UPDATE artworks SET comment_count = MAX(comment_count - 1, 0) WHERE id = ?"
    ).bind(comment.artwork_id),
    context.env.DB.prepare("DELETE FROM activity_events WHERE comment_id = ?").bind(id)
  ]);
  if (isStaffRole(user.role) && comment.user_id) {
    await createNotification(context.env.DB, {
      userId: comment.user_id,
      actorUserId: user.id,
      type: "moderation",
      artworkId: comment.artwork_id,
      commentId: id,
      message: `Your comment on "${comment.artwork_title}" was removed by moderation.`
    });
  }

  const updated = await getArtworkFromD1(context.env.DB, comment.artwork_id, user);
  if (!updated) {
    return context.json({ message: "Artwork not found" }, 404);
  }

  return context.json<DeleteCommentResponse>({
    deleted: true,
    commentId: id,
    artwork: updated.artwork,
    message: "Comment deleted."
  });
});

app.put("/api/comments/:id", async (context) => {
  const id = context.req.param("id");

  if (!context.env.DB) {
    return context.json({ message: "D1 database is required." }, 503);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to edit comments." }, 401);
  }
  if (!user.emailVerified && user.role !== "admin") {
    return context.json({ message: "Verify your email before editing comments." }, 403);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "comments:update",
    userId: user.id,
    ...rateLimitDefaults.comments
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }
  const parsed = await parseJson(context, commentSchema);
  if (!parsed.success) {
    return context.json({ message: "Comment is invalid." }, 400);
  }

  const comment = await context.env.DB.prepare(
    `SELECT
      comments.id,
      comments.artwork_id,
      comments.user_id,
      artworks.creator_id AS artwork_creator_id
     FROM comments
     JOIN artworks ON artworks.id = comments.artwork_id
     WHERE comments.id = ?
       AND comments.deleted_at IS NULL
       AND artworks.hidden_at IS NULL
     LIMIT 1`
  )
    .bind(id)
    .first<{
      id: string;
      artwork_id: string;
      user_id: string | null;
      artwork_creator_id: string;
    }>();
  if (!comment) {
    return context.json({ message: "Comment not found." }, 404);
  }
  if (!(await canViewCreatorProfile(context.env.DB, comment.artwork_creator_id, user))) {
    return context.json({ message: "Comment not found." }, 404);
  }
  if (comment.user_id !== user.id && user.role !== "admin") {
    return context.json({ message: "You can only edit your own comments." }, 403);
  }

  await context.env.DB.prepare(
    "UPDATE comments SET body = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  )
    .bind(parsed.data.body, id)
    .run();

  const updated = await getArtworkFromD1(context.env.DB, comment.artwork_id, user);
  const updatedComment = updated?.comments.find((item) => item.id === id);
  if (!updated || !updatedComment) {
    return context.json({ message: "Comment not found." }, 404);
  }

  return context.json<CommentResponse>({
    comment: updatedComment,
    artwork: updated.artwork,
    message: "Comment updated."
  });
});

app.post("/api/comments/:id/report", async (context) => {
  const id = context.req.param("id");

  if (!context.env.DB) {
    return context.json({ message: "D1 database is required." }, 503);
  }
  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to report comments." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "reports:comment",
    userId: user.id,
    ...rateLimitDefaults.reports
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }
  const parsed = await parseJson(context, protectedReportSchema);
  if (!parsed.success) {
    return context.json({ message: "Report details are invalid." }, 400);
  }
  const turnstile = await verifyTurnstile(context, parsed.data.turnstileToken, "report");
  if (!turnstile.ok) {
    return context.json({ message: turnstile.message }, 403);
  }

  const comment = await context.env.DB.prepare(
    `SELECT
      comments.id,
      comments.user_id,
      comments.body,
      artworks.creator_id,
      artworks.mature,
      artworks.mature_rating,
      artworks.visibility
     FROM comments
     JOIN artworks ON artworks.id = comments.artwork_id
     WHERE comments.id = ?
       AND comments.deleted_at IS NULL
       AND artworks.hidden_at IS NULL
     LIMIT 1`
  )
    .bind(id)
    .first<{
      id: string;
      user_id: string | null;
      body: string;
      creator_id: string;
      mature: number;
      mature_rating: string | null;
      visibility: string | null;
    }>();
  if (!comment) {
    return context.json({ message: "Comment not found." }, 404);
  }
  if (
    !canViewDirectArtworkVisibility(
      asArtworkVisibility(comment.visibility),
      comment.creator_id,
      user
    )
  ) {
    return context.json({ message: "Comment not found." }, 404);
  }
  if (!(await canViewCreatorProfile(context.env.DB, comment.creator_id, user))) {
    return context.json({ message: "Comment not found." }, 404);
  }
  if (comment.user_id === user.id) {
    return context.json({ message: "You cannot report your own comment." }, 400);
  }
  if (comment.user_id && (await userBlockedPair(context.env.DB, user.id, comment.user_id))) {
    return context.json({ message: "Comment not found." }, 404);
  }
  if (await userBlockedPair(context.env.DB, user.id, comment.creator_id)) {
    return context.json({ message: "Comment not found." }, 404);
  }
  if (
    (Boolean(comment.mature) || asMatureRating(comment.mature_rating) !== "general") &&
    !matureAccessFor(context, user).allowed
  ) {
    return context.json({ message: "Comment not found." }, 404);
  }

  const reportId = `rpt_${crypto.randomUUID().replaceAll("-", "")}`;
  await context.env.DB.prepare(
    `INSERT INTO moderation_reports
      (id, reporter_user_id, target_type, target_id, reason, details)
     VALUES (?, ?, 'comment', ?, ?, ?)`
  )
    .bind(reportId, user.id, comment.id, parsed.data.reason, parsed.data.details)
    .run();

  return context.json<ReportResponse>(
    {
      report: {
        id: reportId,
        targetType: "comment",
        targetId: comment.id,
        targetLabel: comment.body.slice(0, 80),
        reporter: user.displayName,
        reason: parsed.data.reason,
        details: parsed.data.details,
        status: "open",
        createdAt: new Date().toISOString(),
        resolvedAt: null
      },
      message: "Report submitted."
    },
    201
  );
});

app.post("/api/artworks/:id/bookmark", async (context) => {
  const id = context.req.param("id");

  if (!context.env.DB) {
    return context.json({ message: "D1 database is required." }, 503);
  }

  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to bookmark artwork." }, 401);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "artworks:bookmark",
    userId: user.id,
    ...rateLimitDefaults.social
  });
  if (rateLimitError) {
    return rateLimitError;
  }

  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const parsed = context.req.header("content-type")?.includes("application/json")
    ? bookmarkSchema.safeParse(await context.req.json().catch(() => ({})))
    : bookmarkSchema.safeParse({});
  if (!parsed.success) {
    return context.json({ message: "Bookmark settings are invalid." }, 400);
  }
  const visibility = parsed.data.visibility ?? user.bookmarkDefaultVisibility;

  const artworkExists = await context.env.DB.prepare(
    `SELECT id, creator_id, mature, mature_rating, visibility
     FROM artworks
     WHERE id = ?
       AND hidden_at IS NULL
     LIMIT 1`
  )
    .bind(id)
    .first<{
      id: string;
      creator_id: string;
      mature: number;
      mature_rating: string | null;
      visibility: string | null;
    }>();
  if (!artworkExists) {
    return context.json({ message: "Artwork not found" }, 404);
  }
  if (
    !canViewDirectArtworkVisibility(
      asArtworkVisibility(artworkExists.visibility),
      artworkExists.creator_id,
      user
    )
  ) {
    return context.json({ message: "Artwork not found" }, 404);
  }
  if (!(await canViewCreatorProfile(context.env.DB, artworkExists.creator_id, user))) {
    return context.json({ message: "Artwork not found" }, 404);
  }
  if (await userBlockedPair(context.env.DB, user.id, artworkExists.creator_id)) {
    return context.json({ message: "Artwork not found" }, 404);
  }
  if (
    (Boolean(artworkExists.mature) || asMatureRating(artworkExists.mature_rating) !== "general") &&
    !matureAccessFor(context, user).allowed
  ) {
    return context.json({ message: "Artwork not found" }, 404);
  }

  const existing = await context.env.DB.prepare(
    "SELECT artwork_id FROM user_bookmarks WHERE user_id = ? AND artwork_id = ? LIMIT 1"
  )
    .bind(user.id, id)
    .first<{ artwork_id: string }>();

  if (existing) {
    if (parsed.data.visibility) {
      await context.env.DB.prepare(
        "UPDATE user_bookmarks SET visibility = ? WHERE user_id = ? AND artwork_id = ?"
      )
        .bind(visibility, user.id, id)
        .run();
    } else {
      await context.env.DB.batch([
        context.env.DB.prepare(
          "DELETE FROM user_bookmarks WHERE user_id = ? AND artwork_id = ?"
        ).bind(user.id, id),
        context.env.DB.prepare(
          "UPDATE artworks SET bookmark_count = MAX(bookmark_count - 1, 0) WHERE id = ?"
        ).bind(id)
      ]);
    }
  } else {
    await context.env.DB.batch([
      context.env.DB.prepare(
        "INSERT INTO user_bookmarks (user_id, artwork_id, visibility) VALUES (?, ?, ?)"
      ).bind(user.id, id, visibility),
      context.env.DB.prepare(
        "UPDATE artworks SET bookmark_count = bookmark_count + 1 WHERE id = ?"
      ).bind(id)
    ]);
  }

  const updated = await getArtworkFromD1(context.env.DB, id, user);
  if (!updated) {
    return context.json({ message: "Artwork not found" }, 404);
  }

  return context.json({ artwork: updated.artwork });
});

app.delete("/api/artworks/:id", async (context) => {
  const id = context.req.param("id");

  if (!context.env.DB) {
    return context.json({ message: "D1 database is required." }, 503);
  }

  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to delete artwork." }, 401);
  }
  if (!user.emailVerified && user.role !== "admin") {
    return context.json({ message: "Verify your email before deleting artwork." }, 403);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "artworks:delete",
    userId: user.id,
    ...rateLimitDefaults.social
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const artwork = await context.env.DB.prepare(
    "SELECT id, creator_id, image_url, thumbnail_url FROM artworks WHERE id = ? LIMIT 1"
  )
    .bind(id)
    .first<{ id: string; creator_id: string; image_url: string; thumbnail_url: string }>();
  if (!artwork) {
    return context.json({ message: "Artwork not found" }, 404);
  }
  if (artwork.creator_id !== user.id && user.role !== "admin") {
    return context.json({ message: "You can only delete your own artwork." }, 403);
  }

  const imageRows = await context.env.DB.prepare(
    "SELECT image_url, thumbnail_url FROM artwork_images WHERE artwork_id = ?"
  )
    .bind(id)
    .all<{ image_url: string; thumbnail_url: string }>();
  const mediaKeys = new Set(
    [artwork.image_url, artwork.thumbnail_url, ...imageRows.results.flatMap((row) => [
      row.image_url,
      row.thumbnail_url
    ])]
      .map(mediaKeyFromUrl)
      .filter(Boolean)
  );

  if (context.env.ARTWORKS) {
    await Promise.all(
      Array.from(mediaKeys).map((key) =>
        context.env.ARTWORKS?.delete(key).catch((error) => {
          console.warn("Unable to delete artwork object", key, error);
        })
      )
    );
  }

  await context.env.DB.batch([
    context.env.DB.prepare("DELETE FROM comments WHERE artwork_id = ?").bind(id),
    context.env.DB.prepare("DELETE FROM user_bookmarks WHERE artwork_id = ?").bind(id),
    context.env.DB.prepare("UPDATE collections SET cover_artwork_id = NULL WHERE cover_artwork_id = ?").bind(id),
    context.env.DB.prepare("DELETE FROM collection_items WHERE artwork_id = ?").bind(id),
    context.env.DB.prepare("UPDATE artwork_series SET cover_artwork_id = NULL WHERE cover_artwork_id = ?").bind(id),
    context.env.DB.prepare("DELETE FROM artwork_series_items WHERE artwork_id = ?").bind(id),
    context.env.DB.prepare("DELETE FROM artwork_tags WHERE artwork_id = ?").bind(id),
    context.env.DB.prepare("DELETE FROM artwork_search WHERE artwork_id = ?").bind(id),
    context.env.DB.prepare("DELETE FROM activity_events WHERE artwork_id = ?").bind(id),
    context.env.DB.prepare("DELETE FROM artwork_images WHERE artwork_id = ?").bind(id),
    context.env.DB.prepare("DELETE FROM artworks WHERE id = ?").bind(id)
  ]);

  const responseUserRow = await getUserRowById(context.env.DB, user.id);
  const responseUser = responseUserRow ? currentUserFromRow(responseUserRow) : user;
  return context.json<DeleteArtworkResponse>({
    deleted: true,
    artworkId: id,
    user: publicAuthUser(responseUser),
    message: "Artwork deleted."
  });
});

app.post("/api/upload", async (context) => {
  if (!context.env.DB || !context.env.ARTWORKS) {
    return context.json(
      { message: "D1 and R2 bindings are required to publish artwork." },
      503
    );
  }

  const user = await getCurrentUser(context.env.DB, context.req.raw);
  if (!user) {
    return context.json({ message: "Sign in to publish artwork." }, 401);
  }
  if (!user.emailVerified) {
    return context.json({ message: "Verify your email before publishing artwork." }, 403);
  }
  const rateLimitError = await enforceRateLimit(context, {
    action: "artworks:upload",
    userId: user.id,
    ...rateLimitDefaults.uploads
  });
  if (rateLimitError) {
    return rateLimitError;
  }
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const body = await context.req.parseBody({ all: true });
  const files = normalizeUploadFiles(body.files ?? body.file);

  const parsed = uploadSchema.safeParse({
    title: body.title,
    caption: body.caption,
    tags: body.tags,
    mature: body.mature,
    matureRating: body.matureRating,
    visibility: body.visibility,
    turnstileToken: body.turnstileToken
  });

  if (!parsed.success) {
    return context.json({ message: "Upload metadata is invalid" }, 400);
  }
  const turnstile = await verifyTurnstile(context, parsed.data.turnstileToken, "upload");
  if (!turnstile.ok) {
    return context.json({ message: turnstile.message }, 403);
  }
  const matureRating: MatureRating =
    parsed.data.mature === "true" && parsed.data.matureRating === "general"
      ? "restricted"
      : parsed.data.matureRating;
  if (matureRating !== "general" && !matureAccessFor(context, user).allowed) {
    return context.json({ message: "Verify your age before publishing mature artwork." }, 403);
  }

  if (files.length === 0) {
    return context.json({ message: "At least one artwork image is required" }, 400);
  }
  if (files.length > maxUploadFiles) {
    return context.json({ message: `Upload ${maxUploadFiles} images or fewer.` }, 400);
  }
  const storage = await getUserStorage(context.env.DB, user.id);
  if (!storage) {
    return context.json({ message: "Account storage could not be loaded." }, 500);
  }
  const storageLimitMessage = uploadStorageLimitMessage(storage, files.length);
  if (storageLimitMessage) {
    return context.json({ message: storageLimitMessage }, 400);
  }
  const preparedImages: PreparedUploadImage[] = [];
  for (const [index, file] of files.entries()) {
    if (file.size > maxUploadBytes) {
      return context.json({ message: "Each artwork image must be 10 MB or smaller." }, 413);
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const metadata = readUploadImageMetadata(bytes);
    if (!metadata) {
      return context.json({ message: "Artwork images must be JPEG, PNG, WebP, or GIF." }, 415);
    }
    if (file.type && allowedUploadTypes.has(file.type) && file.type !== metadata.contentType) {
      return context.json({ message: "Artwork image content does not match its file type." }, 415);
    }
    const extension = allowedUploadTypes.get(metadata.contentType);
    if (!extension) {
      return context.json({ message: "Artwork images must be JPEG, PNG, WebP, or GIF." }, 415);
    }
    preparedImages.push({
      ...metadata,
      bytes,
      extension,
      position: index
    });
  }

  const id = `art_${crypto.randomUUID().replaceAll("-", "")}`;
  const tags = await canonicalizeArtworkTags(context.env.DB, parseTagInput(parsed.data.tags));
  const now = new Date().toISOString();
  const images: ArtworkImage[] = [];
  const publicArtworkReviewEnabled = await getPublicArtworkReviewEnabled(context.env.DB);
  const reviewStatus = artworkReviewStatusForUpload(
    parsed.data.visibility,
    user,
    publicArtworkReviewEnabled
  );

  for (const image of preparedImages) {
    const imageId = `img_${crypto.randomUUID().replaceAll("-", "")}`;
    const objectKey = `artworks/${id}/${imageId}.${image.extension}`;
    const objectUrl = artworkMediaUrl(objectKey, context.env);
    await context.env.ARTWORKS.put(objectKey, image.bytes, {
      httpMetadata: {
        contentType: image.contentType
      },
      customMetadata: {
        artworkId: id,
        imageId,
        title: parsed.data.title,
        width: String(image.width),
        height: String(image.height)
      }
    });
    images.push({
      id: imageId,
      imageUrl: objectUrl,
      thumbnailUrl: mediaThumbnailUrl(objectUrl),
      width: image.width,
      height: image.height,
      dominantColor: image.dominantColor,
      position: image.position
    });
  }

  const cover = images[0];
  if (!cover) {
    return context.json({ message: "Artwork image could not be stored." }, 500);
  }

  await context.env.DB.prepare(
    `INSERT INTO creators (id, handle, display_name, avatar_url, bio)
     VALUES (?, ?, ?, '', '')
     ON CONFLICT(id) DO UPDATE SET
       handle = excluded.handle,
       display_name = excluded.display_name`
  )
    .bind(user.id, user.username, user.displayName)
    .run();

  const creatorRow = await context.env.DB.prepare(
    `SELECT id, handle, display_name, avatar_url, bio, follower_count, following
     FROM creators WHERE id = ? LIMIT 1`
  )
    .bind(user.id)
    .first<{
      id: string;
      handle: string;
      display_name: string;
      avatar_url: string;
      bio: string;
      follower_count: number;
      following: number;
    }>();

  const creator: Creator = creatorRow
    ? {
        id: creatorRow.id,
        handle: creatorRow.handle,
        displayName: creatorRow.display_name,
        avatarUrl: creatorRow.avatar_url,
        bio: creatorRow.bio,
        followerCount: creatorRow.follower_count,
        following: Boolean(creatorRow.following)
      }
    : {
        id: user.id,
        handle: user.username,
        displayName: user.displayName,
        avatarUrl: "",
        bio: "",
        followerCount: 0,
        following: false
      };

  const artwork: Artwork = {
    id,
    title: parsed.data.title,
    caption: parsed.data.caption,
    imageUrl: cover.imageUrl,
    thumbnailUrl: cover.thumbnailUrl,
    width: cover.width,
    height: cover.height,
    dominantColor: cover.dominantColor,
    images,
    creator,
    tags,
    likeCount: 0,
    liked: false,
    bookmarkCount: 0,
    bookmarked: false,
    bookmarkVisibility: null,
    viewCount: 0,
    commentCount: 0,
    createdAt: now,
    mature: matureRating !== "general",
    matureRating,
    visibility: parsed.data.visibility,
    reviewStatus
  };

  const db = context.env.DB;
  const statements = [
    db.prepare(
      `INSERT INTO artworks (
        id,
        creator_id,
        title,
        caption,
        image_url,
        thumbnail_url,
        width,
        height,
        dominant_color,
        tags_json,
        like_count,
        bookmark_count,
        view_count,
        comment_count,
        created_at,
        mature,
        mature_rating,
        visibility,
        review_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      artwork.id,
      artwork.creator.id,
      artwork.title,
      artwork.caption,
      artwork.imageUrl,
      artwork.thumbnailUrl,
      artwork.width,
      artwork.height,
      artwork.dominantColor,
      JSON.stringify(artwork.tags),
      artwork.likeCount,
      artwork.bookmarkCount,
      artwork.viewCount,
      artwork.commentCount,
      artwork.createdAt,
      artwork.mature ? 1 : 0,
      artwork.matureRating,
      artwork.visibility,
      artwork.reviewStatus
    ),
    ...artwork.images.map((image) =>
      db.prepare(
        `INSERT INTO artwork_images (
          id,
          artwork_id,
          image_url,
          thumbnail_url,
          width,
          height,
          dominant_color,
          position,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        image.id,
        artwork.id,
        image.imageUrl,
        image.thumbnailUrl,
        image.width,
        image.height,
        image.dominantColor,
        image.position,
        artwork.createdAt
      )
    ),
    ...artworkTagInsertStatements(db, artwork.id, artwork.tags),
    artworkSearchInsertStatement(db, {
      artworkId: artwork.id,
      title: artwork.title,
      caption: artwork.caption,
      tags: artwork.tags,
      creator: `${artwork.creator.displayName} ${artwork.creator.handle}`
    })
  ];
  if (artwork.visibility === "public" && artwork.reviewStatus === "approved") {
    statements.push(
      db.prepare(
        `INSERT INTO activity_events (id, actor_user_id, type, artwork_id, message, created_at)
         VALUES (?, ?, 'publish', ?, ?, ?)`
      ).bind(
        `act_${crypto.randomUUID().replaceAll("-", "")}`,
        user.id,
        artwork.id,
        `${user.displayName} published "${artwork.title}".`,
        artwork.createdAt
      )
    );
  }

  await context.env.DB.batch(statements);

  const responseUserRow = await getUserRowById(context.env.DB, user.id);
  const responseUser = responseUserRow ? currentUserFromRow(responseUserRow) : user;
  return context.json<UploadResponse>({
    artwork,
    user: publicAuthUser(responseUser),
    persisted: true,
    message:
      artwork.reviewStatus === "pending"
        ? "Artwork submitted for review."
        : "Artwork published."
  });
});

const artworkIdFromMediaKey = (key: string) => {
  const parts = key.split("/");
  if (parts.length === 2) {
    return parts[1]?.replace(/\.[^.]+$/, "") ?? "";
  }
  return parts[1] ?? "";
};

const resolveArtworkMediaKey = async (context: AppContext, key: string) => {
  if (!context.env.DB || !key.startsWith("artworks/") || key.includes("..")) {
    return key;
  }
  const parts = key.split("/").filter(Boolean);
  const artworkId = parts[1] ?? "";
  const imageToken = parts[2] ?? "";
  const hasExplicitObjectName = Boolean(imageToken && /\.[^/]+$/.test(imageToken));
  if (!artworkId || parts.length > 3 || hasExplicitObjectName) {
    return key;
  }

  const row = imageToken
    ? await context.env.DB.prepare(
        `SELECT image_url
         FROM artwork_images
         WHERE artwork_id = ?
           AND id = ?
         LIMIT 1`
      )
        .bind(artworkId, imageToken)
        .first<{ image_url: string }>()
    : await context.env.DB.prepare(
        `SELECT image_url
         FROM artworks
         WHERE id = ?
         LIMIT 1`
      )
        .bind(artworkId)
        .first<{ image_url: string }>();
  const resolvedKey = mediaKeyFromUrl(row?.image_url ?? "");
  return resolvedKey.startsWith("artworks/") ? resolvedKey : key;
};

const mediaAccessForRequest = async (context: AppContext, key: string) => {
  if (key.startsWith("profiles/") && !key.includes("..")) {
    return { cacheControl: publicMediaCacheControl };
  }
  if (!key.startsWith("artworks/") || key.includes("..")) {
    return {
      response: context.json({ message: "Object not found" }, 404),
      cacheControl: protectedMediaCacheControl
    };
  }
  if (context.env.DB) {
    const artworkId = artworkIdFromMediaKey(key);
    const viewer = await getCurrentUser(context.env.DB, context.req.raw);
    const artwork = await context.env.DB.prepare(
      `SELECT
        artworks.id,
        artworks.creator_id,
        artworks.mature,
        artworks.mature_rating,
        artworks.visibility,
        artworks.review_status,
        artworks.hidden_at,
        creator_user.profile_visibility
       FROM artworks
       JOIN users AS creator_user ON creator_user.id = artworks.creator_id
       WHERE artworks.id = ?
       LIMIT 1`
    )
      .bind(artworkId)
      .first<{
        id: string;
        creator_id: string;
        mature: number;
        mature_rating: string | null;
        visibility: string | null;
        review_status: string | null;
        hidden_at: string | null;
        profile_visibility: string;
      }>();
    if (!artwork || artwork.hidden_at) {
      return {
        response: context.json({ message: "Object not found" }, 404),
        cacheControl: protectedMediaCacheControl
      };
    }
    const profileVisibility = asProfileVisibility(artwork.profile_visibility);
    const artworkVisibility = asArtworkVisibility(artwork.visibility);
    const reviewStatus = asArtworkReviewStatus(artwork.review_status);
    const mature = Boolean(artwork.mature) || asMatureRating(artwork.mature_rating) !== "general";
    if (reviewStatus !== "approved" && artwork.creator_id !== viewer?.id && !isStaffRole(viewer?.role)) {
      return {
        response: context.json({ message: "Object not found" }, 404),
        cacheControl: protectedMediaCacheControl
      };
    }
    if (!canViewDirectArtworkVisibility(artworkVisibility, artwork.creator_id, viewer)) {
      return {
        response: context.json({ message: "Object not found" }, 404),
        cacheControl: protectedMediaCacheControl
      };
    }
    if (
      !canViewProfileVisibility(
        profileVisibility,
        artwork.creator_id,
        viewer
      )
    ) {
      return {
        response: context.json({ message: "Object not found" }, 404),
        cacheControl: protectedMediaCacheControl
      };
    }
    if (mature) {
      if (!matureAccessFor(context, viewer).allowed) {
        return {
          response: context.json({ message: "Object not found" }, 404),
          cacheControl: protectedMediaCacheControl
        };
      }
    }
    if (viewer && (await userBlockedPair(context.env.DB, viewer.id, artwork.creator_id))) {
      return {
        response: context.json({ message: "Object not found" }, 404),
        cacheControl: protectedMediaCacheControl
      };
    }
    return {
      cacheControl:
        !viewer && profileVisibility === "public" && artworkVisibility === "public" && !mature
          ? publicMediaCacheControl
          : protectedMediaCacheControl
    };
  }
  return { cacheControl: publicMediaCacheControl };
};

const responseFromR2Object = (object: R2ObjectBody, cacheControl: string) => {
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", cacheControl);
  if (cacheControl === protectedMediaCacheControl) {
    headers.set("vary", "Cookie, CF-IPCountry");
  }
  return new Response(object.body, { headers });
};

const streamMediaObject = async (
  context: AppContext,
  key: string,
  variant?: MediaVariant
) => {
  if (!context.env.ARTWORKS) {
    return context.json({ message: "R2 bucket is not bound" }, 404);
  }

  const resolvedKey = await resolveArtworkMediaKey(context, key);
  const access = await mediaAccessForRequest(context, resolvedKey);
  if (access.response) {
    return access.response;
  }

  if (variant) {
    const sourceUrl = new URL(`/media/${resolvedKey}`, context.req.url);
    const resized = await fetch(sourceUrl.toString(), {
      headers: context.req.raw.headers,
      cf: {
        image: mediaVariantOptions[variant]
      }
    });
    if (resized.ok) {
      const headers = new Headers(resized.headers);
      headers.set("cache-control", access.cacheControl);
      if (access.cacheControl === protectedMediaCacheControl) {
        headers.set("vary", "Cookie, CF-IPCountry");
      }
      return new Response(resized.body, {
        status: resized.status,
        statusText: resized.statusText,
        headers
      });
    }
  }

  const object = await context.env.ARTWORKS.get(resolvedKey);
  if (!object) {
    return context.json({ message: "Object not found" }, 404);
  }

  return responseFromR2Object(object, access.cacheControl);
};

app.get("/media-thumbnail/*", async (context) =>
  streamMediaObject(context, context.req.path.replace(/^\/media-thumbnail\//, ""), "thumbnail")
);

app.get("/media-preview/*", async (context) =>
  streamMediaObject(context, context.req.path.replace(/^\/media-preview\//, ""), "preview")
);

app.get("/media/*", async (context) =>
  streamMediaObject(context, context.req.path.replace(/^\/media\//, ""))
);

app.get("/artworks/:id", async (context) => {
  const indexUrl = new URL("/", context.req.url);
  const assetResponse = await context.env.ASSETS.fetch(new Request(indexUrl, context.req.raw));
  if (!assetResponse.ok) {
    return assetResponse;
  }

  let html = await assetResponse.text();
  if (context.env.DB) {
    try {
      const id = context.req.param("id");
      const artwork = await context.env.DB.prepare(
        `SELECT
          artworks.title,
          artworks.caption,
          artworks.thumbnail_url,
          artworks.mature,
          artworks.mature_rating,
          artworks.visibility,
          artworks.hidden_at,
          artworks.creator_id,
          creator_user.profile_visibility,
          creators.display_name AS creator_display_name
         FROM artworks
         JOIN creators ON creators.id = artworks.creator_id
         JOIN users AS creator_user ON creator_user.id = artworks.creator_id
         WHERE artworks.id = ?
         LIMIT 1`
      )
        .bind(id)
        .first<{
          title: string;
          caption: string;
          thumbnail_url: string;
          mature: number;
          mature_rating: string | null;
          visibility: string | null;
          hidden_at: string | null;
          creator_id: string;
          profile_visibility: string;
          creator_display_name: string;
        }>();

      if (
        artwork &&
        !artwork.hidden_at &&
        asArtworkVisibility(artwork.visibility) === "public" &&
        canViewProfileVisibility(
          asProfileVisibility(artwork.profile_visibility),
          artwork.creator_id,
          undefined
        )
      ) {
        const rating = asMatureRating(artwork.mature_rating);
        const mature = Boolean(artwork.mature) || rating !== "general";
        const title = mature
          ? `${matureRatingLabelForMeta(rating)} artwork on ${context.env.PUBLIC_APP_NAME}`
          : `${artwork.title} by ${artwork.creator_display_name}`;
        const description = mature
          ? "Open NEHub to view this artwork with your mature-content settings."
          : artwork.caption || `Artwork by ${artwork.creator_display_name} on ${context.env.PUBLIC_APP_NAME}.`;
        const image = mature
          ? ""
          : new URL(artwork.thumbnail_url, context.env.PUBLIC_APP_URL).toString();
        const url = new URL(context.req.path, context.env.PUBLIC_APP_URL).toString();
        const imageMeta = image
          ? `<meta property="og:image" content="${escapeHtml(image)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />`
          : "";
        const meta = `<title>${escapeHtml(title)} · ${escapeHtml(context.env.PUBLIC_APP_NAME)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${escapeHtml(context.env.PUBLIC_APP_NAME)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    ${imageMeta}
    <meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />`;
        html = html
          .replace(/<title>.*?<\/title>/, "")
          .replace(
            /<meta\s+name="description"[^>]*>\s*/i,
            ""
          )
          .replace("</head>", `    ${meta}\n  </head>`);
      }
    } catch (error) {
      console.warn("Unable to inject artwork metadata", error);
    }
  }

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=60"
    }
  });
});

app.notFound((context) => context.env.ASSETS.fetch(context.req.raw));

export default app;
