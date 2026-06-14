import {
  Activity,
  AtSign,
  BarChart3,
  Bell,
  Bookmark,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Cloud,
  Copy,
  Database,
  Download,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  Flag,
  Flame,
  FolderOpen,
  Grid3X3,
  HardDrive,
  Heart,
  Home,
  ImageUp,
  Images,
  KeyRound,
  ListOrdered,
  Lock,
  LogIn,
  LogOut,
  MailCheck,
  MessageCircle,
  NotebookText,
  Pencil,
  Search,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trash2,
  Trophy,
  UserCog,
  UserPlus,
  UserRound,
  UserX,
  X
} from "lucide-react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import type {
  ActivityItem,
  ActivityResponse,
  AccountDeactivationResponse,
  AccountExportResponse,
  AccountSession,
  AdminArtworkReviewActionResponse,
  AdminArtworkReviewSettingsResponse,
  AdminArtworkReviewsResponse,
  AdminAuditLogResponse,
  AuthConfigResponse,
  AuthLoginResponse,
  AuthResponse,
  AuthSessionResponse,
  AuthSessionsResponse,
  AuthUser,
  AdminModerationActionResponse,
  AdminReportReasonFilter,
  AdminReportTargetFilter,
  AdminReportsResponse,
  AdminStatsResponse,
  AdminTagRuleResponse,
  AdminTagsResponse,
  AdminUserActionResponse,
  AdminUserStatusFilter,
  AdminUserSummary,
  AdminUsersResponse,
  AddArtworkImagesResponse,
  Artwork,
  ArtworkResponse,
  ArtworkVisibility,
  ArtworkSeries,
  ArtworkSeriesDetailResponse,
  ArtworkSeriesItemResponse,
  ArtworkSeriesListResponse,
  ArtworkSeriesResponse,
  BlockResponse,
  BlockedUsersResponse,
  BookmarkVisibility,
  Comment,
  CommentResponse,
  CollectionDetailResponse,
  CollectionDiscoveryResponse,
  CollectionDiscoverySort,
  CollectionItemResponse,
  CollectionResponse,
  CollectionVisibility,
  CollectionsResponse,
  Creator,
  CreatorAnalyticsResponse,
  CreatorNovelAnalyticsResponse,
  CreatorDiscoveryResponse,
  CreatorDiscoverySort,
  DeleteArtworkSeriesResponse,
  DeleteArtworkImageResponse,
  DeleteArtworkResponse,
  DeleteCommentResponse,
  DeleteNovelCommentResponse,
  DeleteNovelResponse,
  DeleteNovelSeriesResponse,
  DeleteReadingListResponse,
  DeleteCollectionResponse,
  DiscordStartResponse,
  DiscordVerificationResponse,
  FollowListMode,
  FollowResponse,
  GalleryResponse,
  MatureAccess,
  MatureFilter,
  MatureRating,
  MarkNotificationsReadResponse,
  ModerationReport,
  NotificationPreferencesResponse,
  NotificationsResponse,
  Novel,
  NovelCommentResponse,
  NovelContentFormat,
  NovelExportFormat,
  NovelImportResponse,
  NovelListResponse,
  NovelMutationResponse,
  NovelProfileResponse,
  NovelProfileSection,
  NovelRankingResponse,
  NovelResponse,
  NovelSearchSuggestionsResponse,
  NovelSortMode,
  NovelSeries,
  NovelSeriesDetailResponse,
  NovelSeriesItemResponse,
  NovelSeriesListResponse,
  NovelSeriesResponse,
  NovelTocItem,
  NovelVisibility,
  ReadingList,
  ReadingListDetailResponse,
  ReadingListNovelResponse,
  ReadingListResponse,
  ReadingListsResponse,
  ReadingProgressResponse,
  ReadingProgressUpdateResponse,
  PasswordChangeResponse,
  EmailChangeRequestResponse,
  EmailConfirmationKind,
  EmailConfirmationResponse,
  EmailConfirmationStatus,
  MfaMethod,
  PasswordResetConfirmResponse,
  PasswordResetRequestResponse,
  PasskeyAuthenticationOptionsResponse,
  PasskeyRegistrationOptionsResponse,
  PrivacySecuritySettingsResponse,
  ProfileFollowListResponse,
  ProfileVisibility,
  ProfileSettingsResponse,
  RankingPeriod,
  RankingResponse,
  ReportReason,
  ReportResponse,
  ReportStatus,
  ReorderArtworkImagesResponse,
  RevokeSessionsResponse,
  SearchSuggestionsResponse,
  SecurityApprovalAction,
  SecurityApprovalCodeResponse,
  SecurityApprovalResponse,
  SecuritySettingsResponse,
  SeriesVisibility,
  SortMode,
  StorageUnlockResponse,
  TagAlias,
  TagDetailResponse,
  TagImplication,
  TagPageSort,
  TagSubscriptionResponse,
  TagSubscriptionsResponse,
  UserNotification,
  UserCollection,
  UserProfileResponse,
  UpdateArtworkResponse,
  UnblockUserResponse,
  UploadResponse,
  UserRole,
  TotpSetupResponse
} from "../shared/types";

type HealthResponse = {
  ok: boolean;
  app: string;
  storage: {
    d1: boolean;
    r2: boolean;
  };
};

const reportReasonOptions: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam" },
  { value: "abuse", label: "Harassment or abuse" },
  { value: "illegal", label: "Illegal content" },
  { value: "copyright", label: "Copyright concern" },
  { value: "other", label: "Other" }
];

const reportStatusFilterOptions: { value: ReportStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" }
];

const reportTargetFilterOptions: { value: AdminReportTargetFilter; label: string }[] = [
  { value: "all", label: "All targets" },
  { value: "artwork", label: "Artworks" },
  { value: "novel", label: "Novels" },
  { value: "comment", label: "Comments" },
  { value: "user", label: "Users" }
];

const reportReasonFilterOptions: { value: AdminReportReasonFilter; label: string }[] = [
  { value: "all", label: "All reasons" },
  ...reportReasonOptions
];

const adminUserStatusFilterOptions: { value: AdminUserStatusFilter; label: string }[] = [
  { value: "all", label: "All accounts" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "unverified", label: "Unverified" },
  { value: "moderator", label: "Moderators" },
  { value: "admin", label: "Admins" }
];

const userRoleOptions: { value: UserRole; label: string }[] = [
  { value: "member", label: "Member" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Administrator" }
];

const matureFilterOptions: { value: MatureFilter; label: string }[] = [
  { value: "all", label: "All ratings" },
  { value: "general", label: "General" },
  { value: "restricted", label: "Restricted" },
  { value: "adult", label: "Adult" }
];

const novelSortOptions: { value: NovelSortMode; label: string; icon: typeof Grid3X3 }[] = [
  { value: "newest", label: "Newest", icon: Grid3X3 },
  { value: "most_liked", label: "Most liked", icon: Heart },
  { value: "most_bookmarked", label: "Most saved", icon: Bookmark },
  { value: "most_viewed", label: "Most read", icon: Eye },
  { value: "word_count", label: "Longest", icon: NotebookText }
];

const artworkVisibilityOptions: {
  value: ArtworkVisibility;
  label: string;
  icon: typeof Eye;
}[] = [
  { value: "public", label: "Public", icon: Eye },
  { value: "unlisted", label: "Unlisted", icon: EyeOff },
  { value: "private", label: "Private", icon: Lock }
];

const novelVisibilityOptions: {
  value: NovelVisibility;
  label: string;
  icon: typeof Eye;
}[] = [
  { value: "public", label: "Public", icon: Eye },
  { value: "unlisted", label: "Unlisted", icon: EyeOff },
  { value: "private", label: "Private", icon: Lock }
];

const profileVisibilityOptions: {
  value: ProfileVisibility;
  label: string;
  icon: typeof Eye;
}[] = [
  { value: "public", label: "Public", icon: Eye },
  { value: "members", label: "Members", icon: UserRound },
  { value: "private", label: "Private", icon: Lock }
];

const donationLinks = [
  { label: "Ko-fi", href: "https://ko-fi.com/xiaoyuan151" },
  { label: "Buy Me a Coffee", href: "https://buymeacoffee.com/xiaoyuan151" }
];

const donationWallets = [
  { label: "BTC", value: "3DPDaQ63u7nKJpc1jYgrPQTmu5vfgaWpUB" },
  { label: "ERC20 / BEP20", value: "0xA57F5F34f6a0B8f44C3363dBA6Dd996f801A0500" },
  { label: "TRC20", value: "TUVwPUf1NMFUbeuLQ91Qa4fPDWzZsxEwyF" }
];

const collectionDiscoverySortOptions: {
  value: CollectionDiscoverySort;
  label: string;
  icon: typeof Calendar;
}[] = [
  { value: "updated", label: "Updated", icon: Calendar },
  { value: "largest", label: "Largest", icon: Images }
];

const creatorDiscoverySortOptions: {
  value: CreatorDiscoverySort;
  label: string;
  icon: typeof UserPlus;
}[] = [
  { value: "popular", label: "Popular", icon: Flame },
  { value: "active", label: "Active", icon: Activity },
  { value: "newest", label: "Newest", icon: Calendar }
];

const tagPageSortOptions: {
  value: TagPageSort;
  label: string;
  icon: typeof Grid3X3;
}[] = [
  { value: "latest", label: "Latest", icon: Grid3X3 },
  { value: "popular", label: "Popular", icon: Flame },
  { value: "rising", label: "Rising", icon: TrendingUp }
];

const numberFormat = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1
});

const dateFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric"
});

const fullDateFormat = new Intl.DateTimeFormat("en", {
  month: "long",
  day: "numeric",
  year: "numeric"
});

const formatCount = (value: number) => numberFormat.format(value);

const formatFileSize = (bytes: number) => {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${Math.ceil(bytes / 1024)} KB`;
  }
  return `${bytes} B`;
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : fullDateFormat.format(date);
};

const formatReportReason = (reason: string) =>
  reportReasonOptions.find((option) => option.value === reason)?.label ?? reason;

const formatUserRole = (role: UserRole) =>
  userRoleOptions.find((option) => option.value === role)?.label ?? role;

const formatAuditAction = (action: string) =>
  action
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const parseTagListInput = (value: string) =>
  Array.from(
    new Set(
      value
        .split(/[\n,]+/)
        .map((tag) => tag.replace(/^#/, "").trim().toLowerCase())
        .filter(Boolean)
        .filter((tag) => tag.length <= 64 && !/[<>/]/.test(tag))
    )
  ).slice(0, 80);

const classNames = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

const csrfHeaderName = "x-csrf-token";
const policyUpdatedDate = "June 7, 2026";

const arrayBufferToBase64Url = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};

const base64UrlToArrayBuffer = (value: string) => {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
};

const passkeyCreationOptions = (
  response: PasskeyRegistrationOptionsResponse
): PublicKeyCredentialCreationOptions => ({
  ...response.publicKey,
  challenge: base64UrlToArrayBuffer(response.publicKey.challenge),
  user: {
    ...response.publicKey.user,
    id: base64UrlToArrayBuffer(response.publicKey.user.id)
  },
  excludeCredentials: response.publicKey.excludeCredentials.map((credential) => ({
    ...credential,
    id: base64UrlToArrayBuffer(credential.id),
    transports: credential.transports as AuthenticatorTransport[] | undefined
  }))
});

const passkeyRequestOptions = (
  response: PasskeyAuthenticationOptionsResponse
): PublicKeyCredentialRequestOptions => ({
  ...response.publicKey,
  challenge: base64UrlToArrayBuffer(response.publicKey.challenge),
  allowCredentials: response.publicKey.allowCredentials?.map((credential) => ({
    ...credential,
    id: base64UrlToArrayBuffer(credential.id),
    transports: credential.transports as AuthenticatorTransport[] | undefined
  }))
});

const passkeyCreationPayload = (credential: PublicKeyCredential, name: string) => {
  const response = credential.response as AuthenticatorAttestationResponse;
  return {
    id: credential.id,
    rawId: arrayBufferToBase64Url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
      attestationObject: arrayBufferToBase64Url(response.attestationObject)
    },
    transports: response.getTransports?.() ?? [],
    name
  };
};

const passkeyAssertionPayload = (credential: PublicKeyCredential, rememberMe = false) => {
  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    id: credential.id,
    rawId: arrayBufferToBase64Url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
      authenticatorData: arrayBufferToBase64Url(response.authenticatorData),
      signature: arrayBufferToBase64Url(response.signature),
      userHandle: response.userHandle ? arrayBufferToBase64Url(response.userHandle) : null
    },
    rememberMe
  };
};

const matureAccessLabel = (matureAccess: MatureAccess | null) => {
  if (!matureAccess) {
    return "Mature access is checking.";
  }
  if (matureAccess.allowed) {
    return "Mature content is visible.";
  }
  if (matureAccess.reason === "region_restricted") {
    return matureAccess.country
      ? `Mature content is hidden in ${matureAccess.country}.`
      : "Mature content is hidden in this region.";
  }
  if (matureAccess.reason === "sign_in_required") {
    return "Sign in and verify your age to view mature content.";
  }
  if (matureAccess.reason === "age_verification_required") {
    return "Verify your age to view mature content.";
  }
  return "Mature content is off.";
};

const avatarInitial = (value: string) => value.trim().slice(0, 1).toUpperCase() || "?";

function DefaultAvatar({ className, name }: { className?: string; name: string }) {
  return (
    <span className={classNames("default-avatar", className)} aria-hidden="true">
      {avatarInitial(name)}
    </span>
  );
}

const matureRatingLabel = (rating: MatureRating) => {
  if (rating === "adult") {
    return "Adult";
  }
  if (rating === "restricted") {
    return "Restricted";
  }
  return "General";
};

const artworkVisibilityLabel = (visibility: ArtworkVisibility) =>
  artworkVisibilityOptions.find((option) => option.value === visibility)?.label ?? "Public";

const novelVisibilityLabel = (visibility: NovelVisibility) =>
  novelVisibilityOptions.find((option) => option.value === visibility)?.label ?? "Public";

const slugifyNovelTocId = (value: string, fallbackIndex: number) =>
  `sec_${value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40) || `section_${fallbackIndex + 1}`}`;

const extractNovelToc = (content: string, format: NovelContentFormat) => {
  if (format !== "markdown") {
    return [] as NovelTocItem[];
  }
  return content
    .split(/\r?\n/)
    .map((line, index) => {
      const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
      if (!match) {
        return null;
      }
      return {
        id: slugifyNovelTocId(match[2], index),
        text: match[2],
        level: match[1].length
      } satisfies NovelTocItem;
    })
    .filter((item): item is NovelTocItem => Boolean(item));
};

const renderNovelMarkdown = (markdown: string) => {
  const toc = extractNovelToc(markdown, "markdown");
  const rendered = marked.parse(markdown, { breaks: true, gfm: true }) as string;
  if (typeof window === "undefined") {
    return DOMPurify.sanitize(rendered, { USE_PROFILES: { html: true } });
  }
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(rendered, "text/html");
  const headings = Array.from(doc.querySelectorAll("h1, h2, h3, h4, h5, h6"));
  headings.forEach((heading, index) => {
    const tocItem = toc[index];
    if (tocItem) {
      heading.id = tocItem.id;
    }
  });
  return DOMPurify.sanitize(doc.body.innerHTML, { USE_PROFILES: { html: true } });
};

const estimateReadMinutes = (wordCount: number) => Math.max(1, Math.ceil(wordCount / 200));

type ViewMode =
  | "illustrations"
  | "artwork"
  | "novels"
  | "novel"
  | "dashboard"
  | "profile"
  | "tag"
  | "analytics"
  | "creatorDiscover"
  | "rankings"
  | "notifications"
  | "collections"
  | "collectionDiscover"
  | "collection"
  | "seriesList"
  | "series"
  | "profileSettings"
  | "privacySecurity"
  | "discordVerification"
  | "emailConfirmation"
  | "terms"
  | "privacy";
const novelSectionSlugs = [
  "home",
  "following",
  "creators",
  "tags",
  "novels",
  "rankings",
  "bookmarks",
  "collections",
  "terms",
  "privacy"
] as const;
type NovelSection = (typeof novelSectionSlugs)[number];
const novelSectionSlugSet = new Set<string>(novelSectionSlugs);
const authRequiredNovelSections = new Set<NovelSection>(["following", "tags", "bookmarks"]);
const novelSectionRequiresAuth = (section: NovelSection) => authRequiredNovelSections.has(section);
const novelSectionAuthNotice = (section: NovelSection) => {
  if (section === "following") {
    return "Sign in to view novels from authors you follow.";
  }
  if (section === "tags") {
    return "Sign in to follow novel tags.";
  }
  if (section === "bookmarks") {
    return "Sign in to view your bookmarks.";
  }
  return "Sign in to continue.";
};
const securityApprovalActionLabels: Record<SecurityApprovalAction, string> = {
  discord_link: "connect Discord",
  totp_start: "set up authenticator",
  totp_disable: "disable authenticator",
  email_mfa_enable: "enable email codes",
  email_mfa_disable: "disable email codes",
  passkey_add: "add a passkey",
  passkey_delete: "remove a passkey"
};
type AuthMode = "login" | "register";
type AuthFlow = "auth" | "resetRequest" | "resetConfirm" | "mfa";
type TurnstileAction =
  | AuthMode
  | "resend"
  | "upload"
  | "comment"
  | "report"
  | "email-confirm"
  | "discord-confirm"
  | "password-reset"
  | "password-reset-confirm";
type ArtworkEditInput = {
  title: string;
  caption: string;
  tags: string;
  matureRating: MatureRating;
  visibility: ArtworkVisibility;
};
type NovelEditInput = {
  title: string;
  content: string;
  description: string;
  tags: string;
  matureRating: MatureRating;
  visibility: NovelVisibility;
  isDraft: boolean;
  coverColor: string;
  contentFormat: NovelContentFormat;
  seriesId: string | null;
  chapterNumber: number | null;
};
type NovelImportInput = {
  title: string;
  tags: string;
  matureRating: MatureRating;
  visibility: NovelVisibility;
  coverColor: string;
};
type ReadingListSettingsInput = {
  title: string;
  description: string;
  visibility: CollectionVisibility;
};
type NovelSeriesSettingsInput = {
  title: string;
  description: string;
};
type CollectionSettingsInput = {
  name: string;
  description: string;
  visibility: CollectionVisibility;
  coverArtworkId: string | null;
};
type SeriesSettingsInput = {
  title: string;
  description: string;
  visibility: SeriesVisibility;
  coverArtworkId: string | null;
};

type RouteState = {
  view: ViewMode;
  routeContext: RouteContext;
  username: string;
  artworkId: string;
  novelId: string;
  novelSection: NovelSection;
  collectionId: string;
  seriesId: string;
  tag: string;
};
type RouteContext = "illustrations" | "novels";

const routeState = (
  view: ViewMode,
  values: Partial<Omit<RouteState, "view">> = {}
): RouteState => ({
  view,
  routeContext: values.routeContext ?? (view === "novels" || view === "novel" ? "novels" : "illustrations"),
  username: values.username ?? "",
  artworkId: values.artworkId ?? "",
  novelId: values.novelId ?? "",
  novelSection: values.novelSection ?? "home",
  collectionId: values.collectionId ?? "",
  seriesId: values.seriesId ?? "",
  tag: values.tag ?? ""
});

const getInitialRoute = (): RouteState => {
  if (typeof window === "undefined") {
    return routeState("illustrations");
  }
  if (window.location.hash === "#dashboard") {
    return routeState("dashboard");
  }
  const pathname = decodeURIComponent(window.location.pathname);
  if (pathname === "/") {
    return routeState("illustrations");
  }
  if (pathname.startsWith("/artworks/")) {
    return routeState("artwork", {
      artworkId: pathname.slice("/artworks/".length).replace(/^\/+|\/+$/g, "")
    });
  }
  if (pathname.startsWith("/novels/")) {
    const novelPath = pathname.slice("/novels/".length).replace(/^\/+|\/+$/g, "");
    if (novelPath.startsWith("@")) {
      return routeState("profile", {
        routeContext: "novels",
        username: novelPath.slice(1).replace(/^\/+|\/+$/g, "")
      });
    }
    if (novelPath === "notifications") {
      return routeState("notifications", { routeContext: "novels" });
    }
    if (novelPath === "analytics") {
      return routeState("analytics", { routeContext: "novels" });
    }
    if (novelPath === "my-folders") {
      return routeState("collections", { routeContext: "novels" });
    }
    if (novelPath.startsWith("my-folders/")) {
      return routeState("collection", {
        routeContext: "novels",
        collectionId: novelPath.slice("my-folders/".length).replace(/^\/+|\/+$/g, "")
      });
    }
    if (novelPath === "my-series") {
      return routeState("seriesList", { routeContext: "novels" });
    }
    if (novelPath.startsWith("my-series/")) {
      return routeState("series", {
        routeContext: "novels",
        seriesId: novelPath.slice("my-series/".length).replace(/^\/+|\/+$/g, "")
      });
    }
    if (novelPath === "settings/profile") {
      return routeState("profileSettings", { routeContext: "novels" });
    }
    if (novelPath === "settings/privacy-security") {
      return routeState("privacySecurity", { routeContext: "novels" });
    }
    if (novelPath === "dashboard") {
      return routeState("dashboard", { routeContext: "novels" });
    }
    if (novelSectionSlugSet.has(novelPath)) {
      return routeState("novels", {
        routeContext: "novels",
        novelSection: novelPath as NovelSection
      });
    }
    return routeState("novel", {
      routeContext: "novels",
      novelId: novelPath
    });
  }
  if (pathname === "/novels") {
    return routeState("novels", { routeContext: "novels", novelSection: "home" });
  }
  if (pathname.startsWith("/tags/")) {
    return routeState("tag", {
      tag: pathname.slice("/tags/".length).replace(/^\/+|\/+$/g, "")
    });
  }
  if (pathname === "/analytics") {
    return routeState("analytics");
  }
  if (pathname === "/creators") {
    return routeState("creatorDiscover");
  }
  if (pathname === "/rankings") {
    return routeState("rankings");
  }
  if (pathname === "/notifications") {
    return routeState("notifications");
  }
  if (pathname === "/collections/discover") {
    return routeState("collectionDiscover");
  }
  if (pathname.startsWith("/collections/")) {
    return routeState("collection", {
      collectionId: pathname.slice("/collections/".length).replace(/^\/+|\/+$/g, ""),
    });
  }
  if (pathname === "/collections") {
    return routeState("collections");
  }
  if (pathname.startsWith("/series/")) {
    return routeState("series", {
      seriesId: pathname.slice("/series/".length).replace(/^\/+|\/+$/g, ""),
    });
  }
  if (pathname === "/series") {
    return routeState("seriesList");
  }
  if (pathname.startsWith("/@")) {
    return routeState("profile", {
      username: pathname.slice(2).replace(/^\/+|\/+$/g, ""),
    });
  }
  if (pathname === "/settings/profile") {
    return routeState("profileSettings");
  }
  if (pathname === "/settings/privacy-security") {
    return routeState("privacySecurity");
  }
  if (pathname === "/discord-verification") {
    return routeState("discordVerification");
  }
  if (pathname === "/email-confirmation") {
    return routeState("emailConfirmation");
  }
  if (pathname === "/terms") {
    return routeState("terms");
  }
  if (pathname === "/privacy") {
    return routeState("privacy");
  }
  return routeState("illustrations");
};

function SidebarDonateCard() {
  return (
    <section className="sidebar-donate" aria-label="Support XiaoYuan151">
      <div className="sidebar-donate-heading">
        <Heart size={17} />
        <span>Donate</span>
      </div>
      <p>Support XiaoYuan151 and NEHub development.</p>
      <div className="sidebar-donate-links">
        {donationLinks.map((link) => (
          <a href={link.href} key={link.href} target="_blank" rel="noreferrer">
            {link.label}
            <ExternalLink size={13} />
          </a>
        ))}
      </div>
      <div className="sidebar-donate-wallets">
        {donationWallets.map((wallet) => (
          <span key={wallet.label}>
            <strong>{wallet.label}</strong>
            <code>{wallet.value}</code>
          </span>
        ))}
      </div>
    </section>
  );
}

function App() {
  const initialRoute = useMemo(getInitialRoute, []);
  const [gallery, setGallery] = useState<GalleryResponse | null>(null);
  const [rankingData, setRankingData] = useState<RankingResponse | null>(null);
  const [rankingPeriod, setRankingPeriod] = useState<RankingPeriod>("daily");
  const [novelRankingData, setNovelRankingData] = useState<NovelRankingResponse | null>(null);
  const [novelRankingPeriod, setNovelRankingPeriod] = useState<RankingPeriod>("daily");
  const [readingProgressData, setReadingProgressData] = useState<ReadingProgressResponse | null>(null);
  const [activityData, setActivityData] = useState<ActivityResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStatsResponse | null>(null);
  const [adminReports, setAdminReports] = useState<AdminReportsResponse | null>(null);
  const [adminReportStatus, setAdminReportStatus] = useState<ReportStatus>("open");
  const [adminReportTarget, setAdminReportTarget] = useState<AdminReportTargetFilter>("all");
  const [adminReportReason, setAdminReportReason] = useState<AdminReportReasonFilter>("all");
  const [adminReportLimit, setAdminReportLimit] = useState(50);
  const [adminUsers, setAdminUsers] = useState<AdminUsersResponse | null>(null);
  const [adminUserQuery, setAdminUserQuery] = useState("");
  const [adminUserStatus, setAdminUserStatus] = useState<AdminUserStatusFilter>("all");
  const [adminUserLimit, setAdminUserLimit] = useState(40);
  const [adminTags, setAdminTags] = useState<AdminTagsResponse | null>(null);
  const [adminAuditLog, setAdminAuditLog] = useState<AdminAuditLogResponse | null>(null);
  const [adminArtworkReviews, setAdminArtworkReviews] = useState<AdminArtworkReviewsResponse | null>(null);
  const [dashboardMessage, setDashboardMessage] = useState("");
  const [authConfig, setAuthConfig] = useState<AuthConfigResponse | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [csrfToken, setCsrfToken] = useState("");
  const [storageUnlockSubmitting, setStorageUnlockSubmitting] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [notifications, setNotifications] = useState<NotificationsResponse | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [tagSubscriptions, setTagSubscriptions] = useState<TagSubscriptionsResponse | null>(null);
  const [collections, setCollections] = useState<CollectionsResponse | null>(null);
  const [seriesList, setSeriesList] = useState<ArtworkSeriesListResponse | null>(null);
  const [readingLists, setReadingLists] = useState<ReadingListsResponse | null>(null);
  const [novelSeriesList, setNovelSeriesList] = useState<NovelSeriesListResponse | null>(null);
  const canAdminister = currentUser?.role === "admin";
  const canModerate = currentUser?.role === "admin" || currentUser?.role === "moderator";
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [passwordResetToken, setPasswordResetToken] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [view, setView] = useState<ViewMode>(initialRoute.view);
  const [routeContext, setRouteContext] = useState<"illustrations" | "novels">(initialRoute.routeContext);
  const [profileUsername, setProfileUsername] = useState(initialRoute.username);
  const [routeArtworkId, setRouteArtworkId] = useState(initialRoute.artworkId);
  const [routeNovelId, setRouteNovelId] = useState(initialRoute.novelId);
  const [routeNovelSection, setRouteNovelSection] = useState<NovelSection>(initialRoute.novelSection);
  const [routeCollectionId, setRouteCollectionId] = useState(initialRoute.collectionId);
  const [routeSeriesId, setRouteSeriesId] = useState(initialRoute.seriesId);
  const [routeTag, setRouteTag] = useState(initialRoute.tag);
  const [sort, setSort] = useState<SortMode>("latest");
  const [illustrationQuery, setIllustrationQuery] = useState("");
  const [novelQuery, setNovelQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestionsResponse | null>(null);
  const [searchSuggestionsOpen, setSearchSuggestionsOpen] = useState(false);
  const [searchSuggestionsLoading, setSearchSuggestionsLoading] = useState(false);
  const [activeTag, setActiveTag] = useState("");
  const [illustrationMatureFilter, setIllustrationMatureFilter] = useState<MatureFilter>("all");
  const [novelMatureFilter, setNovelMatureFilter] = useState<MatureFilter>("all");
  const [activeNovelTag, setActiveNovelTag] = useState("");
  const [novelSortMode, setNovelSortMode] = useState<NovelSortMode>("newest");
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [artworkDetail, setArtworkDetail] = useState<ArtworkResponse | null>(null);
  const [novelsData, setNovelsData] = useState<NovelListResponse | null>(null);
  const [followedNovelsData, setFollowedNovelsData] = useState<NovelListResponse | null>(null);
  const [novelDetail, setNovelDetail] = useState<NovelResponse | null>(null);
  const [novelLoading, setNovelLoading] = useState(false);
  const [novelFormOpen, setNovelFormOpen] = useState(false);
  const [novelFormMode, setNovelFormMode] = useState<"create" | "edit">("create");
  const [novelFormNovel, setNovelFormNovel] = useState<Novel | null>(null);
  const [novelFormMessage, setNovelFormMessage] = useState("");
  const [novelFormSubmitting, setNovelFormSubmitting] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadSubmitting, setUploadSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [postAuthSort, setPostAuthSort] = useState<SortMode | null>(null);
  const [postAuthNovelSection, setPostAuthNovelSection] = useState<NovelSection | null>(null);
  const [galleryLoadingMore, setGalleryLoadingMore] = useState(false);
  const [contentAccessRevision, setContentAccessRevision] = useState(0);
  const authOpeningRef = useRef(false);
  const isNovelSection = routeContext === "novels";
  const isIllustrationsSection = view === "illustrations" || view === "artwork";

  const refreshAuthSession = useCallback(async () => {
    const response = await fetch("/api/auth/session", { credentials: "include" });
    const session = (await response.json()) as AuthSessionResponse;
    setCurrentUser(session.user);
    setCsrfToken(session.csrfToken ?? "");
    return session;
  }, []);

  const galleryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("sort", sort);
    params.set("limit", "36");
    if (illustrationQuery.trim()) {
      params.set("q", illustrationQuery.trim());
    }
    if (activeTag) {
      params.set("tag", activeTag);
    }
    if (illustrationMatureFilter !== "all") {
      params.set("rating", illustrationMatureFilter);
    }
    return params;
  }, [activeTag, illustrationMatureFilter, illustrationQuery, sort]);
  const galleryUrl = useMemo(() => `/api/gallery?${galleryParams.toString()}`, [galleryParams]);
  const novelParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", "24");
    if (novelQuery.trim()) {
      params.set("q", novelQuery.trim());
    }
    if (novelMatureFilter !== "all") {
      params.set("rating", novelMatureFilter);
    }
    if (activeNovelTag) {
      params.set("tag", activeNovelTag);
    }
    if (novelSortMode !== "newest") {
      params.set("sort", novelSortMode);
    }
    return params;
  }, [activeNovelTag, novelMatureFilter, novelQuery, novelSortMode]);
  const novelsUrl = useMemo(() => `/api/novels?${novelParams.toString()}`, [novelParams]);

  useEffect(() => {
    if (!isIllustrationsSection) {
      setSearchSuggestions(null);
      setSearchSuggestionsLoading(false);
      setSearchSuggestionsOpen(false);
      return;
    }

    const search = illustrationQuery.trim();
    if (search.length < 2) {
      setSearchSuggestions(null);
      setSearchSuggestionsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearchSuggestionsLoading(true);
      fetch(`/api/search/suggestions?q=${encodeURIComponent(search)}&limit=5`, {
        credentials: "include",
        signal: controller.signal
      })
        .then(async (response) => {
          const payload = (await response.json()) as SearchSuggestionsResponse | { message?: string };
          if (!response.ok || !("query" in payload)) {
            throw new Error(
              ("message" in payload ? payload.message : undefined) ??
                "Search suggestions could not be loaded."
            );
          }
          return payload;
        })
        .then((payload) => {
          setSearchSuggestions(payload);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
          console.error("Unable to load search suggestions", error);
          setSearchSuggestions(null);
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setSearchSuggestionsLoading(false);
          }
        });
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [contentAccessRevision, currentUser?.id, illustrationQuery, isIllustrationsSection]);

  useEffect(() => {
    if (!isIllustrationsSection) {
      return;
    }

    let cancelled = false;

    fetch(galleryUrl, { credentials: "include" })
      .then((response) => response.json() as Promise<GalleryResponse>)
      .then((nextGallery) => {
        if (!cancelled) {
          setGallery(nextGallery);
        }
      })
      .catch((error: unknown) => {
        console.error("Unable to load gallery", error);
      });

    return () => {
      cancelled = true;
    };
  }, [contentAccessRevision, currentUser?.id, galleryUrl, isIllustrationsSection]);

  useEffect(() => {
    if (view !== "novels") {
      return;
    }

    let cancelled = false;
    fetch(novelsUrl, { credentials: "include" })
      .then(async (response) => {
        const payload = (await response.json()) as NovelListResponse | { message?: string };
        if (!response.ok || !("novels" in payload)) {
          throw new Error(
            ("message" in payload ? payload.message : undefined) ?? "Works could not be loaded."
          );
        }
        return payload;
      })
      .then((payload) => {
        if (!cancelled) {
          setNovelsData(payload);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setNovelsData(null);
        }
        console.error("Unable to load novels", error);
      });

    return () => {
      cancelled = true;
    };
  }, [contentAccessRevision, currentUser?.id, novelsUrl, view]);

  useEffect(() => {
    if (!currentUser || !isNovelSection) {
      setFollowedNovelsData(null);
      return;
    }

    let cancelled = false;
    fetch("/api/novels/feed?limit=24", { credentials: "include" })
      .then(async (response) => {
        const payload = (await response.json()) as NovelListResponse | { message?: string };
        if (!response.ok || !("novels" in payload)) {
          throw new Error(
            ("message" in payload ? payload.message : undefined) ??
              "Followed novels could not be loaded."
          );
        }
        return payload;
      })
      .then((payload) => {
        if (!cancelled) {
          setFollowedNovelsData(payload);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setFollowedNovelsData(null);
        }
        console.error("Unable to load followed novels", error);
      });

    return () => {
      cancelled = true;
    };
  }, [contentAccessRevision, currentUser?.id, isNovelSection]);

  useEffect(() => {
    if (!isIllustrationsSection && view !== "rankings") {
      return;
    }

    let cancelled = false;

    fetch(`/api/rankings?period=${rankingPeriod}&limit=8`, { credentials: "include" })
      .then((response) => response.json() as Promise<RankingResponse>)
      .then((payload) => {
        if (!cancelled) {
          setRankingData(payload);
        }
      })
      .catch((error: unknown) => {
        console.error("Unable to load rankings", error);
      });

    return () => {
      cancelled = true;
    };
  }, [contentAccessRevision, currentUser?.id, isIllustrationsSection, rankingPeriod, view]);

  useEffect(() => {
    if (!isNovelSection) {
      return;
    }

    let cancelled = false;

    fetch(`/api/novels/rankings?period=${novelRankingPeriod}&limit=12`, {
      credentials: "include"
    })
      .then(async (response) => {
        const payload = (await response.json()) as NovelRankingResponse | { message?: string };
        if (!response.ok || !("rankings" in payload)) {
          throw new Error(
            ("message" in payload ? payload.message : undefined) ??
              "Novel rankings could not be loaded."
          );
        }
        return payload;
      })
      .then((payload) => {
        if (!cancelled) {
          setNovelRankingData(payload);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setNovelRankingData(null);
        }
        console.error("Unable to load novel rankings", error);
      });

    return () => {
      cancelled = true;
    };
  }, [contentAccessRevision, currentUser?.id, isNovelSection, novelRankingPeriod]);

  useEffect(() => {
    if (!currentUser || !isNovelSection) {
      setReadingProgressData(null);
      return;
    }

    let cancelled = false;
    fetch("/api/novels/reading-progress?limit=8", { credentials: "include" })
      .then(async (response) => {
        const payload = (await response.json()) as ReadingProgressResponse | { message?: string };
        if (!response.ok || !("progress" in payload)) {
          throw new Error(
            ("message" in payload ? payload.message : undefined) ??
              "Reading progress could not be loaded."
          );
        }
        return payload;
      })
      .then((payload) => {
        if (!cancelled) {
          setReadingProgressData(payload);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setReadingProgressData(null);
        }
        console.error("Unable to load reading progress", error);
      });

    return () => {
      cancelled = true;
    };
  }, [contentAccessRevision, currentUser?.id, isNovelSection]);

  useEffect(() => {
    let cancelled = false;
    const scope = currentUser ? "following" : "global";

    fetch(`/api/activity?scope=${scope}&limit=8`, { credentials: "include" })
      .then(async (response) => {
        const payload = (await response.json()) as ActivityResponse | { message?: string };
        if (!response.ok) {
          const message =
            "message" in payload && payload.message ? payload.message : "Unable to load activity.";
          throw new Error(message);
        }
        if (!("activities" in payload)) {
          throw new Error("Unable to load activity.");
        }
        return payload;
      })
      .then((payload) => {
        if (!cancelled) {
          setActivityData(payload);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setActivityData(null);
        }
        console.error("Unable to load activity", error);
      });

    return () => {
      cancelled = true;
    };
  }, [contentAccessRevision, currentUser?.id]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/config")
      .then((response) => response.json() as Promise<AuthConfigResponse>)
      .then((config) => {
        if (!cancelled) {
          setAuthConfig(config);
        }
      })
      .catch((error: unknown) => {
        console.error("Unable to load auth config", error);
      });

    refreshAuthSession()
      .catch((error: unknown) => {
        console.error("Unable to load auth session", error);
      })
      .finally(() => {
        if (!cancelled) {
          setAuthReady(true);
        }
      });

    const params = new URLSearchParams(window.location.search);
    const verified = params.get("verified");
    const emailChanged = params.get("emailChanged");
    const resetToken = params.get("resetToken");
    const auth = params.get("auth");
    const authError = params.get("authError");
    if (verified === "1") {
      setAuthNotice("Email confirmation complete. Your account is verified.");
    } else if (verified === "invalid") {
      setAuthNotice("Email confirmation link is invalid or expired.");
    }
    if (emailChanged === "1") {
      setAuthNotice("Email change confirmed. Your sign-in email was updated successfully.");
    } else if (emailChanged === "security") {
      setAuthNotice("Sign in to the requesting account before confirming an email change.");
    } else if (emailChanged === "invalid") {
      setAuthNotice("Email change link is invalid or expired.");
    }
    if (resetToken) {
      setPasswordResetToken(resetToken);
      setAuthMode("login");
      setAuthOpen(true);
      setAuthNotice("Enter a new password to finish resetting your account.");
    }
    if (auth === "discord") {
      setAuthNotice("Signed in with Discord.");
    } else if (auth === "discord_linked") {
      setAuthNotice("Discord login connected.");
    } else if (authError) {
      const discordAuthErrors: Record<string, string> = {
        discord_config: "Discord sign-in is not configured.",
        discord_denied: "Discord sign-in was cancelled.",
        discord_email: "Discord did not provide a verified email address.",
        discord_failed: "Discord sign-in could not be completed.",
        discord_link_existing: "This account already has Discord login connected.",
        discord_link_failed: "Discord login could not be connected.",
        discord_link_session: "Sign in to the same account before connecting Discord login.",
        discord_link_taken: "That Discord account is already connected to another account.",
        discord_session: "Discord sign-in completed, but a local session could not be created.",
        discord_state: "Discord sign-in expired. Try again.",
        discord_suspended: "This account is suspended.",
        discord_unavailable: "Authentication is temporarily unavailable."
      };
      setAuthNotice(discordAuthErrors[authError] ?? "Discord sign-in could not be completed.");
    }
    if (verified || emailChanged || resetToken || auth || authError) {
      params.delete("verified");
      params.delete("emailChanged");
      params.delete("resetToken");
      params.delete("auth");
      params.delete("authError");
      const nextSearch = params.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`
      );
    }

    return () => {
      cancelled = true;
    };
  }, [refreshAuthSession]);

  useEffect(() => {
    if (!authReady || !currentUser || !authOpen || passwordResetToken) {
      return;
    }
    setAuthOpen(false);
    setPostAuthSort(null);
    setPostAuthNovelSection(null);
    setAuthNotice((notice) => (notice.startsWith("Sign in ") ? "" : notice));
  }, [authOpen, authReady, currentUser, passwordResetToken]);

  const loadNotifications = useCallback(async () => {
    if (!currentUser) {
      setNotifications(null);
      return;
    }
    const response = await fetch("/api/notifications", { credentials: "include" });
    const payload = (await response.json()) as NotificationsResponse | { message?: string };
    if (!response.ok) {
      const message =
        "message" in payload && payload.message
          ? payload.message
          : "Unable to load notifications.";
      throw new Error(message);
    }
    if (!("notifications" in payload)) {
      throw new Error("Unable to load notifications.");
    }
    setNotifications(payload);
  }, [currentUser]);

  const loadTagSubscriptions = useCallback(async () => {
    if (!currentUser) {
      setTagSubscriptions(null);
      return;
    }
    const response = await fetch("/api/tags/subscriptions", { credentials: "include" });
    const payload = (await response.json()) as TagSubscriptionsResponse | { message?: string };
    if (!response.ok) {
      const message =
        "message" in payload && payload.message
          ? payload.message
          : "Unable to load followed tags.";
      throw new Error(message);
    }
    if (!("tags" in payload)) {
      throw new Error("Unable to load followed tags.");
    }
    setTagSubscriptions(payload);
  }, [currentUser]);

  const loadCollections = useCallback(async () => {
    if (!currentUser) {
      setCollections(null);
      return;
    }
    const response = await fetch("/api/collections", { credentials: "include" });
    const payload = (await response.json()) as CollectionsResponse | { message?: string };
    if (!response.ok) {
      const message =
        "message" in payload && payload.message
          ? payload.message
          : "Unable to load collections.";
      throw new Error(message);
    }
    if (!("collections" in payload)) {
      throw new Error("Unable to load collections.");
    }
    setCollections(payload);
  }, [currentUser]);

  const loadSeries = useCallback(async () => {
    if (!currentUser) {
      setSeriesList(null);
      return;
    }
    const response = await fetch("/api/series", { credentials: "include" });
    const payload = (await response.json()) as ArtworkSeriesListResponse | { message?: string };
    if (!response.ok) {
      const message =
        "message" in payload && payload.message
          ? payload.message
          : "Unable to load series.";
      throw new Error(message);
    }
    if (!("series" in payload)) {
      throw new Error("Unable to load series.");
    }
    setSeriesList(payload);
  }, [currentUser]);

  const loadReadingLists = useCallback(async () => {
    if (!currentUser) {
      setReadingLists(null);
      return;
    }
    const response = await fetch("/api/reading-lists", { credentials: "include" });
    const payload = (await response.json()) as ReadingListsResponse | { message?: string };
    if (!response.ok) {
      const message =
        "message" in payload && payload.message
          ? payload.message
          : "Unable to load reading shelves.";
      throw new Error(message);
    }
    if (!("readingLists" in payload)) {
      throw new Error("Unable to load reading shelves.");
    }
    setReadingLists(payload);
  }, [currentUser]);

  const loadNovelSeries = useCallback(async () => {
    if (!currentUser) {
      setNovelSeriesList(null);
      return;
    }
    const response = await fetch("/api/novel-series", { credentials: "include" });
    const payload = (await response.json()) as NovelSeriesListResponse | { message?: string };
    if (!response.ok) {
      const message =
        "message" in payload && payload.message
          ? payload.message
          : "Unable to load serials.";
      throw new Error(message);
    }
    if (!("series" in payload)) {
      throw new Error("Unable to load serials.");
    }
    setNovelSeriesList(payload);
  }, [currentUser]);

  const loadAdminAuditLog = useCallback(async () => {
    if (!canAdminister) {
      setAdminAuditLog(null);
      return;
    }
    const response = await fetch("/api/admin/audit-log?limit=30", { credentials: "include" });
    const payload = (await response.json()) as AdminAuditLogResponse | { message?: string };
    if (!response.ok || !("entries" in payload)) {
      throw new Error(
        ("message" in payload ? payload.message : undefined) ?? "Unable to load audit log."
      );
    }
    setAdminAuditLog(payload);
  }, [canAdminister]);

  const loadAdminReports = useCallback(async () => {
    if (!canModerate) {
      setAdminReports(null);
      return;
    }
    const params = new URLSearchParams({
      status: adminReportStatus,
      targetType: adminReportTarget,
      reason: adminReportReason,
      limit: String(adminReportLimit)
    });
    const response = await fetch(`/api/admin/reports?${params.toString()}`, {
      credentials: "include"
    });
    const payload = (await response.json()) as AdminReportsResponse | { message?: string };
    if (!response.ok || !("reports" in payload)) {
      throw new Error(
        ("message" in payload ? payload.message : undefined) ?? "Unable to load reports."
      );
    }
    setAdminReports(payload);
  }, [
    adminReportLimit,
    adminReportReason,
    adminReportStatus,
    adminReportTarget,
    canModerate
  ]);

  const loadAdminUsers = useCallback(async () => {
    if (!canAdminister) {
      setAdminUsers(null);
      return;
    }
    const params = new URLSearchParams({
      status: adminUserStatus,
      limit: String(adminUserLimit)
    });
    const query = adminUserQuery.trim();
    if (query) {
      params.set("q", query);
    }
    const response = await fetch(`/api/admin/users?${params.toString()}`, {
      credentials: "include"
    });
    const payload = (await response.json()) as AdminUsersResponse | { message?: string };
    if (!response.ok || !("users" in payload)) {
      throw new Error(
        ("message" in payload ? payload.message : undefined) ?? "Unable to load users."
      );
    }
    setAdminUsers(payload);
  }, [adminUserLimit, adminUserQuery, adminUserStatus, canAdminister]);

  const loadAdminArtworkReviews = useCallback(async () => {
    if (!canModerate) {
      setAdminArtworkReviews(null);
      return;
    }
    const response = await fetch("/api/admin/artwork-reviews?limit=40", {
      credentials: "include"
    });
    const payload = (await response.json()) as AdminArtworkReviewsResponse | { message?: string };
    if (!response.ok || !("artworks" in payload)) {
      throw new Error(
        ("message" in payload ? payload.message : undefined) ??
          "Unable to load artwork reviews."
      );
    }
    setAdminArtworkReviews(payload);
  }, [canModerate]);

  useEffect(() => {
    if (!isIllustrationsSection) {
      setSearchSuggestions(null);
      setSearchSuggestionsLoading(false);
      setSearchSuggestionsOpen(false);
    }
  }, [isIllustrationsSection]);

  useEffect(() => {
    if (!authReady || !currentUser) {
      setNotifications(null);
      setNotificationsOpen(false);
      setTagSubscriptions(null);
      setCollections(null);
      setSeriesList(null);
      setReadingLists(null);
      setNovelSeriesList(null);
      setAdminReports(null);
      setAdminUsers(null);
      setAdminTags(null);
      setAdminAuditLog(null);
      setAdminArtworkReviews(null);
      return;
    }
    loadNotifications().catch((error: unknown) => {
      console.error("Unable to load notifications", error);
    });

    if (isNovelSection) {
      setTagSubscriptions(null);
      setCollections(null);
      setSeriesList(null);
      loadReadingLists().catch((error: unknown) => {
        console.error("Unable to load reading lists", error);
      });
      loadNovelSeries().catch((error: unknown) => {
        console.error("Unable to load novel series", error);
      });
      return;
    }

    setReadingLists(null);
    setNovelSeriesList(null);
    loadTagSubscriptions().catch((error: unknown) => {
      console.error("Unable to load tag subscriptions", error);
    });
    loadCollections().catch((error: unknown) => {
      console.error("Unable to load collections", error);
    });
    loadSeries().catch((error: unknown) => {
      console.error("Unable to load series", error);
    });
  }, [
    authReady,
    currentUser,
    isNovelSection,
    loadCollections,
    loadNotifications,
    loadNovelSeries,
    loadReadingLists,
    loadSeries,
    loadTagSubscriptions
  ]);

  useEffect(() => {
    if (view !== "dashboard") {
      return;
    }
    if (!authReady) {
      return;
    }
    if (!canModerate) {
      setDashboardMessage("Moderator access is required.");
      setView("illustrations");
      setRouteContext("illustrations");
      if (window.location.hash === "#dashboard") {
        window.history.pushState(null, "", window.location.pathname + window.location.search);
      }
      return;
    }

    fetch("/api/health")
      .then((response) => response.json() as Promise<HealthResponse>)
      .then(setHealth)
      .catch((error: unknown) => {
        console.error("Unable to load health state", error);
      });

    if (canAdminister) {
      fetch("/api/admin/stats", { credentials: "include" })
        .then(async (response) => {
          const payload = (await response.json()) as AdminStatsResponse | { message?: string };
          if (!response.ok) {
            const message =
              "message" in payload && payload.message
                ? payload.message
                : "Unable to load dashboard stats.";
            throw new Error(message);
          }
          return payload as AdminStatsResponse;
        })
        .then((stats) => {
          setAdminStats(stats);
          setDashboardMessage("");
        })
        .catch((error: unknown) => {
          setAdminStats(null);
          setDashboardMessage(error instanceof Error ? error.message : "Unable to load dashboard stats.");
        });
    } else {
      setAdminStats(null);
      setAdminUsers(null);
      setAdminTags(null);
      setAdminAuditLog(null);
    }

    loadAdminReports().catch((error: unknown) => {
      setAdminReports(null);
      setDashboardMessage(error instanceof Error ? error.message : "Unable to load reports.");
    });

    loadAdminUsers().catch((error: unknown) => {
      setAdminUsers(null);
      setDashboardMessage(error instanceof Error ? error.message : "Unable to load users.");
    });

    if (canAdminister) {
      fetch("/api/admin/tags", { credentials: "include" })
        .then(async (response) => {
          const payload = (await response.json()) as AdminTagsResponse | { message?: string };
          if (!response.ok) {
            const message =
              "message" in payload && payload.message ? payload.message : "Unable to load tags.";
            throw new Error(message);
          }
          if (!("aliases" in payload)) {
            throw new Error("Unable to load tags.");
          }
          return payload;
        })
        .then(setAdminTags)
        .catch((error: unknown) => {
          setAdminTags(null);
          setDashboardMessage(error instanceof Error ? error.message : "Unable to load tags.");
        });
    }

    loadAdminAuditLog().catch((error: unknown) => {
      setAdminAuditLog(null);
      setDashboardMessage(error instanceof Error ? error.message : "Unable to load audit log.");
    });

    loadAdminArtworkReviews().catch((error: unknown) => {
      setAdminArtworkReviews(null);
      setDashboardMessage(error instanceof Error ? error.message : "Unable to load artwork reviews.");
    });
  }, [
    authReady,
    canAdminister,
    canModerate,
    loadAdminAuditLog,
    loadAdminArtworkReviews,
    loadAdminReports,
    loadAdminUsers,
    view
  ]);

  useEffect(() => {
    const handleRouteChange = () => {
      const route = getInitialRoute();
      setView(route.view);
      setRouteContext(route.routeContext);
      setProfileUsername(route.username);
      setRouteArtworkId(route.artworkId);
      setRouteNovelId(route.novelId);
      setRouteNovelSection(route.novelSection);
      setRouteCollectionId(route.collectionId);
      setRouteSeriesId(route.seriesId);
      setRouteTag(route.tag);
      setSelectedArtwork(null);
      setArtworkDetail(null);
      setNovelDetail(null);
    };

    window.addEventListener("hashchange", handleRouteChange);
    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("hashchange", handleRouteChange);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  useEffect(() => {
    if (!authReady || currentUser || view !== "novels" || !novelSectionRequiresAuth(routeNovelSection)) {
      return;
    }
    setPostAuthSort(null);
    setPostAuthNovelSection(routeNovelSection);
    openAuth("login", novelSectionAuthNotice(routeNovelSection), {
      onAuthenticated: () => openNovelSection(routeNovelSection)
    });
    setSelectedArtwork(null);
    setArtworkDetail(null);
    setNovelDetail(null);
    pushRoute("/novels", "novels", "", "home", "", "", "", "novels");
  }, [authReady, currentUser, routeNovelSection, view]);

  useEffect(() => {
    if (!routeArtworkId) {
      return;
    }

    let cancelled = false;
    setDetailLoading(true);
    fetch(`/api/artworks/${encodeURIComponent(routeArtworkId)}`)
      .then(async (response) => {
        const payload = (await response.json()) as ArtworkResponse | { message?: string };
        if (!response.ok) {
          const message =
            "message" in payload && payload.message
              ? payload.message
              : "Artwork could not be loaded.";
          throw new Error(message);
        }
        if (!("artwork" in payload)) {
          throw new Error("Artwork could not be loaded.");
        }
        return payload;
      })
      .then((detail) => {
        if (!cancelled) {
          setArtworkDetail(detail);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setAuthNotice(error instanceof Error ? error.message : "Artwork could not be loaded.");
          setSelectedArtwork(null);
          setArtworkDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDetailLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [routeArtworkId]);

  useEffect(() => {
    if (!routeNovelId) {
      setNovelDetail(null);
      return;
    }

    let cancelled = false;
    setNovelLoading(true);
    fetch(`/api/novels/${encodeURIComponent(routeNovelId)}`, { credentials: "include" })
      .then(async (response) => {
        const payload = (await response.json()) as NovelResponse | { message?: string };
        if (!response.ok || !("novel" in payload)) {
          throw new Error(
            ("message" in payload ? payload.message : undefined) ?? "Work could not be loaded."
          );
        }
        return payload;
      })
      .then((detail) => {
        if (!cancelled) {
          setNovelDetail(detail);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setAuthNotice(error instanceof Error ? error.message : "Work could not be loaded.");
          setNovelDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setNovelLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [routeNovelId]);

  useEffect(() => {
    if (!selectedArtwork) {
      if (!routeArtworkId) {
        setArtworkDetail(null);
      }
      return;
    }
    if (selectedArtwork.id === routeArtworkId) {
      return;
    }

    let cancelled = false;
    setDetailLoading(true);
    fetch(`/api/artworks/${selectedArtwork.id}`)
      .then((response) => response.json() as Promise<ArtworkResponse>)
      .then((detail) => {
        if (!cancelled) {
          setArtworkDetail(detail);
        }
      })
      .catch((error: unknown) => {
        console.error("Unable to load artwork detail", error);
      })
      .finally(() => {
        if (!cancelled) {
          setDetailLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [routeArtworkId, selectedArtwork]);

  const artworks = gallery?.artworks ?? [];
  const prominentTags = gallery?.tags.slice(0, 12) ?? [];
  const subscribedTagSet = useMemo(
    () => new Set((tagSubscriptions?.tags ?? []).map((tag) => tag.toLowerCase())),
    [tagSubscriptions]
  );
  const rankingItems =
    rankingData?.rankings ??
    [...artworks]
      .sort((left, right) => right.likeCount - left.likeCount)
      .slice(0, 8)
      .map((artwork) => ({ artwork, score: artwork.likeCount }));
  const totalLikes = artworks.reduce((sum, artwork) => sum + artwork.likeCount, 0);
  const totalViews = artworks.reduce((sum, artwork) => sum + artwork.viewCount, 0);
  const novels = novelsData?.novels ?? [];
  const featuredNovel = novelsData?.featuredNovel ?? novels[0] ?? null;
  const totalNovelWords = novels.reduce((sum, novel) => sum + novel.wordCount, 0);
  const novelCreators = [...new Map(novels.map((novel) => [novel.creator.id, novel.creator])).values()];
  const followedNovelCreators = novelCreators.filter((creator) => creator.following);
  const followedNovelCreatorIds = new Set(followedNovelCreators.map((creator) => creator.id));
  const followedNovels =
    followedNovelsData?.novels ?? novels.filter((novel) => followedNovelCreatorIds.has(novel.creator.id));
  const novelRankingNovels =
    novelRankingData?.rankings.map((item) => item.novel) ??
    [...novels]
      .sort((left, right) => right.likeCount - left.likeCount || right.viewCount - left.viewCount)
      .slice(0, 8);
  const bookmarkedNovels = novels.filter((novel) => novel.bookmarked);
  const continueReadingItems = readingProgressData?.progress ?? [];
  const novelCollections = readingLists?.readingLists ?? [];
  const novelSectionTitleMap: Record<NovelSection, string> = {
    home: "Latest creator works",
    following: "Following",
    creators: "Creators",
    tags: "Tags",
    novels: "All works",
    rankings: "Rankings",
    bookmarks: "Bookmarks",
    collections: "Collections",
    terms: "Terms",
    privacy: "Privacy"
  };
  const novelSectionDescriptionMap: Record<NovelSection, string> = {
    home: activeTag
      ? `Works tagged #${activeTag}.`
      : "Fresh chapters, essays, and luminous fragments from NEHub creators.",
    following: "Works from creators you already follow.",
    creators: "Authors publishing across NEHub.",
    tags: "Browse the labels shaping the current fiction feed.",
    novels: "The complete readable shelf currently loaded from NEHub.",
    rankings: "A quick ranking view built from the current feed.",
    bookmarks: "A dedicated home for saved fiction once bookmarks are supported.",
    collections: "A dedicated home for grouped fiction once collections are supported.",
    terms: "Read the terms without leaving this section.",
    privacy: "Read the privacy policy without leaving this section."
  };
  const isBookmarksView = sort === "bookmarks";
  const isSubscriptionsView = sort === "subscriptions";
  const feedTitle = isBookmarksView
    ? "Bookmarked illustrations"
    : isSubscriptionsView
      ? "Followed tag works"
      : "Recommended illustrations";
  const feedMeta = isBookmarksView
    ? `${formatCount(artworks.length)} saved ${artworks.length === 1 ? "work" : "works"}`
    : isSubscriptionsView
      ? `${formatCount(tagSubscriptions?.tags.length ?? 0)} followed tags`
      : `${formatCount(totalLikes)} likes across ${formatCount(totalViews)} views`;
  const filterLabel = isBookmarksView
    ? "All bookmarks"
    : isSubscriptionsView
      ? "Subscribed tags"
      : "All work";
  const accountNotice = dashboardMessage || authNotice;
  const hasAccountNotice =
    view !== "emailConfirmation" &&
    view !== "discordVerification" &&
    Boolean(accountNotice || (currentUser && !currentUser.emailVerified));
  const activeSearchQuery = isNovelSection ? novelQuery : illustrationQuery;

  const pushRoute = (
    path: string,
    nextView: ViewMode,
    username = "",
    novelSection: NovelSection = "home",
    collectionId = "",
    seriesId = "",
    tag = "",
    nextRouteContext: "illustrations" | "novels" = path.startsWith("/novels") ? "novels" : "illustrations"
  ) => {
    setView(nextView);
    setRouteContext(nextRouteContext);
    setProfileUsername(username);
    setRouteArtworkId("");
    setRouteNovelId("");
    setRouteNovelSection(novelSection);
    setRouteCollectionId(collectionId);
    setRouteSeriesId(seriesId);
    setRouteTag(tag);
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== path) {
      window.history.pushState(null, "", path);
    }
  };

  const showIllustrations = (nextSort: SortMode) => {
    pushRoute("/", "illustrations");
    setSort(nextSort);
  };

  const showFollowingIllustrations = () => {
    if (!currentUser) {
      setPostAuthSort("following");
      setPostAuthNovelSection(null);
      openAuth("login", "Sign in to view works from creators you follow.", {
        onAuthenticated: () => showIllustrations("following")
      });
      return;
    }
    showIllustrations("following");
  };

  const openNovelSection = (section: NovelSection = "home") => {
    setSelectedArtwork(null);
    setArtworkDetail(null);
    setNovelDetail(null);
    if (section !== "novels") {
      setActiveNovelTag("");
    }
    if (section !== "home" && section !== "novels") {
      setNovelQuery("");
    }
    pushRoute(
      section === "home" ? "/novels" : `/novels/${section}`,
      "novels",
      "",
      section
    );
  };

  const showNovels = (section: NovelSection = "home") => {
    if (novelSectionRequiresAuth(section) && !currentUser) {
      setPostAuthSort(null);
      setPostAuthNovelSection(section);
      openAuth("login", novelSectionAuthNotice(section), {
        onAuthenticated: () => openNovelSection(section)
      });
      return;
    }
    openNovelSection(section);
  };

  const showBookmarks = () => {
    if (!currentUser) {
      setPostAuthSort("bookmarks");
      setPostAuthNovelSection(null);
      openAuth("login", "Sign in to view your bookmarks.", {
        onAuthenticated: () => showIllustrations("bookmarks")
      });
      return;
    }
    showIllustrations("bookmarks");
  };

  const showTagSubscriptions = () => {
    if (!currentUser) {
      setPostAuthSort("subscriptions");
      setPostAuthNovelSection(null);
      openAuth("login", "Sign in to follow tags.", {
        onAuthenticated: () => showIllustrations("subscriptions")
      });
      return;
    }
    showIllustrations("subscriptions");
  };

  const showTag = (tag: string) => {
    const cleaned = tag.replace(/^#/, "").trim();
    if (!cleaned) {
      return;
    }
    setSelectedArtwork(null);
    setArtworkDetail(null);
    setNovelDetail(null);
    pushRoute(`/tags/${encodeURIComponent(cleaned)}`, "tag", "", undefined, "", "", cleaned);
  };

  const showCreatorDiscover = () => {
    pushRoute("/creators", "creatorDiscover");
  };

  const showRankings = () => {
    pushRoute("/rankings", "rankings");
  };

  const showNotifications = () => {
    if (!currentUser) {
      openAuth("login", isNovelSection ? "Sign in to view alerts." : "Sign in to view notifications.", {
        onAuthenticated: () => {
          setNotificationsOpen(false);
          pushRoute(isNovelSection ? "/novels/notifications" : "/notifications", "notifications");
        }
      });
      return;
    }
    setNotificationsOpen(false);
    pushRoute(isNovelSection ? "/novels/notifications" : "/notifications", "notifications");
  };

  const showCollections = () => {
    if (!currentUser) {
      openAuth("login", isNovelSection ? "Sign in to manage reading shelves." : "Sign in to manage collections.", {
        onAuthenticated: () => pushRoute(isNovelSection ? "/novels/my-folders" : "/collections", "collections")
      });
      return;
    }
    pushRoute(isNovelSection ? "/novels/my-folders" : "/collections", "collections");
  };

  const showCollectionDiscover = () => {
    pushRoute("/collections/discover", "collectionDiscover");
  };

  const showCollection = (collectionId: string) => {
    if (!collectionId) {
      return;
    }
    setSelectedArtwork(null);
    setArtworkDetail(null);
    setNovelDetail(null);
    pushRoute(
      isNovelSection ? `/novels/my-folders/${encodeURIComponent(collectionId)}` : `/collections/${encodeURIComponent(collectionId)}`,
      "collection",
      "",
      "home",
      collectionId
    );
  };

  const showSeriesList = () => {
    if (!currentUser) {
      openAuth("login", isNovelSection ? "Sign in to manage serials." : "Sign in to manage series.", {
        onAuthenticated: () => pushRoute(isNovelSection ? "/novels/my-series" : "/series", "seriesList")
      });
      return;
    }
    pushRoute(isNovelSection ? "/novels/my-series" : "/series", "seriesList");
  };

  const showSeries = (seriesId: string) => {
    if (!seriesId) {
      return;
    }
    setSelectedArtwork(null);
    setArtworkDetail(null);
    setNovelDetail(null);
    pushRoute(
      isNovelSection ? `/novels/my-series/${encodeURIComponent(seriesId)}` : `/series/${encodeURIComponent(seriesId)}`,
      "series",
      "",
      "home",
      "",
      seriesId
    );
  };

  const showAnalytics = () => {
    if (!currentUser) {
      openAuth("login", isNovelSection ? "Sign in to view stats." : "Sign in to view creator analytics.", {
        onAuthenticated: () => pushRoute(isNovelSection ? "/novels/analytics" : "/analytics", "analytics")
      });
      return;
    }
    pushRoute(isNovelSection ? "/novels/analytics" : "/analytics", "analytics");
  };

  const showDashboard = () => {
    const openDashboard = () => {
      setAdminReportTarget(isNovelSection ? "novel" : "all");
      pushRoute(isNovelSection ? "/novels/dashboard" : "/#dashboard", "dashboard");
    };
    if (!currentUser) {
      openAuth("login", "", {
        onAuthenticated: (user) => {
          if (user.role === "admin" || user.role === "moderator") {
            openDashboard();
            return;
          }
          setDashboardMessage("Moderator access is required.");
        }
      });
      return;
    }
    if (!canModerate) {
      setDashboardMessage("Moderator access is required.");
      return;
    }
    openDashboard();
  };

  const showProfile = (username: string) => {
    const cleaned = username.replace(/^@/, "").trim();
    if (!cleaned) {
      return;
    }
    pushRoute(isNovelSection ? `/novels/@${encodeURIComponent(cleaned)}` : `/@${encodeURIComponent(cleaned)}`, "profile", cleaned);
  };

  const showProfileSettings = () => {
    if (!currentUser) {
      openAuth("login", "", {
        onAuthenticated: () => pushRoute(isNovelSection ? "/novels/settings/profile" : "/settings/profile", "profileSettings")
      });
      return;
    }
    pushRoute(isNovelSection ? "/novels/settings/profile" : "/settings/profile", "profileSettings");
  };

  const showPrivacySecurity = () => {
    if (!currentUser) {
      openAuth("login", "", {
        onAuthenticated: () =>
          pushRoute(isNovelSection ? "/novels/settings/privacy-security" : "/settings/privacy-security", "privacySecurity")
      });
      return;
    }
    pushRoute(isNovelSection ? "/novels/settings/privacy-security" : "/settings/privacy-security", "privacySecurity");
  };

  const showPolicy = (nextView: "terms" | "privacy") => {
    if (isNovelSection) {
      openNovelSection(nextView);
      return;
    }
    pushRoute(
      nextView === "terms" ? "/terms" : "/privacy",
      nextView
    );
  };

  const openArtwork = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setRouteArtworkId(artwork.id);
    setRouteNovelId("");
    setView("illustrations");
    setRouteContext("illustrations");
    setProfileUsername("");
    setRouteCollectionId("");
    setRouteSeriesId("");
    setRouteTag("");
    const path = `/artworks/${encodeURIComponent(artwork.id)}`;
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== path) {
      window.history.pushState(null, "", path);
    }
  };

  const openArtworkById = (artworkId: string) => {
    setSelectedArtwork(null);
    setArtworkDetail(null);
    setRouteArtworkId(artworkId);
    setRouteNovelId("");
    setView("artwork");
    setRouteContext("illustrations");
    setProfileUsername("");
    setRouteCollectionId("");
    setRouteSeriesId("");
    setRouteTag("");
    const path = `/artworks/${encodeURIComponent(artworkId)}`;
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== path) {
      window.history.pushState(null, "", path);
    }
  };

  const openArtworkPage = (artwork: Artwork) => {
    openArtworkById(artwork.id);
  };

  const openNovel = (novelId: string) => {
    if (!novelId) {
      return;
    }
    setSelectedArtwork(null);
    setArtworkDetail(null);
    setNovelDetail(null);
    setRouteArtworkId("");
    setRouteNovelId(novelId);
    setView("novel");
    setRouteContext("novels");
    setProfileUsername("");
    setRouteCollectionId("");
    setRouteSeriesId("");
    setRouteTag("");
    const path = `/novels/${encodeURIComponent(novelId)}`;
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== path) {
      window.history.pushState(null, "", path);
    }
  };

  const openSuggestedTag = (tag: string) => {
    setIllustrationQuery(`#${tag}`);
    setSearchSuggestionsOpen(false);
    showTag(tag);
  };

  const openSuggestedCreator = (username: string) => {
    setIllustrationQuery(`@${username}`);
    setSearchSuggestionsOpen(false);
    showProfile(username);
  };

  const openSuggestedArtwork = (artwork: SearchSuggestionsResponse["artworks"][number]) => {
    setIllustrationQuery(artwork.title);
    setSearchSuggestionsOpen(false);
    openArtworkById(artwork.id);
  };

  const closeArtwork = () => {
    setSelectedArtwork(null);
    setArtworkDetail(null);
    setRouteArtworkId("");
    if (window.location.pathname.startsWith("/artworks/")) {
      pushRoute("/", "illustrations");
    }
  };

  const openAuth = (
    mode: AuthMode,
    notice = "",
    options: { onAuthenticated?: (user: AuthUser) => void } = {}
  ) => {
    if (currentUser) {
      options.onAuthenticated?.(currentUser);
      setAuthNotice((current) => (current.startsWith("Sign in ") ? "" : current));
      return true;
    }
    if (authOpeningRef.current) {
      setAuthMode(mode);
      setAuthNotice(notice);
      return false;
    }
    authOpeningRef.current = true;
    setAuthMode(mode);
    setAuthNotice(notice);
    void refreshAuthSession()
      .then((session) => {
        if (session.user) {
          setAuthOpen(false);
          options.onAuthenticated?.(session.user);
          setAuthNotice((current) => (current.startsWith("Sign in ") ? "" : current));
          return;
        }
        setAuthOpen(true);
      })
      .catch((error: unknown) => {
        console.error("Unable to check auth session", error);
        setAuthOpen(true);
      })
      .finally(() => {
        authOpeningRef.current = false;
        setAuthReady(true);
      });
    return false;
  };

  const openUpload = () => {
    if (!currentUser) {
      openAuth("login");
      return;
    }
    setUploadProgress(0);
    setUploadMessage("");
    setUploadOpen(true);
  };

  const openNovelForm = (novel?: Novel) => {
    if (!currentUser) {
      openAuth("login");
      return;
    }
    setNovelFormMode(novel ? "edit" : "create");
    setNovelFormNovel(novel ?? null);
    setNovelFormMessage("");
    setNovelFormOpen(true);
  };

  const handleAuthSuccess = (payload: AuthResponse) => {
    setCurrentUser(payload.user);
    setCsrfToken(payload.csrfToken);
    setAuthNotice(payload.message);
    setAuthOpen(false);
    if (postAuthSort) {
      showIllustrations(postAuthSort);
      setPostAuthSort(null);
      setPostAuthNovelSection(null);
    } else if (postAuthNovelSection) {
      openNovelSection(postAuthNovelSection);
      setPostAuthNovelSection(null);
    }
  };

  const handleLogout = async () => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
    });
    const payload = (await response.json().catch(() => ({ message: "Signed out." }))) as {
      message: string;
    };
    if (response.ok) {
      setCurrentUser(null);
      setCsrfToken("");
      setAdminStats(null);
      setAdminReports(null);
      setAdminTags(null);
      setNotifications(null);
      setNotificationsOpen(false);
      setTagSubscriptions(null);
      setCollections(null);
      setSeriesList(null);
      setReadingLists(null);
      setNovelSeriesList(null);
      setFollowedNovelsData(null);
      if (
        view === "dashboard" ||
        view === "collections" ||
        view === "collection" ||
        view === "analytics" ||
        view === "seriesList" ||
        view === "series" ||
        view === "profileSettings" ||
        view === "privacySecurity" ||
        sort === "following" ||
        sort === "bookmarks" ||
        sort === "subscriptions" ||
        (view === "novels" && novelSectionRequiresAuth(routeNovelSection))
      ) {
        showIllustrations("latest");
      }
      setPostAuthSort(null);
      setPostAuthNovelSection(null);
    }
    setAuthNotice(payload.message);
  };

  const handleAccountDeactivated = (payload: AccountDeactivationResponse) => {
    setCurrentUser(null);
    setCsrfToken("");
    setAdminStats(null);
    setAdminReports(null);
    setAdminTags(null);
    setAdminAuditLog(null);
    setNotifications(null);
    setNotificationsOpen(false);
    setTagSubscriptions(null);
    setCollections(null);
    setSeriesList(null);
    setReadingLists(null);
    setNovelSeriesList(null);
    setSelectedArtwork(null);
    setArtworkDetail(null);
    setAuthNotice(payload.message);
    showIllustrations("latest");
    setContentAccessRevision((revision) => revision + 1);
  };

  const syncArtwork = (updatedArtwork: Artwork) => {
    setGallery((current) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        artworks: current.artworks
          .map((item) => (item.id === updatedArtwork.id ? updatedArtwork : item))
          .filter((item) => item.reviewStatus === "approved")
          .filter((item) => sort !== "following" || item.creator.following)
          .filter((item) => sort !== "bookmarks" || item.bookmarked)
      };
    });
    setSelectedArtwork((current) =>
      current?.id === updatedArtwork.id ? updatedArtwork : current
    );
    setArtworkDetail((current) =>
      current?.artwork.id === updatedArtwork.id
        ? { ...current, artwork: updatedArtwork }
        : current
    );
  };

  const syncNovel = (updatedNovel: Novel) => {
    setNovelsData((current) => {
      if (!current) {
        return current;
      }
      const existing = current.novels.some((item) => item.id === updatedNovel.id);
      const novels = existing
        ? current.novels.map((item) => (item.id === updatedNovel.id ? updatedNovel : item))
        : [updatedNovel, ...current.novels];
      return {
        ...current,
        novels,
        featuredNovel:
          current.featuredNovel?.id === updatedNovel.id || !current.featuredNovel
            ? updatedNovel
            : current.featuredNovel,
        tags: current.tags,
        totalCount: existing ? current.totalCount : current.totalCount + 1
      };
    });
    setNovelDetail((current) =>
      current?.novel.id === updatedNovel.id ? { ...current, novel: updatedNovel } : current
    );
  };

  const handleResendVerification = useCallback(async (turnstileToken: string) => {
    const response = await fetch("/api/auth/resend-verification", {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        [csrfHeaderName]: csrfToken
      },
      body: JSON.stringify({ turnstileToken })
    });
    const payload = (await response.json()) as {
      message: string;
      user?: AuthUser;
    };
    if (payload.user) {
      setCurrentUser(payload.user);
    }
    setAuthNotice(payload.message);
    if (!response.ok) {
      throw new Error(payload.message);
    }
    return payload.message;
  }, [csrfToken]);

  const handleLike = async (artwork: Artwork) => {
    if (!currentUser) {
      openAuth("login");
      return;
    }
    const response = await fetch(`/api/artworks/${artwork.id}/like`, {
      method: "POST",
      credentials: "include",
      headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
    });
    const payload = (await response.json()) as { artwork?: Artwork; message?: string };
    if (!response.ok || !payload.artwork) {
      setAuthNotice(payload.message ?? "Unable to like artwork.");
      return;
    }
    const likedArtwork = payload.artwork;
    syncArtwork(likedArtwork);
  };

  const handleBookmark = async (artwork: Artwork, visibility?: BookmarkVisibility) => {
    if (!currentUser) {
      openAuth("login");
      return;
    }
    const headers: Record<string, string> = csrfToken ? { [csrfHeaderName]: csrfToken } : {};
    if (visibility) {
      headers["content-type"] = "application/json";
    }
    const response = await fetch(`/api/artworks/${artwork.id}/bookmark`, {
      method: "POST",
      credentials: "include",
      headers,
      body: visibility ? JSON.stringify({ visibility }) : undefined
    });
    const payload = (await response.json()) as { artwork?: Artwork; message?: string };
    if (!response.ok || !payload.artwork) {
      setAuthNotice(payload.message ?? "Unable to bookmark artwork.");
      return;
    }
    syncArtwork(payload.artwork);
  };

  const handleDeleteArtwork = async (artwork: Artwork) => {
    if (!currentUser) {
      openAuth("login");
      return;
    }
    if (!window.confirm(`Delete "${artwork.title}"?`)) {
      return;
    }
    const response = await fetch(`/api/artworks/${artwork.id}`, {
      method: "DELETE",
      credentials: "include",
      headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
    });
    const payload = (await response.json().catch(() => ({ message: "Unable to delete artwork." }))) as
      | DeleteArtworkResponse
      | { message?: string };
    if (!response.ok || !("deleted" in payload)) {
      setAuthNotice(payload.message ?? "Unable to delete artwork.");
      return;
    }
    setCurrentUser(payload.user);
    setGallery((current) =>
      current
        ? {
            ...current,
            artworks: current.artworks.filter((item) => item.id !== artwork.id)
          }
        : current
    );
    closeArtwork();
    setAuthNotice(payload.message);
  };

  const handleUpdateArtwork = async (artwork: Artwork, input: ArtworkEditInput) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to edit artwork.");
    }
    const response = await fetch(`/api/artworks/${artwork.id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify(input)
    });
    const payload = (await response.json()) as UpdateArtworkResponse | { message?: string };
    if (!response.ok || !("artwork" in payload)) {
      throw new Error(payload.message ?? "Unable to update artwork.");
    }
    syncArtwork(payload.artwork);
    return payload.message;
  };

  const handleReorderArtworkImages = async (artwork: Artwork, imageIds: string[]) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to edit artwork.");
    }
    const response = await fetch(`/api/artworks/${artwork.id}/images/order`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ imageIds })
    });
    const payload = (await response
      .json()
      .catch(() => ({ message: "Unable to update image order." }))) as
      | ReorderArtworkImagesResponse
      | { message?: string };
    if (!response.ok || !("artwork" in payload)) {
      throw new Error(payload.message ?? "Unable to update image order.");
    }
    syncArtwork(payload.artwork);
    return payload.message;
  };

  const handleDeleteArtworkImage = async (artwork: Artwork, imageId: string) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to edit artwork.");
    }
    const response = await fetch(`/api/artworks/${artwork.id}/images/${imageId}`, {
      method: "DELETE",
      credentials: "include",
      headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
    });
    const payload = (await response
      .json()
      .catch(() => ({ message: "Unable to remove image." }))) as
      | DeleteArtworkImageResponse
      | { message?: string };
    if (!response.ok || !("artwork" in payload)) {
      throw new Error(payload.message ?? "Unable to remove image.");
    }
    setCurrentUser(payload.user);
    syncArtwork(payload.artwork);
    return payload.message;
  };

  const handleAddArtworkImages = async (artwork: Artwork, files: File[]) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to edit artwork.");
    }
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }
    const response = await fetch(`/api/artworks/${artwork.id}/images`, {
      method: "POST",
      credentials: "include",
      headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined,
      body: formData
    });
    const payload = (await response
      .json()
      .catch(() => ({ message: "Unable to add images." }))) as
      | AddArtworkImagesResponse
      | { message?: string };
    if (!response.ok || !("artwork" in payload)) {
      throw new Error(payload.message ?? "Unable to add images.");
    }
    setCurrentUser(payload.user);
    syncArtwork(payload.artwork);
    return payload.message;
  };

  const handleUnlockStorageSlot = async () => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to unlock storage slots.");
    }
    if (storageUnlockSubmitting) {
      return "Storage unlock already in progress.";
    }
    if (currentUser.storage.siteCredits < currentUser.storage.creditsPerSlot) {
      throw new Error(`Unlocking a storage slot costs ${currentUser.storage.creditsPerSlot} credits.`);
    }
    setStorageUnlockSubmitting(true);
    try {
      const response = await fetch("/api/storage/unlock-slot", {
        method: "POST",
        credentials: "include",
        headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
      });
      const payload = (await response
        .json()
        .catch(() => ({ message: "Unable to unlock storage slot." }))) as
        | StorageUnlockResponse
        | { message?: string };
      if (!response.ok || !("user" in payload)) {
        throw new Error(payload.message ?? "Unable to unlock storage slot.");
      }
      setCurrentUser(payload.user);
      setAuthNotice(payload.message);
      return payload.message;
    } finally {
      setStorageUnlockSubmitting(false);
    }
  };

  const handleComment = async (
    artwork: Artwork,
    body: string,
    turnstileToken: string,
    parentId?: string
  ) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to comment.");
    }
    const response = await fetch(`/api/artworks/${artwork.id}/comments`, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ body, parentId, turnstileToken })
    });
    const payload = (await response.json()) as CommentResponse | { message?: string };
    if (!response.ok || !("comment" in payload)) {
      throw new Error(payload.message ?? "Unable to post comment.");
    }
    syncArtwork(payload.artwork);
    setArtworkDetail((current) =>
      current?.artwork.id === artwork.id
        ? {
            ...current,
            artwork: payload.artwork,
            comments: [payload.comment, ...current.comments]
          }
        : current
    );
    return payload.message;
  };

  const handleNovelLike = async (novel: Novel) => {
    if (!currentUser) {
      openAuth("login");
      return;
    }
    const response = await fetch(`/api/novels/${novel.id}/like`, {
      method: "POST",
      credentials: "include",
      headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
    });
    const payload = (await response.json()) as NovelMutationResponse | { message?: string };
    if (!response.ok || !("novel" in payload)) {
      setAuthNotice(payload.message ?? "Unable to like novel.");
      return;
    }
    syncNovel(payload.novel);
  };

  const handleNovelBookmark = async (novel: Novel) => {
    if (!currentUser) {
      openAuth("login");
      return;
    }
    const response = await fetch(`/api/novels/${novel.id}/bookmark`, {
      method: "POST",
      credentials: "include",
      headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
    });
    const payload = (await response.json()) as NovelMutationResponse | { message?: string };
    if (!response.ok || !("novel" in payload)) {
      setAuthNotice(payload.message ?? "Unable to bookmark novel.");
      return;
    }
    syncNovel(payload.novel);
  };

  const handleUpdateReadingProgress = async (
    novel: Novel,
    lastPosition: number,
    scrollPercent: number
  ) => {
    if (!currentUser) {
      return;
    }
    const response = await fetch(`/api/novels/${novel.id}/progress`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ lastPosition, scrollPercent })
    });
    const payload = (await response.json()) as ReadingProgressUpdateResponse | { message?: string };
    if (!response.ok || !("progress" in payload)) {
      throw new Error(payload.message ?? "Unable to save reading progress.");
    }
    setReadingProgressData((current) => {
      const remaining = (current?.progress ?? []).filter(
        (item) => item.novelId !== payload.progress.novelId
      );
      return {
        matureAccess:
          current?.matureAccess ?? {
            allowed: true,
            signedIn: true,
            ageVerified: true,
            enabled: true,
            restrictedRegion: false,
            country: null,
            reason: "allowed"
          },
        progress: [payload.progress, ...remaining].slice(0, 8)
      };
    });
  };

  const handleNovelComment = async (
    novel: Novel,
    body: string,
    turnstileToken: string,
    parentId?: string
  ) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to comment.");
    }
    const response = await fetch(`/api/novels/${novel.id}/comments`, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ body, parentId, turnstileToken })
    });
    const payload = (await response.json()) as NovelCommentResponse | { message?: string };
    if (!response.ok || !("comment" in payload)) {
      throw new Error(payload.message ?? "Unable to post comment.");
    }
    syncNovel(payload.novel);
    setNovelDetail((current) =>
      current?.novel.id === novel.id
        ? {
            ...current,
            novel: payload.novel,
            comments: [payload.comment, ...current.comments]
          }
        : current
    );
    return payload.message;
  };

  const handleUpdateNovelComment = async (comment: Comment, body: string) => {
    const response = await fetch(`/api/novel-comments/${comment.id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ body })
    });
    const payload = (await response.json()) as NovelCommentResponse | { message?: string };
    if (!response.ok || !("comment" in payload)) {
      throw new Error(payload.message ?? "Unable to update comment.");
    }
    syncNovel(payload.novel);
    setNovelDetail((current) =>
      current
        ? {
            ...current,
            novel: payload.novel,
            comments: current.comments.map((item) =>
              item.id === payload.comment.id ? payload.comment : item
            )
          }
        : current
    );
    return payload.message;
  };

  const handleDeleteNovelComment = async (comment: Comment) => {
    const response = await fetch(`/api/novel-comments/${comment.id}`, {
      method: "DELETE",
      credentials: "include",
      headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
    });
    const payload = (await response
      .json()
      .catch(() => ({ message: "Unable to delete comment." }))) as
      | DeleteNovelCommentResponse
      | { message?: string };
    if (!response.ok || !("deleted" in payload)) {
      setAuthNotice(payload.message ?? "Unable to delete comment.");
      return;
    }
    syncNovel(payload.novel);
    setNovelDetail((current) =>
      current
        ? {
            ...current,
            novel: payload.novel,
            comments: current.comments.filter((item) => item.id !== payload.commentId)
          }
        : current
    );
    setAuthNotice(payload.message);
  };

  const handleUpdateComment = async (comment: Comment, body: string) => {
    const response = await fetch(`/api/comments/${comment.id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ body })
    });
    const payload = (await response.json()) as CommentResponse | { message?: string };
    if (!response.ok || !("comment" in payload)) {
      throw new Error(payload.message ?? "Unable to update comment.");
    }
    syncArtwork(payload.artwork);
    setArtworkDetail((current) =>
      current
        ? {
            ...current,
            artwork: payload.artwork,
            comments: current.comments.map((item) =>
              item.id === payload.comment.id ? payload.comment : item
            )
          }
        : current
    );
    return payload.message;
  };

  const handleDeleteComment = async (comment: Comment) => {
    const response = await fetch(`/api/comments/${comment.id}`, {
      method: "DELETE",
      credentials: "include",
      headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
    });
    const payload = (await response.json().catch(() => ({ message: "Unable to delete comment." }))) as
      | DeleteCommentResponse
      | { message?: string };
    if (!response.ok || !("deleted" in payload)) {
      setAuthNotice(payload.message ?? "Unable to delete comment.");
      return;
    }
    syncArtwork(payload.artwork);
    setArtworkDetail((current) =>
      current
        ? {
            ...current,
            artwork: payload.artwork,
            comments: current.comments.filter((item) => item.id !== payload.commentId)
          }
        : current
    );
    setAuthNotice(payload.message);
  };

  const handleReportArtwork = async (
    artwork: Artwork,
    reason: ReportReason,
    details: string,
    turnstileToken: string
  ) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to report artwork.");
    }
    const response = await fetch(`/api/artworks/${artwork.id}/report`, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ reason, details, turnstileToken })
    });
    const payload = (await response.json()) as ReportResponse | { message?: string };
    if (!response.ok || !("report" in payload)) {
      throw new Error(payload.message ?? "Unable to submit report.");
    }
    setAdminReports((current) =>
      current
        ? {
            ...current,
            reports:
              current.status === "open" &&
              (current.targetType === "all" || current.targetType === payload.report.targetType) &&
              (current.reason === "all" || current.reason === payload.report.reason)
                ? [payload.report, ...current.reports].slice(0, current.limit)
                : current.reports,
            totalCount:
              current.status === "open" &&
              (current.targetType === "all" || current.targetType === payload.report.targetType) &&
              (current.reason === "all" || current.reason === payload.report.reason)
                ? current.totalCount + 1
                : current.totalCount
          }
        : current
    );
    return payload.message;
  };

  const handleReportComment = async (
    comment: Comment,
    reason: ReportReason,
    details: string,
    turnstileToken: string
  ) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to report comments.");
    }
    const response = await fetch(`/api/comments/${comment.id}/report`, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ reason, details, turnstileToken })
    });
    const payload = (await response.json()) as ReportResponse | { message?: string };
    if (!response.ok || !("report" in payload)) {
      throw new Error(payload.message ?? "Unable to submit report.");
    }
    setAdminReports((current) =>
      current
        ? {
            ...current,
            reports:
              current.status === "open" &&
              (current.targetType === "all" || current.targetType === payload.report.targetType) &&
              (current.reason === "all" || current.reason === payload.report.reason)
                ? [payload.report, ...current.reports].slice(0, current.limit)
                : current.reports,
            totalCount:
              current.status === "open" &&
              (current.targetType === "all" || current.targetType === payload.report.targetType) &&
              (current.reason === "all" || current.reason === payload.report.reason)
                ? current.totalCount + 1
                : current.totalCount
          }
        : current
    );
    return payload.message;
  };

  const resolveReportRequest = async (
    report: ModerationReport,
    status: "resolved" | "dismissed"
  ) => {
    const response = await fetch(`/api/admin/reports/${report.id}/resolve`, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ status })
    });
    const payload = (await response.json()) as ReportResponse | { message?: string };
    if (!response.ok || !("report" in payload)) {
      throw new Error(payload.message ?? "Unable to update report.");
    }
    setAdminReports((current) =>
      current
        ? {
            ...current,
            reports: current.reports.filter((item) => item.id !== payload.report.id),
            totalCount:
              current.status === "open" ? Math.max(current.totalCount - 1, 0) : current.totalCount
          }
        : current
    );
    void loadAdminReports().catch(() => undefined);
    void loadAdminAuditLog().catch(() => undefined);
    return payload.message;
  };

  const handleResolveReport = async (
    report: ModerationReport,
    status: "resolved" | "dismissed"
  ) => {
    try {
      setDashboardMessage(await resolveReportRequest(report, status));
    } catch (error) {
      setDashboardMessage(error instanceof Error ? error.message : "Unable to update report.");
    }
  };

  const handleModerateReportedArtwork = async (
    report: ModerationReport,
    action: "hide" | "restore"
  ) => {
    const response = await fetch(`/api/admin/artworks/${report.targetId}/moderation`, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ action })
    });
    const payload = (await response.json()) as
      | AdminModerationActionResponse
      | { message?: string };
    if (!response.ok || !("action" in payload)) {
      setDashboardMessage(payload.message ?? "Unable to moderate artwork.");
      return;
    }
    if (payload.action === "hide_artwork") {
      setGallery((current) =>
        current
          ? {
              ...current,
              artworks: current.artworks.filter((artwork) => artwork.id !== payload.targetId)
            }
          : current
      );
    }
    void loadAdminAuditLog().catch(() => undefined);
    try {
      const resolveMessage = await resolveReportRequest(report, "resolved");
      setDashboardMessage(`${payload.message} ${resolveMessage}`);
    } catch (error) {
      setDashboardMessage(error instanceof Error ? error.message : payload.message);
    }
  };

  const handleModerateReportedNovel = async (
    report: ModerationReport,
    action: "hide" | "restore"
  ) => {
    const response = await fetch(`/api/admin/novels/${report.targetId}/moderation`, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ action })
    });
    const payload = (await response.json()) as
      | AdminModerationActionResponse
      | { message?: string };
    if (!response.ok || !("action" in payload)) {
      setDashboardMessage(payload.message ?? "Unable to moderate novel.");
      return;
    }
    if (payload.action === "hide_novel") {
      setNovelsData((current) =>
        current
          ? {
              ...current,
              novels: current.novels.filter((novel) => novel.id !== payload.targetId),
              featuredNovel:
                current.featuredNovel?.id === payload.targetId ? null : current.featuredNovel,
              totalCount: Math.max(0, current.totalCount - 1)
            }
          : current
      );
      setNovelDetail((current) =>
        current?.novel.id === payload.targetId ? null : current
      );
    }
    void loadAdminAuditLog().catch(() => undefined);
    try {
      const resolveMessage = await resolveReportRequest(report, "resolved");
      setDashboardMessage(`${payload.message} ${resolveMessage}`);
    } catch (error) {
      setDashboardMessage(error instanceof Error ? error.message : payload.message);
    }
  };

  const handleDeleteReportedComment = async (report: ModerationReport) => {
    const response = await fetch(`/api/comments/${report.targetId}`, {
      method: "DELETE",
      credentials: "include",
      headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
    });
    const payload = (await response.json().catch(() => ({ message: "Unable to delete comment." }))) as
      | DeleteCommentResponse
      | { message?: string };
    if (!response.ok || !("deleted" in payload)) {
      setDashboardMessage(payload.message ?? "Unable to delete comment.");
      return;
    }
    syncArtwork(payload.artwork);
    try {
      const resolveMessage = await resolveReportRequest(report, "resolved");
      setDashboardMessage(`${payload.message} ${resolveMessage}`);
    } catch (error) {
      setDashboardMessage(error instanceof Error ? error.message : payload.message);
    }
  };

  const handleToggleUserSuspension = async (
    user: AdminUserSummary,
    suspended: boolean
  ) => {
    const response = await fetch(`/api/admin/users/${user.id}/suspension`, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({
        suspended,
        reason: suspended ? "Suspended from dashboard moderation." : ""
      })
    });
    const payload = (await response.json()) as AdminUserActionResponse | { message?: string };
    if (!response.ok || !("user" in payload)) {
      setDashboardMessage(payload.message ?? "Unable to update user.");
      return;
    }
    const wasSuspended = Boolean(user.suspendedAt);
    const isSuspended = Boolean(payload.user.suspendedAt);
    const suspendedDelta = isSuspended && !wasSuspended ? 1 : !isSuspended && wasSuspended ? -1 : 0;
    setAdminStats((current) =>
      current
        ? {
            ...current,
            accounts: {
              ...current.accounts,
              suspendedUsers: Math.max(0, current.accounts.suspendedUsers + suspendedDelta)
            },
            recentUsers: current.recentUsers.map((item) =>
              item.id === payload.user.id ? payload.user : item
            )
          }
        : current
    );
    setAdminUsers((current) =>
      current
        ? {
            ...current,
            users: current.users.map((item) =>
              item.id === payload.user.id ? payload.user : item
            )
          }
        : current
    );
    void loadAdminUsers().catch(() => undefined);
    void loadAdminAuditLog().catch(() => undefined);
    setDashboardMessage(payload.message);
  };

  const handleUpdateUserRole = async (user: AdminUserSummary, role: UserRole) => {
    const response = await fetch(`/api/admin/users/${user.id}/role`, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ role })
    });
    const payload = (await response.json()) as AdminUserActionResponse | { message?: string };
    if (!response.ok || !("user" in payload)) {
      setDashboardMessage(payload.message ?? "Unable to update user role.");
      return;
    }
    const adminDelta =
      user.role !== "admin" && payload.user.role === "admin"
        ? 1
        : user.role === "admin" && payload.user.role !== "admin"
          ? -1
          : 0;
    const moderatorDelta =
      user.role !== "moderator" && payload.user.role === "moderator"
        ? 1
        : user.role === "moderator" && payload.user.role !== "moderator"
          ? -1
          : 0;
    setAdminStats((current) =>
      current
        ? {
            ...current,
            accounts: {
              ...current.accounts,
              admins: Math.max(0, current.accounts.admins + adminDelta),
              moderators: Math.max(0, current.accounts.moderators + moderatorDelta),
              suspendedUsers:
                user.suspendedAt && !payload.user.suspendedAt
                  ? Math.max(0, current.accounts.suspendedUsers - 1)
                  : current.accounts.suspendedUsers
            },
            recentUsers: current.recentUsers.map((item) =>
              item.id === payload.user.id ? payload.user : item
            )
          }
        : current
    );
    setAdminUsers((current) =>
      current
        ? {
            ...current,
            users: current.users.map((item) =>
              item.id === payload.user.id ? payload.user : item
            )
          }
        : current
    );
    void loadAdminUsers().catch(() => undefined);
    void loadAdminAuditLog().catch(() => undefined);
    setDashboardMessage(payload.message);
  };

  const handleToggleArtworkReview = async (enabled: boolean) => {
    const response = await fetch("/api/admin/artwork-review-settings", {
      method: "PUT",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ publicArtworkReviewEnabled: enabled })
    });
    const payload = (await response.json()) as AdminArtworkReviewSettingsResponse | { message?: string };
    if (!response.ok || !("publicArtworkReviewEnabled" in payload)) {
      setDashboardMessage(payload.message ?? "Unable to update artwork review setting.");
      return;
    }
    setAdminArtworkReviews((current) =>
      current
        ? {
            ...current,
            publicArtworkReviewEnabled: payload.publicArtworkReviewEnabled,
            totalCount: payload.pendingCount
          }
        : {
            publicArtworkReviewEnabled: payload.publicArtworkReviewEnabled,
            artworks: [],
            totalCount: payload.pendingCount,
            limit: 40
          }
    );
    void loadAdminArtworkReviews().catch(() => undefined);
    void loadAdminAuditLog().catch(() => undefined);
    setDashboardMessage(payload.message ?? "Artwork review setting updated.");
  };

  const handleReviewArtwork = async (artwork: Artwork, action: "approve" | "reject") => {
    const response = await fetch(`/api/admin/artworks/${artwork.id}/review`, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ action })
    });
    const payload = (await response.json()) as AdminArtworkReviewActionResponse | { message?: string };
    if (!response.ok || !("artwork" in payload)) {
      setDashboardMessage(payload.message ?? "Unable to review artwork.");
      return;
    }
    setAdminArtworkReviews((current) =>
      current
        ? {
            ...current,
            artworks: current.artworks.filter((item) => item.id !== payload.artwork.id),
            totalCount: Math.max(0, current.totalCount - 1)
          }
        : current
    );
    syncArtwork(payload.artwork);
    void loadAdminArtworkReviews().catch(() => undefined);
    void loadAdminAuditLog().catch(() => undefined);
    setDashboardMessage(payload.message);
  };

  const handleSuspendReportedUser = async (report: ModerationReport) => {
    const response = await fetch(`/api/admin/users/${report.targetId}/suspension`, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({
        suspended: true,
        reason: `Suspended after profile report ${report.id}.`
      })
    });
    const payload = (await response.json()) as AdminUserActionResponse | { message?: string };
    if (!response.ok || !("user" in payload)) {
      setDashboardMessage(payload.message ?? "Unable to suspend reported user.");
      return;
    }
    setAdminStats((current) =>
      current
        ? {
            ...current,
            accounts: {
              ...current.accounts,
              suspendedUsers: current.recentUsers.some(
                (item) => item.id === payload.user.id && item.suspendedAt
              )
                ? current.accounts.suspendedUsers
                : current.accounts.suspendedUsers + 1
            },
            recentUsers: current.recentUsers.map((item) =>
              item.id === payload.user.id ? payload.user : item
            )
          }
        : current
    );
    setAdminUsers((current) =>
      current
        ? {
            ...current,
            users: current.users.map((item) =>
              item.id === payload.user.id ? payload.user : item
            )
          }
        : current
    );
    void loadAdminUsers().catch(() => undefined);
    void loadAdminAuditLog().catch(() => undefined);
    try {
      const resolveMessage = await resolveReportRequest(report, "resolved");
      setDashboardMessage(`${payload.message} ${resolveMessage}`);
    } catch (error) {
      setDashboardMessage(error instanceof Error ? error.message : payload.message);
    }
  };

  const saveTagRule = async (
    path: string,
    sourceTag: string,
    targetTag: string
  ) => {
    const response = await fetch(path, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ sourceTag, targetTag })
    });
    const payload = (await response.json()) as AdminTagRuleResponse | { message?: string };
    if (!response.ok || !("tags" in payload)) {
      throw new Error(payload.message ?? "Unable to update tags.");
    }
    setAdminTags(payload.tags);
    setDashboardMessage(payload.message);
    setContentAccessRevision((revision) => revision + 1);
    void loadAdminAuditLog().catch(() => undefined);
    return payload.message;
  };

  const deleteTagRule = async (path: string) => {
    const response = await fetch(path, {
      method: "DELETE",
      credentials: "include",
      headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
    });
    const payload = (await response.json()) as AdminTagRuleResponse | { message?: string };
    if (!response.ok || !("tags" in payload)) {
      throw new Error(payload.message ?? "Unable to update tags.");
    }
    setAdminTags(payload.tags);
    setDashboardMessage(payload.message);
    setContentAccessRevision((revision) => revision + 1);
    void loadAdminAuditLog().catch(() => undefined);
    return payload.message;
  };

  const handleSaveTagAlias = (sourceTag: string, targetTag: string) =>
    saveTagRule("/api/admin/tags/aliases", sourceTag, targetTag);

  const handleDeleteTagAlias = (alias: TagAlias) =>
    deleteTagRule(`/api/admin/tags/aliases/${encodeURIComponent(alias.sourceTag)}`);

  const handleSaveTagImplication = (sourceTag: string, targetTag: string) =>
    saveTagRule("/api/admin/tags/implications", sourceTag, targetTag);

  const handleDeleteTagImplication = (implication: TagImplication) =>
    deleteTagRule(
      `/api/admin/tags/implications/${encodeURIComponent(
        implication.sourceTag
      )}/${encodeURIComponent(implication.targetTag)}`
    );

  const handleToggleNotifications = () => {
    if (!currentUser) {
      openAuth("login");
      return;
    }
    setNotificationsOpen((open) => !open);
    loadNotifications().catch((error: unknown) => {
      console.error("Unable to load notifications", error);
    });
  };

  const handleMarkNotificationsRead = async (notification?: UserNotification) => {
    if (!currentUser) {
      openAuth("login");
      return;
    }
    const response = await fetch("/api/notifications/read", {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify(notification ? { id: notification.id } : {})
    });
    const payload = (await response.json()) as MarkNotificationsReadResponse | { message?: string };
    if (!response.ok || !("unreadCount" in payload)) {
      setAuthNotice(payload.message ?? "Unable to update notifications.");
      return;
    }
    const readAt = new Date().toISOString();
    setNotifications((current) =>
      current
        ? {
            unreadCount: payload.unreadCount,
            notifications: current.notifications.map((item) =>
              !notification || item.id === notification.id
                ? { ...item, readAt: item.readAt ?? readAt }
                : item
            )
          }
        : current
    );
  };

  const handleOpenNotification = async (notification: UserNotification) => {
    await handleMarkNotificationsRead(notification);
    setNotificationsOpen(false);
    if (notification.artworkId) {
      openArtworkById(notification.artworkId);
      return;
    }
    if (notification.novelId) {
      openNovel(notification.novelId);
      return;
    }
    if (notification.actor?.username) {
      showProfile(notification.actor.username);
    }
  };

  const handleToggleTagSubscription = async (tag: string) => {
    if (!currentUser) {
      setPostAuthSort("subscriptions");
      openAuth("login");
      return null;
    }
    const response = await fetch(`/api/tags/${encodeURIComponent(tag)}/subscribe`, {
      method: "POST",
      credentials: "include",
      headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
    });
    const payload = (await response.json()) as TagSubscriptionResponse | { message?: string };
    if (!response.ok || !("tag" in payload)) {
      setAuthNotice(payload.message ?? "Unable to update tag.");
      return;
    }
    setTagSubscriptions((current) => {
      const tags = new Set(current?.tags ?? []);
      if (payload.subscribed) {
        tags.add(payload.tag);
      } else {
        tags.delete(payload.tag);
      }
      return { tags: Array.from(tags).sort((left, right) => left.localeCompare(right)) };
    });
    setContentAccessRevision((revision) => revision + 1);
    setAuthNotice(payload.message);
    return payload;
  };

  const handleCreateCollection = async (name: string) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to create collections.");
    }
    const response = await fetch("/api/collections", {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ name })
    });
    const payload = (await response.json()) as CollectionResponse | { message?: string };
    if (!response.ok || !("collection" in payload)) {
      throw new Error(payload.message ?? "Unable to create collection.");
    }
    setCollections((current) => ({
      collections: [payload.collection, ...(current?.collections ?? [])]
    }));
    return payload.message;
  };

  const handleUpdateCollection = async (
    collectionId: string,
    input: CollectionSettingsInput
  ) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to update collections.");
    }
    const response = await fetch(`/api/collections/${collectionId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify(input)
    });
    const payload = (await response.json()) as CollectionResponse | { message?: string };
    if (!response.ok || !("collection" in payload)) {
      throw new Error(payload.message ?? "Unable to update collection.");
    }
    setCollections((current) =>
      current
        ? {
            collections: current.collections.map((collection) =>
              collection.id === payload.collection.id ? payload.collection : collection
            )
          }
        : { collections: [payload.collection] }
    );
    return payload;
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to delete collections.");
    }
    const response = await fetch(`/api/collections/${collectionId}`, {
      method: "DELETE",
      credentials: "include",
      headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
    });
    const payload = (await response.json().catch(() => ({ message: "Unable to delete collection." }))) as
      | DeleteCollectionResponse
      | { message?: string };
    if (!response.ok || !("deleted" in payload)) {
      throw new Error(payload.message ?? "Unable to delete collection.");
    }
    setCollections((current) =>
      current
        ? {
            collections: current.collections.filter(
              (collection) => collection.id !== payload.collectionId
            )
          }
        : current
    );
    return payload.message;
  };

  const handleToggleCollectionItem = async (
    collection: UserCollection,
    artwork: Artwork
  ) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to update collections.");
    }
    const response = await fetch(`/api/collections/${collection.id}/items`, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ artworkId: artwork.id })
    });
    const payload = (await response.json()) as CollectionItemResponse | { message?: string };
    if (!response.ok || !("collection" in payload)) {
      throw new Error(payload.message ?? "Unable to update collection.");
    }
    setCollections((current) =>
      current
        ? {
            collections: current.collections.map((item) =>
              item.id === payload.collection.id ? payload.collection : item
            )
          }
        : { collections: [payload.collection] }
    );
    syncArtwork(payload.artwork);
    return payload.message;
  };

  const handleCreateSeries = async (title: string) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to create series.");
    }
    const response = await fetch("/api/series", {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ title })
    });
    const payload = (await response.json()) as ArtworkSeriesResponse | { message?: string };
    if (!response.ok || !("series" in payload)) {
      throw new Error(payload.message ?? "Unable to create series.");
    }
    setSeriesList((current) => ({
      series: [payload.series, ...(current?.series ?? [])]
    }));
    return payload.message;
  };

  const handleUpdateSeries = async (seriesId: string, input: SeriesSettingsInput) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to update series.");
    }
    const response = await fetch(`/api/series/${seriesId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify(input)
    });
    const payload = (await response.json()) as ArtworkSeriesResponse | { message?: string };
    if (!response.ok || !("series" in payload)) {
      throw new Error(payload.message ?? "Unable to update series.");
    }
    setSeriesList((current) =>
      current
        ? {
            series: current.series.map((item) =>
              item.id === payload.series.id ? payload.series : item
            )
          }
        : { series: [payload.series] }
    );
    return payload;
  };

  const handleDeleteSeries = async (seriesId: string) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to delete series.");
    }
    const response = await fetch(`/api/series/${seriesId}`, {
      method: "DELETE",
      credentials: "include",
      headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
    });
    const payload = (await response.json().catch(() => ({ message: "Unable to delete series." }))) as
      | DeleteArtworkSeriesResponse
      | { message?: string };
    if (!response.ok || !("deleted" in payload)) {
      throw new Error(payload.message ?? "Unable to delete series.");
    }
    setSeriesList((current) =>
      current
        ? {
            series: current.series.filter((series) => series.id !== payload.seriesId)
          }
        : current
    );
    return payload.message;
  };

  const handleToggleSeriesItem = async (series: ArtworkSeries, artwork: Artwork) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to update series.");
    }
    const response = await fetch(`/api/series/${series.id}/items`, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ artworkId: artwork.id })
    });
    const payload = (await response.json()) as ArtworkSeriesItemResponse | { message?: string };
    if (!response.ok || !("series" in payload)) {
      throw new Error(payload.message ?? "Unable to update series.");
    }
    setSeriesList((current) =>
      current
        ? {
            series: current.series.map((item) =>
              item.id === payload.series.id ? payload.series : item
            )
          }
        : { series: [payload.series] }
    );
    syncArtwork(payload.artwork);
    return payload.message;
  };

  const handleCreateReadingList = async (title: string) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to create reading shelves.");
    }
    const response = await fetch("/api/reading-lists", {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ title, description: "", visibility: "private" })
    });
    const payload = (await response.json()) as ReadingListResponse | { message?: string };
    if (!response.ok || !("readingList" in payload)) {
      throw new Error(payload.message ?? "Unable to create reading shelf.");
    }
    setReadingLists((current) => ({
      readingLists: [payload.readingList, ...(current?.readingLists ?? [])]
    }));
    return payload.message;
  };

  const handleUpdateReadingList = async (
    readingListId: string,
    input: ReadingListSettingsInput
  ) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to update reading shelves.");
    }
    const response = await fetch(`/api/reading-lists/${readingListId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify(input)
    });
    const payload = (await response.json()) as ReadingListResponse | { message?: string };
    if (!response.ok || !("readingList" in payload)) {
      throw new Error(payload.message ?? "Unable to update reading shelf.");
    }
    setReadingLists((current) =>
      current
        ? {
            readingLists: current.readingLists.map((item) =>
              item.id === payload.readingList.id ? payload.readingList : item
            )
          }
        : { readingLists: [payload.readingList] }
    );
    return payload;
  };

  const handleDeleteReadingList = async (readingListId: string) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to delete reading shelves.");
    }
    const response = await fetch(`/api/reading-lists/${readingListId}`, {
      method: "DELETE",
      credentials: "include",
      headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
    });
    const payload = (await response
      .json()
      .catch(() => ({ message: "Unable to delete reading shelf." }))) as
      | DeleteReadingListResponse
      | { message?: string };
    if (!response.ok || !("deleted" in payload)) {
      throw new Error(payload.message ?? "Unable to delete reading shelf.");
    }
    setReadingLists((current) =>
      current
        ? {
            readingLists: current.readingLists.filter((item) => item.id !== payload.readingListId)
          }
        : current
    );
    return payload.message;
  };

  const handleToggleReadingListNovel = async (readingList: ReadingList, novel: Novel) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to update reading shelves.");
    }
    const response = await fetch(`/api/reading-lists/${readingList.id}/novels`, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ novelId: novel.id })
    });
    const payload = (await response.json()) as ReadingListNovelResponse | { message?: string };
    if (!response.ok || !("readingList" in payload)) {
      throw new Error(payload.message ?? "Unable to update reading shelf.");
    }
    setReadingLists((current) =>
      current
        ? {
            readingLists: current.readingLists.map((item) =>
              item.id === payload.readingList.id ? payload.readingList : item
            )
          }
        : { readingLists: [payload.readingList] }
    );
    syncNovel(payload.novel);
    return payload;
  };

  const handleCreateNovelSeries = async (title: string) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to create serials.");
    }
    const response = await fetch("/api/novel-series", {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ title, description: "" })
    });
    const payload = (await response.json()) as NovelSeriesResponse | { message?: string };
    if (!response.ok || !("series" in payload)) {
      throw new Error(payload.message ?? "Unable to create serial.");
    }
    setNovelSeriesList((current) => ({
      series: [payload.series, ...(current?.series ?? [])]
    }));
    return payload.message;
  };

  const handleUpdateNovelSeries = async (
    seriesId: string,
    input: NovelSeriesSettingsInput
  ) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to update serials.");
    }
    const response = await fetch(`/api/novel-series/${seriesId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify(input)
    });
    const payload = (await response.json()) as NovelSeriesResponse | { message?: string };
    if (!response.ok || !("series" in payload)) {
      throw new Error(payload.message ?? "Unable to update serial.");
    }
    setNovelSeriesList((current) =>
      current
        ? {
            series: current.series.map((item) =>
              item.id === payload.series.id ? payload.series : item
            )
          }
        : { series: [payload.series] }
    );
    return payload;
  };

  const handleDeleteNovelSeries = async (seriesId: string) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to delete serials.");
    }
    const response = await fetch(`/api/novel-series/${seriesId}`, {
      method: "DELETE",
      credentials: "include",
      headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
    });
    const payload = (await response
      .json()
      .catch(() => ({ message: "Unable to delete serial." }))) as
      | DeleteNovelSeriesResponse
      | { message?: string };
    if (!response.ok || !("deleted" in payload)) {
      throw new Error(payload.message ?? "Unable to delete serial.");
    }
    setNovelSeriesList((current) =>
      current
        ? {
            series: current.series.filter((item) => item.id !== payload.seriesId)
          }
        : current
    );
    return payload.message;
  };

  const handleToggleNovelSeriesItem = async (series: NovelSeries, novel: Novel) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to update serials.");
    }
    const response = await fetch(`/api/novel-series/${series.id}/novels`, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ novelId: novel.id })
    });
    const payload = (await response.json()) as NovelSeriesItemResponse | { message?: string };
    if (!response.ok || !("series" in payload)) {
      throw new Error(payload.message ?? "Unable to update serial.");
    }
    setNovelSeriesList((current) =>
      current
        ? {
            series: current.series.map((item) =>
              item.id === payload.series.id ? payload.series : item
            )
          }
        : { series: [payload.series] }
    );
    syncNovel(payload.novel);
    return payload;
  };

  const handleLoadMoreGallery = async () => {
    if (!gallery?.nextCursor) {
      return;
    }
    setGalleryLoadingMore(true);
    const params = new URLSearchParams(galleryParams);
    params.set("cursor", gallery.nextCursor);
    try {
      const response = await fetch(`/api/gallery?${params.toString()}`, { credentials: "include" });
      const payload = (await response.json()) as GalleryResponse;
      setGallery((current) =>
        current
          ? {
              ...payload,
              artworks: [...current.artworks, ...payload.artworks]
            }
          : payload
      );
    } catch (error) {
      console.error("Unable to load more artwork", error);
    } finally {
      setGalleryLoadingMore(false);
    }
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>, files?: File[]) => {
    event.preventDefault();
    if (uploadSubmitting) {
      return false;
    }
    setUploadMessage("");
    setUploadProgress(0);
    setUploadSubmitting(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    if (files) {
      formData.delete("files");
      files.forEach((file) => formData.append("files", file));
    }
    try {
      const payload = await new Promise<UploadResponse | { message: string }>((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open("POST", "/api/upload");
        request.withCredentials = true;
        if (csrfToken) {
          request.setRequestHeader(csrfHeaderName, csrfToken);
        }
        request.upload.onprogress = (progressEvent) => {
          if (!progressEvent.lengthComputable) {
            return;
          }
          setUploadProgress(Math.min(99, Math.round((progressEvent.loaded / progressEvent.total) * 100)));
        };
        request.onload = () => {
          let parsed: UploadResponse | { message: string };
          try {
            parsed = JSON.parse(request.responseText || "{}") as UploadResponse | { message: string };
          } catch {
            parsed = { message: "Upload failed." };
          }
          if (request.status < 200 || request.status >= 300) {
            resolve("message" in parsed ? parsed : { message: "Upload failed." });
            return;
          }
          resolve(parsed);
        };
        request.onerror = () => reject(new Error("Upload failed."));
        request.onabort = () => reject(new Error("Upload cancelled."));
        request.send(formData);
      });

      if (!("artwork" in payload)) {
        setUploadMessage(payload.message);
        return false;
      }

      setUploadProgress(100);
      setCurrentUser(payload.user);
      setGallery((current) => {
        if (!current) {
          return current;
        }
        if (payload.artwork.reviewStatus !== "approved") {
          return current;
        }
        return {
          ...current,
          artworks: [payload.artwork, ...current.artworks]
        };
      });
      setUploadMessage(payload.message);
      form.reset();
      setUploadOpen(false);
      return true;
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "Upload failed.");
      return false;
    } finally {
      setUploadSubmitting(false);
    }
  };

  const handleSaveNovel = async (
    input: NovelEditInput,
    turnstileToken: string
  ) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to write novels.");
    }
    setNovelFormSubmitting(true);
    try {
      const editing = novelFormMode === "edit" && novelFormNovel;
      const response = await fetch(editing ? `/api/novels/${novelFormNovel.id}` : "/api/novels", {
        method: editing ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
        },
        body: JSON.stringify(editing ? input : { ...input, turnstileToken })
      });
      const payload = (await response
        .json()
        .catch(() => ({ message: "Unable to save novel." }))) as
        | NovelMutationResponse
        | { message?: string };
      if (!response.ok || !("novel" in payload)) {
        throw new Error(payload.message ?? "Unable to save novel.");
      }
      syncNovel(payload.novel);
      setNovelFormOpen(false);
      setNovelFormNovel(null);
      setNovelFormMessage(payload.message);
      setAuthNotice(payload.message);
      if (!editing) {
        openNovel(payload.novel.id);
      }
      return payload.message;
    } finally {
      setNovelFormSubmitting(false);
    }
  };

  const handleImportNovel = async (
    input: NovelImportInput,
    file: File,
    turnstileToken: string
  ) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to import novels.");
    }
    setNovelFormSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", input.title);
      formData.append("tags", input.tags);
      formData.append("matureRating", input.matureRating);
      formData.append("visibility", input.visibility);
      formData.append("coverColor", input.coverColor);
      formData.append("turnstileToken", turnstileToken);
      const response = await fetch("/api/novels/import", {
        method: "POST",
        credentials: "include",
        headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined,
        body: formData
      });
      const payload = (await response
        .json()
        .catch(() => ({ message: "Unable to import novel." }))) as
        | NovelImportResponse
        | { message?: string };
      if (!response.ok || !("novel" in payload)) {
        throw new Error(payload.message ?? "Unable to import novel.");
      }
      syncNovel(payload.novel);
      setNovelFormOpen(false);
      setNovelFormNovel(null);
      setNovelFormMessage(payload.message);
      setAuthNotice(payload.message);
      openNovel(payload.novel.id);
      return payload.message;
    } finally {
      setNovelFormSubmitting(false);
    }
  };

  const handleExportNovel = (novel: Novel, format: NovelExportFormat) => {
    window.location.assign(`/api/novels/${encodeURIComponent(novel.id)}/export?format=${format}`);
  };

  const handleReportNovel = async (
    novel: Novel,
    reason: ReportReason,
    details: string,
    turnstileToken: string
  ) => {
    if (!currentUser) {
      openAuth("login");
      throw new Error("Sign in to report novels.");
    }
    const response = await fetch(`/api/novels/${novel.id}/report`, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
      },
      body: JSON.stringify({ reason, details, turnstileToken })
    });
    const payload = (await response.json()) as ReportResponse | { message?: string };
    if (!response.ok || !("report" in payload)) {
      throw new Error(payload.message ?? "Unable to submit report.");
    }
    setAdminReports((current) =>
      current
        ? {
            ...current,
            reports:
              current.status === "open" &&
              (current.targetType === "all" || current.targetType === payload.report.targetType) &&
              (current.reason === "all" || current.reason === payload.report.reason)
                ? [payload.report, ...current.reports].slice(0, current.limit)
                : current.reports,
            totalCount:
              current.status === "open" &&
              (current.targetType === "all" || current.targetType === payload.report.targetType) &&
              (current.reason === "all" || current.reason === payload.report.reason)
                ? current.totalCount + 1
                : current.totalCount
          }
        : current
    );
    return payload.message;
  };

  const handleDeleteNovel = async (novel: Novel) => {
    if (!currentUser) {
      openAuth("login");
      return;
    }
    if (!window.confirm(`Delete "${novel.title}"?`)) {
      return;
    }
    const response = await fetch(`/api/novels/${novel.id}`, {
      method: "DELETE",
      credentials: "include",
      headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
    });
    const payload = (await response
      .json()
      .catch(() => ({ message: "Unable to delete novel." }))) as
      | DeleteNovelResponse
      | { message?: string };
    if (!response.ok || !("deleted" in payload)) {
      setAuthNotice(payload.message ?? "Unable to delete novel.");
      return;
    }
    setNovelsData((current) =>
      current
        ? {
            ...current,
            novels: current.novels.filter((item) => item.id !== payload.novelId),
            featuredNovel:
              current.featuredNovel?.id === payload.novelId ? null : current.featuredNovel,
            totalCount: Math.max(0, current.totalCount - 1)
          }
        : current
    );
    setNovelDetail(null);
    setAuthNotice(payload.message);
    showNovels("home");
  };

  const handleSettingsUser = (user: AuthUser, notice = "Settings saved.") => {
    setCurrentUser(user);
    setAuthNotice(notice);
    setContentAccessRevision((revision) => revision + 1);
  };

  const searchSuggestionQueryActive = searchSuggestions?.query === illustrationQuery.trim();
  const hasSearchSuggestions = Boolean(
    searchSuggestionQueryActive &&
      searchSuggestions &&
      (searchSuggestions.tags.length > 0 ||
        searchSuggestions.creators.length > 0 ||
        searchSuggestions.artworks.length > 0)
  );

  return (
    <main className="pixiv-shell">
      <header className="global-header">
        <div className="header-inner">
          <div className="brand-cluster">
            <a
              className="brand-home-link"
              href="/"
              aria-label="Go to home"
              onClick={(event) => {
                if (
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey ||
                  event.button !== 0
                ) {
                  return;
                }

                event.preventDefault();
                showIllustrations("latest");
              }}
            >
              <div className="brand-mark" aria-hidden="true">
                N
              </div>
              <div className="brand-wordmark" aria-label="NEHub">
                <strong>NEHub</strong>
                <span>{isNovelSection ? "reading diary" : "art diary"}</span>
              </div>
            </a>
            <nav className="main-nav" aria-label="Content types">
              <button
                className={classNames(isIllustrationsSection && sort === "latest" && "is-active")}
                type="button"
                onClick={() => showIllustrations("latest")}
              >
                Illustrations
              </button>
              <button type="button">Manga</button>
              <button
                className={classNames(isNovelSection && "is-active")}
                type="button"
                onClick={() => showNovels("home")}
              >
                Novels
              </button>
            </nav>
          </div>

          <div className={classNames("searchbox", searchSuggestionsOpen && "is-open")}>
            <Search size={18} />
            <input
              value={activeSearchQuery}
              onBlur={() => {
                window.setTimeout(() => setSearchSuggestionsOpen(false), 120);
              }}
              onChange={(event) => {
                if (isNovelSection) {
                  setNovelQuery(event.target.value);
                  setSearchSuggestionsOpen(false);
                } else {
                  setIllustrationQuery(event.target.value);
                  setSearchSuggestionsOpen(true);
                }
              }}
              onFocus={() => setSearchSuggestionsOpen(isIllustrationsSection)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setSearchSuggestionsOpen(false);
                }
              }}
              placeholder={isNovelSection ? "Search works, authors, tags" : "Search works, creators, tags"}
              type="search"
            />
            {isIllustrationsSection && searchSuggestionsOpen && illustrationQuery.trim().length >= 2 ? (
              <div className="search-suggestions" role="listbox" aria-label="Search suggestions">
                {searchSuggestionsLoading ? <p className="muted">Finding matches.</p> : null}
                {searchSuggestionQueryActive && searchSuggestions?.tags.length ? (
                  <section>
                    <span className="search-suggestion-heading">Tags</span>
                    {searchSuggestions.tags.map((tag) => (
                      <button
                        type="button"
                        key={tag.name}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => openSuggestedTag(tag.name)}
                      >
                        <span className="search-suggestion-icon">#</span>
                        <span>
                          <strong>#{tag.name}</strong>
                          <small>{formatCount(tag.count)} works</small>
                        </span>
                      </button>
                    ))}
                  </section>
                ) : null}
                {searchSuggestionQueryActive && searchSuggestions?.creators.length ? (
                  <section>
                    <span className="search-suggestion-heading">Creators</span>
                    {searchSuggestions.creators.map((creator) => (
                      <button
                        type="button"
                        key={creator.id}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => openSuggestedCreator(creator.handle)}
                      >
                        {creator.avatarUrl ? (
                          <span className="search-suggestion-avatar">
                            <img src={creator.avatarUrl} alt="" />
                          </span>
                        ) : (
                          <DefaultAvatar className="search-suggestion-avatar" name={creator.displayName} />
                        )}
                        <span>
                          <strong>{creator.displayName}</strong>
                          <small>@{creator.handle}</small>
                        </span>
                      </button>
                    ))}
                  </section>
                ) : null}
                {searchSuggestionQueryActive && searchSuggestions?.artworks.length ? (
                  <section>
                    <span className="search-suggestion-heading">Works</span>
                    {searchSuggestions.artworks.map((artwork) => (
                      <button
                        type="button"
                        key={artwork.id}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => openSuggestedArtwork(artwork)}
                      >
                        <img
                          className="search-suggestion-thumb"
                          src={artwork.thumbnailUrl}
                          alt=""
                        />
                        <span>
                          <strong>{artwork.title}</strong>
                          <small>by {artwork.creator.displayName}</small>
                        </span>
                      </button>
                    ))}
                  </section>
                ) : null}
                {!searchSuggestionsLoading && searchSuggestionQueryActive && !hasSearchSuggestions ? (
                  <p className="muted">No suggestions found.</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="header-actions">
            <div className="notification-wrap">
              <button
                className={classNames("icon-button", notificationsOpen && "is-active")}
                type="button"
                aria-label="Notifications"
                onClick={handleToggleNotifications}
              >
                <Bell size={18} />
                {(notifications?.unreadCount ?? 0) > 0 ? (
                  <span className="notification-badge">
                    {formatCount(notifications?.unreadCount ?? 0)}
                  </span>
                ) : null}
              </button>
              {notificationsOpen ? (
                <NotificationMenu
                  data={notifications}
                  onMarkRead={handleMarkNotificationsRead}
                />
              ) : null}
            </div>
            <button
              className="primary-button"
              type="button"
              onClick={isNovelSection ? () => openNovelForm() : openUpload}
            >
              {isNovelSection ? <NotebookText size={17} /> : <ImageUp size={17} />}
              {isNovelSection ? "Write" : "Post"}
            </button>
            <AccountControl
              user={currentUser}
              onLogin={() => openAuth("login")}
              onRegister={() => openAuth("register")}
              onLogout={handleLogout}
              onProfile={() => currentUser && showProfile(currentUser.username)}
              onSettings={showProfileSettings}
            />
          </div>
        </div>
      </header>

      {hasAccountNotice ? (
        <div className="global-account-notice">
          <AccountNotice
            notice={accountNotice}
            siteKey={authConfig?.turnstileSiteKey ?? ""}
            user={currentUser}
            onDismiss={() => {
              setAuthNotice("");
              setDashboardMessage("");
            }}
            onResend={handleResendVerification}
          />
        </div>
      ) : null}

      <div className={classNames("page-frame", isNovelSection && "is-novel-section")}>
        <aside className="left-menu" aria-label="Main sections">
          {isNovelSection ? (
            <>
              <button
                className={classNames("menu-item", view === "novels" && routeNovelSection === "home" && "is-active")}
                type="button"
                onClick={() => showNovels("home")}
              >
                <Home size={18} />
                Home
              </button>
              <button
                className={classNames("menu-item", view === "novels" && routeNovelSection === "following" && "is-active")}
                type="button"
                onClick={() => showNovels("following")}
              >
                <Grid3X3 size={18} />
                Following
              </button>
              <button
                className={classNames("menu-item", view === "novels" && routeNovelSection === "creators" && "is-active")}
                type="button"
                onClick={() => showNovels("creators")}
              >
                <UserPlus size={18} />
                Creators
              </button>
              <button
                className={classNames("menu-item", view === "novels" && routeNovelSection === "tags" && "is-active")}
                type="button"
                onClick={() => showNovels("tags")}
              >
                <Bell size={18} />
                Tags
              </button>
              <button
                className={classNames("menu-item", view === "novels" && routeNovelSection === "bookmarks" && "is-active")}
                type="button"
                onClick={() => showNovels("bookmarks")}
              >
                <Bookmark size={18} />
                Bookmarks
              </button>
              <button
                className={classNames("menu-item", view === "novels" && routeNovelSection === "rankings" && "is-active")}
                type="button"
                onClick={() => showNovels("rankings")}
              >
                <Trophy size={18} />
                Rankings
              </button>
              <button
                className={classNames("menu-item", view === "novels" && routeNovelSection === "collections" && "is-active")}
                type="button"
                onClick={() => showNovels("collections")}
              >
                <FolderOpen size={18} />
                Collections
              </button>
              <SidebarDonateCard />
            </>
          ) : (
            <>
              <button
                className={classNames("menu-item", view === "illustrations" && sort === "latest" && "is-active")}
                type="button"
                onClick={() => showIllustrations("latest")}
              >
                <Home size={18} />
                Home
              </button>
              <button
                className={classNames("menu-item", view === "illustrations" && sort === "following" && "is-active")}
                type="button"
                onClick={showFollowingIllustrations}
              >
                <Grid3X3 size={18} />
                Following
              </button>
              <button
                className={classNames("menu-item", view === "creatorDiscover" && "is-active")}
                type="button"
                onClick={showCreatorDiscover}
              >
                <UserPlus size={18} />
                Creators
              </button>
              <button
                className={classNames("menu-item", view === "illustrations" && sort === "subscriptions" && "is-active")}
                type="button"
                onClick={showTagSubscriptions}
              >
                <Bell size={18} />
                Tags
              </button>
              <button
                className={classNames("menu-item", view === "illustrations" && sort === "bookmarks" && "is-active")}
                type="button"
                onClick={showBookmarks}
              >
                <Bookmark size={18} />
                Bookmarks
              </button>
              <button
                className={classNames("menu-item", view === "rankings" && "is-active")}
                type="button"
                onClick={showRankings}
              >
                <Trophy size={18} />
                Rankings
              </button>
              <button
                className={classNames("menu-item", view === "collectionDiscover" && "is-active")}
                type="button"
                onClick={showCollectionDiscover}
              >
                <FolderOpen size={18} />
                Collections
              </button>
              <SidebarDonateCard />
            </>
          )}
          {currentUser ? (
            <>
              <button
                className={classNames(
                  "menu-item",
                  view === "profile" && profileUsername.toLowerCase() === currentUser.username.toLowerCase() && "is-active"
                )}
                type="button"
                onClick={() => showProfile(currentUser.username)}
              >
                <UserRound size={18} />
                Profile
              </button>
              <button
                className={classNames("menu-item", view === "notifications" && "is-active")}
                type="button"
                onClick={showNotifications}
              >
                <Bell size={18} />
                Notifications
              </button>
              <button
                className={classNames("menu-item", view === "analytics" && "is-active")}
                type="button"
                onClick={showAnalytics}
              >
                <TrendingUp size={18} />
                Analytics
              </button>
              <button
                className={classNames(
                  "menu-item",
                  (view === "collections" || view === "collection") && "is-active"
                )}
                type="button"
                onClick={showCollections}
              >
                <FolderOpen size={18} />
                My folders
              </button>
              <button
                className={classNames(
                  "menu-item",
                  (view === "seriesList" || view === "series") && "is-active"
                )}
                type="button"
                onClick={showSeriesList}
              >
                <ListOrdered size={18} />
                My series
              </button>
              <button
                className={classNames("menu-item", view === "profileSettings" && "is-active")}
                type="button"
                onClick={showProfileSettings}
              >
                <UserCog size={18} />
                Profile settings
              </button>
              <button
                className={classNames("menu-item", view === "privacySecurity" && "is-active")}
                type="button"
                onClick={showPrivacySecurity}
              >
                <KeyRound size={18} />
                Privacy
              </button>
            </>
          ) : null}
          {canModerate ? (
            <button
              className={classNames("menu-item", view === "dashboard" && "is-active")}
              type="button"
              onClick={showDashboard}
            >
              <BarChart3 size={18} />
              Dashboard
            </button>
          ) : null}
          {isNovelSection ? (
            <>
              <button
                className={classNames("menu-item", view === "novels" && routeNovelSection === "terms" && "is-active")}
                type="button"
                onClick={() => showNovels("terms")}
              >
                <FileText size={18} />
                Terms
              </button>
              <button
                className={classNames("menu-item", view === "novels" && routeNovelSection === "privacy" && "is-active")}
                type="button"
                onClick={() => showNovels("privacy")}
              >
                <Shield size={18} />
                Policy
              </button>
            </>
          ) : (
            <>
              <button
                className={classNames("menu-item", view === "terms" && "is-active")}
                type="button"
                onClick={() => showPolicy("terms")}
              >
                <FileText size={18} />
                Terms
              </button>
              <button
                className={classNames("menu-item", view === "privacy" && "is-active")}
                type="button"
                onClick={() => showPolicy("privacy")}
              >
                <Shield size={18} />
                Policy
              </button>
            </>
          )}
        </aside>

        {view === "dashboard" ? (
          <Dashboard
            context={routeContext}
            artworks={artworks}
            health={health}
            adminStats={adminStats}
            adminReports={adminReports}
            reportStatus={adminReportStatus}
            reportTarget={adminReportTarget}
            reportReason={adminReportReason}
            reportLimit={adminReportLimit}
            adminUsers={adminUsers}
            userQuery={adminUserQuery}
            userStatus={adminUserStatus}
            userLimit={adminUserLimit}
            adminTags={adminTags}
            adminAuditLog={adminAuditLog}
            adminArtworkReviews={adminArtworkReviews}
            canAdminister={canAdminister}
            message={dashboardMessage}
            source={gallery?.source ?? "empty"}
            tagsCount={gallery?.tags.length ?? 0}
            creatorsCount={gallery?.creators.length ?? 0}
            totalLikes={totalLikes}
            totalViews={totalViews}
            onUpload={routeContext === "novels" ? () => openNovelForm() : openUpload}
            onResolveReport={handleResolveReport}
            onReportStatusChange={setAdminReportStatus}
            onReportTargetChange={setAdminReportTarget}
            onReportReasonChange={setAdminReportReason}
            onReportLimitChange={setAdminReportLimit}
            onUserQueryChange={setAdminUserQuery}
            onUserStatusChange={setAdminUserStatus}
            onUserLimitChange={setAdminUserLimit}
            onUpdateUserRole={handleUpdateUserRole}
            onToggleArtworkReview={handleToggleArtworkReview}
            onReviewArtwork={handleReviewArtwork}
            onModerateArtwork={handleModerateReportedArtwork}
            onModerateNovel={handleModerateReportedNovel}
            onDeleteReportedComment={handleDeleteReportedComment}
            onToggleUserSuspension={handleToggleUserSuspension}
            onSuspendReportedUser={handleSuspendReportedUser}
            onSaveTagAlias={handleSaveTagAlias}
            onDeleteTagAlias={handleDeleteTagAlias}
            onSaveTagImplication={handleSaveTagImplication}
            onDeleteTagImplication={handleDeleteTagImplication}
          />
        ) : view === "novels" ? (
          routeNovelSection === "terms" ? (
            <PolicyPage kind="terms" context="novels" onOpenPrivacy={() => showNovels("privacy")} />
          ) : routeNovelSection === "privacy" ? (
            <PolicyPage kind="privacy" context="novels" onOpenTerms={() => showNovels("terms")} />
          ) : (
            <NovelHubPage
              section={routeNovelSection}
              data={novelsData}
              activityData={activityData}
              featuredNovel={featuredNovel}
              novels={novels}
              totalWords={totalNovelWords}
              creators={novelCreators}
              followedCreators={followedNovelCreators}
              followedNovels={followedNovels}
              rankingNovels={novelRankingNovels}
              rankingItems={novelRankingData?.rankings ?? []}
              rankingPeriod={novelRankingPeriod}
              continueReadingItems={continueReadingItems}
              bookmarkedNovels={bookmarkedNovels}
              collections={novelCollections}
              currentUser={currentUser}
              matureFilter={novelMatureFilter}
              sortMode={novelSortMode}
              activeTag={activeNovelTag}
              query={novelQuery}
              onMatureFilterChange={setNovelMatureFilter}
              onSortModeChange={setNovelSortMode}
              onTagFilterChange={setActiveNovelTag}
              onRankingPeriodChange={setNovelRankingPeriod}
              onAuthRequired={() => openAuth("login")}
              onOpenNovel={openNovel}
              onOpenCollection={showCollection}
              onOpenArtwork={openArtwork}
              onOpenProfile={showProfile}
              onPrivacySecurity={showPrivacySecurity}
              onOpenSection={showNovels}
            />
          )
        ) : view === "novel" ? (
          <NovelDetailPage
            detail={novelDetail}
            loading={novelLoading}
            currentUser={currentUser}
            siteKey={authConfig?.turnstileSiteKey ?? ""}
            readingLists={readingLists?.readingLists ?? []}
            onBack={showNovels}
            onAuthRequired={() => openAuth("login")}
            onLikeNovel={handleNovelLike}
            onBookmarkNovel={handleNovelBookmark}
            onExportNovel={handleExportNovel}
            onReportNovel={handleReportNovel}
            onEditNovel={openNovelForm}
            onDeleteNovel={handleDeleteNovel}
            onCreateReadingList={handleCreateReadingList}
            onToggleReadingListNovel={handleToggleReadingListNovel}
            onCommentNovel={handleNovelComment}
            onUpdateNovelComment={handleUpdateNovelComment}
            onDeleteNovelComment={handleDeleteNovelComment}
            onUpdateReadingProgress={handleUpdateReadingProgress}
            onOpenNovel={openNovel}
            onOpenProfile={showProfile}
            onPrivacySecurity={showPrivacySecurity}
          />
        ) : view === "profile" ? (
          <ProfilePage
            context={routeContext}
            username={profileUsername}
            csrfToken={csrfToken}
            siteKey={authConfig?.turnstileSiteKey ?? ""}
            currentUser={currentUser}
            onAuthRequired={() => openAuth("login")}
            onBookmark={handleBookmark}
            onOpenCollection={showCollection}
            onOpenNovel={openNovel}
            onOpenProfile={showProfile}
            onOpenPrivacySecurity={showPrivacySecurity}
            onOpenProfileSettings={showProfileSettings}
            onOpenSeries={showSeries}
            onSelectArtwork={openArtwork}
          />
        ) : view === "tag" ? (
          <TagPage
            tag={routeTag}
            currentUser={currentUser}
            onAuthRequired={() => openAuth("login")}
            onBookmark={handleBookmark}
            onOpenArtwork={openArtwork}
            onOpenPrivacySecurity={showPrivacySecurity}
            onOpenProfile={showProfile}
            onOpenTag={showTag}
            onToggleSubscription={handleToggleTagSubscription}
          />
        ) : view === "creatorDiscover" ? (
          <CreatorDiscoverPage
            csrfToken={csrfToken}
            currentUser={currentUser}
            onAuthRequired={() => openAuth("login")}
            onOpenProfile={showProfile}
            onOpenPrivacySecurity={showPrivacySecurity}
          />
        ) : view === "rankings" ? (
          <RankingsPage
            period={rankingPeriod}
            currentUser={currentUser}
            onAuthRequired={() => openAuth("login")}
            onBookmark={handleBookmark}
            onOpenArtwork={openArtwork}
            onOpenPrivacySecurity={showPrivacySecurity}
            onOpenProfile={showProfile}
            onPeriodChange={setRankingPeriod}
          />
        ) : view === "notifications" ? (
          <NotificationsPage
            context={routeContext}
            data={notifications}
            currentUser={currentUser}
            onAuthRequired={() => openAuth("login")}
            onMarkRead={handleMarkNotificationsRead}
            onOpenNotification={handleOpenNotification}
            onRefresh={loadNotifications}
          />
        ) : view === "analytics" ? (
          <CreatorAnalyticsPage
            context={routeContext}
            currentUser={currentUser}
            onAuthRequired={() => openAuth("login")}
            onOpenArtwork={openArtwork}
          />
        ) : view === "collectionDiscover" ? (
          <CollectionDiscoverPage
            currentUser={currentUser}
            onAuthRequired={() => openAuth("login")}
            onOpenCollection={showCollection}
            onOpenProfile={showProfile}
            onOpenPrivacySecurity={showPrivacySecurity}
          />
        ) : view === "collections" ? (
          routeContext === "novels" ? (
            <ReadingListsPage
              readingLists={readingLists?.readingLists ?? []}
              currentUser={currentUser}
              onAuthRequired={() => openAuth("login")}
              onCreateReadingList={handleCreateReadingList}
              onOpenReadingList={showCollection}
            />
          ) : (
            <CollectionsPage
              context={routeContext}
              collections={collections?.collections ?? []}
              currentUser={currentUser}
              onAuthRequired={() => openAuth("login")}
              onCreateCollection={handleCreateCollection}
              onOpenCollection={showCollection}
            />
          )
        ) : view === "collection" ? (
          routeContext === "novels" ? (
            <ReadingListPage
              readingListId={routeCollectionId}
              csrfToken={csrfToken}
              currentUser={currentUser}
              onAuthRequired={() => openAuth("login")}
              onBack={showCollections}
              onDelete={handleDeleteReadingList}
              onDeleted={showCollections}
              onOpenNovel={openNovel}
              onOpenProfile={showProfile}
              onOpenPrivacySecurity={showPrivacySecurity}
              onUpdate={handleUpdateReadingList}
            />
          ) : (
            <CollectionPage
              context={routeContext}
              collectionId={routeCollectionId}
              currentUser={currentUser}
              onAuthRequired={() => openAuth("login")}
              onBack={showCollections}
              onBookmark={handleBookmark}
              onDelete={handleDeleteCollection}
              onDeleted={showCollections}
              onOpenArtwork={openArtwork}
              onOpenProfile={showProfile}
              onOpenPrivacySecurity={showPrivacySecurity}
              onUpdate={handleUpdateCollection}
            />
          )
        ) : view === "seriesList" ? (
          routeContext === "novels" ? (
            <NovelSeriesListPage
              seriesList={novelSeriesList?.series ?? []}
              currentUser={currentUser}
              onAuthRequired={() => openAuth("login")}
              onCreateSeries={handleCreateNovelSeries}
              onOpenSeries={showSeries}
            />
          ) : (
            <SeriesListPage
              context={routeContext}
              seriesList={seriesList?.series ?? []}
              currentUser={currentUser}
              onAuthRequired={() => openAuth("login")}
              onCreateSeries={handleCreateSeries}
              onOpenSeries={showSeries}
            />
          )
        ) : view === "series" ? (
          routeContext === "novels" ? (
            <NovelSeriesPage
              seriesId={routeSeriesId}
              csrfToken={csrfToken}
              currentUser={currentUser}
              onAuthRequired={() => openAuth("login")}
              onBack={showSeriesList}
              onDelete={handleDeleteNovelSeries}
              onDeleted={showSeriesList}
              onOpenNovel={openNovel}
              onOpenProfile={showProfile}
              onOpenPrivacySecurity={showPrivacySecurity}
              onUpdate={handleUpdateNovelSeries}
            />
          ) : (
            <SeriesPage
              context={routeContext}
              seriesId={routeSeriesId}
              currentUser={currentUser}
              onAuthRequired={() => openAuth("login")}
              onBack={showSeriesList}
              onBookmark={handleBookmark}
              onDelete={handleDeleteSeries}
              onDeleted={showSeriesList}
              onOpenArtwork={openArtwork}
              onOpenProfile={showProfile}
              onOpenPrivacySecurity={showPrivacySecurity}
              onUpdate={handleUpdateSeries}
            />
          )
        ) : view === "profileSettings" ? (
          <ProfileSettingsPage
            context={routeContext}
            csrfToken={csrfToken}
            currentUser={currentUser}
            onAuthRequired={() => openAuth("login")}
            onOpenPrivacySecurity={showPrivacySecurity}
            onOpenProfile={showProfile}
            onSaved={handleSettingsUser}
          />
        ) : view === "privacySecurity" ? (
          <PrivacySecurityPage
            context={routeContext}
            csrfToken={csrfToken}
            currentUser={currentUser}
            onAuthRequired={() => openAuth("login")}
            onNotice={setAuthNotice}
            onOpenProfileSettings={showProfileSettings}
            onPasswordChanged={(payload) => {
              setCurrentUser(payload.user);
              setCsrfToken(payload.csrfToken);
              setAuthNotice(payload.message);
            }}
            onSessionsChanged={(payload) => {
              setCsrfToken(payload.csrfToken);
              setAuthNotice(payload.message);
            }}
            onAccountDeactivated={handleAccountDeactivated}
            onSaved={handleSettingsUser}
          />
        ) : view === "emailConfirmation" ? (
          <EmailConfirmationPage
            currentUser={currentUser}
            onAuthRequired={() => openAuth("login")}
            onHome={() => showIllustrations("latest")}
            onOpenPrivacySecurity={showPrivacySecurity}
            onSessionRefresh={refreshAuthSession}
            siteKey={authConfig?.turnstileSiteKey ?? ""}
          />
        ) : view === "discordVerification" ? (
          <DiscordVerificationPage
            onAuthRequired={() => openAuth("login")}
            onHome={() => showIllustrations("latest")}
            onSessionRefresh={refreshAuthSession}
            siteKey={authConfig?.turnstileSiteKey ?? ""}
          />
        ) : view === "terms" ? (
          <PolicyPage kind="terms" onOpenPrivacy={() => showPolicy("privacy")} />
        ) : view === "privacy" ? (
          <PolicyPage kind="privacy" onOpenTerms={() => showPolicy("terms")} />
        ) : view === "artwork" && artworkDetail ? (
          <ArtworkDialog
            detail={artworkDetail}
            fallbackArtwork={artworkDetail.artwork}
            loading={detailLoading}
            presentation="page"
            onClose={() => showIllustrations("latest")}
            onLike={handleLike}
            onBookmark={handleBookmark}
            onDelete={handleDeleteArtwork}
            onUpdate={handleUpdateArtwork}
            onReorderImages={handleReorderArtworkImages}
            onDeleteImage={handleDeleteArtworkImage}
            onAddImages={handleAddArtworkImages}
            onUnlockStorageSlot={handleUnlockStorageSlot}
            storageUnlocking={storageUnlockSubmitting}
            onOpenArtwork={openArtworkPage}
            onComment={handleComment}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
            onReportArtwork={handleReportArtwork}
            onReportComment={handleReportComment}
            collections={collections?.collections ?? []}
            onCreateCollection={handleCreateCollection}
            onOpenCollection={showCollection}
            onToggleCollectionItem={handleToggleCollectionItem}
            seriesList={seriesList?.series ?? []}
            onCreateSeries={handleCreateSeries}
            onOpenSeries={showSeries}
            onToggleSeriesItem={handleToggleSeriesItem}
            siteKey={authConfig?.turnstileSiteKey ?? ""}
            onOpenProfile={showProfile}
            currentUser={currentUser}
            matureAccess={gallery?.matureAccess ?? null}
          />
        ) : view === "artwork" ? (
          <section className="content-main artwork-page-empty">
            <p className="empty-feed">{detailLoading ? "Loading artwork." : "Artwork could not be loaded."}</p>
          </section>
        ) : view === "illustrations" ? (
          <IllustrationsPage
            gallery={gallery}
            activityData={activityData}
            artworks={artworks}
            creators={gallery?.creators ?? []}
            prominentTags={prominentTags}
            subscribedTagSet={subscribedTagSet}
            rankingItems={rankingItems}
            rankingPeriod={rankingPeriod}
            matureFilter={illustrationMatureFilter}
            feedTitle={feedTitle}
            feedMeta={feedMeta}
            filterLabel={filterLabel}
            galleryLoadingMore={galleryLoadingMore}
            isBookmarksView={isBookmarksView}
            onAuthRequired={() => openAuth("login")}
            onPrivacySecurity={showPrivacySecurity}
            onMatureFilterChange={setIllustrationMatureFilter}
            onResetFilters={() => {
              setActiveTag("");
              setIllustrationQuery("");
              setIllustrationMatureFilter("all");
            }}
            onOpenTag={showTag}
            onToggleTagSubscription={handleToggleTagSubscription}
            onOpenArtwork={openArtwork}
            onOpenArtworkPage={openArtworkPage}
            onOpenNovel={openNovel}
            onBookmark={handleBookmark}
            onOpenProfile={showProfile}
            onLoadMore={handleLoadMoreGallery}
            onRankingPeriodChange={setRankingPeriod}
          />
        ) : null}
      </div>

      {selectedArtwork ? (
        <ArtworkDialog
          detail={artworkDetail}
          fallbackArtwork={selectedArtwork}
          loading={detailLoading}
          presentation="modal"
          onClose={closeArtwork}
          onLike={handleLike}
          onBookmark={handleBookmark}
          onDelete={handleDeleteArtwork}
          onUpdate={handleUpdateArtwork}
          onReorderImages={handleReorderArtworkImages}
          onDeleteImage={handleDeleteArtworkImage}
          onAddImages={handleAddArtworkImages}
          onUnlockStorageSlot={handleUnlockStorageSlot}
          storageUnlocking={storageUnlockSubmitting}
          onOpenArtwork={openArtworkPage}
          onComment={handleComment}
          onUpdateComment={handleUpdateComment}
          onDeleteComment={handleDeleteComment}
          onReportArtwork={handleReportArtwork}
          onReportComment={handleReportComment}
          collections={collections?.collections ?? []}
          onCreateCollection={handleCreateCollection}
          onOpenCollection={showCollection}
          onToggleCollectionItem={handleToggleCollectionItem}
          seriesList={seriesList?.series ?? []}
          onCreateSeries={handleCreateSeries}
          onOpenSeries={showSeries}
          onToggleSeriesItem={handleToggleSeriesItem}
          siteKey={authConfig?.turnstileSiteKey ?? ""}
          onOpenProfile={showProfile}
          currentUser={currentUser}
          matureAccess={gallery?.matureAccess ?? null}
        />
      ) : null}

      <UploadDrawer
        open={uploadOpen}
        message={uploadMessage}
        siteKey={authConfig?.turnstileSiteKey ?? ""}
        currentUser={currentUser}
        matureAccess={gallery?.matureAccess ?? null}
        uploading={uploadSubmitting}
        progress={uploadProgress}
        onClose={() => {
          if (!uploadSubmitting) {
            setUploadOpen(false);
            setUploadProgress(0);
          }
        }}
        onOpenPrivacySecurity={showPrivacySecurity}
        onUnlockStorageSlot={handleUnlockStorageSlot}
        storageUnlocking={storageUnlockSubmitting}
        onSubmit={handleUpload}
      />

      <NovelFormDrawer
        open={novelFormOpen}
        mode={novelFormMode}
        novel={novelFormNovel}
        message={novelFormMessage}
        siteKey={authConfig?.turnstileSiteKey ?? ""}
        matureAccess={novelsData?.matureAccess ?? null}
        seriesList={novelSeriesList?.series ?? []}
        submitting={novelFormSubmitting}
        onClose={() => {
          if (!novelFormSubmitting) {
            setNovelFormOpen(false);
            setNovelFormNovel(null);
          }
        }}
        onOpenPrivacySecurity={showPrivacySecurity}
        onSubmit={handleSaveNovel}
        onImport={handleImportNovel}
      />

      {authOpen ? (
        <AuthDialog
          mode={authMode}
          siteKey={authConfig?.turnstileSiteKey ?? ""}
          discordEnabled={authConfig?.discordEnabled ?? false}
          initialResetToken={passwordResetToken}
          onClose={() => setAuthOpen(false)}
          onModeChange={setAuthMode}
          onResetTokenConsumed={() => setPasswordResetToken("")}
          onSuccess={handleAuthSuccess}
        />
      ) : null}
    </main>
  );
}

type AccountControlProps = {
  user: AuthUser | null;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  onProfile: () => void;
  onSettings: () => void;
};

function AccountControl({
  user,
  onLogin,
  onRegister,
  onLogout,
  onProfile,
  onSettings
}: AccountControlProps) {
  if (!user) {
    return (
      <div className="auth-actions">
        <button className="secondary-button auth-compact" type="button" onClick={onLogin}>
          <LogIn size={16} />
          Sign in
        </button>
        <button className="primary-button auth-compact" type="button" onClick={onRegister}>
          <UserRound size={16} />
          Join
        </button>
      </div>
    );
  }

  return (
    <div className="account-chip" title={user.displayName}>
      <span className={classNames("verify-dot", (user.emailVerified || user.role !== "member") && "is-verified")} />
      <button className="account-name" type="button" onClick={onProfile}>
        {user.displayName}
      </button>
      <button className="icon-button account-settings" type="button" onClick={onSettings} aria-label="Account settings">
        <Settings size={16} />
      </button>
      <button className="icon-button account-logout" type="button" onClick={onLogout} aria-label="Sign out">
        <LogOut size={16} />
      </button>
    </div>
  );
}

type AccountNoticeProps = {
  notice: string;
  siteKey: string;
  user: AuthUser | null;
  onDismiss: () => void;
  onResend: (turnstileToken: string) => Promise<string>;
};

function AccountNotice({
  notice,
  siteKey,
  user,
  onDismiss,
  onResend
}: AccountNoticeProps) {
  const [resendToken, setResendToken] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const needsVerification = Boolean(user && !user.emailVerified);
  if (!notice && !needsVerification) {
    return null;
  }
  const noticeHeading = notice || "Verify your email";
  const noticeDetail = needsVerification
    ? notice
      ? "Verify your email to keep full account access."
      : "Check your inbox for the account link."
    : "";

  const handleResend = async () => {
    if (!resendToken) {
      setResendMessage("Complete the check first.");
      return;
    }
    setResending(true);
    setResendMessage("");
    try {
      const message = await onResend(resendToken);
      setResendMessage(message);
      setResendToken("");
    } catch (error) {
      setResendMessage(error instanceof Error ? error.message : "Verification email failed.");
    } finally {
      setResending(false);
    }
  };

  return (
    <section className="account-notice" aria-live="polite">
      <div className="account-notice-copy">
        <MailCheck size={20} />
        <div>
          <strong>{noticeHeading}</strong>
          {noticeDetail ? <span>{noticeDetail}</span> : null}
        </div>
      </div>
      {needsVerification ? (
        <div className="resend-cluster">
          <TurnstileWidget siteKey={siteKey} action="resend" onToken={setResendToken} compact />
          <button className="secondary-button" type="button" onClick={handleResend} disabled={resending}>
            <MailCheck size={16} />
            {resending ? "Sending" : "Resend"}
          </button>
        </div>
      ) : (
        <button className="icon-button notice-close" type="button" onClick={onDismiss} aria-label="Dismiss">
          <X size={16} />
        </button>
      )}
      {resendMessage ? <p className="auth-inline-message">{resendMessage}</p> : null}
    </section>
  );
}

const emailConfirmationKindFromQuery = (value: string | null): EmailConfirmationKind =>
  value === "change" ? "change" : "verify";

const emailConfirmationStatusFromQuery = (
  value: string | null
): EmailConfirmationStatus | null =>
  value === "confirmed" || value === "invalid" || value === "unavailable" ? value : null;

const emailConfirmationStatusMessage = (
  kind: EmailConfirmationKind,
  status: EmailConfirmationStatus
) => {
  if (status === "confirmed") {
    return kind === "change"
      ? "Email change confirmed. Your sign-in email was updated successfully."
      : "Email confirmation complete. Your account is verified.";
  }
  if (status === "unavailable") {
    return "Email confirmation is temporarily unavailable.";
  }
  return kind === "change"
    ? "Email change link is invalid or expired."
    : "Email confirmation link is invalid or expired.";
};

type EmailConfirmationPageProps = {
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onHome: () => void;
  onOpenPrivacySecurity: () => void;
  onSessionRefresh: () => Promise<AuthSessionResponse>;
  siteKey: string;
};

function EmailConfirmationPage({
  currentUser,
  onAuthRequired,
  onHome,
  onOpenPrivacySecurity,
  onSessionRefresh,
  siteKey
}: EmailConfirmationPageProps) {
  const confirmationParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const kind = emailConfirmationKindFromQuery(confirmationParams.get("kind"));
  const token = confirmationParams.get("token")?.trim() ?? "";
  const initialStatus = emailConfirmationStatusFromQuery(confirmationParams.get("status"));
  const [status, setStatus] = useState<"challenge" | "pending" | EmailConfirmationStatus>(
    initialStatus ?? (token ? "challenge" : "invalid")
  );
  const [turnstileToken, setTurnstileToken] = useState("");
  const [challengeRevision, setChallengeRevision] = useState(0);
  const [message, setMessage] = useState(() => {
    if (initialStatus) {
      return emailConfirmationStatusMessage(kind, initialStatus);
    }
    if (!token) {
      return "Email confirmation link is missing.";
    }
    return kind === "change"
      ? "Complete the security check to confirm your new email."
      : "Complete the security check to confirm your account email.";
  });

  useEffect(() => {
    if (!token) {
      if (!initialStatus) {
        setStatus("invalid");
        setMessage("Email confirmation link is missing.");
      } else if (initialStatus === "confirmed") {
        onSessionRefresh().catch((error: unknown) => {
          console.error("Unable to refresh confirmed session", error);
        });
      }
    }
  }, [initialStatus, onSessionRefresh, token]);

  const handleConfirm = async () => {
    if (!token) {
      setStatus("invalid");
      setMessage("Email confirmation link is missing.");
      return;
    }
    if (!turnstileToken) {
      setMessage("Complete the security check first.");
      return;
    }

    const endpoint =
      kind === "change" ? "/api/settings/email/confirm" : "/api/auth/verify-email";

    setStatus("pending");
    setMessage(kind === "change" ? "Confirming your email change." : "Confirming your account email.");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          accept: "application/json"
        },
        body: JSON.stringify({
          token,
          turnstileToken
        })
      });
      const payload = (await response.json().catch(() => null)) as
        | EmailConfirmationResponse
        | { message?: string }
        | null;
      if (payload && "status" in payload && "kind" in payload) {
        setStatus(payload.status);
        setMessage(payload.message);
        window.history.replaceState(
          null,
          "",
          `/email-confirmation?kind=${payload.kind}&status=${payload.status}`
        );
        if (payload.status === "confirmed") {
          await onSessionRefresh().catch((error: unknown) => {
            console.error("Unable to refresh confirmed session", error);
          });
        }
        return;
      }
      throw new Error(payload?.message ?? "Email confirmation failed.");
    } catch (error) {
      setStatus("challenge");
      setTurnstileToken("");
      setChallengeRevision((revision) => revision + 1);
      setMessage(error instanceof Error ? error.message : "Email confirmation failed.");
    }
  };

  const StatusIcon =
    status === "confirmed" ? ShieldCheck : status === "invalid" ? X : MailCheck;
  const title =
    status === "pending"
      ? "Confirming email"
      : status === "challenge"
        ? "Confirm email"
        : status === "confirmed"
          ? kind === "change"
            ? "Email changed"
            : "Email verified"
          : status === "unavailable"
            ? "Confirmation unavailable"
            : "Link needs attention";

  return (
    <section className="content-main email-confirmation-page" aria-live="polite">
      <div className={`email-confirmation-card is-${status}`}>
        <span className="email-confirmation-icon">
          <StatusIcon size={28} />
        </span>
        <p className="eyebrow">Email confirmation</p>
        <h1>{title}</h1>
        <p>{message}</p>
        {status === "challenge" && token ? (
          <div className="email-confirmation-check">
            <TurnstileWidget
              key={challengeRevision}
              siteKey={siteKey}
              action="email-confirm"
              onToken={setTurnstileToken}
              compact
            />
            <button
              className="primary-button"
              type="button"
              onClick={() => void handleConfirm()}
              disabled={!siteKey || !turnstileToken}
            >
              <ShieldCheck size={16} />
              Confirm email
            </button>
          </div>
        ) : null}
        {status !== "pending" && status !== "challenge" ? (
          <div className="email-confirmation-actions">
            <button className="primary-button" type="button" onClick={onHome}>
              <Home size={16} />
              Open gallery
            </button>
            {status === "confirmed" && kind === "change" && currentUser ? (
              <button className="secondary-button" type="button" onClick={onOpenPrivacySecurity}>
                <KeyRound size={16} />
                Privacy settings
              </button>
            ) : null}
            {!currentUser ? (
              <button className="secondary-button" type="button" onClick={onAuthRequired}>
                <LogIn size={16} />
                Sign in
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

type DiscordVerificationPageProps = {
  onAuthRequired: () => void;
  onHome: () => void;
  onSessionRefresh: () => Promise<AuthSessionResponse>;
  siteKey: string;
};

function DiscordVerificationPage({
  onAuthRequired,
  onHome,
  onSessionRefresh,
  siteKey
}: DiscordVerificationPageProps) {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const token = params.get("token")?.trim() ?? "";
  const initialStatus =
    params.get("status") === "confirmed"
      ? "confirmed"
      : params.get("status") === "unavailable"
        ? "unavailable"
        : params.get("status") === "invalid"
          ? "invalid"
          : null;
  const [status, setStatus] = useState<
    "challenge" | "pending" | "confirmed" | "invalid" | "unavailable"
  >(initialStatus ?? (token ? "challenge" : "invalid"));
  const [challengeRevision, setChallengeRevision] = useState(0);
  const [returnTo, setReturnTo] = useState("/");
  const verificationInFlightRef = useRef(false);
  const [message, setMessage] = useState(() =>
    initialStatus === "confirmed"
      ? "Discord sign-in verified."
      : initialStatus === "unavailable"
        ? "Discord verification is temporarily unavailable."
        : !token
          ? "Discord verification link is missing."
          : "NEHub is checking this Discord sign-in before creating your session."
  );

  useEffect(() => {
    if (!token && !initialStatus) {
      setStatus("invalid");
      setMessage("Discord verification link is missing.");
    } else if (initialStatus === "confirmed") {
      onSessionRefresh().catch((error: unknown) => {
        console.error("Unable to refresh Discord session", error);
      });
    }
  }, [initialStatus, onSessionRefresh, token]);

  const handleVerify = useCallback(async (turnstileToken: string) => {
    const verifiedTurnstileToken = turnstileToken.trim();
    if (!token) {
      setStatus("invalid");
      setMessage("Discord verification link is missing.");
      return;
    }
    if (!verifiedTurnstileToken || verificationInFlightRef.current) {
      return;
    }
    verificationInFlightRef.current = true;
    setStatus("pending");
    setMessage("Verifying Discord sign-in.");
    try {
      const response = await fetch("/api/auth/discord/verify", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          accept: "application/json"
        },
        body: JSON.stringify({ token, turnstileToken: verifiedTurnstileToken })
      });
      const payload = (await response.json().catch(() => null)) as
        | DiscordVerificationResponse
        | { message?: string }
        | null;
      if (payload && "status" in payload) {
        setStatus(payload.status);
        setMessage(payload.message);
        window.history.replaceState(null, "", `/discord-verification?status=${payload.status}`);
        if (payload.status === "confirmed") {
          setReturnTo(payload.returnTo);
          await onSessionRefresh().catch((error: unknown) => {
            console.error("Unable to refresh Discord session", error);
          });
          window.location.assign(payload.returnTo);
        } else {
          setChallengeRevision((revision) => revision + 1);
        }
        return;
      }
      throw new Error(payload?.message ?? "Discord verification failed.");
    } catch (error) {
      setStatus("challenge");
      setChallengeRevision((revision) => revision + 1);
      setMessage(error instanceof Error ? error.message : "Discord verification failed.");
    } finally {
      verificationInFlightRef.current = false;
    }
  }, [onSessionRefresh, token]);

  const StatusIcon =
    status === "confirmed" ? ShieldCheck : status === "invalid" || status === "unavailable" ? X : MessageCircle;
  const title =
    status === "pending"
      ? "Verifying Discord"
      : status === "unavailable"
        ? "Verification unavailable"
        : status === "invalid"
          ? "Link needs attention"
          : status === "confirmed"
            ? "Discord verified"
            : "Verify Discord sign-in";

  return (
    <section className="content-main discord-verification-page" aria-live="polite">
      <div className={`discord-verification-card is-${status}`}>
        <span className="discord-verification-icon">
          <StatusIcon size={28} />
        </span>
        <p className="eyebrow">Discord verification</p>
        <h1>{title}</h1>
        <p>{message}</p>
        {status === "challenge" && token ? (
          <div className="discord-verification-check">
            <TurnstileWidget
              key={challengeRevision}
              siteKey={siteKey}
              action="discord-confirm"
              onToken={handleVerify}
              compact
            />
          </div>
        ) : null}
        {status !== "pending" && status !== "challenge" ? (
          <div className="discord-verification-actions">
            {status === "confirmed" ? (
              <button
                className="primary-button"
                type="button"
                onClick={() => window.location.assign(returnTo)}
              >
                <LogIn size={16} />
                Continue
              </button>
            ) : (
              <button className="primary-button" type="button" onClick={onHome}>
                <Home size={16} />
                Open gallery
              </button>
            )}
            {status !== "confirmed" ? (
              <button className="secondary-button" type="button" onClick={onAuthRequired}>
                <LogIn size={16} />
                Sign in
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

type MatureAccessNoticeProps = {
  matureAccess: MatureAccess | null;
  onLogin: () => void;
  onPrivacySecurity: () => void;
};

function MatureAccessNotice({
  matureAccess,
  onLogin,
  onPrivacySecurity
}: MatureAccessNoticeProps) {
  if (!matureAccess || matureAccess.allowed) {
    return null;
  }

  const action =
    matureAccess.reason === "sign_in_required" ? (
      <button className="secondary-button" type="button" onClick={onLogin}>
        <LogIn size={16} />
        Sign in
      </button>
    ) : matureAccess.reason === "region_restricted" ? null : (
      <button className="secondary-button" type="button" onClick={onPrivacySecurity}>
        <KeyRound size={16} />
        Verify age
      </button>
    );

  return (
    <section className="mature-access-strip" aria-live="polite">
      <div>
        <EyeOff size={18} />
        <span>{matureAccessLabel(matureAccess)}</span>
      </div>
      {action}
    </section>
  );
}

type TurnstileWidgetProps = {
  siteKey: string;
  action: TurnstileAction;
  onToken: (token: string) => void;
  compact?: boolean;
};

function TurnstileWidget({ siteKey, action, onToken, compact = false }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string>("");

  useEffect(() => {
    let cancelled = false;

    const render = () => {
      if (cancelled || widgetIdRef.current || !containerRef.current || !siteKey || !window.turnstile) {
        return Boolean(widgetIdRef.current);
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        action,
        callback: onToken,
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
        theme: "light",
        size: "normal"
      });
      return true;
    };

    if (!render()) {
      const interval = window.setInterval(() => {
        if (render()) {
          window.clearInterval(interval);
        }
      }, 150);

      return () => {
        cancelled = true;
        window.clearInterval(interval);
        if (widgetIdRef.current && window.turnstile?.remove) {
          window.turnstile.remove(widgetIdRef.current);
        }
        widgetIdRef.current = "";
      };
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = "";
    };
  }, [action, compact, onToken, siteKey]);

  return (
    <div className={classNames("turnstile-shell", compact && "is-compact")}>
      <div ref={containerRef} />
      {!siteKey ? <span>Challenge unavailable</span> : null}
    </div>
  );
}

type AuthDialogProps = {
  mode: AuthMode;
  siteKey: string;
  discordEnabled: boolean;
  initialResetToken: string;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
  onResetTokenConsumed: () => void;
  onSuccess: (payload: AuthResponse) => void;
};

function AuthDialog({
  mode,
  siteKey,
  discordEnabled,
  initialResetToken,
  onClose,
  onModeChange,
  onResetTokenConsumed,
  onSuccess
}: AuthDialogProps) {
  const [flow, setFlow] = useState<AuthFlow>(initialResetToken ? "resetConfirm" : "auth");
  const [resetToken, setResetToken] = useState(initialResetToken);
  const [mfaToken, setMfaToken] = useState("");
  const [mfaMethods, setMfaMethods] = useState<MfaMethod[]>([]);
  const [mfaMethod, setMfaMethod] = useState<MfaMethod>("totp");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const isRegister = mode === "register";

  const clearMfaState = () => {
    setMfaToken("");
    setMfaMethods([]);
    setMfaMethod("totp");
  };

  useEffect(() => {
    if (initialResetToken) {
      setResetToken(initialResetToken);
      setFlow("resetConfirm");
      setMessage("");
      setTurnstileToken("");
      clearMfaState();
    }
  }, [initialResetToken]);

  const handleModeChange = (nextMode: AuthMode) => {
    setFlow("auth");
    setMessage("");
    setTurnstileToken("");
    clearMfaState();
    onModeChange(nextMode);
  };

  const handleFlowChange = (nextFlow: AuthFlow) => {
    setFlow(nextFlow);
    setMessage("");
    setTurnstileToken("");
    if (nextFlow !== "mfa") {
      clearMfaState();
    }
  };

  const handleResetRequestSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setMessage("");
    if (!turnstileToken) {
      setMessage("Complete the check first.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          email: String(formData.get("email") ?? ""),
          turnstileToken
        })
      });
      const payload = (await response.json()) as PasswordResetRequestResponse | { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Reset email could not be sent.");
      }
      setMessage(payload.message ?? "If that email belongs to an account, a reset link has been sent.");
      setTurnstileToken("");
      form.reset();
      window.turnstile?.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Reset email could not be sent.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetConfirmSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setMessage("");
    if (!turnstileToken) {
      setMessage("Complete the check first.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          token: resetToken,
          newPassword,
          turnstileToken
        })
      });
      const payload = (await response.json()) as PasswordResetConfirmResponse | { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Password could not be reset.");
      }
      const successMessage = payload.message ?? "Password reset. Sign in with your new password.";
      setResetToken("");
      setTurnstileToken("");
      onResetTokenConsumed();
      setFlow("auth");
      onModeChange("login");
      setMessage(successMessage);
      form.reset();
      window.turnstile?.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Password could not be reset.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMfaSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          mfaToken,
          method: mfaMethod,
          code: String(formData.get("code") ?? ""),
          rememberMe
        })
      });
      const payload = (await response.json()) as AuthResponse | { message?: string };
      if (!response.ok || !("user" in payload)) {
        throw new Error(payload.message ?? "Verification failed.");
      }
      clearMfaState();
      onSuccess(payload);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Verification failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasskeySignIn = async () => {
    if (submitting) {
      return;
    }
    if (!window.PublicKeyCredential || !navigator.credentials) {
      setMessage("Passkeys are not available in this browser.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      const optionsResponse = await fetch("/api/auth/passkey/options", {
        method: "POST",
        credentials: "include"
      });
      const optionsPayload = (await optionsResponse.json()) as
        | PasskeyAuthenticationOptionsResponse
        | { message?: string };
      if (!optionsResponse.ok || !("publicKey" in optionsPayload)) {
        throw new Error(
          ("message" in optionsPayload ? optionsPayload.message : undefined) ??
            "Passkey sign-in could not start."
        );
      }
      const credential = await navigator.credentials.get({
        publicKey: passkeyRequestOptions(optionsPayload)
      });
      if (!(credential instanceof PublicKeyCredential)) {
        throw new Error("Passkey sign-in was cancelled.");
      }
      const verifyResponse = await fetch("/api/auth/passkey/verify", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(passkeyAssertionPayload(credential, rememberMe))
      });
      const payload = (await verifyResponse.json()) as AuthResponse | { message?: string };
      if (!verifyResponse.ok || !("user" in payload)) {
        throw new Error(payload.message ?? "Passkey sign-in failed.");
      }
      onSuccess(payload);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Passkey sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDiscordSignIn = () => {
    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.assign(`/discord/start?returnTo=${encodeURIComponent(returnTo)}`);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setMessage("");

    if (!turnstileToken) {
      setMessage("Complete the check first.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const body = isRegister
      ? {
          displayName: String(formData.get("displayName") ?? ""),
          username: String(formData.get("username") ?? ""),
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
          turnstileToken
        }
      : {
          identifier: String(formData.get("identifier") ?? ""),
          password: String(formData.get("password") ?? ""),
          turnstileToken,
          rememberMe
        };

    setSubmitting(true);
    try {
      const response = await fetch(isRegister ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(body)
      });
      const payload = (await response.json()) as AuthLoginResponse | { message?: string };
      if (!response.ok) {
        setMessage(payload.message ?? "Authentication failed.");
        setTurnstileToken("");
        window.turnstile?.reset();
        return;
      }
      if ("mfaRequired" in payload) {
        setMfaToken(payload.mfaToken);
        setMfaMethods(payload.methods);
        setMfaMethod(payload.methods[0] ?? "totp");
        setFlow("mfa");
        setMessage(payload.message);
        setTurnstileToken("");
        window.turnstile?.reset();
        form.reset();
        return;
      }
      if (!("user" in payload)) {
        setMessage(payload.message ?? "Authentication failed.");
        setTurnstileToken("");
        window.turnstile?.reset();
        return;
      }
      onSuccess(payload);
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const isResetRequest = flow === "resetRequest";
  const isResetConfirm = flow === "resetConfirm";
  const isMfa = flow === "mfa";

  return (
    <div className="modal-backdrop auth-backdrop" role="dialog" aria-modal="true">
      <section className="auth-dialog">
        <button className="close-button" type="button" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        <div className="auth-hero">
          <div className="auth-stamp">
            <Shield size={34} />
          </div>
          <p className="eyebrow">NEHub ID</p>
          <h2>
            {isResetConfirm
              ? "Set new password"
              : isMfa
                ? "Verify sign-in"
              : isResetRequest
                ? "Reset password"
                : isRegister
                  ? "Create account"
                  : "Welcome back"}
          </h2>
        </div>
        <div className="auth-panel">
          {flow === "auth" ? (
            <>
              <div className="auth-tabs" aria-label="Account mode">
                <button
                  className={classNames(mode === "login" && "is-active")}
                  type="button"
                  onClick={() => handleModeChange("login")}
                >
                  Sign in
                </button>
                <button
                  className={classNames(mode === "register" && "is-active")}
                  type="button"
                  onClick={() => handleModeChange("register")}
                >
                  Register
                </button>
              </div>

              <form className="auth-form" onSubmit={handleSubmit}>
                {discordEnabled ? (
                  <button
                    className="secondary-button auth-submit auth-provider-button"
                    type="button"
                    disabled={submitting}
                    onClick={handleDiscordSignIn}
                  >
                    <MessageCircle size={17} />
                    Continue with Discord
                  </button>
                ) : null}
                {isRegister ? (
                  <>
                    <label>
                      Display name
                      <input name="displayName" minLength={2} maxLength={60} autoComplete="name" required />
                    </label>
                    <label>
                      Username
                      <input
                        name="username"
                        minLength={3}
                        maxLength={32}
                        pattern="[A-Za-z0-9_-]+"
                        autoComplete="username"
                        required
                      />
                    </label>
                    <label>
                      Email
                      <input name="email" type="email" maxLength={254} autoComplete="email" required />
                    </label>
                  </>
                ) : (
                  <label>
                    Email or username
                    <input name="identifier" autoComplete="username" required />
                  </label>
                )}
                <label>
                  Password
                  <input
                    name="password"
                    type="password"
                    minLength={isRegister ? 10 : 1}
                    maxLength={160}
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    required
                  />
                </label>

                {!isRegister ? (
                  <label className="auth-remember-row">
                    <input
                      checked={rememberMe}
                      type="checkbox"
                      onChange={(event) => setRememberMe(event.target.checked)}
                    />
                    <span>
                      <strong>Remember me</strong>
                      <small>Keep this browser signed in.</small>
                    </span>
                  </label>
                ) : null}

                <TurnstileWidget
                  key={mode}
                  siteKey={siteKey}
                  action={mode}
                  onToken={setTurnstileToken}
                />

                <button className="primary-button auth-submit" type="submit" disabled={submitting}>
                  {isRegister ? <UserRound size={17} /> : <LogIn size={17} />}
                  {submitting ? "Checking" : isRegister ? "Create account" : "Sign in"}
                </button>
                {!isRegister ? (
                  <button
                    className="secondary-button auth-submit"
                    type="button"
                    disabled={submitting}
                    onClick={() => void handlePasskeySignIn()}
                  >
                    <KeyRound size={17} />
                    Sign in with passkey
                  </button>
                ) : null}
                {!isRegister ? (
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => handleFlowChange("resetRequest")}
                  >
                    Forgot password?
                  </button>
                ) : null}
                {message ? <p className="auth-message">{message}</p> : null}
              </form>
            </>
          ) : null}

          {isResetRequest ? (
            <form className="auth-form" onSubmit={handleResetRequestSubmit}>
              <label>
                Account email
                <input name="email" type="email" maxLength={254} autoComplete="email" required />
              </label>
              <TurnstileWidget
                key="password-reset"
                siteKey={siteKey}
                action="password-reset"
                onToken={setTurnstileToken}
              />
              <button className="primary-button auth-submit" type="submit" disabled={submitting}>
                <MailCheck size={17} />
                {submitting ? "Sending" : "Send reset link"}
              </button>
              <button className="text-button" type="button" onClick={() => handleFlowChange("auth")}>
                Back to sign in
              </button>
              {message ? <p className="auth-message">{message}</p> : null}
            </form>
          ) : null}

          {isResetConfirm ? (
            <form className="auth-form" onSubmit={handleResetConfirmSubmit}>
              <label>
                Reset token
                <input
                  value={resetToken}
                  maxLength={256}
                  onChange={(event) => setResetToken(event.target.value.trim())}
                  required
                />
              </label>
              <label>
                New password
                <input
                  name="newPassword"
                  type="password"
                  minLength={10}
                  maxLength={160}
                  autoComplete="new-password"
                  required
                />
              </label>
              <label>
                Confirm new password
                <input
                  name="confirmPassword"
                  type="password"
                  minLength={10}
                  maxLength={160}
                  autoComplete="new-password"
                  required
                />
              </label>
              <TurnstileWidget
                key="password-reset-confirm"
                siteKey={siteKey}
                action="password-reset-confirm"
                onToken={setTurnstileToken}
              />
              <button className="primary-button auth-submit" type="submit" disabled={submitting}>
                <KeyRound size={17} />
                {submitting ? "Saving" : "Reset password"}
              </button>
              <button className="text-button" type="button" onClick={() => handleFlowChange("auth")}>
                Back to sign in
              </button>
              {message ? <p className="auth-message">{message}</p> : null}
            </form>
          ) : null}

          {isMfa ? (
            <form className="auth-form" onSubmit={handleMfaSubmit}>
              {mfaMethods.length > 1 ? (
                <div className="segmented-control" aria-label="Verification method">
                  {mfaMethods.map((method) => (
                    <button
                      className={classNames(mfaMethod === method && "is-active")}
                      key={method}
                      type="button"
                      onClick={() => setMfaMethod(method)}
                    >
                      {method === "email" ? <MailCheck size={16} /> : <KeyRound size={16} />}
                      {method === "email" ? "Email" : "Authenticator"}
                    </button>
                  ))}
                </div>
              ) : null}
              <label>
                {mfaMethod === "email" ? "Email code" : "Authenticator code"}
                <input
                  name="code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  minLength={6}
                  maxLength={6}
                  autoComplete="one-time-code"
                  required
                />
              </label>
              <button className="primary-button auth-submit" type="submit" disabled={submitting}>
                {mfaMethod === "email" ? <MailCheck size={17} /> : <KeyRound size={17} />}
                {submitting ? "Verifying" : "Verify"}
              </button>
              <button className="text-button" type="button" onClick={() => handleFlowChange("auth")}>
                Back to sign in
              </button>
              {message ? <p className="auth-message">{message}</p> : null}
            </form>
          ) : null}
        </div>
      </section>
    </div>
  );
}

type NotificationMenuProps = {
  data: NotificationsResponse | null;
  onMarkRead: (notification?: UserNotification) => void;
};

const notificationIconFor = (notification: UserNotification) =>
  notification.type === "like"
    ? Heart
    : notification.type === "comment"
      ? MessageCircle
      : notification.type === "follow"
        ? UserPlus
        : ShieldCheck;

function NotificationMenu({ data, onMarkRead }: NotificationMenuProps) {
  const notifications = data?.notifications ?? [];

  return (
    <div className="notification-popover" role="menu" aria-label="Notifications">
      <div className="notification-popover-heading">
        <strong>Notifications</strong>
        {data && data.unreadCount > 0 ? (
          <button className="text-button" type="button" onClick={() => onMarkRead()}>
            Mark all read
          </button>
        ) : null}
      </div>
      {!data ? <p className="muted">Loading notifications.</p> : null}
      {notifications.map((notification) => {
        const Icon = notificationIconFor(notification);
        return (
          <button
            className={classNames("notification-row", !notification.readAt && "is-unread")}
            key={notification.id}
            type="button"
            onClick={() => onMarkRead(notification)}
          >
            <span className="notification-icon">
              <Icon size={16} />
            </span>
            <span>
              <strong>{notification.message}</strong>
              <small>{dateFormat.format(new Date(notification.createdAt))}</small>
            </span>
          </button>
        );
      })}
      {data && notifications.length === 0 ? (
        <p className="muted">No notifications yet.</p>
      ) : null}
    </div>
  );
}

type NotificationsPageProps = {
  context: RouteContext;
  data: NotificationsResponse | null;
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onMarkRead: (notification?: UserNotification) => Promise<void> | void;
  onOpenNotification: (notification: UserNotification) => Promise<void> | void;
  onRefresh: () => Promise<void>;
};

function NotificationsPage({
  context,
  data,
  currentUser,
  onAuthRequired,
  onMarkRead,
  onOpenNotification,
  onRefresh
}: NotificationsPageProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const notifications = data?.notifications ?? [];
  const showLoadingState = loading && !data;
  const showEmptyState = Boolean(data && !loading && !message && notifications.length === 0);
  const novelContext = context === "novels";

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    setMessage("");
    onRefresh()
      .catch((error: unknown) => {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Notifications could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser, onRefresh]);

  if (!currentUser) {
    return (
      <section className={classNames("content-main notification-page", novelContext && "novel-dedicated-page novel-notification-page")}>
        <p className="empty-feed">{novelContext ? "Sign in to view alerts." : "Sign in to view notifications."}</p>
        <button className="primary-button" type="button" onClick={onAuthRequired}>
          <LogIn size={17} />
          Sign in
        </button>
      </section>
    );
  }

  return (
    <section className={classNames("content-main notification-page", novelContext && "novel-dedicated-page novel-notification-page")}>
      <div className="settings-heading notification-page-heading">
        <div>
          <p className="eyebrow">{novelContext ? "Alerts" : "Notifications"}</p>
          <h1>{novelContext ? "Reading notifications" : "Notification center"}</h1>
          <p>
            {data
              ? `${formatCount(data.unreadCount)} unread updates from likes, comments, follows, and moderation.`
              : novelContext
                ? "Loading reader and writer updates."
                : "Loading community updates."}
          </p>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={() => void onMarkRead()}
          disabled={!data || data.unreadCount === 0}
        >
          <MailCheck size={16} />
          Mark all read
        </button>
      </div>

      {showLoadingState ? <p className="empty-feed">Loading notifications.</p> : null}
      {message ? <p className="empty-feed">{message}</p> : null}

      <div className="notification-page-list">
        {notifications.map((notification) => {
          const Icon = notificationIconFor(notification);
          const targetLabel = notification.novelId
            ? "Open novel"
            : notification.artworkId
            ? "Open artwork"
            : notification.actor
              ? "Open profile"
              : "Mark read";
          return (
            <article
              className={classNames("notification-row notification-page-row", !notification.readAt && "is-unread")}
              key={notification.id}
            >
              <span className="notification-icon">
                <Icon size={16} />
              </span>
              <span>
                <strong>{notification.message}</strong>
                <small>
                  {fullDateFormat.format(new Date(notification.createdAt))}
                  {!notification.readAt ? " · unread" : ""}
                </small>
              </span>
              <button
                className="secondary-button"
                type="button"
                onClick={() => void onOpenNotification(notification)}
              >
                {targetLabel}
              </button>
            </article>
          );
        })}
      </div>
      {showEmptyState ? (
        <p className="empty-feed">No notifications yet.</p>
      ) : null}
    </section>
  );
}

type CreatorAnalyticsPageProps = {
  context: RouteContext;
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onOpenArtwork: (artwork: Artwork) => void;
};

function CreatorAnalyticsPage({
  context,
  ...props
}: CreatorAnalyticsPageProps) {
  if (context === "novels") {
    return <NovelAnalyticsPage {...props} />;
  }
  return <IllustrationAnalyticsPage context={context} {...props} />;
}

function IllustrationAnalyticsPage({
  context,
  currentUser,
  onAuthRequired,
  onOpenArtwork
}: CreatorAnalyticsPageProps) {
  const [data, setData] = useState<CreatorAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const novelContext = context === "novels";

  useEffect(() => {
    if (!currentUser) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setMessage("");
    fetch("/api/analytics/creator", { credentials: "include" })
      .then(async (response) => {
        const payload = (await response.json()) as CreatorAnalyticsResponse | { message?: string };
        if (!response.ok || !("summary" in payload)) {
          throw new Error(
            ("message" in payload ? payload.message : undefined) ?? "Analytics could not be loaded."
          );
        }
        return payload;
      })
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Analytics could not be loaded.");
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  if (!currentUser) {
    return (
      <section className={classNames("content-main analytics-page", novelContext && "novel-dedicated-page novel-analytics-page")}>
        <p className="empty-feed">{novelContext ? "Sign in to view stats." : "Sign in to view creator analytics."}</p>
        <button className="primary-button" type="button" onClick={onAuthRequired}>
          <LogIn size={17} />
          Sign in
        </button>
      </section>
    );
  }

  const summary = data?.summary;
  const showInitialLoading = loading && !data;
  const showContent = Boolean(data && !message);
  const maxDailyViews = Math.max(1, ...(data?.daily ?? []).map((day) => day.views));
  const totalInteractions =
    (summary?.likes ?? 0) + (summary?.bookmarks ?? 0) + (summary?.comments ?? 0);
  const overallEngagement =
    Math.round((totalInteractions / Math.max(1, summary?.totalViews ?? 0)) * 1000) / 10;

  return (
    <section className={classNames("content-main analytics-page", novelContext && "novel-dedicated-page novel-analytics-page")}>
      <div className="settings-heading analytics-heading">
        <div>
          <p className="eyebrow">{novelContext ? "Studio" : "Creator studio"}</p>
          <h1>{novelContext ? "Performance" : "Artwork analytics"}</h1>
          <p>
            {data
              ? `${formatCount(summary?.views30d ?? 0)} views in the last 30 days.`
              : novelContext
                ? "Loading performance signals for your works."
                : "Loading performance signals for your artworks."}
          </p>
        </div>
        <button className="secondary-button" type="button" onClick={() => window.location.reload()}>
          <Activity size={16} />
          Refresh
        </button>
      </div>

      {showInitialLoading ? <p className="empty-feed">Loading analytics.</p> : null}
      {message ? <p className="empty-feed">{message}</p> : null}

      {showContent ? (
        <>
          <div className="analytics-summary-grid">
            <MetricTile label="Total views" value={formatCount(summary?.totalViews ?? 0)} />
            <MetricTile label="7-day views" value={formatCount(summary?.views7d ?? 0)} />
            <MetricTile label="Followers" value={formatCount(summary?.followers ?? 0)} />
            <MetricTile label="Engagement" value={`${overallEngagement}%`} />
            <MetricTile label={novelContext ? "Published works" : "Artworks"} value={formatCount(summary?.artworks ?? 0)} />
            <MetricTile label={novelContext ? "Mature entries" : "Mature works"} value={formatCount(summary?.matureArtworks ?? 0)} />
          </div>

          <div className="analytics-grid">
            <section className="dashboard-panel analytics-trend-panel">
              <div className="panel-title">
                <BarChart3 size={18} />
                30-day trend
              </div>
              <div className="analytics-bars" aria-label="Views by day">
                {(data?.daily ?? []).map((day) => {
                  const height = Math.max(4, Math.round((day.views / maxDailyViews) * 100));
                  return (
                    <span className="analytics-bar-wrap" key={day.date}>
                      <span
                        className="analytics-bar"
                        style={{ height: `${height}%` }}
                        title={`${day.date}: ${formatCount(day.views)} views`}
                      />
                      <small>{new Date(`${day.date}T00:00:00.000Z`).getUTCDate()}</small>
                    </span>
                  );
                })}
              </div>
              <div className="analytics-day-totals">
                <span>
                  <Eye size={14} />
                  {formatCount(summary?.views30d ?? 0)} views
                </span>
                <span>
                  <Heart size={14} />
                  {formatCount((data?.daily ?? []).reduce((total, day) => total + day.likes, 0))} likes
                </span>
                <span>
                  <Bookmark size={14} />
                  {formatCount((data?.daily ?? []).reduce((total, day) => total + day.bookmarks, 0))} bookmarks
                </span>
                <span>
                  <MessageCircle size={14} />
                  {formatCount((data?.daily ?? []).reduce((total, day) => total + day.comments, 0))} comments
                </span>
              </div>
            </section>

            <section className="dashboard-panel analytics-list-panel">
              <div className="panel-title">
                <TrendingUp size={18} />
                Top works
              </div>
              {(data?.topArtworks ?? []).map((item) => (
                <AnalyticsArtworkRow item={item} key={item.artwork.id} onOpen={onOpenArtwork} />
              ))}
              {data && data.topArtworks.length === 0 ? (
                <p className="muted">{novelContext ? "Post work to start collecting analytics." : "Post artwork to start collecting analytics."}</p>
              ) : null}
            </section>

            <section className="dashboard-panel analytics-list-panel">
              <div className="panel-title">
                <Calendar size={18} />
                Recent works
              </div>
              {(data?.recentArtworks ?? []).map((item) => (
                <AnalyticsArtworkRow item={item} key={item.artwork.id} onOpen={onOpenArtwork} />
              ))}
              {data && data.recentArtworks.length === 0 ? (
                <p className="muted">No recent works yet.</p>
              ) : null}
            </section>
          </div>
        </>
      ) : null}

      {data ? (
        <p className="analytics-footnote">
          Updated {fullDateFormat.format(new Date(data.generatedAt))}. Views count one unique viewer per
          {novelContext ? " work" : " artwork"} per day.
        </p>
      ) : null}
    </section>
  );
}

type AnalyticsArtworkRowProps = {
  item: CreatorAnalyticsResponse["topArtworks"][number];
  onOpen: (artwork: Artwork) => void;
};

function AnalyticsArtworkRow({ item, onOpen }: AnalyticsArtworkRowProps) {
  const artwork = item.artwork;
  return (
    <button className="analytics-artwork-row" type="button" onClick={() => onOpen(artwork)}>
      <img src={artwork.thumbnailUrl} alt="" loading="lazy" decoding="async" />
      <span>
        <strong>{artwork.title}</strong>
        <small>
          {formatCount(item.views7d)} views this week · {formatCount(artwork.viewCount)} total
        </small>
      </span>
      <span className="analytics-artwork-score">
        <strong>{item.engagementRate}%</strong>
        <small>engaged</small>
      </span>
    </button>
  );
}

function NovelAnalyticsPage({
  currentUser,
  onAuthRequired
}: Omit<CreatorAnalyticsPageProps, "context" | "onOpenArtwork">) {
  const [data, setData] = useState<CreatorNovelAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!currentUser) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setMessage("");
    fetch("/api/analytics/novels", { credentials: "include" })
      .then(async (response) => {
        const payload = (await response.json()) as CreatorNovelAnalyticsResponse | { message?: string };
        if (!response.ok || !("summary" in payload)) {
          throw new Error(
            ("message" in payload ? payload.message : undefined) ?? "Novel analytics could not be loaded."
          );
        }
        return payload;
      })
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Novel analytics could not be loaded.");
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  if (!currentUser) {
    return (
      <section className="content-main analytics-page novel-dedicated-page novel-analytics-page">
        <p className="empty-feed">Sign in to view novel stats.</p>
        <button className="primary-button" type="button" onClick={onAuthRequired}>
          <LogIn size={17} />
          Sign in
        </button>
      </section>
    );
  }

  const summary = data?.summary;
  const showInitialLoading = loading && !data;
  const showContent = Boolean(data && !message);
  const maxDailyInteractions = Math.max(
    1,
    ...(data?.daily ?? []).map((day) => day.likes + day.bookmarks + day.comments)
  );
  const totalInteractions =
    (summary?.likes ?? 0) + (summary?.bookmarks ?? 0) + (summary?.comments ?? 0);
  const overallEngagement =
    Math.round((totalInteractions / Math.max(1, summary?.totalReads ?? 0)) * 1000) / 10;

  return (
    <section className="content-main analytics-page novel-dedicated-page novel-analytics-page">
      <div className="settings-heading analytics-heading">
        <div>
          <p className="eyebrow">Novel studio</p>
          <h1>Novel performance</h1>
          <p>
            {data
              ? `${formatCount(summary?.totalReads ?? 0)} lifetime reads across ${formatCount(summary?.publishedNovels ?? 0)} published works.`
              : "Loading performance signals for your novels."}
          </p>
        </div>
        <button className="secondary-button" type="button" onClick={() => window.location.reload()}>
          <Activity size={16} />
          Refresh
        </button>
      </div>

      {showInitialLoading ? <p className="empty-feed">Loading novel analytics.</p> : null}
      {message ? <p className="empty-feed">{message}</p> : null}

      {showContent ? (
        <>
          <div className="analytics-summary-grid">
            <MetricTile label="Total reads" value={formatCount(summary?.totalReads ?? 0)} />
            <MetricTile label="Words" value={formatCount(summary?.words ?? 0)} />
            <MetricTile label="Followers" value={formatCount(summary?.followers ?? 0)} />
            <MetricTile label="Engagement" value={`${overallEngagement}%`} />
            <MetricTile label="Published novels" value={formatCount(summary?.publishedNovels ?? 0)} />
            <MetricTile label="Drafts" value={formatCount(summary?.draftNovels ?? 0)} />
          </div>

          <div className="analytics-grid">
            <section className="dashboard-panel analytics-trend-panel">
              <div className="panel-title">
                <BarChart3 size={18} />
                30-day interactions
              </div>
              <div className="analytics-bars" aria-label="Novel interactions by day">
                {(data?.daily ?? []).map((day) => {
                  const interactions = day.likes + day.bookmarks + day.comments;
                  const height = Math.max(4, Math.round((interactions / maxDailyInteractions) * 100));
                  return (
                    <span className="analytics-bar-wrap" key={day.date}>
                      <span
                        className="analytics-bar"
                        style={{ height: `${height}%` }}
                        title={`${day.date}: ${formatCount(interactions)} interactions`}
                      />
                      <small>{new Date(`${day.date}T00:00:00.000Z`).getUTCDate()}</small>
                    </span>
                  );
                })}
              </div>
              <div className="analytics-day-totals">
                <span>
                  <Heart size={14} />
                  {formatCount((data?.daily ?? []).reduce((total, day) => total + day.likes, 0))} likes
                </span>
                <span>
                  <Bookmark size={14} />
                  {formatCount((data?.daily ?? []).reduce((total, day) => total + day.bookmarks, 0))} bookmarks
                </span>
                <span>
                  <MessageCircle size={14} />
                  {formatCount((data?.daily ?? []).reduce((total, day) => total + day.comments, 0))} comments
                </span>
              </div>
            </section>

            <section className="dashboard-panel analytics-list-panel">
              <div className="panel-title">
                <TrendingUp size={18} />
                Top novels
              </div>
              {(data?.topNovels ?? []).map((item) => (
                <AnalyticsNovelRow item={item} key={item.novel.id} />
              ))}
              {data && data.topNovels.length === 0 ? (
                <p className="muted">Post a novel to start collecting analytics.</p>
              ) : null}
            </section>

            <section className="dashboard-panel analytics-list-panel">
              <div className="panel-title">
                <Calendar size={18} />
                Recent novels
              </div>
              {(data?.recentNovels ?? []).map((item) => (
                <AnalyticsNovelRow item={item} key={item.novel.id} />
              ))}
              {data && data.recentNovels.length === 0 ? (
                <p className="muted">No recent novels yet.</p>
              ) : null}
            </section>
          </div>
        </>
      ) : null}

      {data ? (
        <p className="analytics-footnote">
          Updated {fullDateFormat.format(new Date(data.generatedAt))}. Daily trend tracks likes,
          bookmarks, and comments; read totals are lifetime aggregate counts.
        </p>
      ) : null}
    </section>
  );
}

type AnalyticsNovelRowProps = {
  item: CreatorNovelAnalyticsResponse["topNovels"][number];
};

function AnalyticsNovelRow({ item }: AnalyticsNovelRowProps) {
  const novel = item.novel;
  return (
    <a className="analytics-artwork-row analytics-novel-row" href={`/novels/${encodeURIComponent(novel.id)}`}>
      <span className="recent-novel-mark" style={{ background: novel.coverColor }}>
        {novel.title.slice(0, 1).toUpperCase()}
      </span>
      <span>
        <strong>{novel.title}</strong>
        <small>
          {formatCount(novel.viewCount)} reads · {formatCount(novel.wordCount)} words
        </small>
      </span>
      <span className="analytics-artwork-score">
        <strong>{item.engagementRate}%</strong>
        <small>engaged</small>
      </span>
    </a>
  );
}

type ActivityPanelProps = {
  data: ActivityResponse | null;
  onOpenArtwork: (artwork: Artwork) => void;
  onOpenNovel?: (novelId: string) => void;
  onOpenProfile: (username: string) => void;
};

function ActivityPanel({ data, onOpenArtwork, onOpenNovel, onOpenProfile }: ActivityPanelProps) {
  const activities = data?.activities ?? [];
  const label = data?.scope === "following" ? "Following pulse" : "Community pulse";

  return (
    <section className="side-panel activity-panel">
      <div className="panel-title">
        <Activity size={18} />
        {label}
      </div>
      {!data ? <p className="muted">Loading activity.</p> : null}
      {activities.map((item) => (
        <ActivityRow
          item={item}
          key={item.id}
          onOpenArtwork={onOpenArtwork}
          onOpenNovel={onOpenNovel}
          onOpenProfile={onOpenProfile}
        />
      ))}
      {data && activities.length === 0 ? (
        <p className="muted">
          {data.scope === "following"
            ? "Follow creators to build your activity feed."
            : "No public activity yet."}
        </p>
      ) : null}
    </section>
  );
}

type ActivityRowProps = {
  item: ActivityItem;
  onOpenArtwork: (artwork: Artwork) => void;
  onOpenNovel?: (novelId: string) => void;
  onOpenProfile: (username: string) => void;
};

function ActivityRow({ item, onOpenArtwork, onOpenNovel, onOpenProfile }: ActivityRowProps) {
  const Icon =
    item.type === "publish"
      ? ImageUp
      : item.type === "like"
        ? Heart
        : item.type === "comment"
          ? MessageCircle
          : UserPlus;
  const actorLabel = item.actor.username || item.actor.displayName;

  return (
    <article className="activity-row">
      <button
        className="activity-avatar"
        type="button"
        onClick={() => onOpenProfile(actorLabel)}
        aria-label={`Open ${item.actor.displayName}`}
      >
        {item.actor.avatarUrl ? <img src={item.actor.avatarUrl} alt="" /> : <span><UserRound size={16} /></span>}
      </button>
      <div className="activity-copy">
        <button className="activity-line" type="button" onClick={() => onOpenProfile(actorLabel)}>
          <Icon size={14} />
          <strong>{item.actor.displayName}</strong>
        </button>
        {item.artwork ? (
          <button
            className="activity-artwork"
            type="button"
            onClick={() => onOpenArtwork(item.artwork as Artwork)}
          >
            <span>{item.message}</span>
            <img
              src={item.artwork.thumbnailUrl}
              alt=""
              loading="lazy"
              decoding="async"
            />
          </button>
        ) : item.novel ? (
          <button
            className="activity-artwork activity-novel"
            type="button"
            onClick={() => onOpenNovel?.(item.novel?.id ?? "")}
          >
            <span>{item.message}</span>
            <span className="activity-novel-mark" style={{ background: item.novel.coverColor }}>
              {item.novel.title.slice(0, 1).toUpperCase()}
            </span>
          </button>
        ) : (
          <p>{item.message}</p>
        )}
        {item.targetUser ? (
          <button
            className="activity-target"
            type="button"
            onClick={() => onOpenProfile(item.targetUser?.username ?? "")}
          >
            @{item.targetUser.username}
          </button>
        ) : null}
        <small>{dateFormat.format(new Date(item.createdAt))}</small>
      </div>
    </article>
  );
}

type DashboardProps = {
  context: RouteContext;
  artworks: Artwork[];
  health: HealthResponse | null;
  adminStats: AdminStatsResponse | null;
  adminReports: AdminReportsResponse | null;
  reportStatus: ReportStatus;
  reportTarget: AdminReportTargetFilter;
  reportReason: AdminReportReasonFilter;
  reportLimit: number;
  adminUsers: AdminUsersResponse | null;
  userQuery: string;
  userStatus: AdminUserStatusFilter;
  userLimit: number;
  adminTags: AdminTagsResponse | null;
  adminAuditLog: AdminAuditLogResponse | null;
  adminArtworkReviews: AdminArtworkReviewsResponse | null;
  canAdminister: boolean;
  message: string;
  source: GalleryResponse["source"];
  tagsCount: number;
  creatorsCount: number;
  totalLikes: number;
  totalViews: number;
  onUpload: () => void;
  onResolveReport: (report: ModerationReport, status: "resolved" | "dismissed") => void;
  onReportStatusChange: (status: ReportStatus) => void;
  onReportTargetChange: (target: AdminReportTargetFilter) => void;
  onReportReasonChange: (reason: AdminReportReasonFilter) => void;
  onReportLimitChange: (limit: number) => void;
  onUserQueryChange: (query: string) => void;
  onUserStatusChange: (status: AdminUserStatusFilter) => void;
  onUserLimitChange: (limit: number) => void;
  onUpdateUserRole: (user: AdminUserSummary, role: UserRole) => void;
  onToggleArtworkReview: (enabled: boolean) => void;
  onReviewArtwork: (artwork: Artwork, action: "approve" | "reject") => void;
  onModerateArtwork: (report: ModerationReport, action: "hide" | "restore") => void;
  onModerateNovel: (report: ModerationReport, action: "hide" | "restore") => void;
  onDeleteReportedComment: (report: ModerationReport) => void;
  onToggleUserSuspension: (
    user: AdminUserSummary,
    suspended: boolean
  ) => void;
  onSuspendReportedUser: (report: ModerationReport) => void;
  onSaveTagAlias: (sourceTag: string, targetTag: string) => Promise<string>;
  onDeleteTagAlias: (alias: TagAlias) => Promise<string>;
  onSaveTagImplication: (sourceTag: string, targetTag: string) => Promise<string>;
  onDeleteTagImplication: (implication: TagImplication) => Promise<string>;
};

function Dashboard(props: DashboardProps) {
  if (props.context === "novels") {
    return <NovelDashboard {...props} />;
  }
  return <IllustrationDashboard {...props} />;
}

function IllustrationDashboard({
  artworks,
  health,
  adminStats,
  adminReports,
  reportStatus,
  reportTarget,
  reportReason,
  reportLimit,
  adminUsers,
  userQuery,
  userStatus,
  userLimit,
  adminTags,
  adminAuditLog,
  adminArtworkReviews,
  canAdminister,
  message,
  source,
  tagsCount,
  creatorsCount,
  totalLikes,
  totalViews,
  onUpload,
  onResolveReport,
  onReportStatusChange,
  onReportTargetChange,
  onReportReasonChange,
  onReportLimitChange,
  onUserQueryChange,
  onUserStatusChange,
  onUserLimitChange,
  onUpdateUserRole,
  onToggleArtworkReview,
  onReviewArtwork,
  onModerateArtwork,
  onModerateNovel,
  onDeleteReportedComment,
  onToggleUserSuspension,
  onSuspendReportedUser,
  onSaveTagAlias,
  onDeleteTagAlias,
  onSaveTagImplication,
  onDeleteTagImplication
}: DashboardProps) {
  const recent = [...artworks].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
  const contentStats = adminStats?.content;
  const accountStats = adminStats?.accounts;
  const reports = adminReports?.reports ?? [];
  const auditEntries = adminAuditLog?.entries ?? [];
  const pendingReviewArtworks = adminArtworkReviews?.artworks ?? [];
  const publicArtworkReviewEnabled = adminArtworkReviews?.publicArtworkReviewEnabled ?? false;
  const filteredReportTotal = adminReports?.totalCount ?? reports.length;
  const reportStatusLabel =
    reportStatusFilterOptions.find((option) => option.value === reportStatus)?.label ?? "Open";
  const directoryUsers = adminUsers?.users ?? [];
  const userStatusLabel =
    adminUserStatusFilterOptions.find((option) => option.value === userStatus)?.label ??
    "All accounts";
  const [userSearchDraft, setUserSearchDraft] = useState(userQuery);

  useEffect(() => {
    setUserSearchDraft(userQuery);
  }, [userQuery]);

  return (
    <section className="dashboard-main" aria-label="Operations dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">Operations</p>
          <h1>Cloudflare dashboard</h1>
          <p>Worker, D1, R2, and illustration pipeline status for NEHub.</p>
          {message ? <p className="dashboard-message">{message}</p> : null}
        </div>
        <button className="primary-button" type="button" onClick={onUpload}>
          <ImageUp size={17} />
          Post artwork
        </button>
      </div>

      <div className="status-grid">
        <StatusCard
          icon={<Server size={22} />}
          label="Worker API"
          value={health?.ok ? "Online" : "Checking"}
          active={Boolean(health?.ok)}
          detail="Hono routes and static asset fallback"
        />
        <StatusCard
          icon={<Database size={22} />}
          label="D1 metadata"
          value={health?.storage.d1 ? "Bound" : "Fallback"}
          active={Boolean(health?.storage.d1)}
          detail={`${source.toUpperCase()} feed source`}
        />
        <StatusCard
          icon={<HardDrive size={22} />}
          label="R2 originals"
          value={health?.storage.r2 ? "Bound" : "Demo assets"}
          active={Boolean(health?.storage.r2)}
          detail="Artwork file storage"
        />
        <StatusCard
          icon={<Cloud size={22} />}
          label="Static assets"
          value="Serving"
          active
          detail="Vite build on Workers assets"
        />
        <StatusCard
          icon={<MailCheck size={22} />}
          label="Email binding"
          value={adminStats?.storage.email ? "Ready" : "Checking"}
          active={Boolean(adminStats?.storage.email)}
          detail="Verification email delivery"
        />
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-panel">
          <div className="panel-title">
            <UserRound size={18} />
            Account controls
          </div>
          <StatusLine
            label="Total users"
            value={formatCount(accountStats?.totalUsers ?? 0)}
            active={Boolean(accountStats)}
          />
          <StatusLine
            label="Verified users"
            value={formatCount(accountStats?.verifiedUsers ?? 0)}
            active={Boolean(accountStats?.verifiedUsers)}
          />
          <StatusLine
            label="Administrators"
            value={formatCount(accountStats?.admins ?? 0)}
            active={Boolean(accountStats?.admins)}
          />
          <StatusLine
            label="Moderators"
            value={formatCount(accountStats?.moderators ?? 0)}
            active={Boolean(accountStats?.moderators)}
          />
          <StatusLine
            label="Suspended users"
            value={formatCount(accountStats?.suspendedUsers ?? 0)}
            active={Boolean(accountStats?.suspendedUsers)}
          />
          <StatusLine
            label="Active sessions"
            value={formatCount(accountStats?.activeSessions ?? 0)}
            active={Boolean(accountStats?.activeSessions)}
          />
          <StatusLine
            label="Pending email links"
            value={formatCount(accountStats?.pendingVerifications ?? 0)}
            active={Boolean(accountStats?.pendingVerifications)}
          />
        </section>

        <section className="dashboard-panel metric-panel">
          <div className="panel-title">
            <Activity size={18} />
            Content metrics
          </div>
          <div className="metric-grid">
            <MetricTile label="Artworks" value={formatCount(contentStats?.artworks ?? artworks.length)} />
            <MetricTile label="Creators" value={formatCount(contentStats?.creators ?? creatorsCount)} />
            <MetricTile label="Tags" value={formatCount(tagsCount)} />
            <MetricTile label="Likes" value={formatCount(contentStats?.likes ?? totalLikes)} />
            <MetricTile label="Views" value={formatCount(contentStats?.views ?? totalViews)} />
            <MetricTile label={`${reportStatusLabel} reports`} value={formatCount(filteredReportTotal)} />
            <MetricTile label="Source" value={source.toUpperCase()} />
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-title">
            <BarChart3 size={18} />
            Resource checks
          </div>
          <StatusLine
            label="API response"
            value={health?.ok ? "Healthy" : "Pending"}
            active={Boolean(health?.ok)}
          />
          <StatusLine
            label="D1 binding"
            value={health?.storage.d1 ? "Available" : "Unavailable"}
            active={Boolean(health?.storage.d1)}
          />
          <StatusLine
            label="R2 binding"
            value={health?.storage.r2 ? "Available" : "Unavailable"}
            active={Boolean(health?.storage.r2)}
          />
          <StatusLine
            label="Gallery data"
            value={source === "d1" ? "Persisted" : "Empty"}
            active={source === "d1"}
          />
        </section>

        {canAdminister ? (
          <section className="dashboard-panel recent-users-panel">
          <div className="panel-title">
            <ShieldCheck size={18} />
            User directory
          </div>
          <div className="admin-user-filter-row" aria-label="User directory filters">
            <form
              className="admin-user-search-form"
              onSubmit={(event) => {
                event.preventDefault();
                onUserQueryChange(userSearchDraft.trim());
              }}
            >
              <label>
                Search
                <div className="admin-user-search-box">
                  <Search size={15} />
                  <input
                    value={userSearchDraft}
                    maxLength={120}
                    onChange={(event) => setUserSearchDraft(event.target.value)}
                    placeholder="Username, email, display name"
                  />
                </div>
              </label>
              <button className="secondary-button" type="submit">
                Search
              </button>
            </form>
            <label>
              Status
              <select
                value={userStatus}
                onChange={(event) =>
                  onUserStatusChange(event.target.value as AdminUserStatusFilter)
                }
              >
                {adminUserStatusFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Limit
              <select
                value={userLimit}
                onChange={(event) => onUserLimitChange(Number(event.target.value))}
              >
                {[20, 40, 100].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {adminUsers ? (
            <p className="muted">
              Showing {formatCount(directoryUsers.length)} of{" "}
              {formatCount(adminUsers.totalCount)} {userStatusLabel.toLowerCase()}.
            </p>
          ) : (
            <p className="muted">Loading users.</p>
          )}
          {directoryUsers.map((user) => (
            <div className="admin-user-row" key={user.id}>
              <span className={classNames("verify-dot", (user.emailVerified || user.role !== "member") && "is-verified")} />
              <div>
                <strong>{user.displayName}</strong>
                <span>
                  @{user.username} · {user.email} · {formatUserRole(user.role)}
                  {!user.emailVerified ? " · unverified" : ""}
                  {user.suspendedAt ? " · suspended" : ""} ·{" "}
                  {dateFormat.format(new Date(user.createdAt))}
                </span>
              </div>
              <label className="admin-user-role-select">
                Role
                <select
                  value={user.role}
                  onChange={(event) => onUpdateUserRole(user, event.target.value as UserRole)}
                >
                  {userRoleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              {user.role === "member" ? (
                <button
                  className={classNames("text-button", user.suspendedAt && "is-danger")}
                  type="button"
                  onClick={() => onToggleUserSuspension(user, !user.suspendedAt)}
                >
                  {user.suspendedAt ? "Restore" : "Suspend"}
                </button>
              ) : null}
            </div>
          ))}
          {adminUsers && directoryUsers.length === 0 ? (
            <p className="muted">No users match these filters.</p>
          ) : null}
          </section>
        ) : null}

        <section className="dashboard-panel artwork-review-panel">
          <div className="panel-title">
            <ShieldCheck size={18} />
            Public artwork review
          </div>
          {canAdminister ? (
            <label className="toggle-row review-toggle">
              Require review before public publishing
              <input
                type="checkbox"
                checked={publicArtworkReviewEnabled}
                onChange={(event) => onToggleArtworkReview(event.target.checked)}
              />
            </label>
          ) : null}
          {adminArtworkReviews ? (
            <p className="muted">
              {publicArtworkReviewEnabled ? "Review gate is on." : "Review gate is off."}{" "}
              {formatCount(adminArtworkReviews.totalCount)} pending artwork
              {adminArtworkReviews.totalCount === 1 ? "" : "s"}.
            </p>
          ) : (
            <p className="muted">Loading artwork reviews.</p>
          )}
          <div className="artwork-review-list">
            {pendingReviewArtworks.map((artwork) => (
              <article className="artwork-review-row" key={artwork.id}>
                <img src={artwork.thumbnailUrl} alt="" />
                <div>
                  <strong>{artwork.title}</strong>
                  <span>
                    @{artwork.creator.handle} · {artwork.visibility} · {formatDateTime(artwork.createdAt)}
                  </span>
                </div>
                <div className="artwork-review-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => onReviewArtwork(artwork, "approve")}
                  >
                    <ShieldCheck size={15} />
                    Approve
                  </button>
                  <button
                    className="danger-button"
                    type="button"
                    onClick={() => onReviewArtwork(artwork, "reject")}
                  >
                    <X size={15} />
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
          {adminArtworkReviews && pendingReviewArtworks.length === 0 ? (
            <p className="muted">No artwork is waiting for review.</p>
          ) : null}
        </section>

        <section className="dashboard-panel moderation-panel">
          <div className="panel-title">
            <Flag size={18} />
            Moderation queue
          </div>
          <div className="report-filter-row" aria-label="Moderation report filters">
            <label>
              Status
              <select
                value={reportStatus}
                onChange={(event) => onReportStatusChange(event.target.value as ReportStatus)}
              >
                {reportStatusFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Target
              <select
                value={reportTarget}
                onChange={(event) =>
                  onReportTargetChange(event.target.value as AdminReportTargetFilter)
                }
              >
                {reportTargetFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Reason
              <select
                value={reportReason}
                onChange={(event) =>
                  onReportReasonChange(event.target.value as AdminReportReasonFilter)
                }
              >
                {reportReasonFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Limit
              <select
                value={reportLimit}
                onChange={(event) => onReportLimitChange(Number(event.target.value))}
              >
                {[25, 50, 100].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {adminReports ? (
            <p className="muted">
              Showing {formatCount(reports.length)} of {formatCount(filteredReportTotal)}{" "}
              {reportStatusLabel.toLowerCase()} reports.
            </p>
          ) : null}
          {!adminReports ? <p className="muted">Loading reports.</p> : null}
          {reports.map((report) => (
            <article className="report-row" key={report.id}>
              <div className="report-row-heading">
                <span className="report-target">{report.targetType}</span>
                <span>{dateFormat.format(new Date(report.createdAt))}</span>
              </div>
              <strong>{report.targetLabel}</strong>
              <small>
                Reported by {report.reporter} · {formatReportReason(report.reason)}
              </small>
              {report.details ? <p>{report.details}</p> : null}
              {report.status === "open" ? (
                <div className="report-actions">
                  {report.targetType === "artwork" ? (
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => onModerateArtwork(report, "hide")}
                    >
                      <EyeOff size={15} />
                      Hide artwork
                    </button>
                  ) : null}
                  {report.targetType === "novel" ? (
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => onModerateNovel(report, "hide")}
                    >
                      <EyeOff size={15} />
                      Unpublish novel
                    </button>
                  ) : null}
                  {report.targetType === "comment" ? (
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => onDeleteReportedComment(report)}
                    >
                      <X size={15} />
                      Delete comment
                    </button>
                  ) : null}
                  {canAdminister && report.targetType === "user" ? (
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => onSuspendReportedUser(report)}
                    >
                      <Shield size={15} />
                      Suspend user
                    </button>
                  ) : null}
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => onResolveReport(report, "resolved")}
                  >
                    <ShieldCheck size={15} />
                    Resolve
                  </button>
                  <button
                    className="danger-button"
                    type="button"
                    onClick={() => onResolveReport(report, "dismissed")}
                  >
                    <X size={15} />
                    Dismiss
                  </button>
                </div>
              ) : (
                <span className="report-status-pill">{report.status}</span>
              )}
            </article>
          ))}
          {adminReports && reports.length === 0 ? (
            <p className="muted">No reports match these filters.</p>
          ) : null}
        </section>

        {canAdminister ? (
          <TagGovernancePanel
            data={adminTags}
            onSaveAlias={onSaveTagAlias}
            onDeleteAlias={onDeleteTagAlias}
            onSaveImplication={onSaveTagImplication}
            onDeleteImplication={onDeleteTagImplication}
          />
        ) : null}

        {canAdminister ? (
          <section className="dashboard-panel audit-log-panel">
          <div className="panel-title">
            <FileText size={18} />
            Audit log
          </div>
          {!adminAuditLog ? <p className="muted">Loading audit trail.</p> : null}
          {auditEntries.map((entry) => (
            <article className="audit-log-row" key={entry.id}>
              <div className="audit-log-heading">
                <strong>{entry.summary}</strong>
                <span>{dateFormat.format(new Date(entry.createdAt))}</span>
              </div>
              <small>
                {formatAuditAction(entry.action)} by {entry.admin.displayName} ·{" "}
                {entry.targetType}:{entry.targetId}
              </small>
            </article>
          ))}
          {adminAuditLog && auditEntries.length === 0 ? (
            <p className="muted">No admin actions recorded yet.</p>
          ) : null}
          </section>
        ) : null}

        <section className="dashboard-panel recent-panel">
          <div className="panel-title">
            <Grid3X3 size={18} />
            Recent works
          </div>
          {recent.slice(0, 6).map((artwork) => (
            <div className="recent-row" key={artwork.id}>
              <img
                src={artwork.thumbnailUrl}
                alt=""
                loading="lazy"
                decoding="async"
              />
              <div>
                <strong>{artwork.title}</strong>
                <span>
                  {dateFormat.format(new Date(artwork.createdAt))} · {formatCount(artwork.viewCount)} views
                </span>
              </div>
            </div>
          ))}
        </section>
      </div>
    </section>
  );
}

function NovelDashboard({
  health,
  adminStats,
  adminReports,
  reportStatus,
  reportTarget,
  reportReason,
  reportLimit,
  adminUsers,
  userQuery,
  userStatus,
  userLimit,
  adminTags,
  adminAuditLog,
  canAdminister,
  message,
  onUpload,
  onResolveReport,
  onReportStatusChange,
  onReportTargetChange,
  onReportReasonChange,
  onReportLimitChange,
  onUserQueryChange,
  onUserStatusChange,
  onUserLimitChange,
  onUpdateUserRole,
  onModerateNovel,
  onToggleUserSuspension,
  onSaveTagAlias,
  onDeleteTagAlias,
  onSaveTagImplication,
  onDeleteTagImplication
}: DashboardProps) {
  const contentStats = adminStats?.content;
  const accountStats = adminStats?.accounts;
  const recentNovels = adminStats?.recentNovels ?? [];
  const reports = adminReports?.reports ?? [];
  const auditEntries = adminAuditLog?.entries ?? [];
  const novelReports = reports.filter((report) => report.targetType === "novel");
  const reportStatusLabel =
    reportStatusFilterOptions.find((option) => option.value === reportStatus)?.label ?? "Open";
  const directoryUsers = adminUsers?.users ?? [];
  const userStatusLabel =
    adminUserStatusFilterOptions.find((option) => option.value === userStatus)?.label ??
    "All accounts";
  const filteredReportTotal =
    adminReports?.targetType === "novel" ? adminReports.totalCount : novelReports.length;
  const draftCount = Math.max(
    0,
    (contentStats?.novels ?? 0) - (contentStats?.publishedNovels ?? 0)
  );
  const [userSearchDraft, setUserSearchDraft] = useState(userQuery);

  useEffect(() => {
    if (reportTarget !== "novel") {
      onReportTargetChange("novel");
    }
  }, [onReportTargetChange, reportTarget]);

  useEffect(() => {
    setUserSearchDraft(userQuery);
  }, [userQuery]);

  return (
    <section className="dashboard-main" aria-label="Novel operations dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">Operations</p>
          <h1>Novel dashboard</h1>
          <p>Worker, D1, accounts, and novel publishing pipeline status for NEHub.</p>
          {message ? <p className="dashboard-message">{message}</p> : null}
        </div>
        <button className="primary-button" type="button" onClick={onUpload}>
          <NotebookText size={17} />
          Post novel
        </button>
      </div>

      <div className="status-grid">
        <StatusCard
          icon={<NotebookText size={22} />}
          label="Novel API"
          value={health?.ok ? "Online" : "Checking"}
          active={Boolean(health?.ok)}
          detail="Novel routes and static asset fallback"
        />
        <StatusCard
          icon={<Database size={22} />}
          label="D1 novels"
          value={health?.storage.d1 ? "Bound" : "Fallback"}
          active={Boolean(health?.storage.d1)}
          detail={`${formatCount(contentStats?.novels ?? 0)} stored works`}
        />
        <StatusCard
          icon={<Bookmark size={22} />}
          label="Reader saves"
          value={formatCount(contentStats?.novelBookmarks ?? 0)}
          active={Boolean(contentStats?.novelBookmarks)}
          detail="Bookmarks, reading lists, progress"
        />
        <StatusCard
          icon={<Trophy size={22} />}
          label="Rankings"
          value={formatCount(contentStats?.novelViews ?? 0)}
          active={Boolean(contentStats?.novelViews)}
          detail="Reads and engagement power novel discovery"
        />
        <StatusCard
          icon={<MailCheck size={22} />}
          label="Email binding"
          value={adminStats?.storage.email ? "Ready" : "Checking"}
          active={Boolean(adminStats?.storage.email)}
          detail="Alerts and account email delivery"
        />
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-panel">
          <div className="panel-title">
            <UserRound size={18} />
            Account controls
          </div>
          <StatusLine
            label="Total users"
            value={formatCount(accountStats?.totalUsers ?? 0)}
            active={Boolean(accountStats)}
          />
          <StatusLine
            label="Verified users"
            value={formatCount(accountStats?.verifiedUsers ?? 0)}
            active={Boolean(accountStats?.verifiedUsers)}
          />
          <StatusLine
            label="Administrators"
            value={formatCount(accountStats?.admins ?? 0)}
            active={Boolean(accountStats?.admins)}
          />
          <StatusLine
            label="Moderators"
            value={formatCount(accountStats?.moderators ?? 0)}
            active={Boolean(accountStats?.moderators)}
          />
          <StatusLine
            label="Suspended users"
            value={formatCount(accountStats?.suspendedUsers ?? 0)}
            active={Boolean(accountStats?.suspendedUsers)}
          />
          <StatusLine
            label="Active sessions"
            value={formatCount(accountStats?.activeSessions ?? 0)}
            active={Boolean(accountStats?.activeSessions)}
          />
          <StatusLine
            label="Pending email links"
            value={formatCount(accountStats?.pendingVerifications ?? 0)}
            active={Boolean(accountStats?.pendingVerifications)}
          />
        </section>

        <section className="dashboard-panel metric-panel">
          <div className="panel-title">
            <Activity size={18} />
            Novel metrics
          </div>
          <div className="metric-grid">
            <MetricTile label="Novels" value={formatCount(contentStats?.novels ?? 0)} />
            <MetricTile label="Published" value={formatCount(contentStats?.publishedNovels ?? 0)} />
            <MetricTile label="Drafts" value={formatCount(draftCount)} />
            <MetricTile label="Novelists" value={formatCount(contentStats?.novelCreators ?? 0)} />
            <MetricTile label="Words" value={formatCount(contentStats?.novelWords ?? 0)} />
            <MetricTile label="Reads" value={formatCount(contentStats?.novelViews ?? 0)} />
            <MetricTile label="Bookmarks" value={formatCount(contentStats?.novelBookmarks ?? 0)} />
            <MetricTile label="Likes" value={formatCount(contentStats?.novelLikes ?? 0)} />
            <MetricTile label="Comments" value={formatCount(contentStats?.novelComments ?? 0)} />
            <MetricTile label={`${reportStatusLabel} reports`} value={formatCount(filteredReportTotal)} />
            <MetricTile label="Source" value={health?.storage.d1 ? "D1" : "EMPTY"} />
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-title">
            <BarChart3 size={18} />
            Resource checks
          </div>
          <StatusLine
            label="API response"
            value={health?.ok ? "Healthy" : "Pending"}
            active={Boolean(health?.ok)}
          />
          <StatusLine
            label="D1 binding"
            value={health?.storage.d1 ? "Available" : "Unavailable"}
            active={Boolean(health?.storage.d1)}
          />
          <StatusLine
            label="Email binding"
            value={adminStats?.storage.email ? "Available" : "Unavailable"}
            active={Boolean(adminStats?.storage.email)}
          />
          <StatusLine
            label="Novel data"
            value={health?.storage.d1 ? "Persisted" : "Empty"}
            active={Boolean(health?.storage.d1)}
          />
          <StatusLine
            label="Reading progress"
            value="Tracking"
            active
          />
        </section>

        {canAdminister ? (
          <section className="dashboard-panel recent-users-panel">
            <div className="panel-title">
              <ShieldCheck size={18} />
              User directory
            </div>
            <div className="admin-user-filter-row" aria-label="User directory filters">
              <form
                className="admin-user-search-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  onUserQueryChange(userSearchDraft.trim());
                }}
              >
                <label>
                  Search
                  <div className="admin-user-search-box">
                    <Search size={15} />
                    <input
                      value={userSearchDraft}
                      maxLength={120}
                      onChange={(event) => setUserSearchDraft(event.target.value)}
                      placeholder="Username, email, display name"
                    />
                  </div>
                </label>
                <button className="secondary-button" type="submit">
                  Search
                </button>
              </form>
              <label>
                Status
                <select
                  value={userStatus}
                  onChange={(event) =>
                    onUserStatusChange(event.target.value as AdminUserStatusFilter)
                  }
                >
                  {adminUserStatusFilterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Limit
                <select
                  value={userLimit}
                  onChange={(event) => onUserLimitChange(Number(event.target.value))}
                >
                  {[20, 40, 100].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {adminUsers ? (
              <p className="muted">
                Showing {formatCount(directoryUsers.length)} of{" "}
                {formatCount(adminUsers.totalCount)} {userStatusLabel.toLowerCase()}.
              </p>
            ) : (
              <p className="muted">Loading users.</p>
            )}
            {directoryUsers.map((user) => (
              <div className="admin-user-row" key={user.id}>
                <span className={classNames("verify-dot", (user.emailVerified || user.role !== "member") && "is-verified")} />
                <div>
                  <strong>{user.displayName}</strong>
                  <span>
                    @{user.username} · {user.email} · {formatUserRole(user.role)}
                    {!user.emailVerified ? " · unverified" : ""}
                    {user.suspendedAt ? " · suspended" : ""} ·{" "}
                    {dateFormat.format(new Date(user.createdAt))}
                  </span>
                </div>
                <label className="admin-user-role-select">
                  Role
                  <select
                    value={user.role}
                    onChange={(event) => onUpdateUserRole(user, event.target.value as UserRole)}
                  >
                    {userRoleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                {user.role === "member" ? (
                  <button
                    className={classNames("text-button", user.suspendedAt && "is-danger")}
                    type="button"
                    onClick={() => onToggleUserSuspension(user, !user.suspendedAt)}
                  >
                    {user.suspendedAt ? "Restore" : "Suspend"}
                  </button>
                ) : null}
              </div>
            ))}
            {adminUsers && directoryUsers.length === 0 ? (
              <p className="muted">No users match these filters.</p>
            ) : null}
          </section>
        ) : null}

        <section className="dashboard-panel moderation-panel">
          <div className="panel-title">
            <Flag size={18} />
            Novel moderation queue
          </div>
          <div className="report-filter-row" aria-label="Novel report filters">
            <label>
              Status
              <select
                value={reportStatus}
                onChange={(event) => onReportStatusChange(event.target.value as ReportStatus)}
              >
                {reportStatusFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Target
              <select value="novel" disabled>
                <option value="novel">Novels</option>
              </select>
            </label>
            <label>
              Reason
              <select
                value={reportReason}
                onChange={(event) =>
                  onReportReasonChange(event.target.value as AdminReportReasonFilter)
                }
              >
                {reportReasonFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Limit
              <select
                value={reportLimit}
                onChange={(event) => onReportLimitChange(Number(event.target.value))}
              >
                {[25, 50, 100].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {adminReports ? (
            <p className="muted">
              Showing {formatCount(novelReports.length)} of {formatCount(filteredReportTotal)}{" "}
              {reportStatusLabel.toLowerCase()} novel reports.
            </p>
          ) : (
            <p className="muted">Loading novel reports.</p>
          )}
          {novelReports.map((report) => (
            <article className="report-row" key={report.id}>
              <div className="report-row-heading">
                <span className="report-target">novel</span>
                <span>{dateFormat.format(new Date(report.createdAt))}</span>
              </div>
              <strong>{report.targetLabel}</strong>
              <small>
                Reported by {report.reporter} · {formatReportReason(report.reason)}
              </small>
              {report.details ? <p>{report.details}</p> : null}
              {report.status === "open" ? (
                <div className="report-actions">
                  <button
                    className="danger-button"
                    type="button"
                    onClick={() => onModerateNovel(report, "hide")}
                  >
                    <EyeOff size={15} />
                    Unpublish novel
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => onResolveReport(report, "resolved")}
                  >
                    <ShieldCheck size={15} />
                    Resolve
                  </button>
                  <button
                    className="danger-button"
                    type="button"
                    onClick={() => onResolveReport(report, "dismissed")}
                  >
                    <X size={15} />
                    Dismiss
                  </button>
                </div>
              ) : (
                <span className="report-status-pill">{report.status}</span>
              )}
            </article>
          ))}
          {adminReports && novelReports.length === 0 ? (
            <p className="muted">No novel reports match these filters.</p>
          ) : null}
        </section>

        {canAdminister ? (
          <TagGovernancePanel
            data={adminTags}
            onSaveAlias={onSaveTagAlias}
            onDeleteAlias={onDeleteTagAlias}
            onSaveImplication={onSaveTagImplication}
            onDeleteImplication={onDeleteTagImplication}
          />
        ) : null}

        {canAdminister ? (
          <section className="dashboard-panel audit-log-panel">
            <div className="panel-title">
              <FileText size={18} />
              Audit log
            </div>
            {!adminAuditLog ? <p className="muted">Loading audit trail.</p> : null}
            {auditEntries.map((entry) => (
              <article className="audit-log-row" key={entry.id}>
                <div className="audit-log-heading">
                  <strong>{entry.summary}</strong>
                  <span>{dateFormat.format(new Date(entry.createdAt))}</span>
                </div>
                <small>
                  {formatAuditAction(entry.action)} by {entry.admin.displayName} ·{" "}
                  {entry.targetType}:{entry.targetId}
                </small>
              </article>
            ))}
            {adminAuditLog && auditEntries.length === 0 ? (
              <p className="muted">No admin actions recorded yet.</p>
            ) : null}
          </section>
        ) : null}

        <section className="dashboard-panel recent-panel">
          <div className="panel-title">
            <NotebookText size={18} />
            Recent novels
          </div>
          {recentNovels.map((novel) => (
            <div className="recent-row recent-novel-row" key={novel.id}>
              <span className="recent-novel-mark" style={{ background: novel.coverColor }}>
                {novel.title.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <strong>{novel.title}</strong>
                <span>
                  @{novel.creator.handle} · {formatCount(novel.wordCount)} words ·{" "}
                  {formatCount(novel.viewCount)} reads
                  {novel.isDraft ? " · draft" : ""}
                  {novel.matureRating !== "general" ? ` · ${matureRatingLabel(novel.matureRating)}` : ""}
                </span>
              </div>
            </div>
          ))}
          {adminStats && recentNovels.length === 0 ? (
            <p className="muted">No novels have been posted yet.</p>
          ) : null}
          {!adminStats ? <p className="muted">Loading novels.</p> : null}
        </section>
      </div>
    </section>
  );
}

type TagGovernancePanelProps = {
  data: AdminTagsResponse | null;
  onSaveAlias: (sourceTag: string, targetTag: string) => Promise<string>;
  onDeleteAlias: (alias: TagAlias) => Promise<string>;
  onSaveImplication: (sourceTag: string, targetTag: string) => Promise<string>;
  onDeleteImplication: (implication: TagImplication) => Promise<string>;
};

function TagGovernancePanel({
  data,
  onSaveAlias,
  onDeleteAlias,
  onSaveImplication,
  onDeleteImplication
}: TagGovernancePanelProps) {
  const [aliasSource, setAliasSource] = useState("");
  const [aliasTarget, setAliasTarget] = useState("");
  const [implicationSource, setImplicationSource] = useState("");
  const [implicationTarget, setImplicationTarget] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const submitAlias = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) {
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      setMessage(await onSaveAlias(aliasSource, aliasTarget));
      setAliasSource("");
      setAliasTarget("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save alias.");
    } finally {
      setBusy(false);
    }
  };

  const submitImplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) {
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      setMessage(await onSaveImplication(implicationSource, implicationTarget));
      setImplicationSource("");
      setImplicationTarget("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save implication.");
    } finally {
      setBusy(false);
    }
  };

  const removeAlias = async (alias: TagAlias) => {
    setBusy(true);
    setMessage("");
    try {
      setMessage(await onDeleteAlias(alias));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to remove alias.");
    } finally {
      setBusy(false);
    }
  };

  const removeImplication = async (implication: TagImplication) => {
    setBusy(true);
    setMessage("");
    try {
      setMessage(await onDeleteImplication(implication));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to remove implication.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="dashboard-panel tag-governance-panel">
      <div className="panel-title">
        <AtSign size={18} />
        Tag governance
      </div>
      {!data ? <p className="muted">Loading tag rules.</p> : null}
      {message ? <p className="dashboard-message">{message}</p> : null}

      <div className="tag-rule-grid">
        <form className="tag-rule-form" onSubmit={submitAlias}>
          <strong>Alias</strong>
          <span>Merge misspellings or alternate names into one canonical tag.</span>
          <input
            value={aliasSource}
            onChange={(event) => setAliasSource(event.target.value)}
            placeholder="old tag"
            required
          />
          <input
            value={aliasTarget}
            onChange={(event) => setAliasTarget(event.target.value)}
            placeholder="canonical tag"
            required
          />
          <button className="secondary-button" type="submit" disabled={busy}>
            Save alias
          </button>
        </form>

        <form className="tag-rule-form" onSubmit={submitImplication}>
          <strong>Implication</strong>
          <span>Add broader tags automatically when a specific tag is used.</span>
          <input
            value={implicationSource}
            onChange={(event) => setImplicationSource(event.target.value)}
            placeholder="specific tag"
            required
          />
          <input
            value={implicationTarget}
            onChange={(event) => setImplicationTarget(event.target.value)}
            placeholder="broader tag"
            required
          />
          <button className="secondary-button" type="submit" disabled={busy}>
            Save implication
          </button>
        </form>
      </div>

      <div className="tag-governance-columns">
        <div>
          <strong>Aliases</strong>
          {(data?.aliases ?? []).map((alias) => (
            <div className="tag-rule-row" key={alias.sourceTag}>
              <span>#{alias.sourceTag} {"->"} #{alias.targetTag}</span>
              <button
                className="text-button is-danger"
                type="button"
                disabled={busy}
                onClick={() => removeAlias(alias)}
              >
                Remove
              </button>
            </div>
          ))}
          {data && data.aliases.length === 0 ? <p className="muted">No aliases yet.</p> : null}
        </div>

        <div>
          <strong>Implications</strong>
          {(data?.implications ?? []).map((implication) => (
            <div
              className="tag-rule-row"
              key={`${implication.sourceTag}-${implication.targetTag}`}
            >
              <span>#{implication.sourceTag} {"->"} #{implication.targetTag}</span>
              <button
                className="text-button is-danger"
                type="button"
                disabled={busy}
                onClick={() => removeImplication(implication)}
              >
                Remove
              </button>
            </div>
          ))}
          {data && data.implications.length === 0 ? (
            <p className="muted">No implications yet.</p>
          ) : null}
        </div>
      </div>

      <div className="tag-mini-grid" aria-label="Indexed tags">
        {(data?.topTags ?? []).slice(0, 12).map((tag) => (
          <span key={tag.name}>
            #{tag.name}
            <strong>{formatCount(tag.count)}</strong>
          </span>
        ))}
      </div>
    </section>
  );
}

type ProfilePageProps = {
  context: RouteContext;
  username: string;
  csrfToken: string;
  siteKey: string;
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onBookmark: (artwork: Artwork, visibility?: BookmarkVisibility) => void;
  onOpenCollection: (collectionId: string) => void;
  onOpenNovel: (novelId: string) => void;
  onOpenProfile: (username: string) => void;
  onOpenPrivacySecurity: () => void;
  onOpenProfileSettings: () => void;
  onOpenSeries: (seriesId: string) => void;
  onSelectArtwork: (artwork: Artwork) => void;
};

type TagPageProps = {
  tag: string;
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onBookmark: (artwork: Artwork, visibility?: BookmarkVisibility) => void;
  onOpenArtwork: (artwork: Artwork) => void;
  onOpenPrivacySecurity: () => void;
  onOpenProfile: (username: string) => void;
  onOpenTag: (tag: string) => void;
  onToggleSubscription: (tag: string) => Promise<TagSubscriptionResponse | null | void>;
};

function TagPage({
  tag,
  currentUser,
  onAuthRequired,
  onBookmark,
  onOpenArtwork,
  onOpenPrivacySecurity,
  onOpenProfile,
  onOpenTag,
  onToggleSubscription
}: TagPageProps) {
  const [data, setData] = useState<TagDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [followingBusy, setFollowingBusy] = useState(false);
  const [sort, setSort] = useState<TagPageSort>("latest");
  const [rating, setRating] = useState<MatureFilter>("all");
  const [message, setMessage] = useState("");
  const normalizedTag = tag.trim();
  const tagParams = useMemo(() => {
    const params = new URLSearchParams({
      limit: "36",
      sort
    });
    if (rating !== "all") {
      params.set("rating", rating);
    }
    return params;
  }, [rating, sort]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessage("");
    setData(null);

    if (!normalizedTag) {
      setLoading(false);
      setMessage("Tag not found.");
      return () => {
        cancelled = true;
      };
    }

    fetch(`/api/tags/${encodeURIComponent(normalizedTag)}?${tagParams.toString()}`, {
      credentials: "include"
    })
      .then(async (response) => {
        const payload = (await response.json()) as TagDetailResponse | { message?: string };
        if (!response.ok || !("tag" in payload)) {
          throw new Error(
            ("message" in payload ? payload.message : undefined) ?? "Tag could not be loaded."
          );
        }
        return payload;
      })
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Tag could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, normalizedTag, tagParams]);

  const handleLoadMore = async () => {
    if (!data?.nextCursor) {
      return;
    }
    setLoadingMore(true);
    setMessage("");
    try {
      const params = new URLSearchParams(tagParams);
      params.set("cursor", data.nextCursor);
      const response = await fetch(
        `/api/tags/${encodeURIComponent(data.tag)}?${params.toString()}`,
        { credentials: "include" }
      );
      const payload = (await response.json()) as TagDetailResponse | { message?: string };
      if (!response.ok || !("tag" in payload)) {
        throw new Error(
          ("message" in payload ? payload.message : undefined) ?? "Tag page could not be loaded."
        );
      }
      setData((current) =>
        current
          ? {
              ...payload,
              artworks: [...current.artworks, ...payload.artworks]
            }
          : payload
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Tag page could not be loaded.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      onAuthRequired();
      return;
    }
    setFollowingBusy(true);
    setMessage("");
    try {
      const payload = await onToggleSubscription(data?.tag ?? normalizedTag);
      if (payload && "tag" in payload) {
        setData((current) =>
          current
            ? {
                ...current,
                tag: payload.tag,
                subscribed: payload.subscribed
              }
            : current
        );
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update tag.");
    } finally {
      setFollowingBusy(false);
    }
  };

  const artworks = data?.artworks ?? [];
  const titleTag = data?.tag ?? normalizedTag;
  const activeSortLabel =
    tagPageSortOptions.find((option) => option.value === sort)?.label ?? "Latest";

  return (
    <section className="content-main tag-page">
      <div className="tag-hero">
        <div>
          <p className="eyebrow">Tag channel</p>
          <h1>#{titleTag}</h1>
          <p>
            {data
              ? `${formatCount(data.totalCount)} visible works in this community tag.`
              : "Loading tag works from the community."}
          </p>
          <div className="profile-meta">
            <span>{activeSortLabel}</span>
            {data ? <span>{matureAccessLabel(data.matureAccess)}</span> : null}
          </div>
        </div>
        <button
          className={classNames("secondary-button tag-hero-follow", data?.subscribed && "is-active")}
          type="button"
          onClick={handleFollow}
          disabled={followingBusy || !titleTag}
        >
          <Bell size={16} />
          {followingBusy ? "Saving" : data?.subscribed ? "Following" : "Follow tag"}
        </button>
      </div>

      <div className="tag-page-toolbar">
        <div className="mini-segmented" aria-label="Tag sort">
          {tagPageSortOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                className={classNames(sort === option.value && "is-active")}
                type="button"
                key={option.value}
                onClick={() => setSort(option.value)}
                disabled={loading}
              >
                <Icon size={15} />
                {option.label}
              </button>
            );
          })}
        </div>
        <label className="rating-filter">
          <Shield size={15} />
          <select
            value={rating}
            onChange={(event) => setRating(event.target.value as MatureFilter)}
          >
            {matureFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <MatureAccessNotice
        matureAccess={data?.matureAccess ?? null}
        onLogin={onAuthRequired}
        onPrivacySecurity={onOpenPrivacySecurity}
      />

      {data && data.relatedTags.length > 0 ? (
        <div className="tag-row tag-related-row" aria-label="Related tags">
          {data.relatedTags.map((relatedTag) => (
            <button
              className="tag-pill"
              type="button"
              key={relatedTag.name}
              onClick={() => onOpenTag(relatedTag.name)}
            >
              #{relatedTag.name}
              <span>{formatCount(relatedTag.count)}</span>
            </button>
          ))}
        </div>
      ) : null}

      {loading ? <p className="empty-feed">Loading tag works.</p> : null}
      {message ? <p className="empty-feed">{message}</p> : null}

      <div className="art-grid tag-art-grid" aria-live="polite">
        {artworks.map((artwork, index) => (
          <ArtworkCard
            artwork={artwork}
            index={index}
            key={artwork.id}
            onBookmark={onBookmark}
            onOpenProfile={onOpenProfile}
            onSelect={onOpenArtwork}
          />
        ))}
      </div>
      {data?.nextCursor ? (
        <div className="load-more-row">
          <button
            className="secondary-button"
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading" : "Load more"}
            <span>
              {formatCount(artworks.length)} / {formatCount(data.totalCount)}
            </span>
          </button>
        </div>
      ) : null}
      {data && artworks.length === 0 ? (
        <p className="empty-feed">No visible works for this tag yet.</p>
      ) : null}
    </section>
  );
}

type CollectionsPageProps = {
  context: RouteContext;
  collections: UserCollection[];
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onCreateCollection: (name: string) => Promise<string>;
  onOpenCollection: (collectionId: string) => void;
};

function CollectionFolderPreview({ collection }: { collection: UserCollection }) {
  if (collection.previewArtworks.length === 0) {
    return (
      <span className="collection-folder-icon">
        <FolderOpen size={22} />
      </span>
    );
  }
  return (
    <span className="collection-folder-preview" aria-hidden="true">
      {collection.previewArtworks.slice(0, 3).map((artwork) => (
        <img
          alt=""
          key={artwork.id}
          src={artwork.thumbnailUrl}
          style={{ backgroundColor: artwork.dominantColor }}
          loading="lazy"
          decoding="async"
        />
      ))}
    </span>
  );
}

function ReadingShelfPreview({ readingList }: { readingList: ReadingList }) {
  if (readingList.novelCount === 0) {
    return (
      <span className="collection-folder-icon novel-shelf-icon">
        <FolderOpen size={22} />
      </span>
    );
  }
  return (
    <span className="collection-folder-preview novel-shelf-preview" aria-hidden="true">
      {Array.from({ length: Math.min(3, Math.max(1, readingList.novelCount)) }).map((_, index) => (
        <span key={`${readingList.id}-${index}`} />
      ))}
    </span>
  );
}

type CreatorDiscoverPageProps = {
  csrfToken: string;
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onOpenProfile: (username: string) => void;
  onOpenPrivacySecurity: () => void;
};

function CreatorDiscoverPage({
  csrfToken,
  currentUser,
  onAuthRequired,
  onOpenProfile,
  onOpenPrivacySecurity
}: CreatorDiscoverPageProps) {
  const [data, setData] = useState<CreatorDiscoveryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<CreatorDiscoverySort>("popular");
  const [message, setMessage] = useState("");
  const [followingBusy, setFollowingBusy] = useState("");
  const creatorParams = useMemo(() => {
    const params = new URLSearchParams({
      limit: "24",
      sort
    });
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    return params;
  }, [searchQuery, sort]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessage("");

    fetch(`/api/creators?${creatorParams.toString()}`, { credentials: "include" })
      .then(async (response) => {
        const payload = (await response.json()) as CreatorDiscoveryResponse | { message?: string };
        if (!response.ok || !("creators" in payload)) {
          throw new Error(
            ("message" in payload ? payload.message : undefined) ?? "Creators could not be loaded."
          );
        }
        return payload;
      })
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Creators could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, creatorParams]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const handleLoadMore = async () => {
    if (!data?.nextCursor) {
      return;
    }
    setLoadingMore(true);
    setMessage("");
    try {
      const params = new URLSearchParams(creatorParams);
      params.set("cursor", data.nextCursor);
      const response = await fetch(`/api/creators?${params.toString()}`, {
        credentials: "include"
      });
      const payload = (await response.json()) as CreatorDiscoveryResponse | { message?: string };
      if (!response.ok || !("creators" in payload)) {
        throw new Error(
          ("message" in payload ? payload.message : undefined) ?? "Creators could not be loaded."
        );
      }
      setData((current) =>
        current
          ? {
              ...payload,
              creators: [...current.creators, ...payload.creators]
            }
          : payload
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Creators could not be loaded.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleFollow = async (username: string) => {
    if (!currentUser) {
      onAuthRequired();
      return;
    }
    setFollowingBusy(username);
    setMessage("");
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(username)}/follow`, {
        method: "POST",
        credentials: "include",
        headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
      });
      const payload = (await response.json()) as FollowResponse | { message?: string };
      if (!response.ok || !("following" in payload)) {
        throw new Error(payload.message ?? "Follow action failed.");
      }
      setData((current) =>
        current
          ? {
              ...current,
              creators: current.creators.map((item) =>
                item.creator.handle.toLowerCase() === username.toLowerCase()
                  ? {
                      ...item,
                      creator: {
                        ...item.creator,
                        following: payload.following,
                        followerCount: payload.followerCount
                      }
                    }
                  : item
              )
            }
          : current
      );
      setMessage(payload.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Follow action failed.");
    } finally {
      setFollowingBusy("");
    }
  };

  const items = data?.creators ?? [];
  const resultSummary = data
    ? searchQuery
      ? `${formatCount(data.totalCount)} creators matching "${searchQuery}".`
      : `${formatCount(data.totalCount)} visible creators.`
    : "Find artists by recent activity, audience, or name.";

  return (
    <section className="content-main creator-discover-page">
      <div className="settings-heading creator-discover-heading">
        <div>
          <p className="eyebrow">Artists</p>
          <h1>Creator discovery</h1>
          <p>{resultSummary}</p>
        </div>
      </div>

      <div className="creator-discovery-toolbar">
        <form className="collection-discovery-search" onSubmit={handleSearchSubmit}>
          <Search size={18} />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search creators"
            type="search"
          />
          <button className="secondary-button" type="submit" disabled={loading}>
            Search
          </button>
        </form>
        <div className="mini-segmented" aria-label="Creator discovery sort">
          {creatorDiscoverySortOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                className={classNames(sort === option.value && "is-active")}
                type="button"
                key={option.value}
                onClick={() => setSort(option.value)}
                disabled={loading}
              >
                <Icon size={15} />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <MatureAccessNotice
        matureAccess={data?.matureAccess ?? null}
        onLogin={onAuthRequired}
        onPrivacySecurity={onOpenPrivacySecurity}
      />

      {loading ? <p className="empty-feed">Loading creators.</p> : null}
      {message ? <p className="empty-feed">{message}</p> : null}

      <div className="creator-discovery-grid">
        {items.map(({ creator, artworkCount, latestArtworkAt, previewArtworks }) => {
          const ownProfile =
            currentUser?.username.toLowerCase() === creator.handle.toLowerCase();
          return (
            <article className="creator-discovery-card" key={creator.id}>
              <button
                className="creator-discovery-main"
                type="button"
                onClick={() => onOpenProfile(creator.handle)}
              >
                {creator.avatarUrl ? (
                  <img className="creator-discovery-avatar" src={creator.avatarUrl} alt="" />
                ) : (
                  <span className="creator-discovery-avatar creator-discovery-avatar-fallback">
                    {creator.displayName.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="creator-discovery-copy">
                  <strong>{creator.displayName}</strong>
                  <small>@{creator.handle}</small>
                  {creator.bio ? <span>{creator.bio}</span> : null}
                </span>
              </button>

              <div className="creator-discovery-previews">
                {previewArtworks.length > 0 ? (
                  previewArtworks.map((artwork) => (
                    <button
                      className="creator-preview-tile"
                      type="button"
                      key={artwork.id}
                      onClick={() => onOpenProfile(creator.handle)}
                      title={artwork.title}
                    >
                      <img
                        src={artwork.thumbnailUrl}
                        alt=""
                        style={{ backgroundColor: artwork.dominantColor }}
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ))
                ) : (
                  <span className="creator-preview-empty">
                    <Images size={20} />
                  </span>
                )}
              </div>

              <div className="creator-discovery-meta">
                <span>{formatCount(creator.followerCount)} followers</span>
                <span>{formatCount(artworkCount)} works</span>
                {latestArtworkAt ? (
                  <span>Active {dateFormat.format(new Date(latestArtworkAt))}</span>
                ) : null}
              </div>

              <div className="creator-discovery-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => onOpenProfile(creator.handle)}
                >
                  <UserRound size={16} />
                  Profile
                </button>
                <button
                  className={classNames("secondary-button", creator.following && "is-active")}
                  type="button"
                  onClick={() =>
                    ownProfile ? onOpenProfile(creator.handle) : handleFollow(creator.handle)
                  }
                  disabled={followingBusy === creator.handle}
                >
                  <UserPlus size={16} />
                  {ownProfile
                    ? "You"
                    : followingBusy === creator.handle
                      ? "Saving"
                      : creator.following
                        ? "Following"
                        : "Follow"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {data?.nextCursor ? (
        <div className="load-more-row">
          <button
            className="secondary-button"
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading" : "Load more"}
            <span>
              {formatCount(items.length)} / {formatCount(data.totalCount)}
            </span>
          </button>
        </div>
      ) : null}
      {data && items.length === 0 ? (
        <p className="empty-feed">No creators match this view yet.</p>
      ) : null}
    </section>
  );
}

type RankingsPageProps = {
  period: RankingPeriod;
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onBookmark: (artwork: Artwork, visibility?: BookmarkVisibility) => void;
  onOpenArtwork: (artwork: Artwork) => void;
  onOpenPrivacySecurity: () => void;
  onOpenProfile: (username: string) => void;
  onPeriodChange: (period: RankingPeriod) => void;
};

function RankingsPage({
  period,
  currentUser,
  onAuthRequired,
  onBookmark,
  onOpenArtwork,
  onOpenPrivacySecurity,
  onOpenProfile,
  onPeriodChange
}: RankingsPageProps) {
  const [data, setData] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessage("");

    fetch(`/api/rankings?period=${period}&limit=50`, { credentials: "include" })
      .then(async (response) => {
        const payload = (await response.json()) as RankingResponse | { message?: string };
        if (!response.ok || !("rankings" in payload)) {
          throw new Error(
            ("message" in payload ? payload.message : undefined) ?? "Rankings could not be loaded."
          );
        }
        return payload;
      })
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Rankings could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, period]);

  const rankings = data?.rankings ?? [];
  const periodLabel = period === "weekly" ? "Weekly" : "Daily";
  const summary = data
    ? `${formatCount(rankings.length)} ranked works from recent ${period === "weekly" ? "weekly" : "daily"} likes.`
    : "Loading ranked works from the community.";

  return (
    <section className="content-main ranking-page">
      <div className="settings-heading ranking-page-heading">
        <div>
          <p className="eyebrow">Rankings</p>
          <h1>{periodLabel} ranking</h1>
          <p>{summary}</p>
        </div>
        <div className="mini-segmented" aria-label="Ranking period">
          {(["daily", "weekly"] as RankingPeriod[]).map((nextPeriod) => (
            <button
              className={classNames(period === nextPeriod && "is-active")}
              type="button"
              key={nextPeriod}
              onClick={() => onPeriodChange(nextPeriod)}
              disabled={loading}
            >
              <Trophy size={15} />
              {nextPeriod === "daily" ? "Daily" : "Weekly"}
            </button>
          ))}
        </div>
      </div>

      <MatureAccessNotice
        matureAccess={data?.matureAccess ?? null}
        onLogin={onAuthRequired}
        onPrivacySecurity={onOpenPrivacySecurity}
      />

      {loading ? <p className="empty-feed">Loading rankings.</p> : null}
      {message ? <p className="empty-feed">{message}</p> : null}

      <div className="ranking-grid">
        {rankings.map(({ artwork, score }, index) => (
          <article className="ranking-card" key={artwork.id}>
            <div className="ranking-card-rank">
              <Trophy size={18} />
              #{index + 1}
              <span>{formatCount(score || artwork.likeCount)} likes</span>
            </div>
            <ArtworkCard
              artwork={artwork}
              index={index}
              onBookmark={onBookmark}
              onOpenProfile={onOpenProfile}
              onSelect={onOpenArtwork}
            />
          </article>
        ))}
      </div>

      {data && rankings.length === 0 ? (
        <p className="empty-feed">No ranked works yet. Likes from visible artwork will appear here.</p>
      ) : null}
    </section>
  );
}

type CollectionDiscoverPageProps = {
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onOpenCollection: (collectionId: string) => void;
  onOpenProfile: (username: string) => void;
  onOpenPrivacySecurity: () => void;
};

function CollectionDiscoverPage({
  currentUser,
  onAuthRequired,
  onOpenCollection,
  onOpenProfile,
  onOpenPrivacySecurity
}: CollectionDiscoverPageProps) {
  const [data, setData] = useState<CollectionDiscoveryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<CollectionDiscoverySort>("updated");
  const [message, setMessage] = useState("");
  const discoveryParams = useMemo(() => {
    const params = new URLSearchParams({
      limit: "24",
      sort
    });
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    return params;
  }, [searchQuery, sort]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessage("");

    fetch(`/api/collections/discover?${discoveryParams.toString()}`, { credentials: "include" })
      .then(async (response) => {
        const payload = (await response.json()) as CollectionDiscoveryResponse | { message?: string };
        if (!response.ok || !("collections" in payload)) {
          throw new Error(
            ("message" in payload ? payload.message : undefined) ?? "Collections could not be loaded."
          );
        }
        return payload;
      })
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Collections could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, discoveryParams]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const handleLoadMore = async () => {
    if (!data?.nextCursor) {
      return;
    }
    setLoadingMore(true);
    setMessage("");
    try {
      const params = new URLSearchParams(discoveryParams);
      params.set("cursor", data.nextCursor);
      const response = await fetch(`/api/collections/discover?${params.toString()}`, {
        credentials: "include"
      });
      const payload = (await response.json()) as CollectionDiscoveryResponse | { message?: string };
      if (!response.ok || !("collections" in payload)) {
        throw new Error(
          ("message" in payload ? payload.message : undefined) ?? "Collections could not be loaded."
        );
      }
      setData((current) =>
        current
          ? {
              ...payload,
              collections: [...current.collections, ...payload.collections]
            }
          : payload
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Collections could not be loaded.");
    } finally {
      setLoadingMore(false);
    }
  };

  const items = data?.collections ?? [];
  const resultSummary = data
    ? searchQuery
      ? `${formatCount(data.totalCount)} public folders matching "${searchQuery}".`
      : `${formatCount(data.totalCount)} public folders from the community.`
    : "Browse public artwork folders from the community.";

  return (
    <section className="content-main collection-page collection-discover-page">
      <div className="settings-heading collection-heading">
        <div>
          <p className="eyebrow">Public folders</p>
          <h1>Collection discovery</h1>
          <p>{resultSummary}</p>
        </div>
      </div>

      <div className="collection-discovery-toolbar">
        <form className="collection-discovery-search" onSubmit={handleSearchSubmit}>
          <Search size={18} />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search folders or creators"
            type="search"
          />
          <button className="secondary-button" type="submit" disabled={loading}>
            Search
          </button>
        </form>
        <div className="mini-segmented" aria-label="Collection discovery sort">
          {collectionDiscoverySortOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                className={classNames(sort === option.value && "is-active")}
                type="button"
                key={option.value}
                onClick={() => setSort(option.value)}
                disabled={loading}
              >
                <Icon size={15} />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <MatureAccessNotice
        matureAccess={data?.matureAccess ?? null}
        onLogin={onAuthRequired}
        onPrivacySecurity={onOpenPrivacySecurity}
      />

      {loading ? <p className="empty-feed">Loading public collections.</p> : null}
      {message ? <p className="empty-feed">{message}</p> : null}
      <div className="collection-folder-grid collection-discovery-grid">
        {items.map(({ collection, owner }) => (
          <article className="collection-discovery-item" key={collection.id}>
            <button
              className="collection-folder-card"
              type="button"
              onClick={() => onOpenCollection(collection.id)}
            >
              <CollectionFolderPreview collection={collection} />
              <span>
                <strong>{collection.name}</strong>
                <small>
                  {formatCount(collection.itemCount)} works · Updated{" "}
                  {dateFormat.format(new Date(collection.updatedAt))}
                </small>
              </span>
              <Eye size={16} />
            </button>
            <button
              className="collection-owner-link"
              type="button"
              onClick={() => onOpenProfile(owner.handle)}
            >
              {owner.avatarUrl ? (
                <img src={owner.avatarUrl} alt="" />
              ) : (
                <span>{owner.displayName.slice(0, 1).toUpperCase()}</span>
              )}
              <strong>{owner.displayName}</strong>
              <small>@{owner.handle}</small>
            </button>
          </article>
        ))}
      </div>
      {data?.nextCursor ? (
        <div className="load-more-row">
          <button
            className="secondary-button"
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading" : "Load more"}
            <span>
              {formatCount(items.length)} / {formatCount(data.totalCount)}
            </span>
          </button>
        </div>
      ) : null}
      {data && items.length === 0 ? (
        <p className="empty-feed">No public collections yet.</p>
      ) : null}
    </section>
  );
}

function CollectionsPage({
  context,
  collections,
  currentUser,
  onAuthRequired,
  onCreateCollection,
  onOpenCollection
}: CollectionsPageProps) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const novelContext = context === "novels";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      const nextMessage = await onCreateCollection(name);
      setName("");
      setMessage(nextMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create collection.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <section className={classNames("content-main collection-page", novelContext && "novel-dedicated-page novel-shelves-page")}>
        <p className="empty-feed">{novelContext ? "Sign in to manage reading shelves." : "Sign in to manage collection folders."}</p>
        <button className="primary-button" type="button" onClick={onAuthRequired}>
          <LogIn size={17} />
          Sign in
        </button>
      </section>
    );
  }

  return (
    <section className={classNames("content-main collection-page", novelContext && "novel-dedicated-page novel-shelves-page")}>
      <div className="settings-heading collection-heading">
        <div>
          <p className="eyebrow">{novelContext ? "Shelves" : "Collections"}</p>
          <h1>{novelContext ? "Reading shelves" : "Artwork folders"}</h1>
          <p>
            {novelContext
              ? "Group saved works into private shelves, then publish selected shelves when they are ready."
              : "Group saved works into private folders, then publish selected folders when they are ready."}
          </p>
        </div>
      </div>

      <form className="collection-page-create" onSubmit={handleSubmit}>
        <input
          value={name}
          minLength={2}
          maxLength={60}
          onChange={(event) => setName(event.target.value)}
          placeholder={novelContext ? "New shelf name" : "New folder name"}
          required
        />
        <button className="primary-button" type="submit" disabled={submitting}>
          <FolderOpen size={17} />
          {submitting ? "Creating" : "Create"}
        </button>
      </form>
      {message ? <p className="auth-inline-message">{message}</p> : null}

      <div className="collection-folder-grid">
        {collections.map((collection) => (
          <button
            className="collection-folder-card"
            key={collection.id}
            type="button"
            onClick={() => onOpenCollection(collection.id)}
          >
            <CollectionFolderPreview collection={collection} />
            <span>
              <strong>{collection.name}</strong>
              <small>
                {formatCount(collection.itemCount)} {novelContext ? "entries" : "works"} · {collection.visibility}
              </small>
            </span>
            {collection.visibility === "public" ? <Eye size={16} /> : <Lock size={16} />}
          </button>
        ))}
      </div>
      {collections.length === 0 ? (
        <p className="empty-feed">
          {novelContext
            ? "No shelves yet. Create one, then add saved works as this section grows."
            : "No folders yet. Create one, then add works from an artwork page."}
        </p>
      ) : null}
    </section>
  );
}

type CollectionPageProps = {
  context: RouteContext;
  collectionId: string;
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onBack: () => void;
  onBookmark: (artwork: Artwork, visibility?: BookmarkVisibility) => void;
  onDelete: (collectionId: string) => Promise<string>;
  onDeleted: () => void;
  onOpenArtwork: (artwork: Artwork) => void;
  onOpenProfile: (username: string) => void;
  onOpenPrivacySecurity: () => void;
  onUpdate: (
    collectionId: string,
    input: CollectionSettingsInput
  ) => Promise<CollectionResponse>;
};

function CollectionPage({
  context,
  collectionId,
  currentUser,
  onAuthRequired,
  onBack,
  onBookmark,
  onDelete,
  onDeleted,
  onOpenArtwork,
  onOpenProfile,
  onOpenPrivacySecurity,
  onUpdate
}: CollectionPageProps) {
  const [detail, setDetail] = useState<CollectionDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<CollectionSettingsInput>({
    name: "",
    description: "",
    visibility: "private",
    coverArtworkId: null
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessage("");
    setDetail(null);

    if (!collectionId) {
      setLoading(false);
      setMessage("Collection not found.");
      return () => {
        cancelled = true;
      };
    }

    fetch(`/api/collections/${encodeURIComponent(collectionId)}`, { credentials: "include" })
      .then(async (response) => {
        const payload = (await response.json()) as CollectionDetailResponse | { message?: string };
        if (!response.ok || !("collection" in payload)) {
          throw new Error(
            ("message" in payload ? payload.message : undefined) ?? "Collection could not be loaded."
          );
        }
        return payload;
      })
      .then((payload) => {
        if (!cancelled) {
          setDetail(payload);
          setForm({
            name: payload.collection.name,
            description: payload.collection.description,
            visibility: payload.collection.visibility,
            coverArtworkId: payload.collection.coverArtworkId
          });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Collection could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [collectionId, currentUser?.id]);

  const handleLoadMore = async () => {
    if (!detail?.nextCursor) {
      return;
    }
    setLoadingMore(true);
    setMessage("");
    try {
      const params = new URLSearchParams({ cursor: detail.nextCursor });
      const response = await fetch(
        `/api/collections/${encodeURIComponent(collectionId)}?${params.toString()}`,
        { credentials: "include" }
      );
      const payload = (await response.json()) as CollectionDetailResponse | { message?: string };
      if (!response.ok || !("collection" in payload)) {
        throw new Error(
          ("message" in payload ? payload.message : undefined) ?? "Collection page could not be loaded."
        );
      }
      setDetail((current) =>
        current
          ? {
              ...payload,
              artworks: [...current.artworks, ...payload.artworks]
            }
          : payload
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Collection page could not be loaded.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) {
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const payload = await onUpdate(collectionId, form);
      setDetail((current) =>
        current
          ? {
              ...current,
              collection: payload.collection
            }
          : current
      );
      setEditing(false);
      setMessage(payload.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update collection.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleting || !detail || !window.confirm(`Delete "${detail.collection.name}"?`)) {
      return;
    }
    setDeleting(true);
    setMessage("");
    try {
      const nextMessage = await onDelete(collectionId);
      setMessage(nextMessage);
      onDeleted();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete collection.");
    } finally {
      setDeleting(false);
    }
  };

  const collection = detail?.collection;
  const owner = detail?.owner;
  const novelContext = context === "novels";

  return (
    <section className={classNames("content-main collection-page", novelContext && "novel-dedicated-page novel-shelves-page")}>
      {loading ? <p className="empty-feed">{novelContext ? "Loading shelf." : "Loading collection."}</p> : null}
      {message ? <p className="empty-feed">{message}</p> : null}
      {!loading && !detail && !currentUser ? (
        <button className="primary-button" type="button" onClick={onAuthRequired}>
          <LogIn size={17} />
          Sign in
        </button>
      ) : null}
      {detail && collection && owner ? (
        <>
          <div className="collection-detail-hero">
            <button className="secondary-button" type="button" onClick={onBack}>
              <ChevronDown size={17} />
              {novelContext ? "Shelves" : "Folders"}
            </button>
            <div>
              <p className="eyebrow">{novelContext ? "Shelf" : "Collection folder"}</p>
              <h1>{collection.name}</h1>
              <p>{collection.description || "No description."}</p>
              <div className="profile-meta">
                <button className="text-button" type="button" onClick={() => onOpenProfile(owner.handle)}>
                  @{owner.handle}
                </button>
                <span>{formatCount(detail.totalCount)} visible {novelContext ? "entries" : "works"}</span>
                <span>{collection.visibility}</span>
                <span>Updated {fullDateFormat.format(new Date(collection.updatedAt))}</span>
              </div>
            </div>
            {detail.canManage ? (
              <div className="collection-detail-actions">
                <button className="secondary-button" type="button" onClick={() => setEditing((value) => !value)}>
                  <Pencil size={16} />
                  Edit
                </button>
                <button className="danger-button" type="button" onClick={handleDelete} disabled={deleting}>
                  <Trash2 size={16} />
                  {deleting ? "Deleting" : "Delete"}
                </button>
              </div>
            ) : null}
          </div>

          <MatureAccessNotice
            matureAccess={detail.matureAccess}
            onLogin={onAuthRequired}
            onPrivacySecurity={onOpenPrivacySecurity}
          />

          {editing ? (
            <form className="settings-form collection-settings-form" onSubmit={handleSave}>
              <label>
                Name
                <input
                  value={form.name}
                  minLength={2}
                  maxLength={60}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  value={form.description}
                  maxLength={240}
                  rows={3}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                />
              </label>
              <label>
                Visibility
                <select
                  value={form.visibility}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      visibility: event.target.value as CollectionVisibility
                    }))
                  }
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </label>
              <div className="collection-cover-field">
                <div className="field-heading">
                  <strong>{novelContext ? "Cover work" : "Cover artwork"}</strong>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, coverArtworkId: null }))}
                    disabled={!form.coverArtworkId}
                  >
                    Clear
                  </button>
                </div>
                <div className="collection-cover-picker">
                  {detail.artworks.map((artwork) => (
                    <button
                      className={classNames(
                        "collection-cover-option",
                        form.coverArtworkId === artwork.id && "is-selected"
                      )}
                      key={artwork.id}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({ ...current, coverArtworkId: artwork.id }))
                      }
                    >
                      <img
                        src={artwork.thumbnailUrl}
                        alt=""
                        style={{ backgroundColor: artwork.dominantColor }}
                        loading="lazy"
                        decoding="async"
                      />
                      <span>{artwork.title}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="settings-actions">
                <button className="primary-button" type="submit" disabled={saving}>
                  <Pencil size={17} />
                  {saving ? "Saving" : "Save folder"}
                </button>
                <button className="secondary-button" type="button" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          <div className="art-grid collection-art-grid">
            {detail.artworks.map((artwork, index) => (
              <ArtworkCard
                artwork={artwork}
                index={index}
                key={artwork.id}
                onBookmark={onBookmark}
                onOpenProfile={onOpenProfile}
                onSelect={onOpenArtwork}
              />
            ))}
          </div>
          {detail.nextCursor ? (
            <div className="load-more-row">
              <button
                className="secondary-button"
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading" : "Load more"}
                <span>
                  {formatCount(detail.artworks.length)} / {formatCount(detail.totalCount)}
                </span>
              </button>
            </div>
          ) : null}
          {detail.artworks.length === 0 ? (
            <p className="empty-feed">{novelContext ? "No visible entries in this shelf." : "No visible works in this folder."}</p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

function SeriesFolderPreview({ series }: { series: ArtworkSeries }) {
  if (series.previewArtworks.length === 0) {
    return (
      <span className="collection-folder-icon series-folder-icon">
        <ListOrdered size={22} />
      </span>
    );
  }
  return (
    <span className="collection-folder-preview series-folder-preview" aria-hidden="true">
      {series.previewArtworks.slice(0, 3).map((artwork) => (
        <img
          alt=""
          key={artwork.id}
          src={artwork.thumbnailUrl}
          style={{ backgroundColor: artwork.dominantColor }}
          loading="lazy"
          decoding="async"
        />
      ))}
    </span>
  );
}

type SeriesListPageProps = {
  context: RouteContext;
  seriesList: ArtworkSeries[];
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onCreateSeries: (title: string) => Promise<string>;
  onOpenSeries: (seriesId: string) => void;
};

function SeriesListPage({
  context,
  seriesList,
  currentUser,
  onAuthRequired,
  onCreateSeries,
  onOpenSeries
}: SeriesListPageProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const novelContext = context === "novels";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      const nextMessage = await onCreateSeries(title);
      setTitle("");
      setMessage(nextMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create series.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <section className={classNames("content-main collection-page series-page", novelContext && "novel-dedicated-page novel-serials-page")}>
        <p className="empty-feed">{novelContext ? "Sign in to manage serials." : "Sign in to manage artwork series."}</p>
        <button className="primary-button" type="button" onClick={onAuthRequired}>
          <LogIn size={17} />
          Sign in
        </button>
      </section>
    );
  }

  return (
    <section className={classNames("content-main collection-page series-page", novelContext && "novel-dedicated-page novel-serials-page")}>
      <div className="settings-heading collection-heading">
        <div>
          <p className="eyebrow">{novelContext ? "Serials" : "Series"}</p>
          <h1>{novelContext ? "Serials" : "Artwork series"}</h1>
          <p>
            {novelContext
              ? "Order your own works into public or private reading sequences."
              : "Order your own works into public or private multi-part galleries."}
          </p>
        </div>
      </div>

      <form className="collection-page-create" onSubmit={handleSubmit}>
        <input
          value={title}
          minLength={2}
          maxLength={80}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={novelContext ? "New serial title" : "New series title"}
          required
        />
        <button className="primary-button" type="submit" disabled={submitting}>
          <ListOrdered size={17} />
          {submitting ? "Creating" : "Create"}
        </button>
      </form>
      {message ? <p className="auth-inline-message">{message}</p> : null}

      <div className="collection-folder-grid">
        {seriesList.map((series) => (
          <button
            className="collection-folder-card series-folder-card"
            key={series.id}
            type="button"
            onClick={() => onOpenSeries(series.id)}
          >
            <SeriesFolderPreview series={series} />
            <span>
              <strong>{series.title}</strong>
              <small>
                {formatCount(series.itemCount)} {novelContext ? "entries" : "works"} · {series.visibility}
              </small>
            </span>
            {series.visibility === "public" ? <Eye size={16} /> : <Lock size={16} />}
          </button>
        ))}
      </div>
      {seriesList.length === 0 ? (
        <p className="empty-feed">
          {novelContext
            ? "No serials yet. Create one, then collect related works as this section grows."
            : "No series yet. Create one, then add your works from an artwork page."}
        </p>
      ) : null}
    </section>
  );
}

type SeriesPageProps = {
  context: RouteContext;
  seriesId: string;
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onBack: () => void;
  onBookmark: (artwork: Artwork, visibility?: BookmarkVisibility) => void;
  onDelete: (seriesId: string) => Promise<string>;
  onDeleted: () => void;
  onOpenArtwork: (artwork: Artwork) => void;
  onOpenProfile: (username: string) => void;
  onOpenPrivacySecurity: () => void;
  onUpdate: (seriesId: string, input: SeriesSettingsInput) => Promise<ArtworkSeriesResponse>;
};

function SeriesPage({
  context,
  seriesId,
  currentUser,
  onAuthRequired,
  onBack,
  onBookmark,
  onDelete,
  onDeleted,
  onOpenArtwork,
  onOpenProfile,
  onOpenPrivacySecurity,
  onUpdate
}: SeriesPageProps) {
  const [detail, setDetail] = useState<ArtworkSeriesDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<SeriesSettingsInput>({
    title: "",
    description: "",
    visibility: "private",
    coverArtworkId: null
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessage("");
    setDetail(null);

    if (!seriesId) {
      setLoading(false);
      setMessage("Series not found.");
      return () => {
        cancelled = true;
      };
    }

    fetch(`/api/series/${encodeURIComponent(seriesId)}`, { credentials: "include" })
      .then(async (response) => {
        const payload = (await response.json()) as ArtworkSeriesDetailResponse | { message?: string };
        if (!response.ok || !("series" in payload)) {
          throw new Error(
            ("message" in payload ? payload.message : undefined) ?? "Series could not be loaded."
          );
        }
        return payload;
      })
      .then((payload) => {
        if (!cancelled) {
          setDetail(payload);
          setForm({
            title: payload.series.title,
            description: payload.series.description,
            visibility: payload.series.visibility,
            coverArtworkId: payload.series.coverArtworkId
          });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Series could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, seriesId]);

  const handleLoadMore = async () => {
    if (!detail?.nextCursor) {
      return;
    }
    setLoadingMore(true);
    setMessage("");
    try {
      const params = new URLSearchParams({ cursor: detail.nextCursor });
      const response = await fetch(
        `/api/series/${encodeURIComponent(seriesId)}?${params.toString()}`,
        { credentials: "include" }
      );
      const payload = (await response.json()) as ArtworkSeriesDetailResponse | { message?: string };
      if (!response.ok || !("series" in payload)) {
        throw new Error(
          ("message" in payload ? payload.message : undefined) ?? "Series page could not be loaded."
        );
      }
      setDetail((current) =>
        current
          ? {
              ...payload,
              artworks: [...current.artworks, ...payload.artworks]
            }
          : payload
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Series page could not be loaded.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) {
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const payload = await onUpdate(seriesId, form);
      setDetail((current) =>
        current
          ? {
              ...current,
              series: payload.series
            }
          : current
      );
      setEditing(false);
      setMessage(payload.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update series.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleting || !detail || !window.confirm(`Delete "${detail.series.title}"?`)) {
      return;
    }
    setDeleting(true);
    setMessage("");
    try {
      const nextMessage = await onDelete(seriesId);
      setMessage(nextMessage);
      onDeleted();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete series.");
    } finally {
      setDeleting(false);
    }
  };

  const series = detail?.series;
  const owner = detail?.owner;
  const novelContext = context === "novels";

  return (
    <section className={classNames("content-main collection-page series-page", novelContext && "novel-dedicated-page novel-serials-page")}>
      {loading ? <p className="empty-feed">{novelContext ? "Loading serial." : "Loading series."}</p> : null}
      {message ? <p className="empty-feed">{message}</p> : null}
      {!loading && !detail && !currentUser ? (
        <button className="primary-button" type="button" onClick={onAuthRequired}>
          <LogIn size={17} />
          Sign in
        </button>
      ) : null}
      {detail && series && owner ? (
        <>
          <div className="collection-detail-hero series-detail-hero">
            <button className="secondary-button" type="button" onClick={onBack}>
              <ChevronDown size={17} />
              {novelContext ? "Serials" : "Series"}
            </button>
            <div>
              <p className="eyebrow">{novelContext ? "Serial" : "Artwork series"}</p>
              <h1>{series.title}</h1>
              <p>{series.description || "No description."}</p>
              <div className="profile-meta">
                <button className="text-button" type="button" onClick={() => onOpenProfile(owner.handle)}>
                  @{owner.handle}
                </button>
                <span>{formatCount(detail.totalCount)} visible {novelContext ? "entries" : "works"}</span>
                <span>{series.visibility}</span>
                <span>Updated {fullDateFormat.format(new Date(series.updatedAt))}</span>
              </div>
            </div>
            {detail.canManage ? (
              <div className="collection-detail-actions">
                <button className="secondary-button" type="button" onClick={() => setEditing((value) => !value)}>
                  <Pencil size={16} />
                  Edit
                </button>
                <button className="danger-button" type="button" onClick={handleDelete} disabled={deleting}>
                  <Trash2 size={16} />
                  {deleting ? "Deleting" : "Delete"}
                </button>
              </div>
            ) : null}
          </div>

          <MatureAccessNotice
            matureAccess={detail.matureAccess}
            onLogin={onAuthRequired}
            onPrivacySecurity={onOpenPrivacySecurity}
          />

          {editing ? (
            <form className="settings-form collection-settings-form" onSubmit={handleSave}>
              <label>
                Title
                <input
                  value={form.title}
                  minLength={2}
                  maxLength={80}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  value={form.description}
                  maxLength={360}
                  rows={3}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                />
              </label>
              <label>
                Visibility
                <select
                  value={form.visibility}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      visibility: event.target.value as SeriesVisibility
                    }))
                  }
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </label>
              <div className="collection-cover-field">
                <div className="field-heading">
                  <strong>{novelContext ? "Cover work" : "Cover artwork"}</strong>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, coverArtworkId: null }))}
                    disabled={!form.coverArtworkId}
                  >
                    Clear
                  </button>
                </div>
                <div className="collection-cover-picker">
                  {detail.artworks.map((artwork) => (
                    <button
                      className={classNames(
                        "collection-cover-option",
                        form.coverArtworkId === artwork.id && "is-selected"
                      )}
                      key={artwork.id}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({ ...current, coverArtworkId: artwork.id }))
                      }
                    >
                      <img
                        src={artwork.thumbnailUrl}
                        alt=""
                        style={{ backgroundColor: artwork.dominantColor }}
                        loading="lazy"
                        decoding="async"
                      />
                      <span>{artwork.title}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="settings-actions">
                <button className="primary-button" type="submit" disabled={saving}>
                  <Pencil size={17} />
                  {saving ? "Saving" : novelContext ? "Save serial" : "Save series"}
                </button>
                <button className="secondary-button" type="button" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          <div className="art-grid collection-art-grid">
            {detail.artworks.map((artwork, index) => (
              <ArtworkCard
                artwork={artwork}
                index={index}
                key={artwork.id}
                onBookmark={onBookmark}
                onOpenProfile={onOpenProfile}
                onSelect={onOpenArtwork}
              />
            ))}
          </div>
          {detail.nextCursor ? (
            <div className="load-more-row">
              <button
                className="secondary-button"
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading" : "Load more"}
                <span>
                  {formatCount(detail.artworks.length)} / {formatCount(detail.totalCount)}
                </span>
              </button>
            </div>
          ) : null}
          {detail.artworks.length === 0 ? (
            <p className="empty-feed">{novelContext ? "No visible entries in this serial." : "No visible works in this series."}</p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

type ProfileTab = "works" | "public" | "private" | "collections" | "series";
type NovelProfileTab = "novels" | "public" | "private" | "readingLists" | "series";

function ProfilePage({
  context,
  ...props
}: ProfilePageProps) {
  if (context === "novels") {
    return <NovelProfilePage {...props} />;
  }
  return <IllustrationProfilePage context={context} {...props} />;
}

function IllustrationProfilePage({
  context,
  username,
  csrfToken,
  siteKey,
  currentUser,
  onAuthRequired,
  onBookmark,
  onOpenCollection,
  onOpenProfile,
  onOpenPrivacySecurity,
  onOpenProfileSettings,
  onOpenSeries,
  onSelectArtwork
}: ProfilePageProps) {
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<ProfileTab>("works");
  const [followingBusy, setFollowingBusy] = useState(false);
  const [blockingBusy, setBlockingBusy] = useState(false);
  const [profilePageLoading, setProfilePageLoading] = useState(false);
  const [profileRevision, setProfileRevision] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportTurnstileToken, setReportTurnstileToken] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [followListMode, setFollowListMode] = useState<FollowListMode | null>(null);
  const [followListData, setFollowListData] = useState<ProfileFollowListResponse | null>(null);
  const [followListLoading, setFollowListLoading] = useState(false);
  const [followListLoadingMore, setFollowListLoadingMore] = useState(false);
  const [followListMessage, setFollowListMessage] = useState("");
  const [followListBusyUser, setFollowListBusyUser] = useState("");
  const [copiedUsername, setCopiedUsername] = useState(false);
  const copiedUsernameTimer = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessage("");
    setProfileData(null);
    setActiveTab("works");
    setFollowListMode(null);
    setFollowListData(null);
    setFollowListMessage("");
    if (copiedUsernameTimer.current !== null) {
      window.clearTimeout(copiedUsernameTimer.current);
      copiedUsernameTimer.current = null;
    }
    setCopiedUsername(false);

    if (!username) {
      setLoading(false);
      setMessage("User not found.");
      return () => {
        cancelled = true;
      };
    }

    fetch(`/api/users/${encodeURIComponent(username)}/profile`, { credentials: "include" })
      .then(async (response) => {
        const payload = (await response.json()) as UserProfileResponse | { message?: string };
        if (!response.ok || !("profile" in payload)) {
          throw new Error(
            ("message" in payload ? payload.message : undefined) ?? "Profile could not be loaded."
          );
        }
        return payload;
      })
      .then((payload) => {
        if (!cancelled) {
          setProfileData(payload);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Profile could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, profileRevision, username]);

  useEffect(
    () => () => {
      if (copiedUsernameTimer.current !== null) {
        window.clearTimeout(copiedUsernameTimer.current);
      }
    },
    []
  );

  useEffect(() => {
    if (!followListMode || !username) {
      setFollowListData(null);
      return;
    }

    let cancelled = false;
    setFollowListLoading(true);
    setFollowListMessage("");
    setFollowListData(null);

    const params = new URLSearchParams({
      mode: followListMode,
      limit: "24"
    });
    fetch(`/api/users/${encodeURIComponent(username)}/follows?${params.toString()}`, {
      credentials: "include"
    })
      .then(async (response) => {
        const payload = (await response.json()) as ProfileFollowListResponse | { message?: string };
        if (!response.ok || !("users" in payload)) {
          throw new Error(
            ("message" in payload ? payload.message : undefined) ?? "Follow list could not be loaded."
          );
        }
        return payload;
      })
      .then((payload) => {
        if (!cancelled) {
          setFollowListData(payload);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setFollowListMessage(
            error instanceof Error ? error.message : "Follow list could not be loaded."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setFollowListLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, followListMode, username]);

  const profile = profileData?.profile;
  const ownProfile = Boolean(profile?.ownProfile);
  const profileVisibilityMeta = profile
    ? profile.profileVisibility === "members"
      ? { label: "Members only", icon: UserRound, tone: "members" }
      : profile.profileVisibility === "private"
        ? { label: "Private", icon: Lock, tone: "private" }
        : { label: "Public", icon: Eye, tone: "public" }
    : null;
  const ProfileVisibilityIcon = profileVisibilityMeta?.icon;
  const novelContext = context === "novels";
  const tabs: Array<{ id: ProfileTab; label: string; count: number; icon: typeof Images }> = profileData
    ? [
        {
          id: "works",
          label: novelContext ? "Novels" : "Works",
          count: profileData.stats.artworks,
          icon: novelContext ? NotebookText : Images
        },
        {
          id: "public",
          label: novelContext ? "Public reads" : "Public bookmarks",
          count: profileData.stats.publicBookmarks,
          icon: Bookmark
        },
        {
          id: "collections",
          label: novelContext ? "Shelves" : "Collections",
          count: profileData.stats.publicCollections,
          icon: FolderOpen
        },
        {
          id: "series",
          label: novelContext ? "Serials" : "Series",
          count: profileData.stats.publicSeries,
          icon: ListOrdered
        },
        ...(ownProfile
          ? [
              {
                id: "private" as const,
                label: novelContext ? "Private reads" : "Private bookmarks",
                count: profileData.stats.privateBookmarks,
                icon: Lock
              }
            ]
          : [])
      ]
    : [];
  const visibleArtworks =
    activeTab === "public"
      ? profileData?.publicBookmarks ?? []
      : activeTab === "private"
        ? profileData?.privateBookmarks ?? []
        : profileData?.artworks ?? [];
  const visibleCollections = activeTab === "collections" ? profileData?.publicCollections ?? [] : [];
  const visibleSeries = activeTab === "series" ? profileData?.publicSeries ?? [] : [];
  const activeSection =
    activeTab === "public"
      ? "publicBookmarks"
      : activeTab === "private"
        ? "privateBookmarks"
        : activeTab === "collections"
          ? "publicCollections"
          : activeTab === "series"
            ? "publicSeries"
          : "artworks";
  const activeNextCursor = profileData?.nextCursors[activeSection] ?? null;

  const openFollowList = (mode: FollowListMode) => {
    if (profile?.blocked) {
      return;
    }
    setFollowListMessage("");
    setFollowListMode((current) => (current === mode ? null : mode));
  };

  const handleCopyUsername = async () => {
    if (!profile) {
      return;
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(profile.username);
      } else {
        const input = document.createElement("textarea");
        input.value = profile.username;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      if (copiedUsernameTimer.current !== null) {
        window.clearTimeout(copiedUsernameTimer.current);
      }
      setCopiedUsername(true);
      copiedUsernameTimer.current = window.setTimeout(() => {
        setCopiedUsername(false);
        copiedUsernameTimer.current = null;
      }, 1600);
    } catch {
      setMessage("Username could not be copied.");
    }
  };

  const handleLoadMoreFollowList = async () => {
    if (!followListMode || !followListData?.nextCursor) {
      return;
    }
    setFollowListLoadingMore(true);
    setFollowListMessage("");
    const params = new URLSearchParams({
      mode: followListMode,
      cursor: followListData.nextCursor,
      limit: "24"
    });
    try {
      const response = await fetch(
        `/api/users/${encodeURIComponent(username)}/follows?${params.toString()}`,
        { credentials: "include" }
      );
      const payload = (await response.json()) as ProfileFollowListResponse | { message?: string };
      if (!response.ok || !("users" in payload)) {
        throw new Error(
          ("message" in payload ? payload.message : undefined) ?? "Follow list could not be loaded."
        );
      }
      setFollowListData((current) =>
        current
          ? {
              ...payload,
              users: [...current.users, ...payload.users]
            }
          : payload
      );
    } catch (error) {
      setFollowListMessage(
        error instanceof Error ? error.message : "Follow list could not be loaded."
      );
    } finally {
      setFollowListLoadingMore(false);
    }
  };

  const handleFollowListToggle = async (creator: Creator) => {
    if (!currentUser) {
      onAuthRequired();
      return;
    }
    const ownCreator =
      currentUser.username.toLowerCase() === creator.handle.toLowerCase();
    if (ownCreator) {
      onOpenProfile(creator.handle);
      return;
    }
    setFollowListBusyUser(creator.handle);
    setFollowListMessage("");
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(creator.handle)}/follow`, {
        method: "POST",
        credentials: "include",
        headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
      });
      const payload = (await response.json()) as FollowResponse | { message?: string };
      if (!response.ok || !("following" in payload)) {
        throw new Error(payload.message ?? "Follow action failed.");
      }
      setFollowListData((current) =>
        current
          ? {
              ...current,
              users:
                current.profile.ownProfile &&
                current.mode === "following" &&
                !payload.following
                  ? current.users.filter((item) => item.creator.id !== creator.id)
                  : current.users.map((item) =>
                      item.creator.id === creator.id
                        ? {
                            ...item,
                            creator: {
                              ...item.creator,
                              following: payload.following,
                              followerCount: payload.followerCount
                            }
                          }
                        : item
                    ),
              totalCount:
                current.profile.ownProfile &&
                current.mode === "following" &&
                !payload.following
                  ? Math.max(current.totalCount - 1, 0)
                  : current.totalCount
            }
          : current
      );
      if (profile?.id === creator.id) {
        setProfileData((current) =>
          current
            ? {
                ...current,
                profile: {
                  ...current.profile,
                  following: payload.following,
                  followerCount: payload.followerCount
                }
              }
            : current
        );
      }
      if (ownProfile && followListMode === "following" && !payload.following) {
        setProfileData((current) =>
          current
            ? {
                ...current,
                stats: {
                  ...current.stats,
                  following: Math.max(current.stats.following - 1, 0)
                }
              }
            : current
        );
      }
      setFollowListMessage(payload.message);
    } catch (error) {
      setFollowListMessage(error instanceof Error ? error.message : "Follow action failed.");
    } finally {
      setFollowListBusyUser("");
    }
  };

  const handleLoadMoreProfile = async () => {
    if (!profileData || !activeNextCursor) {
      return;
    }
    setProfilePageLoading(true);
    setMessage("");
    const params = new URLSearchParams({
      section: activeSection,
      cursor: activeNextCursor
    });
    try {
      const response = await fetch(
        `/api/users/${encodeURIComponent(username)}/profile?${params.toString()}`,
        { credentials: "include" }
      );
      const payload = (await response.json()) as UserProfileResponse | { message?: string };
      if (!response.ok || !("profile" in payload)) {
        throw new Error(
          ("message" in payload ? payload.message : undefined) ?? "Profile page could not be loaded."
        );
      }
      setProfileData((current) => {
        if (!current) {
          return payload;
        }
        return {
          ...current,
          profile: payload.profile,
          matureAccess: payload.matureAccess,
          stats: payload.stats,
          artworks:
            activeSection === "artworks"
              ? [...current.artworks, ...payload.artworks]
              : current.artworks,
          publicBookmarks:
            activeSection === "publicBookmarks"
              ? [...current.publicBookmarks, ...payload.publicBookmarks]
              : current.publicBookmarks,
          privateBookmarks:
            activeSection === "privateBookmarks"
              ? [...current.privateBookmarks, ...payload.privateBookmarks]
              : current.privateBookmarks,
          publicCollections:
            activeSection === "publicCollections"
              ? [...current.publicCollections, ...payload.publicCollections]
              : current.publicCollections,
          publicSeries:
            activeSection === "publicSeries"
              ? [...current.publicSeries, ...payload.publicSeries]
              : current.publicSeries,
          nextCursors: {
            ...current.nextCursors,
            [activeSection]: payload.nextCursors[activeSection]
          }
        };
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profile page could not be loaded.");
    } finally {
      setProfilePageLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      onAuthRequired();
      return;
    }
    if (!profile) {
      return;
    }
    setFollowingBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(profile.username)}/follow`, {
        method: "POST",
        credentials: "include",
        headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
      });
      const payload = (await response.json()) as FollowResponse | { message?: string };
      if (!response.ok || !("following" in payload)) {
        throw new Error(payload.message ?? "Follow action failed.");
      }
      setProfileData((current) =>
        current
          ? {
              ...current,
              profile: {
                ...current.profile,
                following: payload.following,
                followerCount: payload.followerCount
              }
            }
          : current
      );
      setMessage(payload.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Follow action failed.");
    } finally {
      setFollowingBusy(false);
    }
  };

  const handleBlock = async () => {
    if (!currentUser) {
      onAuthRequired();
      return;
    }
    if (!profile) {
      return;
    }
    setBlockingBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(profile.username)}/block`, {
        method: "POST",
        credentials: "include",
        headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
      });
      const payload = (await response.json()) as BlockResponse | { message?: string };
      if (!response.ok || !("blocked" in payload)) {
        throw new Error(payload.message ?? "Block action failed.");
      }
      setProfileData((current) =>
        current
          ? {
              ...current,
              profile: {
                ...current.profile,
                blocked: payload.blocked,
                following: payload.following,
                followerCount: payload.followerCount
              },
              artworks: payload.blocked ? [] : current.artworks,
              publicBookmarks: payload.blocked ? [] : current.publicBookmarks,
              privateBookmarks: payload.blocked ? [] : current.privateBookmarks,
              publicCollections: payload.blocked ? [] : current.publicCollections,
              publicSeries: payload.blocked ? [] : current.publicSeries,
              nextCursors: payload.blocked
                ? {
                    artworks: null,
                    publicBookmarks: null,
                    privateBookmarks: null,
                    publicCollections: null,
                    publicSeries: null
                  }
                : current.nextCursors
            }
          : current
      );
      if (!payload.blocked) {
        setProfileRevision((revision) => revision + 1);
      }
      setMessage(payload.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Block action failed.");
    } finally {
      setBlockingBusy(false);
    }
  };

  const handleProfileReport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) {
      onAuthRequired();
      return;
    }
    if (!profile) {
      return;
    }
    setMessage("");
    if (!reportTurnstileToken) {
      setMessage("Complete the check first.");
      return;
    }
    setReportSubmitting(true);
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(profile.username)}/report`, {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
        },
        body: JSON.stringify({
          reason: reportReason,
          details: reportDetails,
          turnstileToken: reportTurnstileToken
        })
      });
      const payload = (await response.json()) as ReportResponse | { message?: string };
      if (!response.ok || !("report" in payload)) {
        throw new Error(payload.message ?? "Profile report failed.");
      }
      setReportOpen(false);
      setReportReason("spam");
      setReportDetails("");
      setReportTurnstileToken("");
      setMessage(payload.message);
      window.turnstile?.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profile report failed.");
      setReportTurnstileToken("");
      window.turnstile?.reset();
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <section className={classNames("content-main profile-page", novelContext && "novel-dedicated-page novel-profile-page")}>
      {loading ? <p className="empty-feed">Loading profile.</p> : null}
      {message ? <p className="empty-feed">{message}</p> : null}
      {profile && profileData ? (
        <>
          <div className="profile-hero">
            {profile.avatarUrl ? (
              <img className="profile-avatar" src={profile.avatarUrl} alt="" />
            ) : (
              <DefaultAvatar className="profile-avatar profile-avatar-fallback" name={profile.displayName} />
            )}
            <div className="profile-copy">
              <p className="eyebrow">{novelContext ? "Novel profile" : "Creator profile"}</p>
              <h1>{profile.displayName}</h1>
              <button
                className={classNames("profile-handle", copiedUsername && "is-copied")}
                type="button"
                title={copiedUsername ? "Username copied" : "Copy username"}
                aria-label={`Copy username ${profile.username}`}
                onClick={() => void handleCopyUsername()}
              >
                <span className="profile-handle-main">
                  <AtSign size={14} />
                  <span>{profile.username}</span>
                </span>
                <span className="profile-handle-action" aria-hidden="true">
                  {copiedUsername ? <Check size={14} /> : <Copy size={14} />}
                </span>
              </button>
              {profile.websiteUrl || (ownProfile && profileVisibilityMeta && ProfileVisibilityIcon) ? (
                <div className="profile-links">
                  {profile.websiteUrl ? (
                    <a
                      className="profile-website"
                      href={profile.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink size={14} />
                      <span>Website</span>
                    </a>
                  ) : null}
                  {ownProfile && profileVisibilityMeta && ProfileVisibilityIcon ? (
                    <span className={`profile-visibility-badge is-${profileVisibilityMeta.tone}`}>
                      <ProfileVisibilityIcon size={14} />
                      <span>{profileVisibilityMeta.label}</span>
                    </span>
                  ) : null}
                </div>
              ) : null}
              {profile.bio ? <p>{profile.bio}</p> : null}
              <div className="profile-meta">
                <button
                  className={classNames(followListMode === "followers" && "is-active")}
                  type="button"
                  onClick={() => openFollowList("followers")}
                >
                  {formatCount(profile.followerCount)} followers
                </button>
                <button
                  className={classNames(followListMode === "following" && "is-active")}
                  type="button"
                  onClick={() => openFollowList("following")}
                >
                  {formatCount(profileData.stats.following)} following
                </button>
                <span>{formatCount(profileData.stats.totalLikes)} likes</span>
                <span>{formatCount(profileData.stats.totalViews)} {novelContext ? "reads" : "views"}</span>
                {ownProfile && currentUser ? (
                  <>
                    <span>{formatCount(currentUser.storage.siteCredits)} credits</span>
                    <span>{formatCount(currentUser.storage.remainingImages)} {novelContext ? "media slots" : "image slots"}</span>
                  </>
                ) : null}
                <span>Joined {fullDateFormat.format(new Date(profile.joinedAt))}</span>
              </div>
            </div>
            {ownProfile ? (
              <div className="profile-actions">
                <button className="secondary-button" type="button" onClick={onOpenProfileSettings}>
                  <UserCog size={16} />
                  Edit profile
                </button>
                <button className="secondary-button" type="button" onClick={onOpenPrivacySecurity}>
                  <KeyRound size={16} />
                  Privacy
                </button>
              </div>
            ) : currentUser ? (
              <div className="profile-actions">
                {!profile.blocked ? (
                  <button
                    className={classNames("secondary-button profile-follow-button", profile.following && "is-active")}
                    type="button"
                    onClick={handleFollow}
                    disabled={followingBusy}
                  >
                    <UserPlus size={16} />
                    {followingBusy ? "Saving" : profile.following ? "Following" : "Follow"}
                  </button>
                ) : null}
                <button className="danger-button profile-follow-button" type="button" onClick={handleBlock} disabled={blockingBusy}>
                  <Shield size={16} />
                  {blockingBusy ? "Saving" : profile.blocked ? "Unblock" : "Block"}
                </button>
                {!profile.blocked ? (
                  <button
                    className="secondary-button profile-follow-button"
                    type="button"
                    onClick={() => {
                      setReportOpen((value) => !value);
                      setMessage("");
                      setReportTurnstileToken("");
                    }}
                  >
                    <Flag size={16} />
                    Report
                  </button>
                ) : null}
              </div>
            ) : (
              <button className="secondary-button profile-follow-button" type="button" onClick={onAuthRequired}>
                <LogIn size={16} />
                Sign in
              </button>
            )}
          </div>

          {reportOpen && currentUser && !ownProfile ? (
            <form className="report-form profile-report-form" onSubmit={handleProfileReport}>
              <label>
                Reason
                <select
                  value={reportReason}
                  onChange={(event) => setReportReason(event.target.value as ReportReason)}
                >
                  {reportReasonOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Details
                <textarea
                  value={reportDetails}
                  maxLength={800}
                  rows={3}
                  onChange={(event) => setReportDetails(event.target.value)}
                  placeholder={`Optional context for @${profile.username}`}
                />
              </label>
              <TurnstileWidget
                siteKey={siteKey}
                action="report"
                onToken={setReportTurnstileToken}
                compact
              />
              <div className="settings-actions">
                <button className="danger-button" type="submit" disabled={reportSubmitting}>
                  <Flag size={15} />
                  {reportSubmitting ? "Submitting" : "Submit report"}
                </button>
                <button className="secondary-button" type="button" onClick={() => setReportOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          <MatureAccessNotice
            matureAccess={profileData.matureAccess}
            onLogin={onAuthRequired}
            onPrivacySecurity={onOpenPrivacySecurity}
          />

          {followListMode && !profile.blocked ? (
            <section className="profile-follow-panel">
              <div className="profile-follow-heading">
                <div>
                  <p className="eyebrow">
                    {followListMode === "followers" ? "Followers" : "Following"}
                  </p>
                  <h2>
                    {followListLoading
                      ? "Loading"
                      : `${formatCount(followListData?.totalCount ?? 0)} ${
                          followListMode === "followers" ? "followers" : "following"
                        }`}
                  </h2>
                </div>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => setFollowListMode(null)}
                >
                  Close
                </button>
              </div>
              {followListMessage ? <p className="auth-inline-message">{followListMessage}</p> : null}
              {followListLoading ? <p className="muted">Loading social list.</p> : null}
              <div className="profile-follow-grid">
                {(followListData?.users ?? []).map(({ creator, followedAt }) => {
                  const ownCreator =
                    currentUser?.username.toLowerCase() === creator.handle.toLowerCase();
                  return (
                    <article className="profile-follow-card" key={creator.id}>
                      <button
                        className="profile-follow-main"
                        type="button"
                        onClick={() => onOpenProfile(creator.handle)}
                      >
                        {creator.avatarUrl ? (
                          <img src={creator.avatarUrl} alt="" />
                        ) : (
                          <DefaultAvatar className="profile-follow-avatar-fallback" name={creator.displayName} />
                        )}
                        <span>
                          <strong>{creator.displayName}</strong>
                          <small>@{creator.handle}</small>
                          {creator.bio ? <em>{creator.bio}</em> : null}
                        </span>
                      </button>
                      <div className="profile-follow-meta">
                        <span>{formatCount(creator.followerCount)} followers</span>
                        <span>Since {dateFormat.format(new Date(followedAt))}</span>
                      </div>
                      <div className="profile-follow-actions">
                        <button
                          className="secondary-button"
                          type="button"
                          onClick={() => onOpenProfile(creator.handle)}
                        >
                          <UserRound size={15} />
                          Profile
                        </button>
                        <button
                          className={classNames("secondary-button", creator.following && "is-active")}
                          type="button"
                          onClick={() => void handleFollowListToggle(creator)}
                          disabled={followListBusyUser === creator.handle}
                        >
                          <UserPlus size={15} />
                          {ownCreator
                            ? "You"
                            : followListBusyUser === creator.handle
                              ? "Saving"
                              : creator.following
                                ? "Following"
                                : "Follow"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
              {!followListLoading && followListData?.users.length === 0 ? (
                <p className="empty-feed">No visible users in this list.</p>
              ) : null}
              {followListData?.nextCursor ? (
                <div className="load-more-row">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={handleLoadMoreFollowList}
                    disabled={followListLoadingMore}
                  >
                    {followListLoadingMore ? "Loading" : "Load more"}
                    <span>
                      {formatCount(followListData.users.length)} /{" "}
                      {formatCount(followListData.totalCount)}
                    </span>
                  </button>
                </div>
              ) : null}
            </section>
          ) : null}

          {profile.blocked ? (
            <p className="empty-feed">This user is blocked. Unblock them to view their works again.</p>
          ) : null}

          {!profile.blocked ? (
          <div className="profile-tabs" aria-label="Profile sections">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={classNames(activeTab === tab.id && "is-active")}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={16} />
                  {tab.label}
                  <span>{formatCount(tab.count)}</span>
                </button>
              );
            })}
          </div>
          ) : null}

          {!profile.blocked && activeTab === "collections" ? (
            <div className="collection-folder-grid profile-collection-grid">
              {visibleCollections.map((collection) => (
                <button
                  className="collection-folder-card"
                  key={collection.id}
                  type="button"
                  onClick={() => onOpenCollection(collection.id)}
                >
                  <CollectionFolderPreview collection={collection} />
                  <span>
                    <strong>{collection.name}</strong>
                    <small>
                      {formatCount(collection.itemCount)} {novelContext ? "reads" : "works"} · Updated{" "}
                      {dateFormat.format(new Date(collection.updatedAt))}
                    </small>
                  </span>
                  <Eye size={16} />
                </button>
              ))}
            </div>
          ) : null}

          {!profile.blocked && activeTab === "series" ? (
            <div className="collection-folder-grid profile-collection-grid">
              {visibleSeries.map((series) => (
                <button
                  className="collection-folder-card series-folder-card"
                  key={series.id}
                  type="button"
                  onClick={() => onOpenSeries(series.id)}
                >
                  <SeriesFolderPreview series={series} />
                  <span>
                    <strong>{series.title}</strong>
                    <small>
                      {formatCount(series.itemCount)} {novelContext ? "entries" : "works"} · Updated{" "}
                      {dateFormat.format(new Date(series.updatedAt))}
                    </small>
                  </span>
                  <Eye size={16} />
                </button>
              ))}
            </div>
          ) : null}

          {!profile.blocked && activeTab !== "collections" && activeTab !== "series" ? (
            <div className="art-grid profile-art-grid">
              {visibleArtworks.map((artwork, index) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  index={index}
                  onBookmark={onBookmark}
                  onOpenProfile={onOpenProfile}
                  onSelect={onSelectArtwork}
                />
              ))}
            </div>
          ) : null}
          {!profile.blocked &&
          (activeTab === "collections"
            ? visibleCollections.length === 0
            : activeTab === "series"
              ? visibleSeries.length === 0
              : visibleArtworks.length === 0) ? (
            <p className="empty-feed">
              {activeTab === "collections"
                ? novelContext
                  ? "No public shelves yet."
                  : "No public collections yet."
                : activeTab === "series"
                  ? novelContext
                    ? "No public serials yet."
                    : "No public series yet."
                : novelContext
                  ? "No readable works in this section."
                  : "No works in this section."}
            </p>
          ) : null}
          {!profile.blocked && activeNextCursor ? (
            <div className="load-more-row profile-load-more-row">
              <button
                className="secondary-button"
                type="button"
                onClick={handleLoadMoreProfile}
                disabled={profilePageLoading}
              >
                {profilePageLoading ? "Loading" : "Load more"}
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

function NovelProfilePage({
  username,
  csrfToken,
  siteKey,
  currentUser,
  onAuthRequired,
  onOpenCollection,
  onOpenNovel,
  onOpenProfile,
  onOpenPrivacySecurity,
  onOpenProfileSettings,
  onOpenSeries
}: Omit<ProfilePageProps, "context" | "onBookmark" | "onSelectArtwork">) {
  const [profileData, setProfileData] = useState<NovelProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<NovelProfileTab>("novels");
  const [followingBusy, setFollowingBusy] = useState(false);
  const [blockingBusy, setBlockingBusy] = useState(false);
  const [profilePageLoading, setProfilePageLoading] = useState(false);
  const [profileRevision, setProfileRevision] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportTurnstileToken, setReportTurnstileToken] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [followListMode, setFollowListMode] = useState<FollowListMode | null>(null);
  const [followListData, setFollowListData] = useState<ProfileFollowListResponse | null>(null);
  const [followListLoading, setFollowListLoading] = useState(false);
  const [followListLoadingMore, setFollowListLoadingMore] = useState(false);
  const [followListMessage, setFollowListMessage] = useState("");
  const [followListBusyUser, setFollowListBusyUser] = useState("");
  const [copiedUsername, setCopiedUsername] = useState(false);
  const copiedUsernameTimer = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessage("");
    setProfileData(null);
    setActiveTab("novels");
    setFollowListMode(null);
    setFollowListData(null);
    setFollowListMessage("");
    if (copiedUsernameTimer.current !== null) {
      window.clearTimeout(copiedUsernameTimer.current);
      copiedUsernameTimer.current = null;
    }
    setCopiedUsername(false);

    if (!username) {
      setLoading(false);
      setMessage("User not found.");
      return () => {
        cancelled = true;
      };
    }

    fetch(`/api/users/${encodeURIComponent(username)}/novel-profile`, { credentials: "include" })
      .then(async (response) => {
        const payload = (await response.json()) as NovelProfileResponse | { message?: string };
        if (!response.ok || !("profile" in payload)) {
          throw new Error(
            ("message" in payload ? payload.message : undefined) ?? "Novel profile could not be loaded."
          );
        }
        return payload;
      })
      .then((payload) => {
        if (!cancelled) {
          setProfileData(payload);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Novel profile could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, profileRevision, username]);

  useEffect(
    () => () => {
      if (copiedUsernameTimer.current !== null) {
        window.clearTimeout(copiedUsernameTimer.current);
      }
    },
    []
  );

  useEffect(() => {
    if (!followListMode || !username) {
      setFollowListData(null);
      return;
    }

    let cancelled = false;
    setFollowListLoading(true);
    setFollowListMessage("");
    setFollowListData(null);
    const params = new URLSearchParams({ mode: followListMode, limit: "24" });
    fetch(`/api/users/${encodeURIComponent(username)}/follows?${params.toString()}`, {
      credentials: "include"
    })
      .then(async (response) => {
        const payload = (await response.json()) as ProfileFollowListResponse | { message?: string };
        if (!response.ok || !("users" in payload)) {
          throw new Error(
            ("message" in payload ? payload.message : undefined) ?? "Follow list could not be loaded."
          );
        }
        return payload;
      })
      .then((payload) => {
        if (!cancelled) {
          setFollowListData(payload);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setFollowListMessage(
            error instanceof Error ? error.message : "Follow list could not be loaded."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setFollowListLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, followListMode, username]);

  const profile = profileData?.profile;
  const ownProfile = Boolean(profile?.ownProfile);
  const profileVisibilityMeta = profile
    ? profile.profileVisibility === "members"
      ? { label: "Members only", icon: UserRound, tone: "members" }
      : profile.profileVisibility === "private"
        ? { label: "Private", icon: Lock, tone: "private" }
        : { label: "Public", icon: Eye, tone: "public" }
    : null;
  const ProfileVisibilityIcon = profileVisibilityMeta?.icon;
  const tabs: Array<{ id: NovelProfileTab; label: string; count: number; icon: typeof NotebookText }> = profileData
    ? [
        { id: "novels", label: "Novels", count: profileData.stats.novels, icon: NotebookText },
        { id: "public", label: "Public reads", count: profileData.stats.publicBookmarks, icon: Bookmark },
        { id: "readingLists", label: "Shelves", count: profileData.stats.publicReadingLists, icon: FolderOpen },
        { id: "series", label: "Serials", count: profileData.stats.publicSeries, icon: ListOrdered },
        ...(ownProfile
          ? [
              {
                id: "private" as const,
                label: "Private reads",
                count: profileData.stats.privateBookmarks,
                icon: Lock
              }
            ]
          : [])
      ]
    : [];
  const visibleNovels =
    activeTab === "public"
      ? profileData?.publicBookmarks ?? []
      : activeTab === "private"
        ? profileData?.privateBookmarks ?? []
        : profileData?.novels ?? [];
  const visibleReadingLists = activeTab === "readingLists" ? profileData?.publicReadingLists ?? [] : [];
  const visibleSeries = activeTab === "series" ? profileData?.publicSeries ?? [] : [];
  const activeSection: NovelProfileSection =
    activeTab === "public"
      ? "publicBookmarks"
      : activeTab === "private"
        ? "privateBookmarks"
        : activeTab === "readingLists"
          ? "publicReadingLists"
          : activeTab === "series"
            ? "publicSeries"
            : "novels";
  const activeNextCursor = profileData?.nextCursors[activeSection] ?? null;

  const handleCopyUsername = async () => {
    if (!profile) {
      return;
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(profile.username);
      } else {
        const input = document.createElement("textarea");
        input.value = profile.username;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      if (copiedUsernameTimer.current !== null) {
        window.clearTimeout(copiedUsernameTimer.current);
      }
      setCopiedUsername(true);
      copiedUsernameTimer.current = window.setTimeout(() => {
        setCopiedUsername(false);
        copiedUsernameTimer.current = null;
      }, 1600);
    } catch {
      setMessage("Username could not be copied.");
    }
  };

  const handleLoadMoreFollowList = async () => {
    if (!followListMode || !followListData?.nextCursor) {
      return;
    }
    setFollowListLoadingMore(true);
    setFollowListMessage("");
    const params = new URLSearchParams({
      mode: followListMode,
      cursor: followListData.nextCursor,
      limit: "24"
    });
    try {
      const response = await fetch(
        `/api/users/${encodeURIComponent(username)}/follows?${params.toString()}`,
        { credentials: "include" }
      );
      const payload = (await response.json()) as ProfileFollowListResponse | { message?: string };
      if (!response.ok || !("users" in payload)) {
        throw new Error(
          ("message" in payload ? payload.message : undefined) ?? "Follow list could not be loaded."
        );
      }
      setFollowListData((current) =>
        current
          ? {
              ...payload,
              users: [...current.users, ...payload.users]
            }
          : payload
      );
    } catch (error) {
      setFollowListMessage(
        error instanceof Error ? error.message : "Follow list could not be loaded."
      );
    } finally {
      setFollowListLoadingMore(false);
    }
  };

  const handleFollowListToggle = async (creator: Creator) => {
    if (!currentUser) {
      onAuthRequired();
      return;
    }
    const ownCreator = currentUser.username.toLowerCase() === creator.handle.toLowerCase();
    if (ownCreator) {
      onOpenProfile(creator.handle);
      return;
    }
    setFollowListBusyUser(creator.handle);
    setFollowListMessage("");
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(creator.handle)}/follow`, {
        method: "POST",
        credentials: "include",
        headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
      });
      const payload = (await response.json()) as FollowResponse | { message?: string };
      if (!response.ok || !("following" in payload)) {
        throw new Error(payload.message ?? "Follow action failed.");
      }
      setFollowListData((current) =>
        current
          ? {
              ...current,
              users:
                current.profile.ownProfile && current.mode === "following" && !payload.following
                  ? current.users.filter((item) => item.creator.id !== creator.id)
                  : current.users.map((item) =>
                      item.creator.id === creator.id
                        ? {
                            ...item,
                            creator: {
                              ...item.creator,
                              following: payload.following,
                              followerCount: payload.followerCount
                            }
                          }
                        : item
                    ),
              totalCount:
                current.profile.ownProfile && current.mode === "following" && !payload.following
                  ? Math.max(current.totalCount - 1, 0)
                  : current.totalCount
            }
          : current
      );
      setFollowListMessage(payload.message);
    } catch (error) {
      setFollowListMessage(error instanceof Error ? error.message : "Follow action failed.");
    } finally {
      setFollowListBusyUser("");
    }
  };

  const handleLoadMoreProfile = async () => {
    if (!profileData || !activeNextCursor) {
      return;
    }
    setProfilePageLoading(true);
    setMessage("");
    const params = new URLSearchParams({
      section: activeSection,
      cursor: activeNextCursor
    });
    try {
      const response = await fetch(
        `/api/users/${encodeURIComponent(username)}/novel-profile?${params.toString()}`,
        { credentials: "include" }
      );
      const payload = (await response.json()) as NovelProfileResponse | { message?: string };
      if (!response.ok || !("profile" in payload)) {
        throw new Error(
          ("message" in payload ? payload.message : undefined) ?? "Novel profile page could not be loaded."
        );
      }
      setProfileData((current) => {
        if (!current) {
          return payload;
        }
        return {
          ...current,
          profile: payload.profile,
          matureAccess: payload.matureAccess,
          stats: payload.stats,
          novels: activeSection === "novels" ? [...current.novels, ...payload.novels] : current.novels,
          publicBookmarks:
            activeSection === "publicBookmarks"
              ? [...current.publicBookmarks, ...payload.publicBookmarks]
              : current.publicBookmarks,
          privateBookmarks:
            activeSection === "privateBookmarks"
              ? [...current.privateBookmarks, ...payload.privateBookmarks]
              : current.privateBookmarks,
          publicReadingLists:
            activeSection === "publicReadingLists"
              ? [...current.publicReadingLists, ...payload.publicReadingLists]
              : current.publicReadingLists,
          publicSeries:
            activeSection === "publicSeries"
              ? [...current.publicSeries, ...payload.publicSeries]
              : current.publicSeries,
          nextCursors: {
            ...current.nextCursors,
            [activeSection]: payload.nextCursors[activeSection]
          }
        };
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Novel profile page could not be loaded.");
    } finally {
      setProfilePageLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      onAuthRequired();
      return;
    }
    if (!profile) {
      return;
    }
    setFollowingBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(profile.username)}/follow`, {
        method: "POST",
        credentials: "include",
        headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
      });
      const payload = (await response.json()) as FollowResponse | { message?: string };
      if (!response.ok || !("following" in payload)) {
        throw new Error(payload.message ?? "Follow action failed.");
      }
      setProfileData((current) =>
        current
          ? {
              ...current,
              profile: {
                ...current.profile,
                following: payload.following,
                followerCount: payload.followerCount
              }
            }
          : current
      );
      setMessage(payload.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Follow action failed.");
    } finally {
      setFollowingBusy(false);
    }
  };

  const handleBlock = async () => {
    if (!currentUser) {
      onAuthRequired();
      return;
    }
    if (!profile) {
      return;
    }
    setBlockingBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(profile.username)}/block`, {
        method: "POST",
        credentials: "include",
        headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined
      });
      const payload = (await response.json()) as BlockResponse | { message?: string };
      if (!response.ok || !("blocked" in payload)) {
        throw new Error(payload.message ?? "Block action failed.");
      }
      setProfileData((current) =>
        current
          ? {
              ...current,
              profile: {
                ...current.profile,
                blocked: payload.blocked,
                following: payload.following,
                followerCount: payload.followerCount
              },
              novels: payload.blocked ? [] : current.novels,
              publicBookmarks: payload.blocked ? [] : current.publicBookmarks,
              privateBookmarks: payload.blocked ? [] : current.privateBookmarks,
              publicReadingLists: payload.blocked ? [] : current.publicReadingLists,
              publicSeries: payload.blocked ? [] : current.publicSeries,
              nextCursors: payload.blocked
                ? {
                    novels: null,
                    publicBookmarks: null,
                    privateBookmarks: null,
                    publicReadingLists: null,
                    publicSeries: null
                  }
                : current.nextCursors
            }
          : current
      );
      if (!payload.blocked) {
        setProfileRevision((revision) => revision + 1);
      }
      setMessage(payload.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Block action failed.");
    } finally {
      setBlockingBusy(false);
    }
  };

  const handleProfileReport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) {
      onAuthRequired();
      return;
    }
    if (!profile) {
      return;
    }
    setMessage("");
    if (!reportTurnstileToken) {
      setMessage("Complete the check first.");
      return;
    }
    setReportSubmitting(true);
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(profile.username)}/report`, {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
        },
        body: JSON.stringify({
          reason: reportReason,
          details: reportDetails,
          turnstileToken: reportTurnstileToken
        })
      });
      const payload = (await response.json()) as ReportResponse | { message?: string };
      if (!response.ok || !("report" in payload)) {
        throw new Error(payload.message ?? "Profile report failed.");
      }
      setReportOpen(false);
      setReportReason("spam");
      setReportDetails("");
      setReportTurnstileToken("");
      setMessage(payload.message);
      window.turnstile?.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profile report failed.");
      setReportTurnstileToken("");
      window.turnstile?.reset();
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <section className="content-main profile-page novel-dedicated-page novel-profile-page">
      {loading ? <p className="empty-feed">Loading novel profile.</p> : null}
      {message ? <p className="empty-feed">{message}</p> : null}
      {profile && profileData ? (
        <>
          <div className="profile-hero">
            {profile.avatarUrl ? (
              <img className="profile-avatar" src={profile.avatarUrl} alt="" />
            ) : (
              <DefaultAvatar className="profile-avatar profile-avatar-fallback" name={profile.displayName} />
            )}
            <div className="profile-copy">
              <p className="eyebrow">Novel profile</p>
              <h1>{profile.displayName}</h1>
              <button
                className={classNames("profile-handle", copiedUsername && "is-copied")}
                type="button"
                title={copiedUsername ? "Username copied" : "Copy username"}
                aria-label={`Copy username ${profile.username}`}
                onClick={() => void handleCopyUsername()}
              >
                <span className="profile-handle-main">
                  <AtSign size={14} />
                  <span>{profile.username}</span>
                </span>
                <span className="profile-handle-action" aria-hidden="true">
                  {copiedUsername ? <Check size={14} /> : <Copy size={14} />}
                </span>
              </button>
              {profile.websiteUrl || (ownProfile && profileVisibilityMeta && ProfileVisibilityIcon) ? (
                <div className="profile-links">
                  {profile.websiteUrl ? (
                    <a className="profile-website" href={profile.websiteUrl} target="_blank" rel="noreferrer">
                      <ExternalLink size={14} />
                      <span>Website</span>
                    </a>
                  ) : null}
                  {ownProfile && profileVisibilityMeta && ProfileVisibilityIcon ? (
                    <span className={`profile-visibility-badge is-${profileVisibilityMeta.tone}`}>
                      <ProfileVisibilityIcon size={14} />
                      <span>{profileVisibilityMeta.label}</span>
                    </span>
                  ) : null}
                </div>
              ) : null}
              {profile.bio ? <p>{profile.bio}</p> : null}
              <div className="profile-meta">
                <button
                  className={classNames(followListMode === "followers" && "is-active")}
                  type="button"
                  onClick={() => setFollowListMode((current) => (current === "followers" ? null : "followers"))}
                >
                  {formatCount(profile.followerCount)} followers
                </button>
                <button
                  className={classNames(followListMode === "following" && "is-active")}
                  type="button"
                  onClick={() => setFollowListMode((current) => (current === "following" ? null : "following"))}
                >
                  {formatCount(profileData.stats.following)} following
                </button>
                <span>{formatCount(profileData.stats.totalLikes)} likes</span>
                <span>{formatCount(profileData.stats.totalReads)} reads</span>
                <span>{formatCount(profileData.stats.totalWords)} words</span>
                {ownProfile && currentUser ? (
                  <span>{formatCount(currentUser.storage.siteCredits)} credits</span>
                ) : null}
                <span>Joined {fullDateFormat.format(new Date(profile.joinedAt))}</span>
              </div>
            </div>
            {ownProfile ? (
              <div className="profile-actions">
                <button className="secondary-button" type="button" onClick={onOpenProfileSettings}>
                  <UserCog size={16} />
                  Edit profile
                </button>
                <button className="secondary-button" type="button" onClick={onOpenPrivacySecurity}>
                  <KeyRound size={16} />
                  Privacy
                </button>
              </div>
            ) : currentUser ? (
              <div className="profile-actions">
                {!profile.blocked ? (
                  <button
                    className={classNames("secondary-button profile-follow-button", profile.following && "is-active")}
                    type="button"
                    onClick={handleFollow}
                    disabled={followingBusy}
                  >
                    <UserPlus size={16} />
                    {followingBusy ? "Saving" : profile.following ? "Following" : "Follow"}
                  </button>
                ) : null}
                <button className="danger-button profile-follow-button" type="button" onClick={handleBlock} disabled={blockingBusy}>
                  <Shield size={16} />
                  {blockingBusy ? "Saving" : profile.blocked ? "Unblock" : "Block"}
                </button>
                {!profile.blocked ? (
                  <button
                    className="secondary-button profile-follow-button"
                    type="button"
                    onClick={() => {
                      setReportOpen((value) => !value);
                      setMessage("");
                      setReportTurnstileToken("");
                    }}
                  >
                    <Flag size={16} />
                    Report
                  </button>
                ) : null}
              </div>
            ) : (
              <button className="secondary-button profile-follow-button" type="button" onClick={onAuthRequired}>
                <LogIn size={16} />
                Sign in
              </button>
            )}
          </div>

          {reportOpen && currentUser && !ownProfile ? (
            <form className="report-form profile-report-form" onSubmit={handleProfileReport}>
              <label>
                Reason
                <select value={reportReason} onChange={(event) => setReportReason(event.target.value as ReportReason)}>
                  {reportReasonOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Details
                <textarea
                  value={reportDetails}
                  maxLength={800}
                  rows={3}
                  onChange={(event) => setReportDetails(event.target.value)}
                  placeholder={`Optional context for @${profile.username}`}
                />
              </label>
              <TurnstileWidget siteKey={siteKey} action="report" onToken={setReportTurnstileToken} compact />
              <div className="settings-actions">
                <button className="danger-button" type="submit" disabled={reportSubmitting}>
                  <Flag size={15} />
                  {reportSubmitting ? "Submitting" : "Submit report"}
                </button>
                <button className="secondary-button" type="button" onClick={() => setReportOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          <MatureAccessNotice
            matureAccess={profileData.matureAccess}
            onLogin={onAuthRequired}
            onPrivacySecurity={onOpenPrivacySecurity}
          />

          {followListMode && !profile.blocked ? (
            <section className="profile-follow-panel">
              <div className="profile-follow-heading">
                <div>
                  <p className="eyebrow">{followListMode === "followers" ? "Followers" : "Following"}</p>
                  <h2>
                    {followListLoading
                      ? "Loading"
                      : `${formatCount(followListData?.totalCount ?? 0)} ${
                          followListMode === "followers" ? "followers" : "following"
                        }`}
                  </h2>
                </div>
                <button className="text-button" type="button" onClick={() => setFollowListMode(null)}>
                  Close
                </button>
              </div>
              {followListMessage ? <p className="auth-inline-message">{followListMessage}</p> : null}
              {followListLoading ? <p className="muted">Loading social list.</p> : null}
              <div className="profile-follow-grid">
                {(followListData?.users ?? []).map(({ creator, followedAt }) => {
                  const ownCreator = currentUser?.username.toLowerCase() === creator.handle.toLowerCase();
                  return (
                    <article className="profile-follow-card" key={creator.id}>
                      <button className="profile-follow-main" type="button" onClick={() => onOpenProfile(creator.handle)}>
                        {creator.avatarUrl ? (
                          <img src={creator.avatarUrl} alt="" />
                        ) : (
                          <DefaultAvatar className="profile-follow-avatar-fallback" name={creator.displayName} />
                        )}
                        <span>
                          <strong>{creator.displayName}</strong>
                          <small>@{creator.handle}</small>
                          {creator.bio ? <em>{creator.bio}</em> : null}
                        </span>
                      </button>
                      <div className="profile-follow-meta">
                        <span>{formatCount(creator.followerCount)} followers</span>
                        <span>Since {dateFormat.format(new Date(followedAt))}</span>
                      </div>
                      <div className="profile-follow-actions">
                        <button className="secondary-button" type="button" onClick={() => onOpenProfile(creator.handle)}>
                          <UserRound size={15} />
                          Profile
                        </button>
                        <button
                          className={classNames("secondary-button", creator.following && "is-active")}
                          type="button"
                          onClick={() => void handleFollowListToggle(creator)}
                          disabled={followListBusyUser === creator.handle}
                        >
                          <UserPlus size={15} />
                          {ownCreator
                            ? "You"
                            : followListBusyUser === creator.handle
                              ? "Saving"
                              : creator.following
                                ? "Following"
                                : "Follow"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
              {!followListLoading && followListData?.users.length === 0 ? (
                <p className="empty-feed">No visible users in this list.</p>
              ) : null}
              {followListData?.nextCursor ? (
                <div className="load-more-row">
                  <button className="secondary-button" type="button" onClick={handleLoadMoreFollowList} disabled={followListLoadingMore}>
                    {followListLoadingMore ? "Loading" : "Load more"}
                    <span>
                      {formatCount(followListData.users.length)} / {formatCount(followListData.totalCount)}
                    </span>
                  </button>
                </div>
              ) : null}
            </section>
          ) : null}

          {profile.blocked ? (
            <p className="empty-feed">This user is blocked. Unblock them to view their novels again.</p>
          ) : null}

          {!profile.blocked ? (
            <div className="profile-tabs" aria-label="Novel profile sections">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={classNames(activeTab === tab.id && "is-active")}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={16} />
                    {tab.label}
                    <span>{formatCount(tab.count)}</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {!profile.blocked && activeTab === "readingLists" ? (
            <div className="collection-folder-grid profile-collection-grid">
              {visibleReadingLists.map((readingList) => (
                <button
                  className="collection-folder-card"
                  key={readingList.id}
                  type="button"
                  onClick={() => onOpenCollection(readingList.id)}
                >
                  <span className="collection-folder-icon">
                    <FolderOpen size={20} />
                  </span>
                  <span>
                    <strong>{readingList.title}</strong>
                    <small>
                      {formatCount(readingList.novelCount)} reads · Updated{" "}
                      {dateFormat.format(new Date(readingList.updatedAt))}
                    </small>
                  </span>
                  <Eye size={16} />
                </button>
              ))}
            </div>
          ) : null}

          {!profile.blocked && activeTab === "series" ? (
            <div className="collection-folder-grid profile-collection-grid">
              {visibleSeries.map((series) => (
                <button
                  className="collection-folder-card series-folder-card"
                  key={series.id}
                  type="button"
                  onClick={() => onOpenSeries(series.id)}
                >
                  <span className="collection-folder-icon">
                    <ListOrdered size={20} />
                  </span>
                  <span>
                    <strong>{series.title}</strong>
                    <small>
                      {formatCount(series.novelCount)} entries · Updated{" "}
                      {dateFormat.format(new Date(series.updatedAt))}
                    </small>
                  </span>
                  <Eye size={16} />
                </button>
              ))}
            </div>
          ) : null}

          {!profile.blocked && activeTab !== "readingLists" && activeTab !== "series" ? (
            <div className="novel-grid profile-novel-grid">
              {visibleNovels.map((novel, index) => (
                <NovelCard
                  key={novel.id}
                  novel={novel}
                  index={index}
                  onOpenNovel={onOpenNovel}
                  onOpenProfile={onOpenProfile}
                />
              ))}
            </div>
          ) : null}

          {!profile.blocked &&
          (activeTab === "readingLists"
            ? visibleReadingLists.length === 0
            : activeTab === "series"
              ? visibleSeries.length === 0
              : visibleNovels.length === 0) ? (
            <p className="empty-feed">
              {activeTab === "readingLists"
                ? "No public reading shelves yet."
                : activeTab === "series"
                  ? "No public serials yet."
                  : "No readable novels in this section."}
            </p>
          ) : null}

          {!profile.blocked && activeNextCursor ? (
            <div className="load-more-row profile-load-more-row">
              <button className="secondary-button" type="button" onClick={handleLoadMoreProfile} disabled={profilePageLoading}>
                {profilePageLoading ? "Loading" : "Load more"}
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

type ProfileSettingsPageProps = {
  context: RouteContext;
  csrfToken: string;
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onOpenPrivacySecurity: () => void;
  onOpenProfile: (username: string) => void;
  onSaved: (user: AuthUser, notice?: string) => void;
};

function ProfileSettingsPage({
  context,
  csrfToken,
  currentUser,
  onAuthRequired,
  onOpenPrivacySecurity,
  onOpenProfile,
  onSaved
}: ProfileSettingsPageProps) {
  const [settings, setSettings] = useState<ProfileSettingsResponse | null>(null);
  const [formState, setFormState] = useState({
    username: "",
    displayName: "",
    avatarUrl: "",
    websiteUrl: "",
    bio: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      onAuthRequired();
      return;
    }

    let cancelled = false;
    setLoading(true);
    setMessage("");
    fetch("/api/settings/profile", { credentials: "include" })
      .then(async (response) => {
        const payload = (await response.json()) as ProfileSettingsResponse | { message?: string };
        if (!response.ok || !("profile" in payload)) {
          throw new Error(
            ("message" in payload ? payload.message : undefined) ??
              "Profile settings could not be loaded."
          );
        }
        return payload;
      })
      .then((payload) => {
        if (!cancelled) {
          setSettings(payload);
          setFormState(payload.profile);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Profile settings could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) {
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/settings/profile", {
        method: "PUT",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          [csrfHeaderName]: csrfToken
        },
        body: JSON.stringify(formState)
      });
      const payload = (await response.json()) as ProfileSettingsResponse | { message?: string };
      if (!response.ok || !("profile" in payload)) {
        throw new Error(
          ("message" in payload ? payload.message : undefined) ?? "Profile could not be saved."
        );
      }
      setSettings(payload);
      setFormState(payload.profile);
      const nextMessage = "Profile saved.";
      onSaved(payload.user, nextMessage);
      setMessage(nextMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profile could not be saved.");
    } finally {
      setSaving(false);
    }
  };
  const handleAvatarUpload = async (file: File | undefined) => {
    if (!file || avatarUploading) {
      return;
    }
    setAvatarUploading(true);
    setMessage("");
    try {
      const body = new FormData();
      body.append("avatar", file);
      const response = await fetch("/api/settings/profile/avatar", {
        method: "POST",
        credentials: "include",
        headers: {
          [csrfHeaderName]: csrfToken
        },
        body
      });
      const payload = (await response.json()) as ProfileSettingsResponse | { message?: string };
      if (!response.ok || !("profile" in payload)) {
        throw new Error(
          ("message" in payload ? payload.message : undefined) ??
            "Profile picture could not be uploaded."
        );
      }
      setSettings(payload);
      setFormState(payload.profile);
      const nextMessage = payload.message ?? "Profile picture uploaded.";
      onSaved(payload.user, nextMessage);
      setMessage(nextMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profile picture could not be uploaded.");
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };
  const profileInitial = (formState.displayName || formState.username || currentUser?.displayName || "U")
    .slice(0, 1)
    .toUpperCase();
  const novelContext = context === "novels";

  return (
    <section className={classNames("content-main settings-page", novelContext && "novel-dedicated-page novel-settings-page")}>
      <div className="settings-heading">
        <div>
          <p className="eyebrow">{novelContext ? "Identity" : "Account"}</p>
          <h1>Profile settings</h1>
        </div>
        <button className="secondary-button" type="button" onClick={onOpenPrivacySecurity}>
          <KeyRound size={16} />
          Privacy
        </button>
      </div>
      {loading ? <p className="empty-feed">Loading settings.</p> : null}
      {message ? <p className="settings-message">{message}</p> : null}
      {!currentUser ? (
        <button className="primary-button" type="button" onClick={onAuthRequired}>
          <LogIn size={17} />
          Sign in
        </button>
      ) : null}
      {settings ? (
        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="profile-avatar-upload">
            <div className="profile-avatar-upload-preview" aria-hidden="true">
              {formState.avatarUrl ? <img src={formState.avatarUrl} alt="" /> : <span>{profileInitial}</span>}
            </div>
            <div className="profile-avatar-upload-copy">
              <strong>Profile picture</strong>
              <span>Upload a square JPEG, PNG, WebP, or GIF up to 4 MB.</span>
              <div className="profile-avatar-upload-actions">
                <button
                  className="secondary-button"
                  type="button"
                  disabled={avatarUploading}
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <ImageUp size={16} />
                  {avatarUploading ? "Uploading" : "Upload picture"}
                </button>
              </div>
              <input
                ref={avatarInputRef}
                className="visually-hidden"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const [file] = Array.from(event.currentTarget.files ?? []);
                  void handleAvatarUpload(file);
                }}
              />
            </div>
          </div>
          <label>
            Display name
            <input
              value={formState.displayName}
              minLength={2}
              maxLength={60}
              onChange={(event) => setFormState((current) => ({ ...current, displayName: event.target.value }))}
              required
            />
          </label>
          <label>
            Username
            <input
              value={formState.username}
              minLength={3}
              maxLength={32}
              pattern="[a-z0-9_-]+"
              onChange={(event) => setFormState((current) => ({ ...current, username: event.target.value.toLowerCase() }))}
              required
            />
          </label>
          <label>
            Website URL
            <input
              value={formState.websiteUrl}
              maxLength={500}
              placeholder="https://example.com"
              type="url"
              onChange={(event) => setFormState((current) => ({ ...current, websiteUrl: event.target.value }))}
            />
          </label>
          <label>
            Bio
            <textarea
              value={formState.bio}
              maxLength={500}
              rows={5}
              onChange={(event) => setFormState((current) => ({ ...current, bio: event.target.value }))}
            />
          </label>
          <div className="settings-actions">
            <button className="primary-button" type="submit" disabled={saving}>
              <Settings size={17} />
              {saving ? "Saving" : "Save profile"}
            </button>
            <button className="secondary-button" type="button" onClick={() => onOpenProfile(formState.username)}>
              <UserRound size={16} />
              View profile
            </button>
          </div>
        </form>
      ) : null}
      {message ? <p className="settings-message">{message}</p> : null}
    </section>
  );
}

type PrivacySecurityPageProps = {
  context: RouteContext;
  csrfToken: string;
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onNotice: (message: string) => void;
  onOpenProfileSettings: () => void;
  onSaved: (user: AuthUser, notice?: string) => void;
  onPasswordChanged: (payload: PasswordChangeResponse) => void;
  onSessionsChanged: (payload: RevokeSessionsResponse) => void;
  onAccountDeactivated: (payload: AccountDeactivationResponse) => void;
};

function PrivacySecurityPage({
  context,
  csrfToken,
  currentUser,
  onAuthRequired,
  onNotice,
  onOpenProfileSettings,
  onSaved,
  onPasswordChanged,
  onSessionsChanged,
  onAccountDeactivated
}: PrivacySecurityPageProps) {
  const [settings, setSettings] = useState<PrivacySecuritySettingsResponse | null>(null);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettingsResponse | null>(null);
  const [sessionsData, setSessionsData] = useState<AuthSessionsResponse | null>(null);
  const [blockedUsersData, setBlockedUsersData] = useState<BlockedUsersResponse | null>(null);
  const [notificationPreferences, setNotificationPreferences] = useState({
    likes: true,
    comments: true,
    follows: true,
    moderation: true
  });
  const [bookmarkDefaultVisibility, setBookmarkDefaultVisibility] =
    useState<BookmarkVisibility>("public");
  const [profileVisibility, setProfileVisibility] = useState<ProfileVisibility>("public");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [matureContentEnabled, setMatureContentEnabled] = useState(false);
  const [mutedTagsInput, setMutedTagsInput] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailChangeAddress, setEmailChangeAddress] = useState("");
  const [emailChangePassword, setEmailChangePassword] = useState("");
  const [deactivationPassword, setDeactivationPassword] = useState("");
  const [deactivationConfirmation, setDeactivationConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [emailChangeMessage, setEmailChangeMessage] = useState("");
  const [sessionMessage, setSessionMessage] = useState("");
  const [blockedUsersMessage, setBlockedUsersMessage] = useState("");
  const [notificationPreferencesMessage, setNotificationPreferencesMessage] = useState("");
  const [exportMessage, setExportMessage] = useState("");
  const [deactivationMessage, setDeactivationMessage] = useState("");
  const [securityMessage, setSecurityMessage] = useState("");
  const [discordMessage, setDiscordMessage] = useState("");
  const [totpSetup, setTotpSetup] = useState<TotpSetupResponse | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [securityApprovalCode, setSecurityApprovalCode] = useState("");
  const [securityApprovalCodeMessage, setSecurityApprovalCodeMessage] = useState("");
  const [securityApprovalCodeOpen, setSecurityApprovalCodeOpen] = useState(false);
  const [securityApprovalPrompt, setSecurityApprovalPrompt] = useState<{
    action: SecurityApprovalAction;
    message: string;
  } | null>(null);
  const [passkeyName, setPasskeyName] = useState("My passkey");
  const [loading, setLoading] = useState(true);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [blockedUsersLoading, setBlockedUsersLoading] = useState(false);
  const [notificationPreferencesLoading, setNotificationPreferencesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notificationPreferencesSaving, setNotificationPreferencesSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [emailChangeSaving, setEmailChangeSaving] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [deactivatingAccount, setDeactivatingAccount] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securityApprovalCodeSaving, setSecurityApprovalCodeSaving] = useState(false);
  const [sessionSaving, setSessionSaving] = useState<string | null>(null);
  const [unblockingUser, setUnblockingUser] = useState<string | null>(null);
  const handledSecurityApprovalRef = useRef("");

  const loadSessions = useCallback(async () => {
    if (!currentUser) {
      setSessionsData(null);
      setSessionsLoading(false);
      return;
    }
    setSessionsLoading(true);
    setSessionMessage("");
    try {
      const response = await fetch("/api/settings/sessions", { credentials: "include" });
      const payload = (await response.json()) as AuthSessionsResponse | { message?: string };
      if (!response.ok || !("sessions" in payload)) {
        throw new Error(
          ("message" in payload ? payload.message : undefined) ??
            "Active sessions could not be loaded."
        );
      }
      setSessionsData(payload);
    } catch (error) {
      setSessionMessage(error instanceof Error ? error.message : "Active sessions could not be loaded.");
    } finally {
      setSessionsLoading(false);
    }
  }, [currentUser]);

  const loadBlockedUsers = useCallback(async () => {
    if (!currentUser) {
      setBlockedUsersData(null);
      setBlockedUsersLoading(false);
      return;
    }
    setBlockedUsersLoading(true);
    setBlockedUsersMessage("");
    try {
      const response = await fetch("/api/settings/blocked-users", { credentials: "include" });
      const payload = (await response.json()) as BlockedUsersResponse | { message?: string };
      if (!response.ok || !("users" in payload)) {
        throw new Error(
          ("message" in payload ? payload.message : undefined) ??
            "Blocked users could not be loaded."
        );
      }
      setBlockedUsersData(payload);
    } catch (error) {
      setBlockedUsersMessage(
        error instanceof Error ? error.message : "Blocked users could not be loaded."
      );
    } finally {
      setBlockedUsersLoading(false);
    }
  }, [currentUser]);

  const loadNotificationPreferences = useCallback(async () => {
    if (!currentUser) {
      setNotificationPreferences({
        likes: true,
        comments: true,
        follows: true,
        moderation: true
      });
      setNotificationPreferencesLoading(false);
      return;
    }
    setNotificationPreferencesLoading(true);
    setNotificationPreferencesMessage("");
    try {
      const response = await fetch("/api/settings/notification-preferences", {
        credentials: "include"
      });
      const payload = (await response.json()) as
        | NotificationPreferencesResponse
        | { message?: string };
      if (!response.ok || !("preferences" in payload)) {
        throw new Error(
          ("message" in payload ? payload.message : undefined) ??
            "Notification preferences could not be loaded."
        );
      }
      setNotificationPreferences(payload.preferences);
    } catch (error) {
      setNotificationPreferencesMessage(
        error instanceof Error
          ? error.message
          : "Notification preferences could not be loaded."
      );
    } finally {
      setNotificationPreferencesLoading(false);
    }
  }, [currentUser]);

  const loadSecuritySettings = useCallback(async () => {
    if (!currentUser) {
      setSecuritySettings(null);
      setSecurityLoading(false);
      return;
    }
    setSecurityLoading(true);
    setSecurityMessage("");
    setDiscordMessage("");
    try {
      const response = await fetch("/api/settings/security", { credentials: "include" });
      const payload = (await response.json()) as SecuritySettingsResponse | { message?: string };
      if (!response.ok || !("twoStep" in payload)) {
        throw new Error(payload.message ?? "Account security settings could not be loaded.");
      }
      setSecuritySettings(payload);
    } catch (error) {
      setSecurityMessage(
        error instanceof Error ? error.message : "Account security settings could not be loaded."
      );
    } finally {
      setSecurityLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      onAuthRequired();
      return;
    }

    let cancelled = false;
    setLoading(true);
    setMessage("");
    fetch("/api/settings/privacy-security", { credentials: "include" })
      .then(async (response) => {
        const payload = (await response.json()) as PrivacySecuritySettingsResponse | { message?: string };
        if (!response.ok || !("privacy" in payload)) {
          throw new Error(
            ("message" in payload ? payload.message : undefined) ??
              "Privacy settings could not be loaded."
          );
        }
        return payload;
      })
      .then((payload) => {
        if (!cancelled) {
          setSettings(payload);
          setBookmarkDefaultVisibility(payload.privacy.bookmarkDefaultVisibility);
          setProfileVisibility(payload.privacy.profileVisibility);
          setDateOfBirth(payload.privacy.dateOfBirth ?? "");
          setMatureContentEnabled(payload.privacy.matureContentEnabled);
          setMutedTagsInput(payload.privacy.mutedTags.join(", "));
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Privacy settings could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    void loadBlockedUsers();
  }, [loadBlockedUsers]);

  useEffect(() => {
    void loadNotificationPreferences();
  }, [loadNotificationPreferences]);

  useEffect(() => {
    void loadSecuritySettings();
  }, [loadSecuritySettings]);

  const scrollSettingsToTop = () => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const savePrivacySettings = async (
    overrides: Partial<PrivacySecuritySettingsResponse["privacy"]> = {},
    nextMessage = "Privacy settings saved."
  ) => {
    if (saving) {
      return false;
    }
    setSaving(true);
    setMessage("");
    try {
      const nextPrivacy = {
        bookmarkDefaultVisibility,
        profileVisibility,
        dateOfBirth: dateOfBirth || null,
        matureContentEnabled,
        mutedTags: parseTagListInput(mutedTagsInput),
        ...overrides
      };
      const response = await fetch("/api/settings/privacy-security", {
        method: "PUT",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          [csrfHeaderName]: csrfToken
        },
        body: JSON.stringify(nextPrivacy)
      });
      const payload = (await response.json()) as PrivacySecuritySettingsResponse | { message?: string };
      if (!response.ok || !("privacy" in payload)) {
        throw new Error(
          ("message" in payload ? payload.message : undefined) ??
            "Privacy settings could not be saved."
        );
      }
      setSettings(payload);
      setBookmarkDefaultVisibility(payload.privacy.bookmarkDefaultVisibility);
      setProfileVisibility(payload.privacy.profileVisibility);
      setDateOfBirth(payload.privacy.dateOfBirth ?? "");
      setMatureContentEnabled(payload.privacy.matureContentEnabled);
      setMutedTagsInput(payload.privacy.mutedTags.join(", "));
      onSaved(payload.user, nextMessage);
      setMessage(nextMessage);
      scrollSettingsToTop();
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Privacy settings could not be saved.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleMatureAccessSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await savePrivacySettings({}, "Mature access saved.");
  };

  const handleMutedTagsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await savePrivacySettings({}, "Muted tags saved.");
  };

  const handleBookmarkDefaultVisibilityChange = (value: BookmarkVisibility) => {
    if (value === bookmarkDefaultVisibility || saving) {
      return;
    }
    setBookmarkDefaultVisibility(value);
    void savePrivacySettings({ bookmarkDefaultVisibility: value }, "Bookmark default saved.");
  };

  const handleProfileVisibilityChange = (value: ProfileVisibility) => {
    if (value === profileVisibility || saving) {
      return;
    }
    setProfileVisibility(value);
    void savePrivacySettings({ profileVisibility: value }, "Profile visibility saved.");
  };

  const handleNotificationPreferencesSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (notificationPreferencesSaving) {
      return;
    }
    setNotificationPreferencesSaving(true);
    setNotificationPreferencesMessage("");
    try {
      const response = await fetch("/api/settings/notification-preferences", {
        method: "PUT",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          [csrfHeaderName]: csrfToken
        },
        body: JSON.stringify(notificationPreferences)
      });
      const payload = (await response.json()) as
        | NotificationPreferencesResponse
        | { message?: string };
      if (!response.ok || !("preferences" in payload)) {
        throw new Error(
          ("message" in payload ? payload.message : undefined) ??
            "Notification preferences could not be saved."
        );
      }
      setNotificationPreferences(payload.preferences);
      const nextMessage = payload.message ?? "Notification preferences saved.";
      setNotificationPreferencesMessage(nextMessage);
      onNotice(nextMessage);
    } catch (error) {
      setNotificationPreferencesMessage(
        error instanceof Error
          ? error.message
          : "Notification preferences could not be saved."
      );
    } finally {
      setNotificationPreferencesSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordSaving) {
      return;
    }
    setPasswordMessage("");
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }
    setPasswordSaving(true);
    try {
      const response = await fetch("/api/settings/password", {
        method: "PUT",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          [csrfHeaderName]: csrfToken
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      const payload = (await response.json()) as PasswordChangeResponse | { message?: string };
      if (!response.ok || !("csrfToken" in payload)) {
        throw new Error(payload.message ?? "Password could not be changed.");
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onPasswordChanged(payload);
      setPasswordMessage(payload.message);
    } catch (error) {
      setPasswordMessage(error instanceof Error ? error.message : "Password could not be changed.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleEmailChangeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (emailChangeSaving) {
      return;
    }
    setEmailChangeMessage("");
    setEmailChangeSaving(true);
    try {
      const response = await fetch("/api/settings/email/request", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          [csrfHeaderName]: csrfToken
        },
        body: JSON.stringify({
          email: emailChangeAddress,
          currentPassword: emailChangePassword
        })
      });
      const payload = (await response.json()) as EmailChangeRequestResponse | { message?: string };
      if (!response.ok || !("pendingEmail" in payload)) {
        throw new Error(payload.message ?? "Confirmation email could not be sent.");
      }
      setEmailChangeAddress("");
      setEmailChangePassword("");
      setEmailChangeMessage(payload.message);
      onNotice(payload.message);
    } catch (error) {
      setEmailChangeMessage(
        error instanceof Error ? error.message : "Confirmation email could not be sent."
      );
    } finally {
      setEmailChangeSaving(false);
    }
  };

  const applySecuritySettingsResponse = (payload: SecuritySettingsResponse) => {
    setSecuritySettings(payload);
    if (payload.message) {
      setSecurityMessage(payload.message);
      onNotice(payload.message);
    }
  };

  const currentSecurityReturnTo = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("securityApprovalToken");
    url.searchParams.delete("securityApprovalAction");
    url.searchParams.delete("securityApprovalStatus");
    url.searchParams.delete("securityApprovalMessage");
    return `${url.pathname}${url.search}${url.hash}`;
  };

  const requestSecurityApproval = async (
    action: SecurityApprovalAction,
    options: { passkeyName?: string; passkeyId?: string } = {},
    setTargetMessage: (message: string) => void = setSecurityMessage
  ) => {
    if (securitySaving) {
      return false;
    }
    setSecuritySaving(true);
    setTargetMessage("");
    try {
      const response = await fetch("/api/settings/security/approval", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          [csrfHeaderName]: csrfToken
        },
        body: JSON.stringify({
          action,
          returnTo: currentSecurityReturnTo(),
          ...options
        })
      });
      const payload = (await response.json()) as SecurityApprovalResponse | { message?: string };
      if (!response.ok || !("message" in payload)) {
        throw new Error(payload.message ?? "Approval request could not be sent.");
      }
      const approvalMessage = payload.message ?? "Approval request sent.";
      setSecurityApprovalPrompt({ action, message: approvalMessage });
      return true;
    } catch (error) {
      setTargetMessage(error instanceof Error ? error.message : "Approval request could not be sent.");
      return false;
    } finally {
      setSecuritySaving(false);
    }
  };

  const handleDiscordLink = async () => {
    if (securitySaving || securitySettings?.discord.linked) {
      return;
    }
    await requestSecurityApproval("discord_link", {}, setDiscordMessage);
  };

  const handleTotpStart = async () => {
    if (securitySaving) {
      return;
    }
    await requestSecurityApproval("totp_start");
  };

  const handleTotpConfirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (securitySaving) {
      return;
    }
    setSecuritySaving(true);
    setSecurityMessage("");
    try {
      const response = await fetch("/api/settings/security/totp/confirm", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          [csrfHeaderName]: csrfToken
        },
        body: JSON.stringify({ code: totpCode })
      });
      const payload = (await response.json()) as SecuritySettingsResponse | { message?: string };
      if (!response.ok || !("twoStep" in payload)) {
        throw new Error(payload.message ?? "Authenticator code could not be confirmed.");
      }
      setTotpSetup(null);
      setTotpCode("");
      applySecuritySettingsResponse(payload);
    } catch (error) {
      setSecurityMessage(
        error instanceof Error ? error.message : "Authenticator code could not be confirmed."
      );
    } finally {
      setSecuritySaving(false);
    }
  };

  const handleTotpDisable = async () => {
    if (securitySaving) {
      return;
    }
    await requestSecurityApproval("totp_disable");
  };

  const handleEmailMfaToggle = async (enabled: boolean) => {
    if (securitySaving) {
      return;
    }
    await requestSecurityApproval(enabled ? "email_mfa_enable" : "email_mfa_disable");
  };

  const handleAddPasskey = async () => {
    if (securitySaving) {
      return;
    }
    await requestSecurityApproval("passkey_add", { passkeyName });
  };

  const handleDeletePasskey = async (id: string) => {
    if (securitySaving) {
      return;
    }
    await requestSecurityApproval("passkey_delete", { passkeyId: id });
  };

  const completeApprovedDiscordLink = async (approvalToken: string) => {
    setSecuritySaving(true);
    setDiscordMessage("");
    try {
      const response = await fetch("/api/settings/security/discord/start", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          [csrfHeaderName]: csrfToken
        },
        body: JSON.stringify({ approvalToken })
      });
      const payload = (await response.json()) as DiscordStartResponse | { message?: string };
      if (!response.ok || !("authorizationUrl" in payload)) {
        throw new Error(payload.message ?? "Discord login could not be connected.");
      }
      window.location.assign(payload.authorizationUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Discord login could not be connected.";
      setDiscordMessage(message);
      setSecurityMessage(message);
    } finally {
      setSecuritySaving(false);
    }
  };

  const completeApprovedTotpStart = async (approvalToken: string) => {
    setSecuritySaving(true);
    setSecurityMessage("");
    try {
      const response = await fetch("/api/settings/security/totp/start", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          [csrfHeaderName]: csrfToken
        },
        body: JSON.stringify({ approvalToken })
      });
      const payload = (await response.json()) as TotpSetupResponse | { message?: string };
      if (!response.ok || !("secret" in payload)) {
        throw new Error(payload.message ?? "Authenticator setup could not start.");
      }
      setTotpSetup(payload);
      setTotpCode("");
      setSecurityMessage(payload.message);
    } catch (error) {
      setSecurityMessage(error instanceof Error ? error.message : "Authenticator setup could not start.");
    } finally {
      setSecuritySaving(false);
    }
  };

  const completeApprovedPasskeyAdd = async (approvalToken: string) => {
    if (!window.PublicKeyCredential || !navigator.credentials) {
      setSecurityMessage("Passkeys are not available in this browser.");
      return;
    }
    setSecuritySaving(true);
    setSecurityMessage("");
    try {
      const optionsResponse = await fetch("/api/settings/security/passkeys/options", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          [csrfHeaderName]: csrfToken
        },
        body: JSON.stringify({ approvalToken })
      });
      const optionsPayload = (await optionsResponse.json()) as
        | PasskeyRegistrationOptionsResponse
        | { message?: string };
      if (!optionsResponse.ok || !("publicKey" in optionsPayload)) {
        throw new Error(
          ("message" in optionsPayload ? optionsPayload.message : undefined) ??
            "Passkey setup could not start."
        );
      }
      const approvedName = optionsPayload.name ?? passkeyName;
      const credential = await navigator.credentials.create({
        publicKey: passkeyCreationOptions(optionsPayload)
      });
      if (!(credential instanceof PublicKeyCredential)) {
        throw new Error("Passkey setup was cancelled.");
      }
      const response = await fetch("/api/settings/security/passkeys", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          [csrfHeaderName]: csrfToken
        },
        body: JSON.stringify(passkeyCreationPayload(credential, approvedName))
      });
      const payload = (await response.json()) as SecuritySettingsResponse | { message?: string };
      if (!response.ok || !("twoStep" in payload)) {
        throw new Error(payload.message ?? "Passkey could not be added.");
      }
      setPasskeyName("My passkey");
      applySecuritySettingsResponse(payload);
    } catch (error) {
      setSecurityMessage(error instanceof Error ? error.message : "Passkey could not be added.");
    } finally {
      setSecuritySaving(false);
    }
  };

  const completeApprovedTotpDisable = async (approvalToken: string) => {
    setSecuritySaving(true);
    setSecurityMessage("");
    try {
      const response = await fetch("/api/settings/security/totp", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          [csrfHeaderName]: csrfToken
        },
        body: JSON.stringify({ approvalToken })
      });
      const payload = (await response.json()) as SecuritySettingsResponse | { message?: string };
      if (!response.ok || !("twoStep" in payload)) {
        throw new Error(payload.message ?? "Authenticator app could not be disabled.");
      }
      applySecuritySettingsResponse(payload);
    } catch (error) {
      setSecurityMessage(
        error instanceof Error ? error.message : "Authenticator app could not be disabled."
      );
    } finally {
      setSecuritySaving(false);
    }
  };

  const completeApprovedEmailMfaToggle = async (enabled: boolean, approvalToken: string) => {
    setSecuritySaving(true);
    setSecurityMessage("");
    try {
      const response = await fetch("/api/settings/security/email", {
        method: "PUT",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          [csrfHeaderName]: csrfToken
        },
        body: JSON.stringify({ enabled, approvalToken })
      });
      const payload = (await response.json()) as SecuritySettingsResponse | { message?: string };
      if (!response.ok || !("twoStep" in payload)) {
        throw new Error(payload.message ?? "Email codes could not be updated.");
      }
      applySecuritySettingsResponse(payload);
    } catch (error) {
      setSecurityMessage(error instanceof Error ? error.message : "Email codes could not be updated.");
    } finally {
      setSecuritySaving(false);
    }
  };

  const completeApprovedPasskeyDelete = async (id: string, approvalToken: string) => {
    if (!id) {
      setSecurityMessage("Passkey approval is invalid.");
      return;
    }
    setSecuritySaving(true);
    setSecurityMessage("");
    try {
      const response = await fetch(`/api/settings/security/passkeys/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          [csrfHeaderName]: csrfToken
        },
        body: JSON.stringify({ approvalToken })
      });
      const payload = (await response.json()) as SecuritySettingsResponse | { message?: string };
      if (!response.ok || !("twoStep" in payload)) {
        throw new Error(payload.message ?? "Passkey could not be removed.");
      }
      applySecuritySettingsResponse(payload);
    } catch (error) {
      setSecurityMessage(error instanceof Error ? error.message : "Passkey could not be removed.");
    } finally {
      setSecuritySaving(false);
    }
  };

  const openSecurityApprovalCodeDialog = () => {
    setSecurityApprovalCode("");
    setSecurityApprovalCodeMessage("");
    setSecurityApprovalPrompt(null);
    setSecurityApprovalCodeOpen(true);
  };

  const closeSecurityApprovalCodeDialog = () => {
    if (securityApprovalCodeSaving) {
      return;
    }
    setSecurityApprovalCode("");
    setSecurityApprovalCodeMessage("");
    setSecurityApprovalCodeOpen(false);
  };

  const handleSecurityApprovalCodeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (securitySaving || securityApprovalCodeSaving) {
      return;
    }
    const code = securityApprovalCode.trim();
    if (!/^\d{6}$/.test(code)) {
      setSecurityApprovalCodeMessage("Approval code must be 6 digits.");
      return;
    }

    setSecurityApprovalCodeSaving(true);
    setSecurityApprovalCodeMessage("");
    try {
      const response = await fetch("/api/settings/security/approval/code", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          [csrfHeaderName]: csrfToken
        },
        body: JSON.stringify({ code })
      });
      const payload = (await response.json()) as SecurityApprovalCodeResponse | { message?: string };
      if (!response.ok || !("approvalToken" in payload) || !("action" in payload)) {
        throw new Error(payload.message ?? "Approval code could not be verified.");
      }
      setSecurityApprovalCode("");
      setSecurityApprovalCodeMessage(payload.message);
      setSecurityApprovalCodeOpen(false);
      onNotice(payload.message);

      if (payload.action === "discord_link") {
        await completeApprovedDiscordLink(payload.approvalToken);
      } else if (payload.action === "totp_start") {
        await completeApprovedTotpStart(payload.approvalToken);
      } else if (payload.action === "totp_disable") {
        await completeApprovedTotpDisable(payload.approvalToken);
      } else if (payload.action === "email_mfa_enable") {
        await completeApprovedEmailMfaToggle(true, payload.approvalToken);
      } else if (payload.action === "email_mfa_disable") {
        await completeApprovedEmailMfaToggle(false, payload.approvalToken);
      } else if (payload.action === "passkey_add") {
        await completeApprovedPasskeyAdd(payload.approvalToken);
      } else if (payload.action === "passkey_delete") {
        await completeApprovedPasskeyDelete(payload.passkeyId ?? "", payload.approvalToken);
      }
    } catch (error) {
      setSecurityApprovalCodeMessage(
        error instanceof Error ? error.message : "Approval code could not be verified."
      );
    } finally {
      setSecurityApprovalCodeSaving(false);
    }
  };

  const clearSecurityApprovalParams = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("securityApprovalToken");
    url.searchParams.delete("securityApprovalAction");
    url.searchParams.delete("securityApprovalStatus");
    url.searchParams.delete("securityApprovalMessage");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };

  useEffect(() => {
    if (!currentUser || !csrfToken) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const status = params.get("securityApprovalStatus");
    const message = params.get("securityApprovalMessage");
    if (status || message) {
      const nextMessage =
        message ??
        (status === "approved" ? "Security change approved." : "Security approval failed.");
      setSecurityMessage(nextMessage);
      onNotice(nextMessage);
      clearSecurityApprovalParams();
      void loadSecuritySettings();
      return;
    }

    const approvalToken = params.get("securityApprovalToken") ?? "";
    const action = params.get("securityApprovalAction") ?? "";
    const approvalKey = `${approvalToken}:${action}`;
    if (!approvalToken || handledSecurityApprovalRef.current === approvalKey) {
      return;
    }
    handledSecurityApprovalRef.current = approvalKey;
    clearSecurityApprovalParams();
    if (action === "totp_start") {
      void completeApprovedTotpStart(approvalToken);
      return;
    }
    if (action === "passkey_add") {
      void completeApprovedPasskeyAdd(approvalToken);
      return;
    }
    setSecurityMessage("Security approval action is not supported.");
  }, [currentUser, csrfToken]);

  const handleRevokeSession = async (sessionId: string | null) => {
    if (sessionSaving !== null) {
      return;
    }
    const savingKey = sessionId ?? "all";
    setSessionSaving(savingKey);
    setSessionMessage("");
    try {
      const response = await fetch(
        sessionId
          ? `/api/settings/sessions/${encodeURIComponent(sessionId)}`
          : "/api/settings/sessions/revoke-others",
        {
          method: sessionId ? "DELETE" : "POST",
          credentials: "include",
          headers: {
            [csrfHeaderName]: csrfToken
          }
        }
      );
      const payload = (await response.json()) as RevokeSessionsResponse | { message?: string };
      if (!response.ok || !("sessions" in payload) || !("csrfToken" in payload)) {
        throw new Error(payload.message ?? "Session could not be revoked.");
      }
      setSessionsData({ sessions: payload.sessions });
      onSessionsChanged(payload);
      setSessionMessage(payload.message);
    } catch (error) {
      setSessionMessage(error instanceof Error ? error.message : "Session could not be revoked.");
    } finally {
      setSessionSaving(null);
    }
  };

  const handleUnblockUser = async (username: string) => {
    if (unblockingUser) {
      return;
    }
    setUnblockingUser(username);
    setBlockedUsersMessage("");
    try {
      const response = await fetch(
        `/api/settings/blocked-users/${encodeURIComponent(username)}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            [csrfHeaderName]: csrfToken
          }
        }
      );
      const payload = (await response.json()) as UnblockUserResponse | { message?: string };
      if (!response.ok || !("users" in payload)) {
        throw new Error(payload.message ?? "User could not be unblocked.");
      }
      setBlockedUsersData({ users: payload.users });
      setBlockedUsersMessage(payload.message);
      onNotice(payload.message);
    } catch (error) {
      setBlockedUsersMessage(error instanceof Error ? error.message : "User could not be unblocked.");
    } finally {
      setUnblockingUser(null);
    }
  };

  const handleDataExport = async () => {
    if (exportingData) {
      return;
    }
    setExportingData(true);
    setExportMessage("");
    try {
      const response = await fetch("/api/settings/export", { credentials: "include" });
      const payload = (await response.json()) as AccountExportResponse | { message?: string };
      if (!response.ok || !("exportedAt" in payload)) {
        throw new Error(
          ("message" in payload ? payload.message : undefined) ??
            "Account export could not be created."
        );
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${payload.user.username}-nehub-export-${payload.exportedAt.slice(0, 10)}.json`;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setExportMessage("Account export downloaded.");
    } catch (error) {
      setExportMessage(error instanceof Error ? error.message : "Account export could not be created.");
    } finally {
      setExportingData(false);
    }
  };

  const handleAccountDeactivationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (deactivatingAccount) {
      return;
    }
    setDeactivationMessage("");
    if (deactivationConfirmation !== "DEACTIVATE") {
      setDeactivationMessage("Type DEACTIVATE to confirm account deactivation.");
      return;
    }
    if (
      !window.confirm(
        "Deactivate this account now? Your public profile and works will be hidden and every browser will be signed out."
      )
    ) {
      return;
    }
    setDeactivatingAccount(true);
    try {
      const response = await fetch("/api/settings/account/deactivate", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          [csrfHeaderName]: csrfToken
        },
        body: JSON.stringify({
          currentPassword: deactivationPassword,
          confirmation: deactivationConfirmation
        })
      });
      const payload = (await response.json()) as AccountDeactivationResponse | { message?: string };
      if (!response.ok || !("deactivated" in payload)) {
        throw new Error(payload.message ?? "Account could not be deactivated.");
      }
      setDeactivationPassword("");
      setDeactivationConfirmation("");
      onAccountDeactivated(payload);
    } catch (error) {
      setDeactivationMessage(
        error instanceof Error ? error.message : "Account could not be deactivated."
      );
    } finally {
      setDeactivatingAccount(false);
    }
  };

  const matureAccess = settings?.matureAccess ?? null;
  const mutedTags = parseTagListInput(mutedTagsInput);
  const sessions = sessionsData?.sessions ?? [];
  const otherSessionCount = sessions.filter((session) => !session.current).length;
  const blockedUsers = blockedUsersData?.users ?? [];
  const discordConnection = securitySettings?.discord ?? null;
  const totpEnabled = securitySettings?.twoStep.totpEnabled ?? false;
  const emailCodesEnabled = securitySettings?.twoStep.emailEnabled ?? false;
  const hasPasskeys = (securitySettings?.passkeys.length ?? 0) > 0;
  const securityMethodCount = [totpEnabled, emailCodesEnabled, hasPasskeys].filter(Boolean).length;
  const securitySummary = securityLoading
    ? "Loading"
    : securityMethodCount > 0
      ? `${securityMethodCount} method${securityMethodCount === 1 ? "" : "s"} ready`
      : "No extra method";
  const discordConnectionLabel = !discordConnection?.configured
    ? "Not configured"
    : discordConnection.linked
      ? discordConnection.username
        ? `Connected as ${discordConnection.username}`
        : "Connected"
      : "Not connected";
  const securityApprovalPromptLabel = securityApprovalPrompt
    ? securityApprovalActionLabels[securityApprovalPrompt.action]
    : "this security change";
  const novelContext = context === "novels";

  return (
    <section className={classNames("content-main settings-page", novelContext && "novel-dedicated-page novel-settings-page")}>
      <div className="settings-heading">
        <div>
          <p className="eyebrow">{novelContext ? "Safety" : "Account"}</p>
          <h1>{novelContext ? "Reading privacy & security" : "Privacy & security"}</h1>
        </div>
        <button className="secondary-button" type="button" onClick={onOpenProfileSettings}>
          <UserCog size={16} />
          Profile
        </button>
      </div>
      {loading ? <p className="empty-feed">Loading settings.</p> : null}
      {!currentUser ? (
        <button className="primary-button" type="button" onClick={onAuthRequired}>
          <LogIn size={17} />
          Sign in
        </button>
      ) : null}
      {settings ? (
        <>
          <div className="settings-form privacy-form">
            <section className="settings-panel">
              <div className="panel-title">
                <Bookmark size={18} />
                Bookmark default
              </div>
              <div className="segmented-control" aria-label="Default bookmark visibility">
                <button
                  className={classNames(bookmarkDefaultVisibility === "public" && "is-active")}
                  type="button"
                  disabled={saving}
                  onClick={() => handleBookmarkDefaultVisibilityChange("public")}
                >
                  <Eye size={16} />
                  Public
                </button>
                <button
                  className={classNames(bookmarkDefaultVisibility === "private" && "is-active")}
                  type="button"
                  disabled={saving}
                  onClick={() => handleBookmarkDefaultVisibilityChange("private")}
                >
                  <Lock size={16} />
                  Private
                </button>
              </div>
            </section>

            <section className="settings-panel">
              <div className="panel-title">
                <UserRound size={18} />
                Profile visibility
              </div>
              <div className="segmented-control" aria-label="Profile visibility">
                {profileVisibilityOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      className={classNames(profileVisibility === option.value && "is-active")}
                      key={option.value}
                      type="button"
                      disabled={saving}
                      onClick={() => handleProfileVisibilityChange(option.value)}
                    >
                      <Icon size={16} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <form className="settings-panel" onSubmit={handleMatureAccessSubmit}>
              <div className="panel-title">
                <Calendar size={18} />
                Mature access
              </div>
              <label>
                Date of birth
                <input
                  value={dateOfBirth}
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                />
              </label>
              <label className="toggle-row settings-toggle">
                <span>Show mature content</span>
                <input
                  checked={matureContentEnabled}
                  type="checkbox"
                  onChange={(event) => setMatureContentEnabled(event.target.checked)}
                />
              </label>
              <MatureAccessStatus matureAccess={matureAccess} />
              <div className="settings-actions">
                <button className="secondary-button" type="submit" disabled={saving}>
                  <ShieldCheck size={17} />
                  {saving ? "Saving" : "Save mature access"}
                </button>
              </div>
            </form>

            <form className="settings-panel" onSubmit={handleMutedTagsSubmit}>
              <div className="panel-title">
                <EyeOff size={18} />
                Muted tags
              </div>
              <label>
                Tags to hide
                <textarea
                  value={mutedTagsInput}
                  rows={4}
                  maxLength={1200}
                  onChange={(event) => setMutedTagsInput(event.target.value)}
                  placeholder="spoilers, loud-color, ai-generated"
                />
              </label>
              <p className="settings-help">
                Muted tags hide matching works by other creators from feeds, search, rankings, tag
                pages, collections, series, and recommendations.
              </p>
              {mutedTags.length > 0 ? (
                <div className="muted-tag-list" aria-label="Muted tags">
                  {mutedTags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              ) : (
                <p className="muted">No muted tags.</p>
              )}
              <div className="settings-actions">
                <button className="secondary-button" type="submit" disabled={saving}>
                  <EyeOff size={17} />
                  {saving ? "Saving" : "Save muted tags"}
                </button>
              </div>
            </form>
          </div>

          <form className="settings-form password-form" onSubmit={handlePasswordSubmit}>
            <section className="settings-panel">
              <div className="panel-title">
                <KeyRound size={18} />
                Password
              </div>
              <div className="password-field-grid">
                <label>
                  Current password
                  <input
                    value={currentPassword}
                    type="password"
                    autoComplete="current-password"
                    maxLength={160}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    required
                  />
                </label>
                <label>
                  New password
                  <input
                    value={newPassword}
                    type="password"
                    autoComplete="new-password"
                    minLength={10}
                    maxLength={160}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                  />
                </label>
                <label>
                  Confirm new password
                  <input
                    value={confirmPassword}
                    type="password"
                    autoComplete="new-password"
                    minLength={10}
                    maxLength={160}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </label>
              </div>
              <p className="settings-help">
                Changing your password keeps this browser signed in and revokes other active
                sessions.
              </p>
              <div className="settings-actions">
                <button className="secondary-button" type="submit" disabled={passwordSaving}>
                  <KeyRound size={17} />
                  {passwordSaving ? "Saving" : "Change password"}
                </button>
              </div>
              {passwordMessage ? <p className="settings-message">{passwordMessage}</p> : null}
            </section>
          </form>

          <section className="settings-form security-form">
            <div className="settings-panel">
              <div className="security-panel-heading">
                <div className="panel-title">
                  <ShieldCheck size={18} />
                  Two-step verification
                </div>
                <span className={classNames("security-summary-badge", securityMethodCount > 0 && "is-enabled")}>
                  <Lock size={14} />
                  {securitySummary}
                </span>
              </div>
              {securityLoading ? <p className="muted">Loading account security.</p> : null}
              <div className="security-option-list">
                <article className={classNames("security-option security-method-card", totpEnabled && "is-enabled")}>
                  <span className="security-method-icon" aria-hidden="true">
                    <KeyRound size={18} />
                  </span>
                  <div className="security-method-copy">
                    <span className="security-method-title-row">
                      <strong>Authenticator app</strong>
                      <span className={classNames("security-status-pill", totpEnabled && "is-enabled")}>
                        {totpEnabled ? "Enabled" : "Off"}
                      </span>
                    </span>
                    <span className="security-option-detail">Authenticator codes for sensitive sign-ins.</span>
                  </div>
                  {totpEnabled ? (
                    <button
                      className="secondary-button"
                      type="button"
                      disabled={securitySaving}
                      onClick={() => void handleTotpDisable()}
                    >
                      <KeyRound size={16} />
                      Disable
                    </button>
                  ) : (
                    <button
                      className="secondary-button"
                      type="button"
                      disabled={securitySaving}
                      onClick={() => void handleTotpStart()}
                    >
                      <KeyRound size={16} />
                      Set up
                    </button>
                  )}
                </article>
                {totpSetup ? (
                  <form className="security-setup-form" onSubmit={handleTotpConfirm}>
                    <label>
                      Setup key
                      <input value={totpSetup.secret} readOnly />
                    </label>
                    <label>
                      Authenticator code
                      <input
                        value={totpCode}
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        minLength={6}
                        maxLength={6}
                        autoComplete="one-time-code"
                        onChange={(event) => setTotpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                        required
                      />
                    </label>
                    <div className="settings-actions">
                      <button className="primary-button" type="submit" disabled={securitySaving}>
                        <ShieldCheck size={17} />
                        {securitySaving ? "Verifying" : "Enable authenticator"}
                      </button>
                    </div>
                  </form>
                ) : null}
                <article className={classNames("security-option security-method-card", emailCodesEnabled && "is-enabled")}>
                  <span className="security-method-icon" aria-hidden="true">
                    <MailCheck size={18} />
                  </span>
                  <div className="security-method-copy">
                    <span className="security-method-title-row">
                      <strong>Email codes</strong>
                      <span className={classNames("security-status-pill", emailCodesEnabled && "is-enabled")}>
                        {emailCodesEnabled ? "Enabled" : "Off"}
                      </span>
                    </span>
                    <span className="security-option-detail">One-time codes delivered to your account email.</span>
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={securitySaving}
                    onClick={() => void handleEmailMfaToggle(!emailCodesEnabled)}
                  >
                    <MailCheck size={16} />
                    {emailCodesEnabled ? "Disable" : "Enable"}
                  </button>
                </article>
              </div>
            </div>
          </section>

          <section className="settings-form connected-logins-form">
            <div className="settings-panel">
              <div className="panel-title">
                <MessageCircle size={18} />
                Connected logins
              </div>
              {securityLoading ? <p className="muted">Loading connected logins.</p> : null}
              <div className="security-option-list">
                <article className={classNames("security-option security-method-card", discordConnection?.linked && "is-enabled")}>
                  <span className="security-method-icon" aria-hidden="true">
                    <MessageCircle size={18} />
                  </span>
                  <div className="security-method-copy">
                    <span className="security-method-title-row">
                      <strong>Discord</strong>
                      <span className={classNames("security-status-pill", discordConnection?.linked && "is-enabled")}>
                        {discordConnection?.linked ? "Connected" : "Off"}
                      </span>
                    </span>
                    <span className="security-option-detail">{discordConnectionLabel}</span>
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={
                      securitySaving ||
                      securityLoading ||
                      !discordConnection?.configured ||
                      discordConnection.linked
                    }
                    onClick={() => void handleDiscordLink()}
                  >
                    <MessageCircle size={16} />
                    {discordConnection?.linked ? "Connected" : "Connect"}
                  </button>
                </article>
              </div>
              {discordMessage ? <p className="settings-message">{discordMessage}</p> : null}
            </div>
          </section>

          <section className="settings-form passkeys-form">
            <div className="settings-panel">
              <div className="panel-title">
                <KeyRound size={18} />
                Passkeys
              </div>
              <div className="passkey-create-row security-passkey-create">
                <label>
                  Passkey name
                  <input
                    value={passkeyName}
                    maxLength={80}
                    onChange={(event) => setPasskeyName(event.target.value)}
                  />
                </label>
                <button
                  className="secondary-button"
                  type="button"
                  disabled={securitySaving || !passkeyName.trim()}
                  onClick={() => void handleAddPasskey()}
                >
                  <KeyRound size={16} />
                  Add passkey
                </button>
              </div>
              {securitySettings?.passkeys.length ? (
                <div className="session-list">
                  {securitySettings.passkeys.map((passkey) => (
                    <article className="session-item" key={passkey.id}>
                      <div>
                        <div className="session-title">
                          <strong>{passkey.name}</strong>
                          {passkey.lastUsedAt ? <span>Used {formatDateTime(passkey.lastUsedAt)}</span> : null}
                        </div>
                        <p>Added {formatDateTime(passkey.createdAt)}</p>
                      </div>
                      <button
                        className="secondary-button icon-button"
                        type="button"
                        title="Remove passkey"
                        disabled={securitySaving}
                        onClick={() => void handleDeletePasskey(passkey.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="security-empty-state">
                  <span className="security-method-icon" aria-hidden="true">
                    <KeyRound size={18} />
                  </span>
                  <p>No passkeys yet.</p>
                </div>
              )}
              {securityMessage ? <p className="settings-message">{securityMessage}</p> : null}
            </div>
          </section>

          {securityApprovalPrompt ? (
            <div
              className="modal-backdrop security-code-backdrop"
              role="dialog"
              aria-modal="true"
              aria-labelledby="security-approval-title"
              onClick={(event) => {
                if (event.currentTarget === event.target) {
                  setSecurityApprovalPrompt(null);
                }
              }}
            >
              <div className="security-code-dialog security-approval-dialog">
                <button
                  className="icon-button security-code-close"
                  type="button"
                  title="Close"
                  onClick={() => setSecurityApprovalPrompt(null)}
                >
                  <X size={16} />
                </button>
                <span className="security-code-icon">
                  <MailCheck size={24} />
                </span>
                <p className="eyebrow">Approval email</p>
                <h2 id="security-approval-title">Check your email</h2>
                <p className="security-code-copy">
                  {securityApprovalPrompt.message} It includes the approval action and a 6-digit
                  backup code for this browser.
                </p>
                <div className="security-approval-steps" aria-label="Approval options">
                  <div>
                    <span>1</span>
                    <p>
                      <strong>Approve from email</strong>
                      <small>Complete the request to {securityApprovalPromptLabel}.</small>
                    </p>
                  </div>
                  <div>
                    <span>2</span>
                    <p>
                      <strong>Use backup code</strong>
                      <small>Enter the 6-digit code here if email approval cannot open.</small>
                    </p>
                  </div>
                </div>
                <div className="settings-actions">
                  <button
                    className="primary-button"
                    type="button"
                    onClick={openSecurityApprovalCodeDialog}
                  >
                    <ShieldCheck size={16} />
                    Enter backup code
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setSecurityApprovalPrompt(null)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {securityApprovalCodeOpen ? (
            <div
              className="modal-backdrop security-code-backdrop"
              role="dialog"
              aria-modal="true"
              aria-labelledby="security-code-title"
              onClick={(event) => {
                if (event.currentTarget === event.target) {
                  closeSecurityApprovalCodeDialog();
                }
              }}
            >
              <form className="security-code-dialog" onSubmit={handleSecurityApprovalCodeSubmit}>
                <button
                  className="icon-button security-code-close"
                  type="button"
                  title="Close"
                  disabled={securityApprovalCodeSaving}
                  onClick={closeSecurityApprovalCodeDialog}
                >
                  <X size={16} />
                </button>
                <span className="security-code-icon">
                  <ShieldCheck size={24} />
                </span>
                <p className="eyebrow">Approval</p>
                <h2 id="security-code-title">Backup code</h2>
                <p className="security-code-copy">
                  Enter the 6-digit backup code from your most recent approval email.
                </p>
                <label>
                  6-digit code
                  <input
                    className="security-code-input"
                    value={securityApprovalCode}
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    minLength={6}
                    maxLength={6}
                    autoComplete="one-time-code"
                    autoFocus
                    placeholder="000000"
                    onChange={(event) =>
                      setSecurityApprovalCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    required
                  />
                </label>
                <div className="settings-actions">
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={
                      securitySaving ||
                      securityApprovalCodeSaving ||
                      securityApprovalCode.length !== 6
                    }
                  >
                    <ShieldCheck size={16} />
                    {securityApprovalCodeSaving ? "Approving" : "Approve code"}
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={securityApprovalCodeSaving}
                    onClick={closeSecurityApprovalCodeDialog}
                  >
                    Cancel
                  </button>
                </div>
                {securityApprovalCodeMessage ? (
                  <p className="settings-message">{securityApprovalCodeMessage}</p>
                ) : null}
              </form>
            </div>
          ) : null}

          <form
            className="settings-form notification-preferences-form"
            onSubmit={handleNotificationPreferencesSubmit}
          >
            <section className="settings-panel">
              <div className="panel-title">
                <Bell size={18} />
                Notification preferences
              </div>
              <p className="settings-help">
                Choose which account events create notifications. Existing notifications stay in
                your inbox until you mark them read.
              </p>
              {notificationPreferencesLoading ? (
                <p className="muted">Loading notification preferences.</p>
              ) : null}
              <div className="notification-preference-list">
                <label className="toggle-row settings-toggle">
                  <span>
                    <Heart size={16} />
                    Likes on your artwork
                  </span>
                  <input
                    checked={notificationPreferences.likes}
                    type="checkbox"
                    onChange={(event) =>
                      setNotificationPreferences((current) => ({
                        ...current,
                        likes: event.target.checked
                      }))
                    }
                  />
                </label>
                <label className="toggle-row settings-toggle">
                  <span>
                    <MessageCircle size={16} />
                    Comments and replies
                  </span>
                  <input
                    checked={notificationPreferences.comments}
                    type="checkbox"
                    onChange={(event) =>
                      setNotificationPreferences((current) => ({
                        ...current,
                        comments: event.target.checked
                      }))
                    }
                  />
                </label>
                <label className="toggle-row settings-toggle">
                  <span>
                    <UserPlus size={16} />
                    New followers
                  </span>
                  <input
                    checked={notificationPreferences.follows}
                    type="checkbox"
                    onChange={(event) =>
                      setNotificationPreferences((current) => ({
                        ...current,
                        follows: event.target.checked
                      }))
                    }
                  />
                </label>
                <label className="toggle-row settings-toggle">
                  <span>
                    <ShieldCheck size={16} />
                    Moderation updates
                  </span>
                  <input
                    checked={notificationPreferences.moderation}
                    type="checkbox"
                    onChange={(event) =>
                      setNotificationPreferences((current) => ({
                        ...current,
                        moderation: event.target.checked
                      }))
                    }
                  />
                </label>
              </div>
              <div className="settings-actions">
                <button
                  className="secondary-button"
                  type="submit"
                  disabled={notificationPreferencesSaving}
                >
                  <Bell size={17} />
                  {notificationPreferencesSaving ? "Saving" : "Save notifications"}
                </button>
              </div>
            </section>
          </form>

          <section className="settings-form blocked-users-form">
            <div className="settings-panel">
              <div className="panel-title">
                <UserX size={18} />
                Blocked users
              </div>
              <p className="settings-help">
                Blocked users cannot follow you or appear in your feeds. Unblocking does not restore
                old follow relationships.
              </p>
              {blockedUsersLoading ? <p className="muted">Loading blocked users.</p> : null}
              {!blockedUsersLoading && blockedUsers.length === 0 ? (
                <p className="muted">No blocked users.</p>
              ) : null}
              {blockedUsers.length > 0 ? (
                <div className="blocked-user-list" aria-label="Blocked users">
                  {blockedUsers.map((blockedUser) => (
                    <article className="blocked-user-row" key={blockedUser.id}>
                      <div className="blocked-user-avatar" aria-hidden="true">
                        {blockedUser.avatarUrl ? (
                          <img src={blockedUser.avatarUrl} alt="" />
                        ) : (
                          <span>{blockedUser.displayName.slice(0, 1).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <strong>{blockedUser.displayName}</strong>
                        <span>
                          @{blockedUser.username} · blocked {formatDateTime(blockedUser.blockedAt)}
                        </span>
                      </div>
                      <button
                        className="secondary-button"
                        type="button"
                        disabled={unblockingUser === blockedUser.username}
                        onClick={() => void handleUnblockUser(blockedUser.username)}
                      >
                        <UserX size={16} />
                        {unblockingUser === blockedUser.username ? "Saving" : "Unblock"}
                      </button>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          <section className="settings-form data-export-form">
            <div className="settings-panel">
              <div className="panel-title">
                <FileText size={18} />
                Account data
              </div>
              <p className="settings-help">
                Download a JSON archive of your profile, privacy choices, artwork metadata,
                comments, bookmarks, follows, blocks, collections, and series.
              </p>
              <div className="settings-actions">
                <button
                  className="secondary-button"
                  type="button"
                  disabled={exportingData}
                  onClick={() => void handleDataExport()}
                >
                  <Download size={17} />
                  {exportingData ? "Preparing" : "Download export"}
                </button>
              </div>
            </div>
          </section>

          <form className="settings-form email-change-form" onSubmit={handleEmailChangeSubmit}>
            <section className="settings-panel">
              <div className="panel-title">
                <MailCheck size={18} />
                Account email
              </div>
              <p className="settings-help">
                Current email: <strong>{currentUser?.email ?? ""}</strong>
              </p>
              <label>
                New email
                <input
                  value={emailChangeAddress}
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  onChange={(event) => setEmailChangeAddress(event.target.value)}
                  required
                />
              </label>
              <label>
                Current password
                <input
                  value={emailChangePassword}
                  type="password"
                  autoComplete="current-password"
                  maxLength={160}
                  onChange={(event) => setEmailChangePassword(event.target.value)}
                  required
                />
              </label>
              <p className="settings-help">
                NEHub sends a confirmation link to the new address before changing your login
                email.
              </p>
              <div className="settings-actions">
                <button className="secondary-button" type="submit" disabled={emailChangeSaving}>
                  <MailCheck size={17} />
                  {emailChangeSaving ? "Sending" : "Send confirmation"}
                </button>
              </div>
            </section>
          </form>

          <section className="settings-form sessions-form">
            <div className="settings-panel">
              <div className="panel-title">
                <Server size={18} />
                Active sessions
              </div>
              <p className="settings-help">
                Review browsers signed in to this account. Use Sign out for this browser, or
                revoke any other session here.
              </p>
              <div className="settings-actions">
                <button
                  className="secondary-button"
                  type="button"
                  disabled={sessionSaving !== null || otherSessionCount === 0}
                  onClick={() => void handleRevokeSession(null)}
                >
                  <LogOut size={16} />
                  {sessionSaving === "all" ? "Revoking" : "Sign out others"}
                </button>
              </div>
              {sessionsLoading ? <p className="muted">Loading active sessions.</p> : null}
              {!sessionsLoading && sessions.length === 0 ? (
                <p className="muted">No active sessions found.</p>
              ) : null}
              {sessions.length > 0 ? (
                <div className="session-list">
                  {sessions.map((session: AccountSession) => (
                    <article className="session-item" key={session.id}>
                      <div>
                        <div className="session-title">
                          <strong>
                            {session.current ? "Current session" : "Other session"}
                          </strong>
                          {session.current ? <span>Active now</span> : null}
                        </div>
                        <p>{session.userAgent}</p>
                        <div className="session-meta">
                          <span>Last seen {formatDateTime(session.lastSeenAt)}</span>
                          <span>Created {formatDateTime(session.createdAt)}</span>
                          <span>Expires {formatDateTime(session.expiresAt)}</span>
                        </div>
                      </div>
                      {!session.current ? (
                        <button
                          className="secondary-button icon-button"
                          type="button"
                          title="Revoke session"
                          disabled={sessionSaving !== null}
                          onClick={() => void handleRevokeSession(session.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          <form
            className="settings-form account-deactivation-form"
            onSubmit={handleAccountDeactivationSubmit}
          >
            <section className="settings-panel danger-settings-panel">
              <div className="panel-title">
                <Trash2 size={18} />
                Deactivate account
              </div>
              <p className="settings-help">
                Deactivation hides your public profile and works, removes follow relationships, and
                signs out every browser. Contact an administrator if you need the account restored.
              </p>
              <label>
                Current password
                <input
                  value={deactivationPassword}
                  type="password"
                  autoComplete="current-password"
                  maxLength={160}
                  onChange={(event) => setDeactivationPassword(event.target.value)}
                  required
                />
              </label>
              <label>
                Type DEACTIVATE
                <input
                  value={deactivationConfirmation}
                  type="text"
                  autoComplete="off"
                  maxLength={10}
                  onChange={(event) => setDeactivationConfirmation(event.target.value)}
                  required
                />
              </label>
              <div className="settings-actions">
                <button
                  className="danger-button"
                  type="submit"
                  disabled={
                    deactivatingAccount ||
                    deactivationPassword.length === 0 ||
                    deactivationConfirmation !== "DEACTIVATE"
                  }
                >
                  <Trash2 size={17} />
                  {deactivatingAccount ? "Deactivating" : "Deactivate account"}
                </button>
              </div>
            </section>
          </form>
        </>
      ) : null}
      {notificationPreferencesMessage ? (
        <p className="settings-message">{notificationPreferencesMessage}</p>
      ) : null}
      {emailChangeMessage ? <p className="settings-message">{emailChangeMessage}</p> : null}
      {blockedUsersMessage ? <p className="settings-message">{blockedUsersMessage}</p> : null}
      {exportMessage ? <p className="settings-message">{exportMessage}</p> : null}
      {sessionMessage ? <p className="settings-message">{sessionMessage}</p> : null}
      {deactivationMessage ? <p className="settings-message">{deactivationMessage}</p> : null}
    </section>
  );
}

type MatureAccessStatusProps = {
  matureAccess: MatureAccess | null;
};

function MatureAccessStatus({ matureAccess }: MatureAccessStatusProps) {
  if (!matureAccess) {
    return null;
  }

  return (
    <div className="mature-status">
      <div className={classNames("mature-status-heading", matureAccess.allowed && "is-active")}>
        {matureAccess.allowed ? <Eye size={18} /> : <EyeOff size={18} />}
        <strong>{matureAccessLabel(matureAccess)}</strong>
      </div>
      <div className="mature-status-grid">
        <StatusPill active={matureAccess.signedIn} label="Signed in" />
        <StatusPill active={matureAccess.ageVerified} label="Age verified" />
        <StatusPill active={matureAccess.enabled} label="Enabled" />
        <StatusPill active={!matureAccess.restrictedRegion} label={matureAccess.country ?? "Region"} />
      </div>
    </div>
  );
}

type StatusPillProps = {
  active: boolean;
  label: string;
};

function StatusPill({ active, label }: StatusPillProps) {
  return (
    <span className={classNames("status-pill", active && "is-active")}>
      {active ? <ShieldCheck size={14} /> : <EyeOff size={14} />}
      {label}
    </span>
  );
}

type PolicyPageProps =
  | { kind: "terms"; context?: RouteContext; onOpenPrivacy: () => void; onOpenTerms?: never }
  | { kind: "privacy"; context?: RouteContext; onOpenTerms: () => void; onOpenPrivacy?: never };

function PolicyPage(props: PolicyPageProps) {
  const isTerms = props.kind === "terms";
  const novelContext = props.context === "novels";
  const sections = isTerms
    ? [
        {
          title: "Eligibility and accounts",
          body:
            "You must be able to form a binding agreement in your location. Keep your login credentials secure and maintain a verified email address for publishing, liking, bookmarking, and account recovery."
        },
        {
          title: "User content",
          body:
            "You keep ownership of artwork you publish. By posting, you grant NEHub a worldwide, non-exclusive license to host, store, resize, display, and distribute that content inside the service."
        },
        {
          title: "Mature content",
          body:
            "Mature content may only be viewed or published by signed-in users who provide an adult date of birth, enable mature viewing, and access the service from a permitted region."
        },
        {
          title: "Prohibited activity",
          body:
            "Do not upload unlawful, abusive, exploitative, infringing, malicious, or non-consensual content. Do not bypass access controls, scrape accounts, attack Cloudflare services, or interfere with other users."
        },
        {
          title: "Moderation and availability",
          body:
            "NEHub may remove content, restrict accounts, change features, or suspend the service when needed for security, legal, operational, or community-protection reasons."
        }
      ]
    : [
        {
          title: "Information we collect",
          body:
            "NEHub stores account email, username, display name, password hash, verification status, profile details, date of birth for age checks, bookmark settings, uploads, likes, comments, and session metadata."
        },
        {
          title: "Cloudflare processing",
          body:
            "The service runs on Cloudflare Workers, D1, R2, Turnstile, Email Routing Workers, and standard Cloudflare request logs. Cloudflare may process IP address, country, device, and security-signal data."
        },
        {
          title: "How data is used",
          body:
            "Data is used to operate accounts, verify email, protect forms with Turnstile, show artwork feeds, enforce bookmark privacy, enforce mature-content age and regional restrictions, and troubleshoot abuse or security issues."
        },
        {
          title: "Visibility choices",
          body:
            "Public bookmarks can appear on your profile. Private bookmarks are visible only to your signed-in account. Mature content is hidden unless the access checks in the Terms are satisfied."
        },
        {
          title: "Retention and requests",
          body:
            "Account, content, and security records are retained while needed to provide the service, meet legal duties, and resolve abuse. Contact the site operator to request access, correction, export, or deletion."
        }
      ];

  return (
    <section className={classNames("content-main policy-page", novelContext && "novel-dedicated-page novel-policy-page")}>
      <div className="policy-heading">
        <p className="eyebrow">NEHub</p>
        <h1>
          {isTerms ? "Terms of Use" : "Privacy Policy"}
        </h1>
        <p>Last updated {policyUpdatedDate}</p>
      </div>
      <div className="policy-grid">
        {sections.map((section) => (
          <article className="policy-section" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </div>
      <div className="policy-switch">
        {isTerms ? (
          <button className="secondary-button" type="button" onClick={props.onOpenPrivacy}>
            <Shield size={16} />
            Privacy Policy
          </button>
        ) : (
          <button className="secondary-button" type="button" onClick={props.onOpenTerms}>
            <FileText size={16} />
            Terms of Use
          </button>
        )}
      </div>
    </section>
  );
}

type StatusCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  active: boolean;
  detail: string;
};

function StatusCard({ icon, label, value, active, detail }: StatusCardProps) {
  return (
    <article className="status-card">
      <div className={classNames("status-card-icon", active && "is-active")}>{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <p>{detail}</p>
      </div>
    </article>
  );
}

type MetricTileProps = {
  label: string;
  value: string;
};

function MetricTile({ label, value }: MetricTileProps) {
  return (
    <div className="metric-tile">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

type NovelHubPageProps = {
  section: NovelSection;
  data: NovelListResponse | null;
  activityData: ActivityResponse | null;
  featuredNovel: Novel | null;
  novels: Novel[];
  totalWords: number;
  creators: Creator[];
  followedCreators: Creator[];
  followedNovels: Novel[];
  rankingNovels: Novel[];
  rankingItems: NovelRankingResponse["rankings"];
  rankingPeriod: RankingPeriod;
  continueReadingItems: ReadingProgressResponse["progress"];
  bookmarkedNovels: Novel[];
  collections: ReadingList[];
  currentUser: AuthUser | null;
  matureFilter: MatureFilter;
  sortMode: NovelSortMode;
  activeTag: string;
  query: string;
  onMatureFilterChange: (filter: MatureFilter) => void;
  onSortModeChange: (sortMode: NovelSortMode) => void;
  onTagFilterChange: (tag: string) => void;
  onRankingPeriodChange: (period: RankingPeriod) => void;
  onAuthRequired: () => void;
  onOpenNovel: (novelId: string) => void;
  onOpenCollection: (collectionId: string) => void;
  onOpenArtwork: (artwork: Artwork) => void;
  onOpenProfile: (username: string) => void;
  onPrivacySecurity: () => void;
  onOpenSection: (section: NovelSection) => void;
};

function NovelHubPage({
  section,
  data,
  activityData,
  featuredNovel,
  novels,
  totalWords,
  creators,
  followedCreators,
  followedNovels,
  rankingNovels,
  rankingItems,
  rankingPeriod,
  continueReadingItems,
  bookmarkedNovels,
  collections,
  currentUser,
  matureFilter,
  sortMode,
  activeTag,
  query,
  onMatureFilterChange,
  onSortModeChange,
  onTagFilterChange,
  onRankingPeriodChange,
  onAuthRequired,
  onOpenNovel,
  onOpenCollection,
  onOpenArtwork,
  onOpenProfile,
  onPrivacySecurity,
  onOpenSection
}: NovelHubPageProps) {
  const [creatorSearchInput, setCreatorSearchInput] = useState("");
  const [creatorSearchQuery, setCreatorSearchQuery] = useState("");
  const [creatorSort, setCreatorSort] = useState<CreatorDiscoverySort>("popular");
  const [shelfSearchInput, setShelfSearchInput] = useState("");
  const [shelfSearchQuery, setShelfSearchQuery] = useState("");
  const [shelfSort, setShelfSort] = useState<CollectionDiscoverySort>("updated");
  const authorNovelMap = useMemo(() => {
    const map = new Map<string, Novel[]>();
    for (const novel of novels) {
      map.set(novel.creator.id, [...(map.get(novel.creator.id) ?? []), novel]);
    }
    return map;
  }, [novels]);
  const creatorItems = useMemo(
    () =>
      creators.map((creator) => {
        const authorNovels = authorNovelMap.get(creator.id) ?? [];
        const latestNovelAt = authorNovels.reduce<string | null>(
          (latest, novel) =>
            !latest || new Date(novel.updatedAt).getTime() > new Date(latest).getTime()
              ? novel.updatedAt
              : latest,
          null
        );
        const newestNovelAt = authorNovels.reduce<string | null>(
          (latest, novel) =>
            !latest || new Date(novel.createdAt).getTime() > new Date(latest).getTime()
              ? novel.createdAt
              : latest,
          null
        );
        return { creator, authorNovels, latestNovelAt, newestNovelAt };
      }),
    [authorNovelMap, creators]
  );
  const visibleCreatorItems = useMemo(() => {
    const search = creatorSearchQuery.trim().toLowerCase();
    const filtered = search
      ? creatorItems.filter(({ creator }) =>
          `${creator.displayName} ${creator.handle} ${creator.bio}`.toLowerCase().includes(search)
        )
      : creatorItems;
    return [...filtered].sort((left, right) => {
      if (creatorSort === "active") {
        return (
          new Date(right.latestNovelAt ?? 0).getTime() -
          new Date(left.latestNovelAt ?? 0).getTime()
        );
      }
      if (creatorSort === "newest") {
        return (
          new Date(right.newestNovelAt ?? 0).getTime() -
          new Date(left.newestNovelAt ?? 0).getTime()
        );
      }
      return (
        right.creator.followerCount - left.creator.followerCount ||
        right.authorNovels.length - left.authorNovels.length
      );
    });
  }, [creatorItems, creatorSearchQuery, creatorSort]);
  const visibleCollections = useMemo(() => {
    const search = shelfSearchQuery.trim().toLowerCase();
    const filtered = search
      ? collections.filter((collection) =>
          `${collection.title} ${collection.description} ${collection.visibility}`
            .toLowerCase()
            .includes(search)
        )
      : collections;
    return [...filtered].sort((left, right) => {
      if (shelfSort === "largest") {
        return (
          right.novelCount - left.novelCount ||
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
        );
      }
      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    });
  }, [collections, shelfSearchQuery, shelfSort]);
  const handleCreatorSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreatorSearchQuery(creatorSearchInput.trim());
  };
  const handleShelfSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShelfSearchQuery(shelfSearchInput.trim());
  };
  const sectionTitleMap: Record<NovelSection, string> = {
    home: "Recommended novels",
    following: "Following",
    creators: "Author discovery",
    tags: "Followed novel tags",
    novels: "All works",
    rankings: `${rankingPeriod === "weekly" ? "Weekly" : "Daily"} novel ranking`,
    bookmarks: "Bookmarks",
    collections: "Reading list discovery",
    terms: "Terms",
    privacy: "Privacy"
  };
  const sectionDescriptionMap: Record<NovelSection, string> = {
    home: query.trim()
      ? `${formatCount(novels.length)} novels matching "${query.trim()}".`
      : `${formatCount(section === "home" ? novels.length : data?.totalCount ?? novels.length)} readable novels from NEHub authors.`,
    following: `${formatCount(followedNovels.length)} novels from authors you follow.`,
    creators: creatorSearchQuery
      ? `${formatCount(visibleCreatorItems.length)} authors matching "${creatorSearchQuery}".`
      : `${formatCount(visibleCreatorItems.length)} visible authors publishing readable novels.`,
    tags: `${formatCount(data?.tags.length ?? 0)} available novel tags.`,
    novels: activeTag
      ? `Every visible work tagged #${activeTag}.`
      : "The complete readable shelf currently loaded from NEHub.",
    rankings: `${formatCount(rankingItems.length)} ranked novels from recent ${rankingPeriod === "weekly" ? "weekly" : "daily"} likes and reads.`,
    bookmarks: `${formatCount(bookmarkedNovels.length)} saved novels from your bookmarks.`,
    collections: shelfSearchQuery
      ? `${formatCount(visibleCollections.length)} reading shelves matching "${shelfSearchQuery}".`
      : currentUser
      ? `${formatCount(visibleCollections.length)} reading shelves from your library.`
      : "Sign in to browse and manage your reading shelves.",
    terms: "Read the terms without leaving this section.",
    privacy: "Read the privacy policy without leaving this section."
  };
  const sectionNovels =
    section === "following"
      ? followedNovels
      : section === "rankings"
        ? rankingNovels
        : section === "bookmarks"
          ? bookmarkedNovels
          : novels;
  const isRankingsSection = section === "rankings";
  const isCreatorSection = section === "creators";
  const isCollectionSection = section === "collections";
  const isTagSection = section === "tags";
  const isDedicatedNovelSection =
    isCreatorSection ||
    isTagSection ||
    section === "bookmarks" ||
    isRankingsSection ||
    isCollectionSection;
  const showMatureFilter = !isCreatorSection && !isTagSection && !isCollectionSection;
  const showSortControl = section === "home" || section === "novels";
  const showNovelRightRail =
    section === "home" || section === "following" || section === "bookmarks" || section === "novels";
  const showContinueReading =
    (section === "home" || section === "following") && continueReadingItems.length > 0;
  const prominentNovelTags = data?.tags.slice(0, 12) ?? [];
  const ownerDisplayName = currentUser?.displayName ?? "You";
  const ownerHandle = currentUser?.username ?? "";
  const sectionLikeCount = sectionNovels.reduce((sum, novel) => sum + novel.likeCount, 0);
  const sectionViewCount = sectionNovels.reduce((sum, novel) => sum + novel.viewCount, 0);
  const visibleCount =
    isCreatorSection
      ? visibleCreatorItems.length
      : isTagSection
        ? data?.tags.length ?? 0
        : isCollectionSection
          ? visibleCollections.length
          : sectionNovels.length;
  const visibleUnitLabel =
    isCreatorSection
      ? `active ${visibleCount === 1 ? "author" : "authors"}`
      : isTagSection
        ? visibleCount === 1 ? "tag" : "tags"
        : isCollectionSection
          ? visibleCount === 1 ? "reading shelf" : "reading shelves"
          : `readable ${visibleCount === 1 ? "novel" : "novels"}`;
  const EmptyIcon =
    section === "bookmarks"
      ? Bookmark
      : section === "rankings"
        ? Trophy
        : isCollectionSection
          ? FolderOpen
          : isTagSection
            ? Bell
            : isCreatorSection
              ? UserPlus
              : NotebookText;
  const emptyTitle =
    section === "bookmarks"
      ? "No bookmarked novels yet"
      : section === "rankings"
        ? "No ranked novels yet"
        : isCollectionSection
          ? "No reading shelves yet"
          : isTagSection
            ? "No followed novel tags yet"
            : isCreatorSection
              ? "No authors yet"
              : "No novels match this view";
  const emptyMessage =
    section === "bookmarks"
      ? "Bookmarked novels will appear here after you save them."
      : section === "rankings"
        ? "Rankings will fill in as readable novels collect views and likes."
        : isCollectionSection
          ? currentUser
            ? "Create reading shelves from a novel page, then use this section to browse them."
            : "Sign in to browse reading shelves."
          : isTagSection
            ? "Novel tags will appear as authors publish readable work."
            : isCreatorSection
              ? "Authors publishing readable novels will appear here."
              : "Try the latest feed or adjust the current filters.";
  const summaryItems =
    isCreatorSection
      ? [
          { value: visibleCount, label: visibleUnitLabel },
          { value: followedCreators.length, label: "followed authors" },
          { value: novels.length, label: "readable novels" }
        ]
      : isTagSection
        ? [
            { value: visibleCount, label: visibleUnitLabel },
            { value: novels.length, label: "tagged novels" },
            { value: totalWords, label: "words indexed" }
          ]
        : isRankingsSection
          ? [
              { value: visibleCount, label: visibleUnitLabel },
              { value: sectionLikeCount, label: "likes in ranking" },
              { value: sectionViewCount, label: "reads in ranking" }
            ]
          : isCollectionSection
            ? [
                { value: visibleCount, label: visibleUnitLabel },
                { value: visibleCollections.reduce((sum, collection) => sum + collection.novelCount, 0), label: "saved novels" },
                { value: visibleCollections.filter((collection) => collection.visibility === "public").length, label: "public shelves" }
            ]
            : [
                { value: visibleCount, label: data ? visibleUnitLabel : "loading novels" },
                { value: totalWords, label: "words in current feed" },
                { value: data?.tags.length ?? 0, label: "tags" }
              ];
  const headingClassName = classNames(
    "section-heading novel-feed-heading",
    isCreatorSection && "settings-heading creator-discover-heading",
    isRankingsSection && "settings-heading ranking-page-heading",
    isCollectionSection && "settings-heading collection-heading"
  );
  const sectionEyebrow = isCreatorSection
    ? "Authors"
    : isRankingsSection
      ? "Rankings"
      : isCollectionSection
        ? "Reading shelves"
        : "NEHub novels";
  const sectionClassName = classNames(
    "content-main novels-page novel-feed-page",
    `novel-section-${section}`,
    isCreatorSection && "creator-discover-page novel-author-discover-page",
    isRankingsSection && "ranking-page novels-rankings-page",
    isCollectionSection && "collection-page collection-discover-page novel-collection-discover-page",
    isDedicatedNovelSection && "novel-section-page"
  );
  const novelRightRail = showNovelRightRail ? (
    <aside className="right-rail novel-right-rail" aria-label="Novel recommendations">
      <section className="side-panel ranking-panel">
        <div className="panel-title ranking-title">
          <span>
            <Trophy size={18} />
            Ranking
          </span>
          <div className="mini-segmented" aria-label="Novel rail ranking period">
            {(["daily", "weekly"] as RankingPeriod[]).map((period) => (
              <button
                className={classNames(rankingPeriod === period && "is-active")}
                key={period}
                type="button"
                onClick={() => onRankingPeriodChange(period)}
              >
                {period === "daily" ? "Day" : "Week"}
              </button>
            ))}
          </div>
        </div>
        {rankingItems.slice(0, 5).map(({ novel, score }, index) => (
          <button
            className="ranking-row novel-ranking-row"
            key={novel.id}
            type="button"
            onClick={() => onOpenNovel(novel.id)}
          >
            <span className="rank-number">{index + 1}</span>
            <span className="novel-ranking-row-cover" style={{ "--novel-cover": novel.coverColor } as CSSProperties}>
              <NotebookText size={15} />
            </span>
            <span>
              <strong>{novel.title}</strong>
              <small>{formatCount(score || novel.likeCount)} recent reads</small>
            </span>
          </button>
        ))}
        {rankingItems.length === 0 ? <p className="muted">No ranked novels yet.</p> : null}
      </section>

      <ActivityPanel
        data={activityData}
        onOpenArtwork={onOpenArtwork}
        onOpenNovel={onOpenNovel}
        onOpenProfile={onOpenProfile}
      />

      <section className="side-panel creator-panel">
        <div className="panel-title">
          <ShieldCheck size={18} />
          Recommended authors
        </div>
        {creators.slice(0, 5).map((creator) => (
          <button
            className="creator-row creator-row-link"
            key={creator.id}
            type="button"
            onClick={() => onOpenProfile(creator.handle)}
          >
            {creator.avatarUrl ? (
              <img src={creator.avatarUrl} alt="" />
            ) : (
              <DefaultAvatar
                className="creator-row-avatar-fallback"
                name={creator.displayName}
              />
            )}
            <div>
              <strong>{creator.displayName}</strong>
              <span>@{creator.handle}</span>
            </div>
            <span className="icon-button creator-row-icon" aria-label={`Open ${creator.displayName}`}>
              <UserPlus size={15} />
            </span>
          </button>
        ))}
      </section>
    </aside>
  ) : null;

  return (
    <>
      <section className={classNames(sectionClassName, showNovelRightRail && "novel-feed-main")}>
      <MatureAccessNotice matureAccess={data?.matureAccess ?? null} onLogin={onAuthRequired} onPrivacySecurity={onPrivacySecurity} />
      <div className={headingClassName}>
        <div>
          <p className="eyebrow">{sectionEyebrow}</p>
          <h1>{sectionTitleMap[section]}</h1>
          <p>{sectionDescriptionMap[section]}</p>
        </div>
        <div className="feed-controls">
          {showMatureFilter ? (
            <label className="rating-filter novel-rating-filter">
              <Shield size={15} />
              <select
                value={matureFilter}
                onChange={(event) => onMatureFilterChange(event.target.value as MatureFilter)}
              >
                {matureFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {showSortControl ? (
            <label className="rating-filter novel-rating-filter">
              <TrendingUp size={15} />
              <select
                value={sortMode}
                onChange={(event) => onSortModeChange(event.target.value as NovelSortMode)}
              >
                {novelSortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {isRankingsSection ? (
            <div className="mini-segmented" aria-label="Novel ranking period">
              {(["daily", "weekly"] as RankingPeriod[]).map((period) => (
                <button
                  className={classNames(rankingPeriod === period && "is-active")}
                  type="button"
                  key={period}
                  onClick={() => onRankingPeriodChange(period)}
                >
                  <Trophy size={14} />
                  {period === "daily" ? "Daily" : "Weekly"}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="novel-feed-summary" aria-label="Novel feed summary">
        {summaryItems.map((item) => (
          <span key={item.label}>
            <strong>{formatCount(item.value)}</strong>
            {item.label}
          </span>
        ))}
      </div>

      {showContinueReading ? (
        <section className="novel-continue-section" aria-label="Continue reading">
          <div className="novels-toolbar">
            <div>
              <h2>Continue reading</h2>
              <p>Resume from your latest saved position.</p>
            </div>
          </div>
          <div className="novel-continue-row">
            {continueReadingItems.slice(0, 4).map((item) => (
              <button
                className="novel-progress-card"
                key={item.novelId}
                type="button"
                onClick={() => onOpenNovel(item.novelId)}
                style={{ "--novel-cover": item.novel.coverColor } as CSSProperties}
              >
                <span className="novel-progress-cover" aria-hidden="true">
                  <NotebookText size={18} />
                </span>
                <span className="novel-progress-copy">
                  <strong>{item.novel.title}</strong>
                  <small>
                    {Math.round(item.scrollPercent)}% · {item.novel.readMinutes} min read
                  </small>
                  <em>{formatDateTime(item.updatedAt)}</em>
                </span>
                <span className="novel-progress-meter" aria-hidden="true">
                  <span style={{ width: `${Math.max(3, Math.min(100, item.scrollPercent))}%` }} />
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {featuredNovel && (section === "home" || section === "novels") ? (
        <button
          className="novel-featured-row"
          type="button"
          onClick={() => onOpenNovel(featuredNovel.id)}
          style={{ "--novel-cover": featuredNovel.coverColor } as CSSProperties}
        >
          <span className="novel-featured-cover">
            <NotebookText size={22} />
          </span>
          <span>
            <small>Featured read</small>
            <strong>{featuredNovel.title}</strong>
            <em>{featuredNovel.excerpt}</em>
          </span>
          <ChevronDown size={16} />
        </button>
      ) : null}

      {prominentNovelTags.length && (section === "home" || section === "following" || section === "novels") ? (
        <div className="tag-row novel-tag-row" aria-label="Popular novel tags">
          {prominentNovelTags.map((tag) => (
            <button
              className={classNames("tag-pill novel-tag-pill", activeTag === tag.name && "is-active")}
              key={tag.name}
              type="button"
              onClick={() => {
                onTagFilterChange(activeTag === tag.name ? "" : tag.name);
                onOpenSection("novels");
              }}
            >
              #{tag.name}
              <span>{tag.count}</span>
            </button>
          ))}
        </div>
      ) : null}

      {isCreatorSection ? (
        <>
          <div className="creator-discovery-toolbar">
            <form className="collection-discovery-search" onSubmit={handleCreatorSearchSubmit}>
              <Search size={18} />
              <input
                value={creatorSearchInput}
                onChange={(event) => setCreatorSearchInput(event.target.value)}
                placeholder="Search authors"
                type="search"
              />
              <button className="secondary-button" type="submit">
                Search
              </button>
            </form>
            <div className="mini-segmented" aria-label="Author discovery sort">
              {creatorDiscoverySortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    className={classNames(creatorSort === option.value && "is-active")}
                    type="button"
                    key={option.value}
                    onClick={() => setCreatorSort(option.value)}
                  >
                    <Icon size={15} />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="creator-discovery-grid novel-creator-grid" aria-live="polite">
            {visibleCreatorItems.map(({ creator, authorNovels, latestNovelAt }) => {
              const ownProfile = currentUser?.username.toLowerCase() === creator.handle.toLowerCase();
              return (
                <article className="creator-discovery-card novel-creator-card" key={creator.id}>
                  <button className="creator-discovery-main" type="button" onClick={() => onOpenProfile(creator.handle)}>
                    {creator.avatarUrl ? (
                      <img className="creator-discovery-avatar" src={creator.avatarUrl} alt="" />
                    ) : (
                      <DefaultAvatar className="creator-discovery-avatar creator-discovery-avatar-fallback" name={creator.displayName} />
                    )}
                    <span className="creator-discovery-copy">
                      <strong>{creator.displayName}</strong>
                      <small>@{creator.handle}</small>
                      <span>{creator.bio || "Author publishing novels on NEHub."}</span>
                    </span>
                  </button>
                  <div className="creator-discovery-previews novel-creator-previews">
                    {authorNovels.slice(0, 4).length > 0 ? (
                      authorNovels.slice(0, 4).map((novel) => (
                        <button
                          className="creator-preview-tile novel-preview-tile"
                          type="button"
                          key={novel.id}
                          onClick={() => onOpenNovel(novel.id)}
                          title={novel.title}
                          style={{ "--novel-cover": novel.coverColor } as CSSProperties}
                        >
                          <NotebookText size={18} />
                        </button>
                      ))
                    ) : (
                      <span className="creator-preview-empty">
                        <NotebookText size={20} />
                      </span>
                    )}
                  </div>
                  <div className="creator-discovery-meta">
                    <span>{formatCount(creator.followerCount)} followers</span>
                    <span>{formatCount(authorNovels.length)} novels</span>
                    {latestNovelAt ? <span>Active {dateFormat.format(new Date(latestNovelAt))}</span> : null}
                  </div>
                  <div className="creator-discovery-actions">
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => onOpenProfile(creator.handle)}
                    >
                      <UserRound size={16} />
                      Profile
                    </button>
                    <button
                      className={classNames("secondary-button", creator.following && "is-active")}
                      type="button"
                      onClick={() => onOpenProfile(creator.handle)}
                    >
                      <UserPlus size={16} />
                      {ownProfile ? "You" : creator.following ? "Following" : "Author"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      ) : isTagSection ? (
        <div className="tag-row novel-tag-browser" aria-live="polite" aria-label="Novel tags">
          {(data?.tags ?? []).map((tag) => (
            <span className="tag-control novel-tag-control" key={tag.name}>
              <button
                className={classNames("tag-pill novel-tag-pill", activeTag === tag.name && "is-active")}
                type="button"
                onClick={() => {
                  onTagFilterChange(activeTag === tag.name ? "" : tag.name);
                  onOpenSection("novels");
                }}
              >
                #{tag.name}
                <span>{formatCount(tag.count)}</span>
              </button>
              <span className="tag-follow-button is-active" aria-label={`Following #${tag.name}`}>
                <Bell size={13} />
              </span>
            </span>
          ))}
        </div>
      ) : isCollectionSection ? (
        <>
          <div className="collection-discovery-toolbar">
            <form className="collection-discovery-search novel-collection-search" onSubmit={handleShelfSearchSubmit}>
              <Search size={18} />
              <input
                value={shelfSearchInput}
                onChange={(event) => setShelfSearchInput(event.target.value)}
                placeholder="Search shelves"
                type="search"
                disabled={!currentUser}
              />
              <button className="secondary-button" type={currentUser ? "submit" : "button"} onClick={currentUser ? undefined : onAuthRequired}>
                {currentUser ? "Search" : "Sign in"}
              </button>
            </form>
            <div className="mini-segmented" aria-label="Reading shelf view">
              {collectionDiscoverySortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    className={classNames(shelfSort === option.value && "is-active")}
                    type="button"
                    key={option.value}
                    onClick={() => setShelfSort(option.value)}
                    disabled={!currentUser}
                  >
                    <Icon size={15} />
                    {option.value === "largest" ? "Largest" : "Updated"}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="collection-folder-grid collection-discovery-grid novel-collection-grid" aria-live="polite">
            {visibleCollections.map((collection) => (
              <article className="collection-discovery-item novel-collection-item" key={collection.id}>
                <button
                  className="collection-folder-card novel-shelf-card"
                  type="button"
                  onClick={() => onOpenCollection(collection.id)}
                >
                  <ReadingShelfPreview readingList={collection} />
                  <span>
                    <strong>{collection.title}</strong>
                    <small>
                      {formatCount(collection.novelCount)} novels · Updated{" "}
                      {dateFormat.format(new Date(collection.updatedAt))}
                    </small>
                  </span>
                  {collection.visibility === "public" ? <Eye size={16} /> : <Lock size={16} />}
                </button>
                <button
                  className="collection-owner-link"
                  type="button"
                  onClick={() => ownerHandle && onOpenProfile(ownerHandle)}
                  disabled={!ownerHandle}
                >
                  <span>{ownerDisplayName.slice(0, 1).toUpperCase()}</span>
                  <strong>{ownerDisplayName}</strong>
                  <small>{ownerHandle ? `@${ownerHandle}` : "Private library"}</small>
                </button>
              </article>
            ))}
          </div>
        </>
      ) : isRankingsSection ? (
        <>
          <div className="ranking-grid novel-ranking-grid" aria-live="polite">
            {rankingItems.map(({ novel, score }, index) => (
              <article className="ranking-card novel-ranking-card" key={novel.id}>
                <div className="ranking-card-rank">
                  <Trophy size={18} />
                  #{index + 1}
                  <span>{formatCount(score || novel.likeCount)} reads</span>
                </div>
                <NovelCard
                  novel={novel}
                  index={index}
                  rankingPosition={index + 1}
                  onOpenNovel={onOpenNovel}
                  onOpenProfile={onOpenProfile}
                />
              </article>
            ))}
          </div>
          {rankingItems.length === 0 && sectionNovels.length > 0 ? (
            <div className="ranking-grid novel-ranking-grid" aria-live="polite">
              {sectionNovels.map((novel, index) => (
                <article className="ranking-card novel-ranking-card" key={novel.id}>
                  <div className="ranking-card-rank">
                    <Trophy size={18} />
                    #{index + 1}
                    <span>{formatCount(novel.likeCount)} likes</span>
                  </div>
                  <NovelCard
                    novel={novel}
                    index={index}
                    rankingPosition={index + 1}
                    onOpenNovel={onOpenNovel}
                    onOpenProfile={onOpenProfile}
                  />
                </article>
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <div className="novel-grid" aria-live="polite">
          {sectionNovels.map((novel, index) => (
            <NovelCard
              key={novel.id}
              novel={novel}
              index={index}
              onOpenNovel={onOpenNovel}
              onOpenProfile={onOpenProfile}
            />
          ))}
        </div>
      )}

      {!data ? <p className="empty-feed">Loading novels.</p> : null}
      {data && visibleCount === 0 ? (
        <div className="novel-empty-state">
          <span className="novel-empty-icon" aria-hidden="true">
            <EmptyIcon size={24} />
          </span>
          <div>
            <strong>{emptyTitle}</strong>
            <p>{emptyMessage}</p>
          </div>
          {isCollectionSection && !currentUser ? (
            <button className="secondary-button" type="button" onClick={onAuthRequired}>
              Sign in
            </button>
          ) : section !== "home" ? (
            <button className="secondary-button" type="button" onClick={() => onOpenSection("home")}>
              Latest novels
            </button>
          ) : null}
        </div>
      ) : null}
      </section>
      {novelRightRail}
    </>
  );
}

type NovelCardProps = {
  novel: Novel;
  index: number;
  rankingPosition?: number;
  onOpenNovel: (novelId: string) => void;
  onOpenProfile: (username: string) => void;
};

function NovelCard({ novel, index, rankingPosition, onOpenNovel, onOpenProfile }: NovelCardProps) {
  const novelPath = `/novels/${encodeURIComponent(novel.id)}`;
  return (
    <article
      className="novel-card"
      style={{ "--novel-cover": novel.coverColor, animationDelay: `${Math.min(index * 36, 260)}ms` } as CSSProperties}
    >
      {rankingPosition ? <span className="novel-rank-badge">#{rankingPosition}</span> : null}
      <a
        className="novel-card-main"
        href={novelPath}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
            return;
          }
          event.preventDefault();
          onOpenNovel(novel.id);
        }}
      >
        <span className="novel-spine" aria-hidden="true" />
        <span className="novel-card-content">
          <small>
            {novel.isDraft ? "Draft" : novelVisibilityLabel(novel.visibility)} · {novel.id}
          </small>
          <strong>{novel.title}</strong>
          <em>{novel.description || novel.excerpt}</em>
        </span>
      </a>
      <div className="novel-card-footer">
        <button className="creator-mini creator-mini-link" type="button" onClick={() => onOpenProfile(novel.creator.handle)}>
          {novel.creator.avatarUrl ? (
            <img src={novel.creator.avatarUrl} alt="" />
          ) : (
            <DefaultAvatar className="creator-mini-avatar" name={novel.creator.displayName} />
          )}
          <span>{novel.creator.displayName}</span>
        </button>
        <span>{novel.readMinutes} min</span>
      </div>
      <div className="novel-card-meta">
        <span>
          <Heart size={14} />
          {formatCount(novel.likeCount)}
        </span>
        <span>
          <Bookmark size={14} />
          {formatCount(novel.bookmarkCount)}
        </span>
        <span>
          <Eye size={14} />
          {formatCount(novel.viewCount)}
        </span>
        <span>{dateFormat.format(new Date(novel.createdAt))}</span>
      </div>
    </article>
  );
}

type NovelDetailPageProps = {
  detail: NovelResponse | null;
  loading: boolean;
  currentUser: AuthUser | null;
  siteKey: string;
  readingLists: ReadingList[];
  onBack: () => void;
  onAuthRequired: () => void;
  onLikeNovel: (novel: Novel) => void;
  onBookmarkNovel: (novel: Novel) => void;
  onExportNovel: (novel: Novel, format: NovelExportFormat) => void;
  onReportNovel: (
    novel: Novel,
    reason: ReportReason,
    details: string,
    turnstileToken: string
  ) => Promise<string>;
  onEditNovel: (novel: Novel) => void;
  onDeleteNovel: (novel: Novel) => void;
  onCreateReadingList: (title: string) => Promise<string>;
  onToggleReadingListNovel: (readingList: ReadingList, novel: Novel) => Promise<ReadingListNovelResponse>;
  onCommentNovel: (
    novel: Novel,
    body: string,
    turnstileToken: string,
    parentId?: string
  ) => Promise<string>;
  onUpdateNovelComment: (comment: Comment, body: string) => Promise<string>;
  onDeleteNovelComment: (comment: Comment) => void;
  onUpdateReadingProgress: (
    novel: Novel,
    lastPosition: number,
    scrollPercent: number
  ) => Promise<void>;
  onOpenNovel: (novelId: string) => void;
  onOpenProfile: (username: string) => void;
  onPrivacySecurity: () => void;
};

function NovelDetailPage({
  detail,
  loading,
  currentUser,
  siteKey,
  readingLists,
  onBack,
  onAuthRequired,
  onLikeNovel,
  onBookmarkNovel,
  onExportNovel,
  onReportNovel,
  onEditNovel,
  onDeleteNovel,
  onCreateReadingList,
  onToggleReadingListNovel,
  onCommentNovel,
  onUpdateNovelComment,
  onDeleteNovelComment,
  onUpdateReadingProgress,
  onOpenNovel,
  onOpenProfile,
  onPrivacySecurity
}: NovelDetailPageProps) {
  const [fontSize, setFontSize] = useState(18);
  const [pageIndex, setPageIndex] = useState(0);
  const [commentBody, setCommentBody] = useState("");
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);
  const [commentTurnstileToken, setCommentTurnstileToken] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentBody, setEditingCommentBody] = useState("");
  const [editingCommentSubmitting, setEditingCommentSubmitting] = useState(false);
  const [readingListTitle, setReadingListTitle] = useState("");
  const [readingListMessage, setReadingListMessage] = useState("");
  const [readingListSubmitting, setReadingListSubmitting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportTurnstileToken, setReportTurnstileToken] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const progressSaveTimerRef = useRef<number | null>(null);
  const commentGroups = useMemo(() => {
    const groups = new Map<string | null, Comment[]>();
    for (const comment of detail?.comments ?? []) {
      const key = comment.parentId ?? null;
      groups.set(key, [...(groups.get(key) ?? []), comment]);
    }
    return groups;
  }, [detail?.comments]);
  useEffect(() => {
    setReplyTarget(null);
    setCommentBody("");
    setCommentTurnstileToken("");
    setCommentMessage("");
    setEditingCommentId(null);
    setEditingCommentBody("");
    setReadingListMessage("");
    setReportOpen(false);
    setReportMessage("");
    setReportTurnstileToken("");
  }, [detail?.novel.id]);

  useEffect(
    () => () => {
      if (progressSaveTimerRef.current !== null) {
        window.clearTimeout(progressSaveTimerRef.current);
      }
    },
    []
  );
  const markdownHtml = useMemo(
    () =>
      detail?.novel.contentFormat === "markdown"
        ? renderNovelMarkdown(detail.novel.body)
        : "",
    [detail?.novel.body, detail?.novel.contentFormat]
  );

  if (!detail) {
    return (
      <section className="content-main novel-detail-page">
        <p className="empty-feed">{loading ? "Loading work." : "Work could not be loaded."}</p>
      </section>
    );
  }
  const novel = detail.novel;
  const paragraphs = novel.contentFormat === "markdown"
    ? []
    : novel.body.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const relatedNovels = detail.relatedNovels;
  const paragraphsPerPage = 12;
  const totalPages = novel.contentFormat === "markdown"
    ? 1
    : Math.max(1, Math.ceil(paragraphs.length / paragraphsPerPage));
  const safePageIndex = Math.min(pageIndex, totalPages - 1);
  const pageParagraphs = paragraphs.slice(
    safePageIndex * paragraphsPerPage,
    safePageIndex * paragraphsPerPage + paragraphsPerPage
  );
  const saveReadingProgress = (nextPageIndex = safePageIndex) => {
    if (!currentUser) {
      return;
    }
    const lastPosition =
      novel.contentFormat === "markdown"
        ? Math.min(novel.body.length, Math.max(0, Math.round((window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight)) * novel.body.length)))
        : Math.min(
            novel.body.length,
            paragraphs.slice(0, nextPageIndex * paragraphsPerPage).join("\n\n").length
          );
    const scrollPercent =
      novel.contentFormat === "markdown"
        ? Math.max(0, Math.min(100, (window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight)) * 100))
        : Math.max(0, Math.min(100, ((nextPageIndex + 1) / totalPages) * 100));
    if (progressSaveTimerRef.current !== null) {
      window.clearTimeout(progressSaveTimerRef.current);
    }
    progressSaveTimerRef.current = window.setTimeout(() => {
      void onUpdateReadingProgress(novel, lastPosition, scrollPercent).catch((error: unknown) => {
        console.error("Unable to save reading progress", error);
      });
    }, 500);
  };
  const handleCommentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (commentSubmitting) {
      return;
    }
    if (!commentTurnstileToken) {
      setCommentMessage("Complete the check first.");
      return;
    }
    setCommentMessage("");
    setCommentSubmitting(true);
    try {
      const message = await onCommentNovel(
        novel,
        commentBody,
        commentTurnstileToken,
        replyTarget?.id
      );
      setCommentBody("");
      setReplyTarget(null);
      setCommentTurnstileToken("");
      window.turnstile?.reset();
      setCommentMessage(message);
    } catch (error) {
      setCommentTurnstileToken("");
      window.turnstile?.reset();
      setCommentMessage(error instanceof Error ? error.message : "Unable to post comment.");
    } finally {
      setCommentSubmitting(false);
    }
  };
  const handleNovelReportSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (reportSubmitting) {
      return;
    }
    if (!currentUser) {
      onAuthRequired();
      return;
    }
    if (!reportTurnstileToken) {
      setReportMessage("Complete the check first.");
      return;
    }
    setReportSubmitting(true);
    setReportMessage("");
    try {
      const message = await onReportNovel(novel, reportReason, reportDetails, reportTurnstileToken);
      setReportOpen(false);
      setReportDetails("");
      setReportTurnstileToken("");
      window.turnstile?.reset();
      setReportMessage(message);
    } catch (error) {
      setReportMessage(error instanceof Error ? error.message : "Unable to submit report.");
      setReportTurnstileToken("");
      window.turnstile?.reset();
    } finally {
      setReportSubmitting(false);
    }
  };
  const handleCreateReadingListSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (readingListSubmitting) {
      return;
    }
    setReadingListSubmitting(true);
    setReadingListMessage("");
    try {
      const message = await onCreateReadingList(readingListTitle);
      setReadingListTitle("");
      setReadingListMessage(message);
    } catch (error) {
      setReadingListMessage(error instanceof Error ? error.message : "Unable to create reading shelf.");
    } finally {
      setReadingListSubmitting(false);
    }
  };
  const handleToggleReadingList = async (readingList: ReadingList) => {
    if (readingListSubmitting) {
      return;
    }
    setReadingListSubmitting(true);
    setReadingListMessage("");
    try {
      const payload = await onToggleReadingListNovel(readingList, novel);
      setReadingListMessage(payload.message);
    } catch (error) {
      setReadingListMessage(error instanceof Error ? error.message : "Unable to update reading shelf.");
    } finally {
      setReadingListSubmitting(false);
    }
  };
  const handleCommentEditSubmit = async (
    event: FormEvent<HTMLFormElement>,
    comment: Comment
  ) => {
    event.preventDefault();
    if (editingCommentSubmitting) {
      return;
    }
    setCommentMessage("");
    setEditingCommentSubmitting(true);
    try {
      const message = await onUpdateNovelComment(comment, editingCommentBody);
      setEditingCommentId(null);
      setEditingCommentBody("");
      setCommentMessage(message);
    } catch (error) {
      setCommentMessage(error instanceof Error ? error.message : "Unable to update comment.");
    } finally {
      setEditingCommentSubmitting(false);
    }
  };
  const renderComment = (comment: Comment, depth = 0): ReactNode => {
    const children = commentGroups.get(comment.id) ?? [];
    return (
      <div className="comment-thread" key={comment.id}>
        <div className="comment-row" style={{ marginLeft: `${Math.min(depth, 3) * 18}px` }}>
          <div className="comment-row-heading">
            <strong>{comment.author}</strong>
            <div className="comment-row-actions">
              {comment.updatedAt ? <span className="comment-edited">edited</span> : null}
              {currentUser ? (
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    setReplyTarget(comment);
                    setEditingCommentId(null);
                  }}
                >
                  Reply
                </button>
              ) : null}
              {currentUser?.id === comment.authorId ? (
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    setEditingCommentId(comment.id);
                    setEditingCommentBody(comment.body);
                    setReplyTarget(null);
                  }}
                >
                  Edit
                </button>
              ) : null}
              {comment.canManage ? (
                <button
                  className="text-button"
                  type="button"
                  onClick={() => onDeleteNovelComment(comment)}
                >
                  Delete
                </button>
              ) : null}
            </div>
          </div>
          {editingCommentId === comment.id ? (
            <form
              className="comment-form inline-comment-form"
              onSubmit={(event) => void handleCommentEditSubmit(event, comment)}
            >
              <textarea
                value={editingCommentBody}
                maxLength={800}
                rows={3}
                onChange={(event) => setEditingCommentBody(event.target.value)}
                required
              />
              <div className="settings-actions">
                <button className="secondary-button" type="submit" disabled={editingCommentSubmitting}>
                  {editingCommentSubmitting ? "Saving" : "Save"}
                </button>
                <button className="text-button" type="button" onClick={() => setEditingCommentId(null)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p>{comment.body}</p>
          )}
        </div>
        {children.map((child) => renderComment(child, depth + 1))}
      </div>
    );
  };

  return (
    <article className="content-main novel-detail-page">
      <MatureAccessNotice matureAccess={detail?.matureAccess ?? null} onLogin={onAuthRequired} onPrivacySecurity={onPrivacySecurity} />
      <header className="novel-detail-hero" style={{ "--novel-cover": novel.coverColor } as CSSProperties}>
        <button className="secondary-button novel-back-button" type="button" onClick={onBack}>
          <ChevronUp size={16} />
          Back
        </button>
        <div className="novel-detail-title">
          <p className="eyebrow">{novel.id}</p>
          <h1>{novel.title}</h1>
          <p>{novel.excerpt}</p>
          <button className="creator-mini creator-mini-link novel-author-link" type="button" onClick={() => onOpenProfile(novel.creator.handle)}>
            {novel.creator.avatarUrl ? (
              <img src={novel.creator.avatarUrl} alt="" />
            ) : (
              <DefaultAvatar className="creator-mini-avatar" name={novel.creator.displayName} />
            )}
            <span>{novel.creator.displayName}</span>
          </button>
        </div>
        <div className="novel-detail-metrics" aria-label="Metrics">
          <span>
            <strong>{formatCount(novel.wordCount)}</strong>
            words
          </span>
          <span>
            <strong>{novel.readMinutes}</strong>
            min
          </span>
          <span>
            <strong>{formatCount(novel.viewCount)}</strong>
            views
          </span>
          <span>
            <strong>{formatCount(novel.commentCount)}</strong>
            comments
          </span>
        </div>
        <div className="novel-action-row">
          <button
            className={classNames("primary-button", novel.liked && "is-active")}
            type="button"
            onClick={() => onLikeNovel(novel)}
          >
            <Heart size={17} fill={novel.liked ? "currentColor" : "none"} />
            {formatCount(novel.likeCount)}
          </button>
          <button
            className={classNames("secondary-button", novel.bookmarked && "is-active")}
            type="button"
            onClick={() => onBookmarkNovel(novel)}
          >
            <Bookmark size={17} fill={novel.bookmarked ? "currentColor" : "none"} />
            {novel.bookmarked ? "Bookmarked" : "Bookmark"}
            <span>{formatCount(novel.bookmarkCount)}</span>
          </button>
          <div className="novel-export-group" aria-label="Export novel">
            {(["markdown", "epub", "pdf"] as NovelExportFormat[]).map((format) => (
              <button
                className="secondary-button"
                key={format}
                type="button"
                onClick={() => onExportNovel(novel, format)}
              >
                <Download size={15} />
                {format.toUpperCase()}
              </button>
            ))}
          </div>
          {currentUser?.id !== novel.creator.id ? (
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                if (!currentUser) {
                  onAuthRequired();
                  return;
                }
                setReportOpen((value) => !value);
                setReportMessage("");
                setReportTurnstileToken("");
              }}
            >
              <Flag size={16} />
              Report
            </button>
          ) : null}
        </div>
        {reportMessage ? <p className="auth-inline-message">{reportMessage}</p> : null}
        {reportOpen ? (
          <form className="report-form novel-report-form" onSubmit={handleNovelReportSubmit}>
            <label>
              Reason
              <select
                value={reportReason}
                onChange={(event) => setReportReason(event.target.value as ReportReason)}
              >
                {reportReasonOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Details
              <textarea
                value={reportDetails}
                maxLength={800}
                rows={3}
                onChange={(event) => setReportDetails(event.target.value)}
                placeholder="Optional context for moderators"
              />
            </label>
            <TurnstileWidget siteKey={siteKey} action="report" onToken={setReportTurnstileToken} compact />
            <div className="settings-actions">
              <button className="danger-button" type="submit" disabled={reportSubmitting}>
                <Flag size={15} />
                {reportSubmitting ? "Submitting" : "Submit report"}
              </button>
              <button className="secondary-button" type="button" onClick={() => setReportOpen(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : null}
        {novel.canManage ? (
          <div className="novel-manage-actions">
            <button className="secondary-button" type="button" onClick={() => onEditNovel(novel)}>
              <Pencil size={15} />
              Edit
            </button>
            <button className="secondary-button" type="button" onClick={() => onDeleteNovel(novel)}>
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        ) : null}
      </header>

      <div className="novel-reading-layout">
        <div className="novel-body" style={{ fontSize }}>
          <div className="novel-reader-controls" aria-label="Reader controls">
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                const nextPageIndex = Math.max(0, safePageIndex - 1);
                setPageIndex(nextPageIndex);
                saveReadingProgress(nextPageIndex);
              }}
              disabled={safePageIndex === 0}
            >
              Previous
            </button>
            <span>
              {novel.contentFormat === "markdown" ? "Markdown" : `Page ${safePageIndex + 1} / ${totalPages}`}
            </span>
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                const nextPageIndex = Math.min(totalPages - 1, safePageIndex + 1);
                setPageIndex(nextPageIndex);
                saveReadingProgress(nextPageIndex);
              }}
              disabled={safePageIndex >= totalPages - 1}
              hidden={novel.contentFormat === "markdown"}
            >
              Next
            </button>
            <label>
              Font
              <input
                type="range"
                min={15}
                max={24}
                value={fontSize}
                onChange={(event) => {
                  setFontSize(Number(event.target.value));
                  saveReadingProgress();
                }}
              />
            </label>
            {currentUser ? (
              <button className="secondary-button" type="button" onClick={() => saveReadingProgress()}>
                <Bookmark size={15} />
                Save place
              </button>
            ) : null}
          </div>
          {novel.contentFormat === "markdown" ? (
            <div
              className="novel-markdown-body"
              dangerouslySetInnerHTML={{ __html: markdownHtml }}
            />
          ) : (
            pageParagraphs.map((paragraph, index) => <p key={`${novel.id}-${index}`}>{paragraph}</p>)
          )}
        </div>
        <aside className="novel-detail-side">
          <section className="side-panel">
            <div className="panel-title">
              <NotebookText size={18} />
              Story tags
            </div>
            <div className="tag-row novel-detail-tags">
              {novel.tags.map((tag) => (
                <span className="tag-pill novel-tag-pill" key={tag}>
                  #{tag}
                </span>
              ))}
            </div>
          </section>
          {novel.toc.length > 0 ? (
            <section className="side-panel">
              <div className="panel-title">
                <ListOrdered size={18} />
                Contents
              </div>
              <div className="novel-toc">
                {novel.toc.map((item) => (
                  <button
                    className="novel-toc-item"
                    key={item.id}
                    type="button"
                    style={{ paddingLeft: `${(item.level - 1) * 10 + 12}px` }}
                    onClick={() => {
                      document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            </section>
          ) : null}
          {currentUser ? (
            <section className="side-panel">
              <div className="panel-title">
                <FolderOpen size={18} />
                Reading shelves
              </div>
              <form className="novel-shelf-form" onSubmit={(event) => void handleCreateReadingListSubmit(event)}>
                <input
                  value={readingListTitle}
                  maxLength={80}
                  onChange={(event) => setReadingListTitle(event.target.value)}
                  placeholder="New shelf"
                />
                <button className="secondary-button" type="submit" disabled={readingListSubmitting}>
                  Add
                </button>
              </form>
              <div className="novel-shelf-list">
                {readingLists.map((readingList) => {
                  const saved = readingList.novelIds.includes(novel.id);
                  return (
                    <button
                      className={classNames("novel-shelf-row", saved && "is-active")}
                      key={readingList.id}
                      type="button"
                      onClick={() => void handleToggleReadingList(readingList)}
                      disabled={readingListSubmitting}
                    >
                      <span>{readingList.title}</span>
                      <small>{formatCount(readingList.novelCount)}</small>
                    </button>
                  );
                })}
              </div>
              {readingListMessage ? <p className="auth-inline-message">{readingListMessage}</p> : null}
            </section>
          ) : null}
          {relatedNovels.length ? (
            <section className="side-panel">
              <div className="panel-title">
                <Sparkles size={18} />
                Related
              </div>
              {relatedNovels.map((relatedNovel) => (
                <button
                  className="novel-mini-row"
                  key={relatedNovel.id}
                  type="button"
                  onClick={() => onOpenNovel(relatedNovel.id)}
                >
                  <span style={{ background: relatedNovel.coverColor }} />
                  <strong>{relatedNovel.title}</strong>
                  <small>{relatedNovel.readMinutes} min</small>
                </button>
              ))}
            </section>
          ) : null}
        </aside>
      </div>
      <section className="side-panel novel-comment-panel">
        <div className="panel-title">
          <MessageCircle size={18} />
          Comments
        </div>
        {currentUser ? (
          <form className="comment-form" onSubmit={(event) => void handleCommentSubmit(event)}>
            {replyTarget ? (
              <div className="reply-target">
                Replying to {replyTarget.author}
                <button className="text-button" type="button" onClick={() => setReplyTarget(null)}>
                  Cancel
                </button>
              </div>
            ) : null}
            <textarea
              value={commentBody}
              maxLength={800}
              rows={3}
              onChange={(event) => setCommentBody(event.target.value)}
              placeholder={replyTarget ? "Add a reply" : "Add a comment"}
              required
            />
            <TurnstileWidget
              siteKey={siteKey}
              action="comment"
              onToken={setCommentTurnstileToken}
              compact
            />
            <button className="secondary-button" type="submit" disabled={commentSubmitting}>
              <MessageCircle size={16} />
              {commentSubmitting ? "Posting" : "Post"}
            </button>
          </form>
        ) : (
          <button className="secondary-button" type="button" onClick={onAuthRequired}>
            <LogIn size={16} />
            Sign in to comment
          </button>
        )}
        {commentMessage ? <p className="auth-inline-message">{commentMessage}</p> : null}
        <div className="comment-list">
          {(commentGroups.get(null) ?? []).map((comment) => renderComment(comment))}
          {detail.comments.length === 0 ? <p className="muted">No comments yet.</p> : null}
        </div>
      </section>
    </article>
  );
}

type IllustrationsPageProps = {
  gallery: GalleryResponse | null;
  activityData: ActivityResponse | null;
  artworks: Artwork[];
  creators: Creator[];
  prominentTags: GalleryResponse["tags"];
  subscribedTagSet: Set<string>;
  rankingItems: RankingResponse["rankings"];
  rankingPeriod: RankingPeriod;
  matureFilter: MatureFilter;
  feedTitle: string;
  feedMeta: string;
  filterLabel: string;
  galleryLoadingMore: boolean;
  isBookmarksView: boolean;
  onAuthRequired: () => void;
  onPrivacySecurity: () => void;
  onMatureFilterChange: (filter: MatureFilter) => void;
  onResetFilters: () => void;
  onOpenTag: (tag: string) => void;
  onToggleTagSubscription: (tag: string) => void;
  onOpenArtwork: (artwork: Artwork) => void;
  onOpenArtworkPage: (artwork: Artwork) => void;
  onOpenNovel: (novelId: string) => void;
  onBookmark: (artwork: Artwork, visibility?: BookmarkVisibility) => void;
  onOpenProfile: (username: string) => void;
  onLoadMore: () => void;
  onRankingPeriodChange: (period: RankingPeriod) => void;
};

function IllustrationsPage({
  gallery,
  activityData,
  artworks,
  creators,
  prominentTags,
  subscribedTagSet,
  rankingItems,
  rankingPeriod,
  matureFilter,
  feedTitle,
  feedMeta,
  filterLabel,
  galleryLoadingMore,
  isBookmarksView,
  onAuthRequired,
  onPrivacySecurity,
  onMatureFilterChange,
  onResetFilters,
  onOpenTag,
  onToggleTagSubscription,
  onOpenArtwork,
  onOpenArtworkPage,
  onOpenNovel,
  onBookmark,
  onOpenProfile,
  onLoadMore,
  onRankingPeriodChange
}: IllustrationsPageProps) {
  return (
    <>
      <section className="feed-main">
        <MatureAccessNotice
          matureAccess={gallery?.matureAccess ?? null}
          onLogin={onAuthRequired}
          onPrivacySecurity={onPrivacySecurity}
        />
        <div className="section-heading">
          <div>
            <h1>{feedTitle}</h1>
            <p>{feedMeta}</p>
          </div>
          <div className="feed-controls">
            <label className="rating-filter">
              <Shield size={15} />
              <select
                value={matureFilter}
                onChange={(event) => onMatureFilterChange(event.target.value as MatureFilter)}
              >
                {matureFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button className="filter-chip" type="button" onClick={onResetFilters}>
              {filterLabel}
              <ChevronDown size={15} />
            </button>
          </div>
        </div>

        <div className="tag-row" aria-label="Popular tags">
          {prominentTags.map((tag) => {
            const subscribed = subscribedTagSet.has(tag.name.toLowerCase());
            return (
              <span className="tag-control" key={tag.name}>
                <button className="tag-pill" type="button" onClick={() => onOpenTag(tag.name)}>
                  #{tag.name}
                  <span>{tag.count}</span>
                </button>
                <button
                  className={classNames("tag-follow-button", subscribed && "is-active")}
                  type="button"
                  aria-label={`${subscribed ? "Unfollow" : "Follow"} #${tag.name}`}
                  onClick={() => onToggleTagSubscription(tag.name)}
                >
                  <Bell size={13} />
                </button>
              </span>
            );
          })}
        </div>

        <div className="art-grid" aria-live="polite">
          {artworks.map((artwork, index) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              index={index}
              onSelect={onOpenArtwork}
              onOpenPage={onOpenArtworkPage}
              onBookmark={onBookmark}
              onOpenProfile={onOpenProfile}
            />
          ))}
        </div>
        {gallery?.nextCursor ? (
          <div className="load-more-row">
            <button
              className="secondary-button"
              type="button"
              onClick={onLoadMore}
              disabled={galleryLoadingMore}
            >
              {galleryLoadingMore ? "Loading" : "Load more"}
              <span>
                {formatCount(artworks.length)} / {formatCount(gallery.totalCount)}
              </span>
            </button>
          </div>
        ) : null}
        {artworks.length === 0 ? (
          <p className="empty-feed">
            {isBookmarksView
              ? "Bookmarked works will appear here after you save them."
              : "No artwork matches this view yet."}
          </p>
        ) : null}
      </section>

      <aside className="right-rail" aria-label="Recommendations">
        <section className="side-panel ranking-panel">
          <div className="panel-title ranking-title">
            <span>
              <Trophy size={18} />
              Ranking
            </span>
            <div className="mini-segmented" aria-label="Ranking period">
              {(["daily", "weekly"] as RankingPeriod[]).map((period) => (
                <button
                  className={classNames(rankingPeriod === period && "is-active")}
                  key={period}
                  type="button"
                  onClick={() => onRankingPeriodChange(period)}
                >
                  {period === "daily" ? "Day" : "Week"}
                </button>
              ))}
            </div>
          </div>
          {rankingItems.slice(0, 5).map(({ artwork, score }, index) => (
            <button
              className="ranking-row"
              key={artwork.id}
              type="button"
              onClick={() => onOpenArtwork(artwork)}
            >
              <span className="rank-number">{index + 1}</span>
              <img src={artwork.thumbnailUrl} alt="" loading="lazy" decoding="async" />
              <span>
                <strong>{artwork.title}</strong>
                <small>{formatCount(score || artwork.likeCount)} recent likes</small>
              </span>
            </button>
          ))}
          {rankingItems.length === 0 ? <p className="muted">No ranked works yet.</p> : null}
        </section>

        <ActivityPanel
          data={activityData}
          onOpenArtwork={onOpenArtwork}
          onOpenNovel={onOpenNovel}
          onOpenProfile={onOpenProfile}
        />

        <section className="side-panel creator-panel">
          <div className="panel-title">
            <ShieldCheck size={18} />
            Recommended users
          </div>
          {creators.slice(0, 5).map((creator) => (
            <button
              className="creator-row creator-row-link"
              key={creator.id}
              type="button"
              onClick={() => onOpenProfile(creator.handle)}
            >
              {creator.avatarUrl ? (
                <img src={creator.avatarUrl} alt="" />
              ) : (
                <DefaultAvatar
                  className="creator-row-avatar-fallback"
                  name={creator.displayName}
                />
              )}
              <div>
                <strong>{creator.displayName}</strong>
                <span>@{creator.handle}</span>
              </div>
              <span className="icon-button creator-row-icon" aria-label={`Open ${creator.displayName}`}>
                <UserPlus size={15} />
              </span>
            </button>
          ))}
        </section>
      </aside>
    </>
  );
}

type ArtworkCardProps = {
  artwork: Artwork;
  index: number;
  onSelect: (artwork: Artwork) => void;
  onOpenPage?: (artwork: Artwork) => void;
  onBookmark: (artwork: Artwork, visibility?: BookmarkVisibility) => void;
  onOpenProfile: (username: string) => void;
};

function ArtworkCard({
  artwork,
  index,
  onSelect,
  onOpenPage,
  onBookmark,
  onOpenProfile
}: ArtworkCardProps) {
  const artworkPath = `/artworks/${encodeURIComponent(artwork.id)}`;

  return (
    <article
      className="art-card"
      style={{ animationDelay: `${Math.min(index * 26, 220)}ms` }}
    >
      <button
        className="image-button"
        type="button"
        onClick={() => onSelect(artwork)}
        aria-label={`Open ${artwork.title}`}
      >
        <img
          src={artwork.thumbnailUrl}
          alt={artwork.title}
          loading="lazy"
          decoding="async"
        />
        {artwork.images.length > 1 ? (
          <span className="image-count-badge">
            <Grid3X3 size={13} />
            {artwork.images.length}
          </span>
        ) : null}
        {artwork.matureRating !== "general" ? (
          <span className={classNames("rating-badge", `is-${artwork.matureRating}`)}>
            {matureRatingLabel(artwork.matureRating)}
          </span>
        ) : null}
        {artwork.visibility !== "public" ? (
          <span className={classNames("rating-badge", `is-${artwork.visibility}`)}>
            {artworkVisibilityLabel(artwork.visibility)}
          </span>
        ) : null}
        {artwork.reviewStatus !== "approved" ? (
          <span className={classNames("rating-badge", `is-review-${artwork.reviewStatus}`)}>
            {artwork.reviewStatus}
          </span>
        ) : null}
      </button>
      <div className="art-card-body">
        <a
          className="art-title-button"
          href={artworkPath}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
              return;
            }
            event.preventDefault();
            if (onOpenPage) {
              onOpenPage(artwork);
              return;
            }
            if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== artworkPath) {
              window.history.pushState(null, "", artworkPath);
            }
            window.dispatchEvent(new Event("popstate"));
          }}
        >
          {artwork.title}
        </a>
        <button className="creator-mini creator-mini-link" type="button" onClick={() => onOpenProfile(artwork.creator.handle)}>
          {artwork.creator.avatarUrl ? (
            <img src={artwork.creator.avatarUrl} alt="" />
          ) : (
            <DefaultAvatar className="creator-mini-avatar" name={artwork.creator.displayName} />
          )}
          <span>{artwork.creator.displayName}</span>
        </button>
      </div>
      <div className="art-stats">
        <span>
          <Heart size={14} fill={artwork.liked ? "currentColor" : "none"} />
          {formatCount(artwork.likeCount)}
        </span>
        <span>
          <Bookmark size={14} />
          {formatCount(artwork.bookmarkCount)}
        </span>
        <span>
          <Eye size={14} />
          {formatCount(artwork.viewCount)}
        </span>
        <button
          className={classNames("bookmark-button", artwork.bookmarked && "is-active")}
          type="button"
          onClick={() => onBookmark(artwork, artwork.bookmarked ? undefined : "public")}
          aria-label={artwork.bookmarked ? `Remove bookmark ${artwork.title}` : `Bookmark ${artwork.title}`}
        >
          <Bookmark size={15} fill={artwork.bookmarked ? "currentColor" : "none"} />
        </button>
      </div>
    </article>
  );
}

type StatusLineProps = {
  label: string;
  value: string;
  active: boolean;
};

function StatusLine({ label, value, active }: StatusLineProps) {
  return (
    <div className="status-line">
      <span>{label}</span>
      <strong className={active ? "is-active" : ""}>{value}</strong>
    </div>
  );
}

type ArtworkDialogProps = {
  detail: ArtworkResponse | null;
  fallbackArtwork: Artwork;
  loading: boolean;
  presentation?: "modal" | "page";
  currentUser: AuthUser | null;
  matureAccess: MatureAccess | null;
  onClose: () => void;
  onLike: (artwork: Artwork) => void;
  onBookmark: (artwork: Artwork, visibility?: BookmarkVisibility) => void;
  onDelete: (artwork: Artwork) => void;
  onUpdate: (artwork: Artwork, input: ArtworkEditInput) => Promise<string>;
  onReorderImages: (artwork: Artwork, imageIds: string[]) => Promise<string>;
  onDeleteImage: (artwork: Artwork, imageId: string) => Promise<string>;
  onAddImages: (artwork: Artwork, files: File[]) => Promise<string>;
  onUnlockStorageSlot: () => Promise<string>;
  storageUnlocking: boolean;
  onOpenArtwork: (artwork: Artwork) => void;
  onComment: (
    artwork: Artwork,
    body: string,
    turnstileToken: string,
    parentId?: string
  ) => Promise<string>;
  onUpdateComment: (comment: Comment, body: string) => Promise<string>;
  onDeleteComment: (comment: Comment) => void;
  onReportArtwork: (
    artwork: Artwork,
    reason: ReportReason,
    details: string,
    turnstileToken: string
  ) => Promise<string>;
  onReportComment: (
    comment: Comment,
    reason: ReportReason,
    details: string,
    turnstileToken: string
  ) => Promise<string>;
  collections: UserCollection[];
  onCreateCollection: (name: string) => Promise<string>;
  onOpenCollection: (collectionId: string) => void;
  onToggleCollectionItem: (collection: UserCollection, artwork: Artwork) => Promise<string>;
  seriesList: ArtworkSeries[];
  onCreateSeries: (title: string) => Promise<string>;
  onOpenSeries: (seriesId: string) => void;
  onToggleSeriesItem: (series: ArtworkSeries, artwork: Artwork) => Promise<string>;
  siteKey: string;
  onOpenProfile: (username: string) => void;
};

function ArtworkDialog({
  detail,
  fallbackArtwork,
  loading,
  presentation = "modal",
  currentUser,
  matureAccess,
  onClose,
  onLike,
  onBookmark,
  onDelete,
  onUpdate,
  onReorderImages,
  onDeleteImage,
  onAddImages,
  onUnlockStorageSlot,
  storageUnlocking,
  onOpenArtwork,
  onComment,
  onUpdateComment,
  onDeleteComment,
  onReportArtwork,
  onReportComment,
  collections,
  onCreateCollection,
  onOpenCollection,
  onToggleCollectionItem,
  seriesList,
  onCreateSeries,
  onOpenSeries,
  onToggleSeriesItem,
  siteKey,
  onOpenProfile
}: ArtworkDialogProps) {
  const artwork = detail?.artwork ?? fallbackArtwork;
  const [commentBody, setCommentBody] = useState("");
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);
  const [commentMessage, setCommentMessage] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentTurnstileToken, setCommentTurnstileToken] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentBody, setEditingCommentBody] = useState("");
  const [editingCommentSubmitting, setEditingCommentSubmitting] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [collectionMessage, setCollectionMessage] = useState("");
  const [collectionSubmitting, setCollectionSubmitting] = useState(false);
  const [seriesTitle, setSeriesTitle] = useState("");
  const [seriesMessage, setSeriesMessage] = useState("");
  const [seriesSubmitting, setSeriesSubmitting] = useState(false);
  const [reportingTarget, setReportingTarget] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<ReportReason>("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportTurnstileToken, setReportTurnstileToken] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const imageAddInputRef = useRef<HTMLInputElement | null>(null);
  const artworkImages = artwork.images.length
    ? artwork.images
    : [
        {
          id: `${artwork.id}_cover`,
          imageUrl: artwork.imageUrl,
          thumbnailUrl: artwork.thumbnailUrl,
          width: artwork.width,
          height: artwork.height,
          dominantColor: artwork.dominantColor,
          position: 0
        }
      ];
  const artworkImageKey = artworkImages.map((image) => image.id).join("|");
  const [editForm, setEditForm] = useState<ArtworkEditInput>({
    title: artwork.title,
    caption: artwork.caption,
    tags: artwork.tags.join(", "),
    matureRating: artwork.matureRating,
    visibility: artwork.visibility
  });
  const [imageOrder, setImageOrder] = useState<string[]>(() =>
    artworkImages.map((image) => image.id)
  );
  const [imageOrderSubmitting, setImageOrderSubmitting] = useState(false);
  const [imageDeleteSubmitting, setImageDeleteSubmitting] = useState<string | null>(null);
  const [imageAddFiles, setImageAddFiles] = useState<File[]>([]);
  const [imageAddSubmitting, setImageAddSubmitting] = useState(false);
  const imageOrderChanged = imageOrder.join("|") !== artworkImageKey;
  const ownsArtwork = Boolean(currentUser && currentUser.id === artwork.creator.id);
  const accountStorage = ownsArtwork ? currentUser?.storage ?? null : null;
  const artworkRemainingImageSlots = Math.max(0, 8 - artworkImages.length);
  const remainingImageSlots = Math.max(
    0,
    Math.min(artworkRemainingImageSlots, accountStorage?.remainingImages ?? artworkRemainingImageSlots)
  );
  const canUnlockStorageSlot = Boolean(
    accountStorage && accountStorage.siteCredits >= accountStorage.creditsPerSlot
  );
  const imageAddLabel =
    imageAddFiles.length === 0
      ? "Choose pages"
      : imageAddFiles.length === 1
        ? imageAddFiles[0]?.name ?? "1 page selected"
        : `${imageAddFiles.length} pages selected`;
  const imageMutationSubmitting =
    imageOrderSubmitting || Boolean(imageDeleteSubmitting) || imageAddSubmitting;
  const orderedEditImages = imageOrder
    .map((imageId) => artworkImages.find((image) => image.id === imageId))
    .filter((image): image is (typeof artworkImages)[number] => Boolean(image));
  const relatedArtworks = detail?.relatedArtworks ?? [];
  const canManageArtwork =
    Boolean(currentUser && currentUser.id === artwork.creator.id) ||
    currentUser?.role === "admin";
  const canManageSeriesForArtwork = Boolean(currentUser && currentUser.id === artwork.creator.id);
  const canSelectMatureRating =
    matureAccess?.allowed || editForm.matureRating !== "general";
  const editTags = parseTagListInput(editForm.tags);
  const canReportArtwork = !currentUser || currentUser.id !== artwork.creator.id;
  const commentGroups = useMemo(() => {
    const groups = new Map<string | null, Comment[]>();
    for (const comment of detail?.comments ?? []) {
      const key = comment.parentId ?? null;
      groups.set(key, [...(groups.get(key) ?? []), comment]);
    }
    return groups;
  }, [detail?.comments]);

  useEffect(() => {
    setEditing(false);
    setEditMessage("");
    setReplyTarget(null);
    setCommentTurnstileToken("");
    setEditingCommentId(null);
    setEditingCommentBody("");
    setCollectionMessage("");
    setSeriesMessage("");
    setReportingTarget(null);
    setReportMessage("");
    setReportTurnstileToken("");
    setEditForm({
      title: artwork.title,
      caption: artwork.caption,
      tags: artwork.tags.join(", "),
      matureRating: artwork.matureRating,
      visibility: artwork.visibility
    });
    setImageOrder(artworkImages.map((image) => image.id));
    setImageDeleteSubmitting(null);
    setImageAddFiles([]);
    if (imageAddInputRef.current) {
      imageAddInputRef.current.value = "";
    }
  }, [
    artwork.caption,
    artwork.id,
    artwork.matureRating,
    artwork.tags,
    artwork.title,
    artwork.visibility,
    artworkImageKey
  ]);

  const handleCommentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (commentSubmitting) {
      return;
    }
    setCommentMessage("");
    if (!commentTurnstileToken) {
      setCommentMessage("Complete the check first.");
      return;
    }
    setCommentSubmitting(true);
    try {
      const message = await onComment(
        artwork,
        commentBody,
        commentTurnstileToken,
        replyTarget?.id
      );
      setCommentBody("");
      setReplyTarget(null);
      setCommentTurnstileToken("");
      window.turnstile?.reset();
      setCommentMessage(message);
    } catch (error) {
      setCommentMessage(error instanceof Error ? error.message : "Unable to post comment.");
      setCommentTurnstileToken("");
      window.turnstile?.reset();
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleCommentEditSubmit = async (
    event: FormEvent<HTMLFormElement>,
    comment: Comment
  ) => {
    event.preventDefault();
    if (editingCommentSubmitting) {
      return;
    }
    setCommentMessage("");
    setEditingCommentSubmitting(true);
    try {
      const message = await onUpdateComment(comment, editingCommentBody);
      setEditingCommentId(null);
      setEditingCommentBody("");
      setCommentMessage(message);
    } catch (error) {
      setCommentMessage(error instanceof Error ? error.message : "Unable to update comment.");
    } finally {
      setEditingCommentSubmitting(false);
    }
  };

  const startCommentEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentBody(comment.body);
    setReplyTarget(null);
    setReportMessage("");
  };

  const handleCreateCollectionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (collectionSubmitting) {
      return;
    }
    setCollectionMessage("");
    setCollectionSubmitting(true);
    try {
      const message = await onCreateCollection(collectionName);
      setCollectionName("");
      setCollectionMessage(message);
    } catch (error) {
      setCollectionMessage(error instanceof Error ? error.message : "Unable to create collection.");
    } finally {
      setCollectionSubmitting(false);
    }
  };

  const handleToggleCollection = async (collection: UserCollection) => {
    if (collectionSubmitting) {
      return;
    }
    setCollectionMessage("");
    setCollectionSubmitting(true);
    try {
      setCollectionMessage(await onToggleCollectionItem(collection, artwork));
    } catch (error) {
      setCollectionMessage(error instanceof Error ? error.message : "Unable to update collection.");
    } finally {
      setCollectionSubmitting(false);
    }
  };

  const handleCreateSeriesSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (seriesSubmitting) {
      return;
    }
    setSeriesMessage("");
    setSeriesSubmitting(true);
    try {
      const message = await onCreateSeries(seriesTitle);
      setSeriesTitle("");
      setSeriesMessage(message);
    } catch (error) {
      setSeriesMessage(error instanceof Error ? error.message : "Unable to create series.");
    } finally {
      setSeriesSubmitting(false);
    }
  };

  const handleToggleSeries = async (series: ArtworkSeries) => {
    if (seriesSubmitting) {
      return;
    }
    setSeriesMessage("");
    setSeriesSubmitting(true);
    try {
      setSeriesMessage(await onToggleSeriesItem(series, artwork));
    } catch (error) {
      setSeriesMessage(error instanceof Error ? error.message : "Unable to update series.");
    } finally {
      setSeriesSubmitting(false);
    }
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editSubmitting) {
      return;
    }
    setEditMessage("");
    setEditSubmitting(true);
    try {
      const message = await onUpdate(artwork, editForm);
      setEditing(false);
      setEditMessage(message);
    } catch (error) {
      setEditMessage(error instanceof Error ? error.message : "Unable to update artwork.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const moveEditImage = (imageId: string, direction: -1 | 1) => {
    setImageOrder((current) => {
      const index = current.indexOf(imageId);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const handleImageOrderSave = async () => {
    if (!imageOrderChanged || imageMutationSubmitting) {
      return;
    }
    setEditMessage("");
    setImageOrderSubmitting(true);
    try {
      const message = await onReorderImages(artwork, imageOrder);
      setEditMessage(message);
    } catch (error) {
      setEditMessage(error instanceof Error ? error.message : "Unable to update image order.");
    } finally {
      setImageOrderSubmitting(false);
    }
  };

  const handleImageDelete = async (image: (typeof artworkImages)[number], index: number) => {
    if (imageMutationSubmitting || !window.confirm(`Remove page ${index + 1} from "${artwork.title}"?`)) {
      return;
    }
    setEditMessage("");
    setImageDeleteSubmitting(image.id);
    try {
      const message = await onDeleteImage(artwork, image.id);
      setEditMessage(message);
    } catch (error) {
      setEditMessage(error instanceof Error ? error.message : "Unable to remove image.");
    } finally {
      setImageDeleteSubmitting(null);
    }
  };

  const handleImageAddSubmit = async () => {
    if (imageMutationSubmitting) {
      return;
    }
    if (imageAddFiles.length === 0) {
      setEditMessage("Choose one or more images first.");
      return;
    }
    if (imageAddFiles.length > remainingImageSlots) {
      setEditMessage(`Add ${remainingImageSlots} image${remainingImageSlots === 1 ? "" : "s"} or fewer.`);
      return;
    }
    setEditMessage("");
    setImageAddSubmitting(true);
    try {
      const message = await onAddImages(artwork, imageAddFiles);
      setImageAddFiles([]);
      if (imageAddInputRef.current) {
        imageAddInputRef.current.value = "";
      }
      setEditMessage(message);
    } catch (error) {
      setEditMessage(error instanceof Error ? error.message : "Unable to add images.");
    } finally {
      setImageAddSubmitting(false);
    }
  };

  const handleStorageUnlock = async () => {
    if (storageUnlocking) {
      return;
    }
    setEditMessage("");
    try {
      setEditMessage(await onUnlockStorageSlot());
    } catch (error) {
      setEditMessage(error instanceof Error ? error.message : "Unable to unlock storage slot.");
    }
  };

  const openReportForm = (target: string) => {
    setReportingTarget((current) => (current === target ? null : target));
    setReportReason("spam");
    setReportDetails("");
    setReportMessage("");
    setReportTurnstileToken("");
  };

  const handleArtworkReportSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (reportSubmitting) {
      return;
    }
    setReportMessage("");
    if (!reportTurnstileToken) {
      setReportMessage("Complete the check first.");
      return;
    }
    setReportSubmitting(true);
    try {
      const message = await onReportArtwork(
        artwork,
        reportReason,
        reportDetails,
        reportTurnstileToken
      );
      setReportingTarget(null);
      setReportDetails("");
      setReportTurnstileToken("");
      window.turnstile?.reset();
      setReportMessage(message);
    } catch (error) {
      setReportMessage(error instanceof Error ? error.message : "Unable to submit report.");
      setReportTurnstileToken("");
      window.turnstile?.reset();
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleCommentReportSubmit = async (
    event: FormEvent<HTMLFormElement>,
    comment: Comment
  ) => {
    event.preventDefault();
    if (reportSubmitting) {
      return;
    }
    setReportMessage("");
    if (!reportTurnstileToken) {
      setReportMessage("Complete the check first.");
      return;
    }
    setReportSubmitting(true);
    try {
      const message = await onReportComment(
        comment,
        reportReason,
        reportDetails,
        reportTurnstileToken
      );
      setReportingTarget(null);
      setReportDetails("");
      setReportTurnstileToken("");
      window.turnstile?.reset();
      setReportMessage(message);
    } catch (error) {
      setReportMessage(error instanceof Error ? error.message : "Unable to submit report.");
      setReportTurnstileToken("");
      window.turnstile?.reset();
    } finally {
      setReportSubmitting(false);
    }
  };

  const renderReportForm = (
    label: string,
    onSubmit: (event: FormEvent<HTMLFormElement>) => void
  ) => (
    <form className="report-form" onSubmit={onSubmit}>
      <label>
        Reason
        <select
          value={reportReason}
          onChange={(event) => setReportReason(event.target.value as ReportReason)}
        >
          {reportReasonOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Details
        <textarea
          value={reportDetails}
          maxLength={800}
          rows={3}
          onChange={(event) => setReportDetails(event.target.value)}
          placeholder={`Optional context for ${label}`}
        />
      </label>
      <TurnstileWidget siteKey={siteKey} action="report" onToken={setReportTurnstileToken} compact />
      <div className="settings-actions">
        <button className="danger-button" type="submit" disabled={reportSubmitting}>
          <Flag size={15} />
          {reportSubmitting ? "Submitting" : "Submit report"}
        </button>
        <button className="secondary-button" type="button" onClick={() => setReportingTarget(null)}>
          Cancel
        </button>
      </div>
    </form>
  );

  const renderComment = (comment: Comment, depth = 0): ReactNode => {
    const children = commentGroups.get(comment.id) ?? [];
    const canEditComment = Boolean(currentUser && currentUser.id === comment.authorId);

    return (
      <div className="comment-thread" key={comment.id}>
        <div className="comment-row" style={{ marginLeft: `${Math.min(depth, 3) * 18}px` }}>
          <div className="comment-row-heading">
            <strong>{comment.author}</strong>
            <div className="comment-row-actions">
              {comment.updatedAt ? <span className="comment-edited">edited</span> : null}
              {currentUser ? (
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    setReplyTarget(comment);
                    setEditingCommentId(null);
                    setReportMessage("");
                  }}
                >
                  Reply
                </button>
              ) : null}
              {currentUser?.id !== comment.authorId ? (
                <button
                  className="text-button"
                  type="button"
                  onClick={() => openReportForm(`comment:${comment.id}`)}
                >
                  Report
                </button>
              ) : null}
              {canEditComment ? (
                <button
                  className="text-button"
                  type="button"
                  onClick={() => startCommentEdit(comment)}
                >
                  Edit
                </button>
              ) : null}
              {comment.canManage ? (
                <button
                  className="text-button"
                  type="button"
                  onClick={() => onDeleteComment(comment)}
                >
                  Delete
                </button>
              ) : null}
            </div>
          </div>
          {editingCommentId === comment.id ? (
            <form
              className="comment-form inline-comment-form"
              onSubmit={(event) => void handleCommentEditSubmit(event, comment)}
            >
              <textarea
                value={editingCommentBody}
                maxLength={800}
                rows={3}
                onChange={(event) => setEditingCommentBody(event.target.value)}
                required
              />
              <div className="settings-actions">
                <button
                  className="secondary-button"
                  type="submit"
                  disabled={editingCommentSubmitting}
                >
                  {editingCommentSubmitting ? "Saving" : "Save"}
                </button>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => setEditingCommentId(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p>{comment.body}</p>
          )}
          {reportingTarget === `comment:${comment.id}`
            ? renderReportForm(
                "this comment",
                (event) => void handleCommentReportSubmit(event, comment)
              )
            : null}
        </div>
        {children.map((child) => renderComment(child, depth + 1))}
      </div>
    );
  };

  const content = (
    <section className={classNames("art-modal", presentation === "page" && "artwork-page")}>
      <button className="close-button" type="button" onClick={onClose} aria-label={presentation === "page" ? "Back to feed" : "Close"}>
          <X size={20} />
        </button>
        <div className={classNames("modal-art-stage", artworkImages.length > 1 && "is-series")}>
          {artworkImages.map((image, index) => (
            <figure className="modal-art-frame" key={image.id}>
              <img src={image.imageUrl} alt={artwork.title} />
              {artworkImages.length > 1 ? (
                <figcaption>
                  {index + 1} / {artworkImages.length}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
        <aside className="modal-detail">
          <button className="artist-block artist-block-link" type="button" onClick={() => onOpenProfile(artwork.creator.handle)}>
            {artwork.creator.avatarUrl ? (
              <img src={artwork.creator.avatarUrl} alt="" />
            ) : (
              <DefaultAvatar className="artist-block-avatar" name={artwork.creator.displayName} />
            )}
            <div>
              <strong>{artwork.creator.displayName}</strong>
              <span>@{artwork.creator.handle}</span>
            </div>
          </button>
          <h2>{artwork.title}</h2>
          {artwork.visibility !== "public" ? (
            <span className={classNames("rating-badge visibility-badge", `is-${artwork.visibility}`)}>
              {artworkVisibilityLabel(artwork.visibility)}
            </span>
          ) : null}
          {artwork.reviewStatus !== "approved" ? (
            <span className={classNames("rating-badge visibility-badge", `is-review-${artwork.reviewStatus}`)}>
              {artwork.reviewStatus}
            </span>
          ) : null}
          <p>{artwork.caption}</p>
          <div className="tag-row modal-tags">
            {artwork.tags.map((tag) => (
              <span className="tag-pill" key={tag}>
                #{tag}
              </span>
            ))}
          </div>
          <div className="modal-actions">
            <button
              className={classNames("primary-button", artwork.liked && "is-active")}
              type="button"
              onClick={() => onLike(artwork)}
            >
              <Heart size={17} fill={artwork.liked ? "currentColor" : "none"} />
              {formatCount(artwork.likeCount)}
            </button>
            <button
              className={classNames("secondary-button", artwork.bookmarked && "is-active")}
              type="button"
              onClick={() => onBookmark(artwork, artwork.bookmarked ? undefined : "public")}
            >
              <Bookmark size={17} fill={artwork.bookmarked ? "currentColor" : "none"} />
              {artwork.bookmarked ? "Bookmarked" : "Bookmark"}
              <span>{formatCount(artwork.bookmarkCount)}</span>
            </button>
            <span className="modal-stat-pill">
              <Eye size={16} />
              {formatCount(artwork.viewCount)} views
            </span>
            {canManageArtwork ? (
              <>
                <button className="secondary-button" type="button" onClick={() => setEditing((value) => !value)}>
                  <Settings size={17} />
                  Edit
                </button>
              </>
            ) : null}
            {canReportArtwork ? (
              <button className="secondary-button" type="button" onClick={() => openReportForm("artwork")}>
                <Flag size={17} />
                Report
              </button>
            ) : null}
          </div>
          {reportMessage ? <p className="auth-inline-message">{reportMessage}</p> : null}
          {reportingTarget === "artwork"
            ? renderReportForm("this artwork", handleArtworkReportSubmit)
            : null}
          {editMessage ? <p className="auth-inline-message">{editMessage}</p> : null}
          {editing ? (
            <form className="artwork-edit-form" onSubmit={handleEditSubmit}>
              <label>
                Title
                <input
                  value={editForm.title}
                  minLength={2}
                  maxLength={120}
                  onChange={(event) =>
                    setEditForm((current) => ({ ...current, title: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Caption
                <textarea
                  value={editForm.caption}
                  maxLength={800}
                  rows={4}
                  onChange={(event) =>
                    setEditForm((current) => ({ ...current, caption: event.target.value }))
                  }
                />
              </label>
              <TagChipEditor
                active={editing}
                label="Tags"
                tags={editTags}
                onTagsChange={(nextTags) =>
                  setEditForm((current) => ({ ...current, tags: nextTags.join(", ") }))
                }
              />
              {artworkImages.length > 1 ? (
                <section className="image-order-editor" aria-label="Image order">
                  <div className="image-order-header">
                    <strong>Image order</strong>
                    <span>Cover: page 1</span>
                  </div>
                  <div className="image-order-list">
                    {orderedEditImages.map((image, index) => (
                      <div className="image-order-row" key={image.id}>
                        <img
                          src={image.thumbnailUrl}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                        <div>
                          <strong>Page {index + 1}</strong>
                          <small>
                            {image.width} x {image.height}
                          </small>
                        </div>
                        <div className="image-order-actions">
                          <button
                            className="icon-button"
                            type="button"
                            aria-label={`Move page ${index + 1} earlier`}
                            onClick={() => moveEditImage(image.id, -1)}
                            disabled={index === 0 || imageMutationSubmitting}
                          >
                            <ChevronUp size={15} />
                          </button>
                          <button
                            className="icon-button"
                            type="button"
                            aria-label={`Move page ${index + 1} later`}
                            onClick={() => moveEditImage(image.id, 1)}
                            disabled={
                              index === orderedEditImages.length - 1 || imageMutationSubmitting
                            }
                          >
                            <ChevronDown size={15} />
                          </button>
                          <button
                            className="icon-button danger-icon-button"
                            type="button"
                            aria-label={`Remove page ${index + 1}`}
                            onClick={() => void handleImageDelete(image, index)}
                            disabled={imageMutationSubmitting}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => void handleImageOrderSave()}
                    disabled={!imageOrderChanged || imageMutationSubmitting}
                  >
                    <ListOrdered size={16} />
                    {imageOrderSubmitting ? "Saving order" : "Save image order"}
                  </button>
                </section>
              ) : null}
              <section className="image-add-editor" aria-label="Add images">
                <div className="image-order-header">
                  <strong>Add pages</strong>
                  <span>
                    {remainingImageSlots} / {artworkRemainingImageSlots} slots left
                  </span>
                </div>
                {accountStorage ? (
                  <div
                    className={classNames(
                      "storage-status",
                      accountStorage.remainingImages === 0 && "is-over-limit"
                    )}
                  >
                    <HardDrive size={18} />
                    <span>
                      <strong>
                        {formatCount(accountStorage.remainingImages)} /{" "}
                        {formatCount(accountStorage.imageLimit)} image slots available
                      </strong>
                      <small>
                        {formatCount(accountStorage.usedImages)} used ·{" "}
                        {formatCount(accountStorage.siteCredits)} credits ·{" "}
                        {formatCount(accountStorage.creditUnlockedSlots)} paid slots ·{" "}
                        {formatCount(accountStorage.bonusSlots)} bonus
                      </small>
                    </span>
                    <button
                      className="secondary-button storage-unlock-button"
                      type="button"
                      onClick={() => void handleStorageUnlock()}
                      disabled={!canUnlockStorageSlot || storageUnlocking || imageMutationSubmitting}
                      aria-label={`Spend ${accountStorage.creditsPerSlot} credits to unlock an image slot`}
                    >
                      <Sparkles size={15} />
                      {storageUnlocking
                        ? "Unlocking"
                        : `Spend ${formatCount(accountStorage.creditsPerSlot)}`}
                    </button>
                  </div>
                ) : null}
                <div className="image-add-actions">
                  <button
                    className="file-picker"
                    type="button"
                    onClick={() => imageAddInputRef.current?.click()}
                    disabled={remainingImageSlots === 0 || imageMutationSubmitting}
                  >
                    <ImageUp size={16} />
                    {remainingImageSlots === 0 ? "Image limit reached" : imageAddLabel}
                  </button>
                  <input
                    ref={imageAddInputRef}
                    className="visually-hidden"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => {
                      const files = Array.from(event.target.files ?? []).slice(
                        0,
                        remainingImageSlots
                      );
                      setImageAddFiles(files);
                    }}
                  />
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => void handleImageAddSubmit()}
                    disabled={
                      imageAddFiles.length === 0 ||
                      remainingImageSlots === 0 ||
                      imageMutationSubmitting
                    }
                  >
                    <ImageUp size={16} />
                    {imageAddSubmitting ? "Adding" : "Add pages"}
                  </button>
                </div>
              </section>
              <label>
                Mature rating
                <select
                  value={editForm.matureRating}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      matureRating: event.target.value as MatureRating
                    }))
                  }
                >
                  <option value="general">General</option>
                  <option value="restricted" disabled={!canSelectMatureRating}>
                    Restricted
                  </option>
                  <option value="adult" disabled={!canSelectMatureRating}>
                    Adult
                  </option>
                </select>
              </label>
              <label>
                Visibility
                <select
                  value={editForm.visibility}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      visibility: event.target.value as ArtworkVisibility
                    }))
                  }
                >
                  {novelVisibilityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="settings-actions">
                <button className="primary-button" type="submit" disabled={editSubmitting}>
                  <Settings size={17} />
                  {editSubmitting ? "Saving" : "Save changes"}
                </button>
                <button className="secondary-button" type="button" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button className="danger-button" type="button" onClick={() => onDelete(artwork)}>
                  <Trash2 size={17} />
                  Delete
                </button>
              </div>
            </form>
          ) : null}
          {currentUser ? (
            <section className="collection-control">
              <div className="panel-title">
                <Grid3X3 size={18} />
                Collections
              </div>
              <form className="collection-create-form" onSubmit={handleCreateCollectionSubmit}>
                <input
                  value={collectionName}
                  minLength={2}
                  maxLength={60}
                  onChange={(event) => setCollectionName(event.target.value)}
                  placeholder="New folder"
                  required
                />
                <button className="secondary-button" type="submit" disabled={collectionSubmitting}>
                  Add
                </button>
              </form>
              <div className="collection-list">
                {collections.map((collection) => {
                  const saved = collection.artworkIds.includes(artwork.id);
                  return (
                    <span className="collection-row-group" key={collection.id}>
                      <button
                        className={classNames("collection-row", saved && "is-active")}
                        type="button"
                        onClick={() => void handleToggleCollection(collection)}
                        disabled={collectionSubmitting}
                      >
                        <span>{collection.name}</span>
                        <small>{formatCount(collection.itemCount)}</small>
                      </button>
                      <button
                        className="icon-button collection-open-button"
                        type="button"
                        aria-label={`Open ${collection.name}`}
                        onClick={() => onOpenCollection(collection.id)}
                      >
                        <FolderOpen size={14} />
                      </button>
                    </span>
                  );
                })}
              </div>
              {collections.length === 0 ? <p className="muted">No collections yet.</p> : null}
              {collectionMessage ? (
                <p className="auth-inline-message">{collectionMessage}</p>
              ) : null}
            </section>
          ) : null}
          {canManageSeriesForArtwork ? (
            <section className="collection-control series-control">
              <div className="panel-title">
                <ListOrdered size={18} />
                Series
              </div>
              <form className="collection-create-form" onSubmit={handleCreateSeriesSubmit}>
                <input
                  value={seriesTitle}
                  minLength={2}
                  maxLength={80}
                  onChange={(event) => setSeriesTitle(event.target.value)}
                  placeholder="New series"
                  required
                />
                <button className="secondary-button" type="submit" disabled={seriesSubmitting}>
                  Add
                </button>
              </form>
              <div className="collection-list">
                {seriesList.map((series) => {
                  const saved = series.artworkIds.includes(artwork.id);
                  return (
                    <span className="collection-row-group" key={series.id}>
                      <button
                        className={classNames("collection-row", saved && "is-active")}
                        type="button"
                        onClick={() => void handleToggleSeries(series)}
                        disabled={seriesSubmitting}
                      >
                        <span>{series.title}</span>
                        <small>{formatCount(series.itemCount)}</small>
                      </button>
                      <button
                        className="icon-button collection-open-button"
                        type="button"
                        aria-label={`Open ${series.title}`}
                        onClick={() => onOpenSeries(series.id)}
                      >
                        <ListOrdered size={14} />
                      </button>
                    </span>
                  );
                })}
              </div>
              {seriesList.length === 0 ? <p className="muted">No series yet.</p> : null}
              {seriesMessage ? (
                <p className="auth-inline-message">{seriesMessage}</p>
              ) : null}
            </section>
          ) : null}
          {relatedArtworks.length > 0 ? (
            <section className="related-artworks">
              <div className="panel-title">
                <Sparkles size={18} />
                Related works
              </div>
              <div className="related-artwork-grid">
                {relatedArtworks.map((relatedArtwork) => (
                  <button
                    className="related-artwork-card"
                    type="button"
                    key={relatedArtwork.id}
                    onClick={() => onOpenArtwork(relatedArtwork)}
                  >
                    <img
                      src={relatedArtwork.thumbnailUrl}
                      alt=""
                      style={{ backgroundColor: relatedArtwork.dominantColor }}
                      loading="lazy"
                      decoding="async"
                    />
                    <span>
                      <strong>{relatedArtwork.title}</strong>
                      <small>
                        @{relatedArtwork.creator.handle} · {formatCount(relatedArtwork.likeCount)} likes
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}
          <div className="comment-list">
            <div className="panel-title">
              <MessageCircle size={18} />
              Comments
            </div>
            {currentUser ? (
              <form className="comment-form" onSubmit={handleCommentSubmit}>
                {replyTarget ? (
                  <div className="reply-target">
                    Replying to {replyTarget.author}
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => setReplyTarget(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : null}
                <textarea
                  value={commentBody}
                  maxLength={800}
                  rows={3}
                  onChange={(event) => setCommentBody(event.target.value)}
                  placeholder={replyTarget ? "Add a reply" : "Add a comment"}
                  required
                />
                <TurnstileWidget
                  siteKey={siteKey}
                  action="comment"
                  onToken={setCommentTurnstileToken}
                  compact
                />
                <button className="secondary-button" type="submit" disabled={commentSubmitting}>
                  <MessageCircle size={16} />
                  {commentSubmitting ? "Posting" : "Post"}
                </button>
              </form>
            ) : null}
            {commentMessage ? <p className="auth-inline-message">{commentMessage}</p> : null}
            {loading ? <p className="muted">Loading comments</p> : null}
            {(commentGroups.get(null) ?? []).map((comment) => renderComment(comment))}
            {!loading && (detail?.comments ?? []).length === 0 ? (
              <p className="muted">No comments yet.</p>
            ) : null}
          </div>
        </aside>
    </section>
  );

  if (presentation === "page") {
    return <section className="content-main artwork-page-shell">{content}</section>;
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      {content}
    </div>
  );
}

type UploadDrawerProps = {
  open: boolean;
  message: string;
  siteKey: string;
  currentUser: AuthUser | null;
  matureAccess: MatureAccess | null;
  uploading: boolean;
  progress: number;
  onClose: () => void;
  onOpenPrivacySecurity: () => void;
  onUnlockStorageSlot: () => Promise<string>;
  storageUnlocking: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>, files: File[]) => boolean | Promise<boolean>;
};

type TagChipEditorProps = {
  active: boolean;
  label: string;
  tags: string[];
  hiddenName?: string;
  placeholder?: string;
  suggestionContext?: RouteContext;
  onTagsChange: (tags: string[]) => void;
};

function TagChipEditor({
  active,
  label,
  tags,
  hiddenName,
  placeholder = "landscape, fanart, original",
  suggestionContext = "illustrations",
  onTagsChange
}: TagChipEditorProps) {
  const [tagDraft, setTagDraft] = useState("");
  const [tagSuggestions, setTagSuggestions] = useState<Array<{ name: string; count: number }>>([]);
  const [tagSuggestionsLoading, setTagSuggestionsLoading] = useState(false);

  useEffect(() => {
    const draft = tagDraft.trim().replace(/^#/, "");
    if (!active || draft.length < 2) {
      setTagSuggestions([]);
      setTagSuggestionsLoading(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setTagSuggestionsLoading(true);
      const endpoint =
        suggestionContext === "novels"
          ? "/api/novels/search/suggestions"
          : "/api/search/suggestions";
      fetch(`${endpoint}?q=${encodeURIComponent(draft)}&limit=8`, {
        credentials: "include",
        signal: controller.signal
      })
        .then(async (response) => {
          const payload = (await response.json()) as
            | SearchSuggestionsResponse
            | NovelSearchSuggestionsResponse
            | { message?: string };
          if (!response.ok || !("tags" in payload)) {
            throw new Error(
              ("message" in payload ? payload.message : undefined) ??
                "Tag suggestions could not be loaded."
            );
          }
          return payload.tags;
        })
        .then((nextTags) => {
          setTagSuggestions(nextTags);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
          console.error("Unable to load tag suggestions", error);
          setTagSuggestions([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setTagSuggestionsLoading(false);
          }
        });
    }, 160);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [active, suggestionContext, tagDraft]);

  const addTag = (value: string) => {
    const [tag] = parseTagListInput(value);
    if (!tag) {
      return;
    }
    if (tags.includes(tag) || tags.length >= 12) {
      setTagDraft("");
      setTagSuggestions([]);
      return;
    }
    onTagsChange([...tags, tag]);
    setTagDraft("");
    setTagSuggestions([]);
  };

  const removeTag = (tag: string) => {
    onTagsChange(tags.filter((item) => item !== tag));
  };

  return (
    <div className="tag-chip-editor">
      <span className="tag-chip-label">{label}</span>
      {hiddenName ? <input name={hiddenName} type="hidden" value={tags.join(", ")} readOnly /> : null}
      <div className="tag-chip-row" aria-label="Selected tags">
        {tags.map((tag) => (
          <button type="button" key={tag} onClick={() => removeTag(tag)}>
            #{tag}
            <X size={13} />
          </button>
        ))}
      </div>
      <label>
        Add tag
        <input
          value={tagDraft}
          type="text"
          maxLength={64}
          placeholder={placeholder}
          onChange={(event) => setTagDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              addTag(tagDraft);
            }
            if (event.key === "Backspace" && !tagDraft) {
              onTagsChange(tags.slice(0, -1));
            }
          }}
        />
      </label>
      <div className="tag-chip-suggestions" aria-label="Tag suggestions">
        {tagSuggestionsLoading ? <span>Loading</span> : null}
        {tagSuggestions
          .filter((tag) => !tags.includes(tag.name))
          .map((tag) => (
            <button type="button" key={tag.name} onClick={() => addTag(tag.name)}>
              #{tag.name}
              <small>{formatCount(tag.count)}</small>
            </button>
          ))}
        {tagDraft.trim() ? (
          <button type="button" onClick={() => addTag(tagDraft)}>
            Add #{tagDraft.replace(/^#/, "").trim()}
          </button>
        ) : null}
      </div>
    </div>
  );
}

type NovelFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  novel: Novel | null;
  message: string;
  siteKey: string;
  matureAccess: MatureAccess | null;
  seriesList: NovelSeries[];
  submitting: boolean;
  onClose: () => void;
  onOpenPrivacySecurity: () => void;
  onSubmit: (input: NovelEditInput, turnstileToken: string) => Promise<string>;
  onImport: (input: NovelImportInput, file: File, turnstileToken: string) => Promise<string>;
};

function NovelShelfPreview({ count }: { count: number }) {
  if (count === 0) {
    return (
      <span className="collection-folder-icon">
        <FolderOpen size={22} />
      </span>
    );
  }
  return (
    <span className="novel-folder-preview" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <span key={index}>{index < count ? "Aa" : ""}</span>
      ))}
    </span>
  );
}

type ReadingListsPageProps = {
  readingLists: ReadingList[];
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onCreateReadingList: (title: string) => Promise<string>;
  onOpenReadingList: (readingListId: string) => void;
};

function ReadingListsPage({
  readingLists,
  currentUser,
  onAuthRequired,
  onCreateReadingList,
  onOpenReadingList
}: ReadingListsPageProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      const nextMessage = await onCreateReadingList(title);
      setTitle("");
      setMessage(nextMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create reading shelf.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <section className="content-main collection-page novel-dedicated-page novel-shelves-page">
        <p className="empty-feed">Sign in to manage reading shelves.</p>
        <button className="primary-button" type="button" onClick={onAuthRequired}>
          <LogIn size={17} />
          Sign in
        </button>
      </section>
    );
  }

  return (
    <section className="content-main collection-page novel-dedicated-page novel-shelves-page">
      <div className="settings-heading collection-heading">
        <div>
          <p className="eyebrow">Shelves</p>
          <h1>Reading shelves</h1>
          <p>Group saved novels into private or public reading lists.</p>
        </div>
      </div>

      <form className="collection-page-create" onSubmit={handleSubmit}>
        <input
          value={title}
          minLength={2}
          maxLength={80}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="New shelf name"
          required
        />
        <button className="primary-button" type="submit" disabled={submitting}>
          <FolderOpen size={17} />
          {submitting ? "Creating" : "Create"}
        </button>
      </form>
      {message ? <p className="auth-inline-message">{message}</p> : null}

      <div className="collection-folder-grid">
        {readingLists.map((readingList) => (
          <button
            className="collection-folder-card"
            key={readingList.id}
            type="button"
            onClick={() => onOpenReadingList(readingList.id)}
          >
            <NovelShelfPreview count={readingList.novelCount} />
            <span>
              <strong>{readingList.title}</strong>
              <small>
                {formatCount(readingList.novelCount)} entries · {readingList.visibility}
              </small>
            </span>
            {readingList.visibility === "public" ? <Eye size={16} /> : <Lock size={16} />}
          </button>
        ))}
      </div>
      {readingLists.length === 0 ? (
        <p className="empty-feed">No shelves yet. Create one, then add novels from a reader page.</p>
      ) : null}
    </section>
  );
}

type ReadingListPageProps = {
  readingListId: string;
  csrfToken: string;
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onBack: () => void;
  onDelete: (readingListId: string) => Promise<string>;
  onDeleted: () => void;
  onOpenNovel: (novelId: string) => void;
  onOpenProfile: (username: string) => void;
  onOpenPrivacySecurity: () => void;
  onUpdate: (readingListId: string, input: ReadingListSettingsInput) => Promise<ReadingListResponse>;
};

function ReadingListPage({
  readingListId,
  csrfToken,
  currentUser,
  onAuthRequired,
  onBack,
  onDelete,
  onDeleted,
  onOpenNovel,
  onOpenProfile,
  onOpenPrivacySecurity,
  onUpdate
}: ReadingListPageProps) {
  const [detail, setDetail] = useState<ReadingListDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [form, setForm] = useState<ReadingListSettingsInput>({
    title: "",
    description: "",
    visibility: "private"
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessage("");
    setDetail(null);
    if (!readingListId) {
      setLoading(false);
      setMessage("Reading shelf not found.");
      return () => {
        cancelled = true;
      };
    }
    fetch(`/api/reading-lists/${encodeURIComponent(readingListId)}`, { credentials: "include" })
      .then(async (response) => {
        const payload = (await response.json()) as ReadingListDetailResponse | { message?: string };
        if (!response.ok || !("readingList" in payload)) {
          throw new Error(
            ("message" in payload ? payload.message : undefined) ?? "Reading shelf could not be loaded."
          );
        }
        return payload;
      })
      .then((payload) => {
        if (!cancelled) {
          setDetail(payload);
          setForm({
            title: payload.readingList.title,
            description: payload.readingList.description,
            visibility: payload.readingList.visibility
          });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Reading shelf could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, readingListId]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) {
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const payload = await onUpdate(readingListId, form);
      setDetail((current) =>
        current
          ? {
              ...current,
              readingList: payload.readingList
            }
          : current
      );
      setEditing(false);
      setMessage(payload.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update reading shelf.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleting || !detail || !window.confirm(`Delete "${detail.readingList.title}"?`)) {
      return;
    }
    setDeleting(true);
    setMessage("");
    try {
      const nextMessage = await onDelete(readingListId);
      setMessage(nextMessage);
      onDeleted();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete reading shelf.");
    } finally {
      setDeleting(false);
    }
  };
  const handleMoveNovel = async (novelId: string, direction: -1 | 1) => {
    if (!detail || reordering) {
      return;
    }
    const currentIndex = detail.novels.findIndex((novel) => novel.id === novelId);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= detail.novels.length) {
      return;
    }
    const nextNovels = [...detail.novels];
    const [moved] = nextNovels.splice(currentIndex, 1);
    nextNovels.splice(targetIndex, 0, moved);
    setReordering(true);
    setMessage("");
    try {
      const response = await fetch(`/api/reading-lists/${readingListId}/novels/order`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
        },
        body: JSON.stringify({ novelIds: nextNovels.map((novel) => novel.id) })
      });
      const payload = (await response.json()) as ReadingListResponse | { message?: string };
      if (!response.ok || !("readingList" in payload)) {
        throw new Error(payload.message ?? "Unable to reorder reading shelf.");
      }
      setDetail((current) =>
        current
          ? {
              ...current,
              readingList: payload.readingList,
              novels: nextNovels
            }
          : current
      );
      setMessage(payload.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to reorder reading shelf.");
    } finally {
      setReordering(false);
    }
  };

  const readingList = detail?.readingList;
  const owner = detail?.owner;

  return (
    <section className="content-main collection-page novel-dedicated-page novel-shelves-page">
      {loading ? <p className="empty-feed">Loading shelf.</p> : null}
      {message ? <p className="empty-feed">{message}</p> : null}
      {!loading && !detail && !currentUser ? (
        <button className="primary-button" type="button" onClick={onAuthRequired}>
          <LogIn size={17} />
          Sign in
        </button>
      ) : null}
      {detail && readingList && owner ? (
        <>
          <div className="collection-detail-hero">
            <button className="secondary-button" type="button" onClick={onBack}>
              <ChevronDown size={17} />
              Shelves
            </button>
            <div>
              <p className="eyebrow">Reading shelf</p>
              <h1>{readingList.title}</h1>
              <p>{readingList.description || "No description."}</p>
              <div className="profile-meta">
                <button className="text-button" type="button" onClick={() => onOpenProfile(owner.handle)}>
                  @{owner.handle}
                </button>
                <span>{formatCount(detail.novels.length)} visible entries</span>
                <span>{readingList.visibility}</span>
                <span>Updated {fullDateFormat.format(new Date(readingList.updatedAt))}</span>
              </div>
            </div>
            {detail.canManage ? (
              <div className="collection-detail-actions">
                <button className="secondary-button" type="button" onClick={() => setEditing((value) => !value)}>
                  <Pencil size={16} />
                  Edit
                </button>
                <button className="danger-button" type="button" onClick={handleDelete} disabled={deleting}>
                  <Trash2 size={16} />
                  {deleting ? "Deleting" : "Delete"}
                </button>
              </div>
            ) : null}
          </div>

          <MatureAccessNotice
            matureAccess={detail.matureAccess}
            onLogin={onAuthRequired}
            onPrivacySecurity={onOpenPrivacySecurity}
          />

          {editing ? (
            <form className="settings-form collection-settings-form" onSubmit={handleSave}>
              <label>
                Title
                <input
                  value={form.title}
                  minLength={2}
                  maxLength={80}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  value={form.description}
                  maxLength={1000}
                  rows={3}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                />
              </label>
              <label>
                Visibility
                <select
                  value={form.visibility}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      visibility: event.target.value as CollectionVisibility
                    }))
                  }
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </label>
              <div className="settings-actions">
                <button className="primary-button" type="submit" disabled={saving}>
                  <Pencil size={17} />
                  {saving ? "Saving" : "Save shelf"}
                </button>
                <button className="secondary-button" type="button" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          {detail.canManage && detail.novels.length > 1 ? (
            <div className="novel-order-list">
              {detail.novels.map((novel, index) => (
                <span className="novel-order-row" key={novel.id}>
                  <span>
                    <strong>{novel.title}</strong>
                    <small>{formatCount(novel.wordCount)} words</small>
                  </span>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={`Move ${novel.title} earlier`}
                    onClick={() => void handleMoveNovel(novel.id, -1)}
                    disabled={index === 0 || reordering}
                  >
                    <ChevronUp size={15} />
                  </button>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={`Move ${novel.title} later`}
                    onClick={() => void handleMoveNovel(novel.id, 1)}
                    disabled={index === detail.novels.length - 1 || reordering}
                  >
                    <ChevronDown size={15} />
                  </button>
                </span>
              ))}
            </div>
          ) : null}

          <div className="novel-grid">
            {detail.novels.map((novel, index) => (
              <NovelCard
                key={novel.id}
                novel={novel}
                index={index}
                onOpenNovel={onOpenNovel}
                onOpenProfile={onOpenProfile}
              />
            ))}
          </div>
          {detail.novels.length === 0 ? <p className="empty-feed">No visible entries in this shelf.</p> : null}
        </>
      ) : null}
    </section>
  );
}

function NovelSerialPreview({ count }: { count: number }) {
  return (
    <span className="novel-folder-preview novel-serial-preview" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <span key={index}>{index < count ? index + 1 : ""}</span>
      ))}
    </span>
  );
}

type NovelSeriesListPageProps = {
  seriesList: NovelSeries[];
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onCreateSeries: (title: string) => Promise<string>;
  onOpenSeries: (seriesId: string) => void;
};

function NovelSeriesListPage({
  seriesList,
  currentUser,
  onAuthRequired,
  onCreateSeries,
  onOpenSeries
}: NovelSeriesListPageProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      const nextMessage = await onCreateSeries(title);
      setTitle("");
      setMessage(nextMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create serial.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <section className="content-main collection-page series-page novel-dedicated-page novel-serials-page">
        <p className="empty-feed">Sign in to manage serials.</p>
        <button className="primary-button" type="button" onClick={onAuthRequired}>
          <LogIn size={17} />
          Sign in
        </button>
      </section>
    );
  }

  return (
    <section className="content-main collection-page series-page novel-dedicated-page novel-serials-page">
      <div className="settings-heading collection-heading">
        <div>
          <p className="eyebrow">Serials</p>
          <h1>Serials</h1>
          <p>Order your own works into chaptered reading sequences.</p>
        </div>
      </div>

      <form className="collection-page-create" onSubmit={handleSubmit}>
        <input
          value={title}
          minLength={2}
          maxLength={160}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="New serial title"
          required
        />
        <button className="primary-button" type="submit" disabled={submitting}>
          <ListOrdered size={17} />
          {submitting ? "Creating" : "Create"}
        </button>
      </form>
      {message ? <p className="auth-inline-message">{message}</p> : null}

      <div className="collection-folder-grid">
        {seriesList.map((series) => (
          <button
            className="collection-folder-card series-folder-card"
            key={series.id}
            type="button"
            onClick={() => onOpenSeries(series.id)}
          >
            <NovelSerialPreview count={series.novelCount} />
            <span>
              <strong>{series.title}</strong>
              <small>{formatCount(series.novelCount)} entries</small>
            </span>
            <ListOrdered size={16} />
          </button>
        ))}
      </div>
      {seriesList.length === 0 ? (
        <p className="empty-feed">No serials yet. Create one, then assign chapters while writing.</p>
      ) : null}
    </section>
  );
}

type NovelSeriesPageProps = {
  seriesId: string;
  csrfToken: string;
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onBack: () => void;
  onDelete: (seriesId: string) => Promise<string>;
  onDeleted: () => void;
  onOpenNovel: (novelId: string) => void;
  onOpenProfile: (username: string) => void;
  onOpenPrivacySecurity: () => void;
  onUpdate: (seriesId: string, input: NovelSeriesSettingsInput) => Promise<NovelSeriesResponse>;
};

function NovelSeriesPage({
  seriesId,
  csrfToken,
  currentUser,
  onAuthRequired,
  onBack,
  onDelete,
  onDeleted,
  onOpenNovel,
  onOpenProfile,
  onOpenPrivacySecurity,
  onUpdate
}: NovelSeriesPageProps) {
  const [detail, setDetail] = useState<NovelSeriesDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [form, setForm] = useState<NovelSeriesSettingsInput>({
    title: "",
    description: ""
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessage("");
    setDetail(null);
    if (!seriesId) {
      setLoading(false);
      setMessage("Serial not found.");
      return () => {
        cancelled = true;
      };
    }
    fetch(`/api/novel-series/${encodeURIComponent(seriesId)}`, { credentials: "include" })
      .then(async (response) => {
        const payload = (await response.json()) as NovelSeriesDetailResponse | { message?: string };
        if (!response.ok || !("series" in payload)) {
          throw new Error(
            ("message" in payload ? payload.message : undefined) ?? "Serial could not be loaded."
          );
        }
        return payload;
      })
      .then((payload) => {
        if (!cancelled) {
          setDetail(payload);
          setForm({
            title: payload.series.title,
            description: payload.series.description
          });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Serial could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, seriesId]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) {
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const payload = await onUpdate(seriesId, form);
      setDetail((current) =>
        current
          ? {
              ...current,
              series: payload.series
            }
          : current
      );
      setEditing(false);
      setMessage(payload.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update serial.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleting || !detail || !window.confirm(`Delete "${detail.series.title}"?`)) {
      return;
    }
    setDeleting(true);
    setMessage("");
    try {
      const nextMessage = await onDelete(seriesId);
      setMessage(nextMessage);
      onDeleted();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete serial.");
    } finally {
      setDeleting(false);
    }
  };
  const handleMoveChapter = async (novelId: string, direction: -1 | 1) => {
    if (!detail || reordering) {
      return;
    }
    const currentIndex = detail.novels.findIndex((novel) => novel.id === novelId);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= detail.novels.length) {
      return;
    }
    const nextNovels = [...detail.novels];
    const [moved] = nextNovels.splice(currentIndex, 1);
    nextNovels.splice(targetIndex, 0, moved);
    setReordering(true);
    setMessage("");
    try {
      const response = await fetch(`/api/novel-series/${seriesId}/novels/order`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          ...(csrfToken ? { [csrfHeaderName]: csrfToken } : {})
        },
        body: JSON.stringify({ novelIds: nextNovels.map((novel) => novel.id) })
      });
      const payload = (await response.json()) as NovelSeriesResponse | { message?: string };
      if (!response.ok || !("series" in payload)) {
        throw new Error(payload.message ?? "Unable to reorder serial.");
      }
      setDetail((current) =>
        current
          ? {
              ...current,
              series: payload.series,
              novels: nextNovels.map((novel, index) => ({
                ...novel,
                chapterNumber: index + 1
              }))
            }
          : current
      );
      setMessage(payload.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to reorder serial.");
    } finally {
      setReordering(false);
    }
  };

  const series = detail?.series;
  const owner = detail?.owner;

  return (
    <section className="content-main collection-page series-page novel-dedicated-page novel-serials-page">
      {loading ? <p className="empty-feed">Loading serial.</p> : null}
      {message ? <p className="empty-feed">{message}</p> : null}
      {!loading && !detail && !currentUser ? (
        <button className="primary-button" type="button" onClick={onAuthRequired}>
          <LogIn size={17} />
          Sign in
        </button>
      ) : null}
      {detail && series && owner ? (
        <>
          <div className="collection-detail-hero series-detail-hero">
            <button className="secondary-button" type="button" onClick={onBack}>
              <ChevronDown size={17} />
              Serials
            </button>
            <div>
              <p className="eyebrow">Serial</p>
              <h1>{series.title}</h1>
              <p>{series.description || "No description."}</p>
              <div className="profile-meta">
                <button className="text-button" type="button" onClick={() => onOpenProfile(owner.handle)}>
                  @{owner.handle}
                </button>
                <span>{formatCount(detail.novels.length)} visible entries</span>
                <span>Updated {fullDateFormat.format(new Date(series.updatedAt))}</span>
              </div>
            </div>
            {detail.canManage ? (
              <div className="collection-detail-actions">
                <button className="secondary-button" type="button" onClick={() => setEditing((value) => !value)}>
                  <Pencil size={16} />
                  Edit
                </button>
                <button className="danger-button" type="button" onClick={handleDelete} disabled={deleting}>
                  <Trash2 size={16} />
                  {deleting ? "Deleting" : "Delete"}
                </button>
              </div>
            ) : null}
          </div>

          <MatureAccessNotice
            matureAccess={detail.matureAccess}
            onLogin={onAuthRequired}
            onPrivacySecurity={onOpenPrivacySecurity}
          />

          {editing ? (
            <form className="settings-form collection-settings-form" onSubmit={handleSave}>
              <label>
                Title
                <input
                  value={form.title}
                  minLength={2}
                  maxLength={160}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  value={form.description}
                  maxLength={2000}
                  rows={3}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                />
              </label>
              <div className="settings-actions">
                <button className="primary-button" type="submit" disabled={saving}>
                  <Pencil size={17} />
                  {saving ? "Saving" : "Save serial"}
                </button>
                <button className="secondary-button" type="button" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          {detail.canManage && detail.novels.length > 1 ? (
            <div className="novel-order-list">
              {detail.novels.map((novel, index) => (
                <span className="novel-order-row" key={novel.id}>
                  <span>
                    <strong>{novel.chapterNumber ? `Chapter ${novel.chapterNumber}: ` : ""}{novel.title}</strong>
                    <small>{novel.readMinutes} min read</small>
                  </span>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={`Move ${novel.title} earlier`}
                    onClick={() => void handleMoveChapter(novel.id, -1)}
                    disabled={index === 0 || reordering}
                  >
                    <ChevronUp size={15} />
                  </button>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={`Move ${novel.title} later`}
                    onClick={() => void handleMoveChapter(novel.id, 1)}
                    disabled={index === detail.novels.length - 1 || reordering}
                  >
                    <ChevronDown size={15} />
                  </button>
                </span>
              ))}
            </div>
          ) : null}

          <div className="novel-grid">
            {detail.novels.map((novel, index) => (
              <NovelCard
                key={novel.id}
                novel={novel}
                index={index}
                onOpenNovel={onOpenNovel}
                onOpenProfile={onOpenProfile}
              />
            ))}
          </div>
          {detail.novels.length === 0 ? <p className="empty-feed">No visible entries in this serial.</p> : null}
        </>
      ) : null}
    </section>
  );
}

function NovelFormDrawer({
  open,
  mode,
  novel,
  message,
  siteKey,
  matureAccess,
  seriesList,
  submitting,
  onClose,
  onOpenPrivacySecurity,
  onSubmit,
  onImport
}: NovelFormDrawerProps) {
  const [input, setInput] = useState<NovelEditInput>({
    title: "",
    content: "",
    description: "",
    tags: "original",
    matureRating: "general",
    visibility: "public",
    isDraft: false,
    coverColor: "#fa9ebc",
    contentFormat: "markdown",
    seriesId: null,
    chapterNumber: null
  });
  const [turnstileToken, setTurnstileToken] = useState("");
  const [importInput, setImportInput] = useState<NovelImportInput>({
    title: "",
    tags: "imported",
    matureRating: "general",
    visibility: "private",
    coverColor: "#fa9ebc"
  });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importTurnstileToken, setImportTurnstileToken] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [localMessage, setLocalMessage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const matureBlocked = matureAccess ? !matureAccess.allowed : true;
  const wordCount = input.content.trim().split(/\s+/).filter(Boolean).length;
  const previewHtml = useMemo(
    () => (input.contentFormat === "markdown" ? renderNovelMarkdown(input.content) : ""),
    [input.content, input.contentFormat]
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    setInput(
      novel
        ? {
            title: novel.title,
            content: novel.body,
            description: novel.description,
            tags: novel.tags.join(", "),
            matureRating: novel.matureRating,
            visibility: novel.visibility,
            isDraft: novel.isDraft,
            coverColor: novel.coverColor,
            contentFormat: novel.contentFormat,
            seriesId: novel.seriesId,
            chapterNumber: novel.chapterNumber
          }
        : {
            title: "",
            content: "",
            description: "",
            tags: "original",
            matureRating: "general",
            visibility: "public",
            isDraft: false,
            coverColor: "#fa9ebc",
            contentFormat: "markdown",
            seriesId: null,
            chapterNumber: null
          }
    );
    setTurnstileToken("");
    setImportInput({
      title: "",
      tags: "imported",
      matureRating: "general",
      visibility: "private",
      coverColor: "#fa9ebc"
    });
    setImportFile(null);
    setImportTurnstileToken("");
    setImportMessage("");
    setLocalMessage("");
    setPreviewOpen(false);
  }, [novel, open]);

  const updateInput = <Key extends keyof NovelEditInput>(
    key: Key,
    value: NovelEditInput[Key]
  ) => {
    setInput((current) => ({ ...current, [key]: value }));
  };

  const updateImportInput = <Key extends keyof NovelImportInput>(
    key: Key,
    value: NovelImportInput[Key]
  ) => {
    setImportInput((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    if (mode === "create" && !turnstileToken) {
      setLocalMessage("Complete the check first.");
      return;
    }
    setLocalMessage("");
    try {
      setLocalMessage(await onSubmit(input, turnstileToken));
      setTurnstileToken("");
      window.turnstile?.reset();
    } catch (error) {
      setLocalMessage(error instanceof Error ? error.message : "Unable to save novel.");
    }
  };

  const handleImportSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    if (!importFile) {
      setImportMessage("Choose a TXT, Markdown, or EPUB file.");
      return;
    }
    if (!importTurnstileToken) {
      setImportMessage("Complete the check first.");
      return;
    }
    setImportMessage("");
    try {
      setImportMessage(await onImport(importInput, importFile, importTurnstileToken));
      setImportFile(null);
      setImportTurnstileToken("");
      window.turnstile?.reset();
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : "Unable to import novel.");
      setImportTurnstileToken("");
      window.turnstile?.reset();
    }
  };

  return (
    <div className={classNames("drawer-backdrop", open && "is-open")}>
      <aside className="upload-drawer novel-form-drawer" aria-hidden={!open}>
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Novel studio</p>
            <h2>{mode === "edit" ? "Edit work" : "New novel"}</h2>
          </div>
          <button className="close-button" type="button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        {mode === "create" ? (
          <form className="novel-import-panel" onSubmit={handleImportSubmit}>
            <div className="panel-title">
              <FileText size={18} />
              Import manuscript
            </div>
            <label>
              File
              <input
                type="file"
                accept=".txt,.md,.markdown,.epub,text/plain,text/markdown,application/epub+zip"
                onChange={(event) => setImportFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <div className="form-grid">
              <label>
                Draft title
                <input
                  value={importInput.title}
                  maxLength={160}
                  onChange={(event) => updateImportInput("title", event.target.value)}
                  placeholder={importFile ? importFile.name.replace(/\.[^.]+$/, "") : "Use filename"}
                />
              </label>
              <TagChipEditor
                active={open && mode === "create"}
                label="Tags"
                tags={parseTagListInput(importInput.tags)}
                placeholder="serial, original, mystery"
                suggestionContext="novels"
                onTagsChange={(nextTags) => updateImportInput("tags", nextTags.join(", "))}
              />
            </div>
            <div className="form-grid">
              <label>
                Mature rating
                <select
                  value={importInput.matureRating}
                  disabled={matureBlocked}
                  onChange={(event) => updateImportInput("matureRating", event.target.value as MatureRating)}
                >
                  <option value="general">General</option>
                  <option value="restricted">Restricted</option>
                  <option value="adult">Adult</option>
                </select>
              </label>
              <label>
                Visibility
                <select
                  value={importInput.visibility}
                  onChange={(event) => updateImportInput("visibility", event.target.value as NovelVisibility)}
                >
                  {novelVisibilityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Cover color
              <input
                type="color"
                value={importInput.coverColor}
                onChange={(event) => updateImportInput("coverColor", event.target.value)}
              />
            </label>
            <TurnstileWidget siteKey={siteKey} action="upload" onToken={setImportTurnstileToken} compact />
            <button className="secondary-button" type="submit" disabled={submitting}>
              <Download size={16} />
              {submitting ? "Importing" : "Import as draft"}
            </button>
            {importMessage ? <p className="upload-message">{importMessage}</p> : null}
          </form>
        ) : null}
        <form className="upload-form novel-form" onSubmit={handleSubmit}>
          <label>
            Title
            <input
              value={input.title}
              minLength={2}
              maxLength={160}
              required
              onChange={(event) => updateInput("title", event.target.value)}
            />
          </label>
          <label>
            Description
            <textarea
              value={input.description}
              rows={3}
              maxLength={1200}
              onChange={(event) => updateInput("description", event.target.value)}
            />
          </label>
          <TagChipEditor
            active={open}
            label="Tags"
            tags={parseTagListInput(input.tags)}
            placeholder="serial, original, mystery"
            suggestionContext="novels"
            onTagsChange={(nextTags) => updateInput("tags", nextTags.join(", "))}
          />
          <div className="novel-editor-toolbar">
            <label>
              Format
              <select
                value={input.contentFormat}
                onChange={(event) => updateInput("contentFormat", event.target.value as NovelContentFormat)}
              >
                <option value="markdown">Markdown</option>
                <option value="plain">Plain text</option>
              </select>
            </label>
            <button
              className={classNames("secondary-button", previewOpen && "is-active")}
              type="button"
              onClick={() => setPreviewOpen((value) => !value)}
              disabled={input.contentFormat !== "markdown"}
            >
              <Eye size={16} />
              Preview
            </button>
          </div>
          <label>
            Content
            <textarea
              className="novel-content-input"
              value={input.content}
              minLength={1}
              maxLength={500000}
              rows={18}
              required
              onChange={(event) => updateInput("content", event.target.value)}
            />
          </label>
          {previewOpen && input.contentFormat === "markdown" ? (
            <section className="novel-markdown-preview" aria-label="Markdown preview">
              {previewHtml ? (
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              ) : (
                <p className="muted">Preview appears as you write.</p>
              )}
            </section>
          ) : null}
          <div className="novel-form-meta">
            <span>{formatCount(wordCount)} words</span>
            <span>{estimateReadMinutes(wordCount)} min read</span>
          </div>
          <div className="form-grid">
            <label>
              Mature rating
              <select
                value={input.matureRating}
                disabled={matureBlocked}
                onChange={(event) => updateInput("matureRating", event.target.value as MatureRating)}
              >
                <option value="general">General</option>
                <option value="restricted">Restricted</option>
                <option value="adult">Adult</option>
              </select>
            </label>
            <label>
              Visibility
              <select
                value={input.visibility}
                onChange={(event) => updateInput("visibility", event.target.value as NovelVisibility)}
              >
                {novelVisibilityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className={classNames("draft-toggle", input.isDraft && "is-active")}>
            <input
              type="checkbox"
              checked={input.isDraft}
              onChange={(event) => updateInput("isDraft", event.target.checked)}
            />
            <span className="draft-toggle-box" aria-hidden="true">
              <Check size={15} />
            </span>
            <span className="draft-toggle-copy">
              <strong>Save as draft</strong>
              <small>Keep it private until you are ready to publish.</small>
            </span>
          </label>
          <label>
            Cover color
            <input
              type="color"
              value={input.coverColor}
              onChange={(event) => updateInput("coverColor", event.target.value)}
            />
          </label>
          <div className="form-grid">
            <label>
              Serial
              <select
                value={input.seriesId ?? ""}
                onChange={(event) => updateInput("seriesId", event.target.value || null)}
              >
                <option value="">Standalone</option>
                {seriesList.map((series) => (
                  <option key={series.id} value={series.id}>
                    {series.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Chapter
              <input
                type="number"
                min={1}
                max={9999}
                value={input.chapterNumber ?? ""}
                onChange={(event) =>
                  updateInput(
                    "chapterNumber",
                    event.target.value ? Number(event.target.value) : null
                  )
                }
                disabled={!input.seriesId}
              />
            </label>
          </div>
          {matureBlocked ? (
            <div className="inline-alert">
              <EyeOff size={16} />
              <span>{matureAccessLabel(matureAccess)}</span>
              <button className="text-button" type="button" onClick={onOpenPrivacySecurity}>
                Settings
              </button>
            </div>
          ) : null}
          {mode === "create" ? (
            <TurnstileWidget siteKey={siteKey} action="upload" onToken={setTurnstileToken} compact />
          ) : null}
          <button className="primary-button" type="submit" disabled={submitting}>
            <NotebookText size={18} />
            {submitting ? "Saving" : input.isDraft ? "Save draft" : "Publish"}
          </button>
          {localMessage || message ? (
            <p className="upload-message">{localMessage || message}</p>
          ) : null}
        </form>
      </aside>
    </div>
  );
}

function UploadDrawer({
  open,
  message,
  siteKey,
  currentUser,
  matureAccess,
  uploading,
  progress,
  onClose,
  onOpenPrivacySecurity,
  onUnlockStorageSlot,
  storageUnlocking,
  onSubmit
}: UploadDrawerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [tags, setTags] = useState(["original", "study"]);
  const matureBlocked = matureAccess ? !matureAccess.allowed : true;
  const [localMessage, setLocalMessage] = useState("");
  const storage = currentUser?.storage ?? null;
  const selectedFileCount = selectedFiles.length;
  const selectedOverStorage = Boolean(
    storage && selectedFileCount > 0 && selectedFileCount > storage.remainingImages
  );
  const canUnlockStorageSlot = Boolean(
    storage && storage.siteCredits >= storage.creditsPerSlot
  );
  const remainingSelectionSlots = Math.max(0, 8 - selectedFiles.length);

  const syncFileInput = (files: File[]) => {
    if (!fileInputRef.current) {
      return;
    }
    try {
      const dataTransfer = new DataTransfer();
      files.forEach((file) => dataTransfer.items.add(file));
      fileInputRef.current.files = dataTransfer.files;
    } catch {
      if (files.length === 0) {
        fileInputRef.current.value = "";
      }
    }
  };

  const updateSelectedFiles = (files: File[]) => {
    const nextFiles = files.slice(0, 8);
    setSelectedFiles(nextFiles);
    syncFileInput(nextFiles);
    if (files.length > 8) {
      setLocalMessage("Upload 8 pages or fewer.");
    } else if (storage && nextFiles.length > storage.remainingImages) {
      setLocalMessage(
        `You have ${storage.remainingImages} image slot${storage.remainingImages === 1 ? "" : "s"} available.`
      );
    } else if (localMessage) {
      setLocalMessage("");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalMessage("");
    if (uploading) {
      return;
    }
    if (selectedFileCount === 0) {
      setLocalMessage("Add at least one page.");
      return;
    }
    if (storage && selectedFileCount > storage.remainingImages) {
      setLocalMessage(
        `You have ${storage.remainingImages} image slot${storage.remainingImages === 1 ? "" : "s"} available.`
      );
      return;
    }
    if (!turnstileToken) {
      setLocalMessage("Complete the check first.");
      return;
    }
    const published = await onSubmit(event, selectedFiles);
    setTurnstileToken("");
    window.turnstile?.reset();
    if (published) {
      setTags(["original", "study"]);
      updateSelectedFiles([]);
    }
  };

  const handleStorageUnlock = async () => {
    if (storageUnlocking) {
      return;
    }
    setLocalMessage("");
    try {
      setLocalMessage(await onUnlockStorageSlot());
    } catch (error) {
      setLocalMessage(error instanceof Error ? error.message : "Unable to unlock storage slot.");
    }
  };

  return (
    <div className={classNames("drawer-backdrop", open && "is-open")}>
      <aside className="upload-drawer" aria-hidden={!open}>
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Artwork upload</p>
            <h2>New artwork</h2>
          </div>
          <button className="close-button" type="button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="upload-form">
          <label>
            Title
            <input name="title" minLength={2} maxLength={120} required />
          </label>
          <label>
            Caption
            <textarea name="caption" rows={4} maxLength={800} />
          </label>
          <TagChipEditor
            active={open}
            label="Tags"
            tags={tags}
            hiddenName="tags"
            onTagsChange={setTags}
          />
          <label>
            Mature rating
            <select name="matureRating" defaultValue="general" disabled={matureBlocked}>
              <option value="general">General</option>
              <option value="restricted">Restricted</option>
              <option value="adult">Adult</option>
            </select>
          </label>
          <label>
            Visibility
            <select name="visibility" defaultValue="public">
              {artworkVisibilityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {matureBlocked ? (
            <div className="inline-alert">
              <EyeOff size={16} />
              <span>{matureAccessLabel(matureAccess)}</span>
              <button className="text-button" type="button" onClick={onOpenPrivacySecurity}>
                Settings
              </button>
            </div>
          ) : null}
          {storage ? (
            <div className={classNames("storage-status", selectedOverStorage && "is-over-limit")}>
              <HardDrive size={18} />
              <span>
                <strong>
                  {formatCount(storage.remainingImages)} / {formatCount(storage.imageLimit)} image slots available
                </strong>
                <small>
                  {formatCount(storage.usedImages)} used · {formatCount(storage.siteCredits)} credits ·{" "}
                  {formatCount(storage.creditUnlockedSlots)} paid slots · {formatCount(storage.bonusSlots)} bonus
                </small>
              </span>
              <button
                className="secondary-button storage-unlock-button"
                type="button"
                onClick={() => void handleStorageUnlock()}
                disabled={!canUnlockStorageSlot || storageUnlocking || uploading}
                aria-label={`Spend ${storage.creditsPerSlot} credits to unlock an image slot`}
              >
                <Sparkles size={15} />
                {storageUnlocking ? "Unlocking" : `Spend ${formatCount(storage.creditsPerSlot)}`}
              </button>
            </div>
          ) : null}
          <section className="upload-pages-editor" aria-label="Artwork pages">
            <div className="image-order-header">
              <strong>Pages</strong>
              <span>{selectedFiles.length} / 8 selected</span>
            </div>
            <div className="upload-page-list">
              {selectedFiles.map((file, index) => (
                <div className="upload-page-row" key={`${file.name}-${file.lastModified}-${index}`}>
                  <span>Page {index + 1}</span>
                  <strong>{file.name}</strong>
                  <small>{formatFileSize(file.size)}</small>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={`Remove page ${index + 1}`}
                    onClick={() =>
                      updateSelectedFiles(selectedFiles.filter((_, fileIndex) => fileIndex !== index))
                    }
                    disabled={uploading}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
              {selectedFiles.length === 0 ? (
                <p className="muted">Add one or more image pages.</p>
              ) : null}
            </div>
            <button
              className="file-picker"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || remainingSelectionSlots === 0}
            >
              <ImageUp size={18} />
              {remainingSelectionSlots === 0 ? "Page limit reached" : "Add pages"}
            </button>
          </section>
          <input
            ref={fileInputRef}
            className="visually-hidden"
            name="files"
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              updateSelectedFiles([...selectedFiles, ...files]);
            }}
          />
          <input name="turnstileToken" type="hidden" value={turnstileToken} />
          <TurnstileWidget siteKey={siteKey} action="upload" onToken={setTurnstileToken} compact />
          {uploading || progress > 0 ? (
            <div className="upload-progress" aria-label="Upload progress">
              <span style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }} />
              <strong>{uploading ? `${Math.max(1, Math.min(progress || 1, 99))}%` : "Complete"}</strong>
            </div>
          ) : null}
          {!uploading ? (
            <button className="primary-button" type="submit">
              <ImageUp size={18} />
              Publish
            </button>
          ) : null}
          {localMessage || message ? (
            <p className="upload-message">{localMessage || message}</p>
          ) : null}
        </form>
      </aside>
    </div>
  );
}

export default App;
