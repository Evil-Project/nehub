import {
  Activity,
  AtSign,
  BarChart3,
  Bell,
  Bookmark,
  Calendar,
  ChevronDown,
  ChevronUp,
  Cloud,
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
  CreatorDiscoveryResponse,
  CreatorDiscoverySort,
  DeleteArtworkSeriesResponse,
  DeleteArtworkImageResponse,
  DeleteArtworkResponse,
  DeleteCommentResponse,
  DeleteCollectionResponse,
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
  NovelListResponse,
  NovelResponse,
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

const artworkVisibilityOptions: {
  value: ArtworkVisibility;
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

const homeSortOptions: { value: SortMode; label: string; icon: typeof Grid3X3 }[] = [
  { value: "latest", label: "Latest", icon: Grid3X3 },
  { value: "following", label: "Following", icon: Sparkles }
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

const passkeyAssertionPayload = (credential: PublicKeyCredential) => {
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
    }
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

type ViewMode =
  | "home"
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
  | "emailConfirmation"
  | "terms"
  | "privacy";
type AuthMode = "login" | "register";
type AuthFlow = "auth" | "resetRequest" | "resetConfirm" | "mfa";
type TurnstileAction =
  | AuthMode
  | "resend"
  | "upload"
  | "comment"
  | "report"
  | "email-confirm"
  | "password-reset"
  | "password-reset-confirm";
type ArtworkEditInput = {
  title: string;
  caption: string;
  tags: string;
  matureRating: MatureRating;
  visibility: ArtworkVisibility;
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
  username: string;
  artworkId: string;
  novelId: string;
  collectionId: string;
  seriesId: string;
  tag: string;
};

const routeState = (
  view: ViewMode,
  values: Partial<Omit<RouteState, "view">> = {}
): RouteState => ({
  view,
  username: values.username ?? "",
  artworkId: values.artworkId ?? "",
  novelId: values.novelId ?? "",
  collectionId: values.collectionId ?? "",
  seriesId: values.seriesId ?? "",
  tag: values.tag ?? ""
});

const getInitialRoute = (): RouteState => {
  if (typeof window === "undefined") {
    return routeState("home");
  }
  if (window.location.hash === "#dashboard") {
    return routeState("dashboard");
  }
  const pathname = decodeURIComponent(window.location.pathname);
  if (pathname.startsWith("/artworks/")) {
    return routeState("artwork", {
      artworkId: pathname.slice("/artworks/".length).replace(/^\/+|\/+$/g, "")
    });
  }
  if (pathname.startsWith("/novels/")) {
    return routeState("novel", {
      novelId: pathname.slice("/novels/".length).replace(/^\/+|\/+$/g, "")
    });
  }
  if (pathname === "/novels") {
    return routeState("novels");
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
  if (pathname === "/email-confirmation") {
    return routeState("emailConfirmation");
  }
  if (pathname === "/terms") {
    return routeState("terms");
  }
  if (pathname === "/privacy") {
    return routeState("privacy");
  }
  return routeState("home");
};

function App() {
  const initialRoute = useMemo(getInitialRoute, []);
  const [gallery, setGallery] = useState<GalleryResponse | null>(null);
  const [rankingData, setRankingData] = useState<RankingResponse | null>(null);
  const [rankingPeriod, setRankingPeriod] = useState<RankingPeriod>("daily");
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
  const canAdminister = currentUser?.role === "admin";
  const canModerate = currentUser?.role === "admin" || currentUser?.role === "moderator";
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [passwordResetToken, setPasswordResetToken] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [view, setView] = useState<ViewMode>(initialRoute.view);
  const [profileUsername, setProfileUsername] = useState(initialRoute.username);
  const [routeArtworkId, setRouteArtworkId] = useState(initialRoute.artworkId);
  const [routeNovelId, setRouteNovelId] = useState(initialRoute.novelId);
  const [routeCollectionId, setRouteCollectionId] = useState(initialRoute.collectionId);
  const [routeSeriesId, setRouteSeriesId] = useState(initialRoute.seriesId);
  const [routeTag, setRouteTag] = useState(initialRoute.tag);
  const [sort, setSort] = useState<SortMode>("latest");
  const [query, setQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestionsResponse | null>(null);
  const [searchSuggestionsOpen, setSearchSuggestionsOpen] = useState(false);
  const [searchSuggestionsLoading, setSearchSuggestionsLoading] = useState(false);
  const [activeTag, setActiveTag] = useState("");
  const [matureFilter, setMatureFilter] = useState<MatureFilter>("all");
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [artworkDetail, setArtworkDetail] = useState<ArtworkResponse | null>(null);
  const [novelsData, setNovelsData] = useState<NovelListResponse | null>(null);
  const [novelDetail, setNovelDetail] = useState<NovelResponse | null>(null);
  const [novelLoading, setNovelLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadSubmitting, setUploadSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [postAuthSort, setPostAuthSort] = useState<SortMode | null>(null);
  const [galleryLoadingMore, setGalleryLoadingMore] = useState(false);
  const [contentAccessRevision, setContentAccessRevision] = useState(0);

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
    if (query.trim()) {
      params.set("q", query.trim());
    }
    if (activeTag) {
      params.set("tag", activeTag);
    }
    if (matureFilter !== "all") {
      params.set("rating", matureFilter);
    }
    return params;
  }, [activeTag, matureFilter, query, sort]);
  const galleryUrl = useMemo(() => `/api/gallery?${galleryParams.toString()}`, [galleryParams]);
  const novelParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", "24");
    if (query.trim()) {
      params.set("q", query.trim());
    }
    if (matureFilter !== "all") {
      params.set("rating", matureFilter);
    }
    return params;
  }, [matureFilter, query]);
  const novelsUrl = useMemo(() => `/api/novels?${novelParams.toString()}`, [novelParams]);

  useEffect(() => {
    const search = query.trim();
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
  }, [contentAccessRevision, currentUser?.id, query]);

  useEffect(() => {
    let cancelled = false;

    fetch(galleryUrl)
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
  }, [contentAccessRevision, currentUser?.id, galleryUrl]);

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
            ("message" in payload ? payload.message : undefined) ?? "Novels could not be loaded."
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
  }, [contentAccessRevision, currentUser?.id, rankingPeriod]);

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
    if (verified || emailChanged || resetToken) {
      params.delete("verified");
      params.delete("emailChanged");
      params.delete("resetToken");
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
    if (!authReady || !currentUser) {
      setNotifications(null);
      setNotificationsOpen(false);
      setTagSubscriptions(null);
      setCollections(null);
      setSeriesList(null);
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
    loadCollections,
    loadNotifications,
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
      setView("home");
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
      setProfileUsername(route.username);
      setRouteArtworkId(route.artworkId);
      setRouteNovelId(route.novelId);
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
            ("message" in payload ? payload.message : undefined) ?? "Novel could not be loaded."
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
          setAuthNotice(error instanceof Error ? error.message : "Novel could not be loaded.");
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
  const showHomeSortTabs = !isBookmarksView && !isSubscriptionsView;
  const accountNotice = dashboardMessage || authNotice;
  const hasAccountNotice =
    view !== "emailConfirmation" &&
    Boolean(accountNotice || (currentUser && !currentUser.emailVerified));
  const isNovelSection = view === "novels" || view === "novel";

  const pushRoute = (
    path: string,
    nextView: ViewMode,
    username = "",
    collectionId = "",
    seriesId = "",
    tag = ""
  ) => {
    setView(nextView);
    setProfileUsername(username);
    setRouteArtworkId("");
    setRouteNovelId("");
    setRouteCollectionId(collectionId);
    setRouteSeriesId(seriesId);
    setRouteTag(tag);
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== path) {
      window.history.pushState(null, "", path);
    }
  };

  const showHome = (nextSort: SortMode) => {
    pushRoute("/", "home");
    setSort(nextSort);
  };

  const showNovels = () => {
    setSelectedArtwork(null);
    setArtworkDetail(null);
    setNovelDetail(null);
    pushRoute("/novels", "novels");
  };

  const showBookmarks = () => {
    if (!currentUser) {
      setPostAuthSort("bookmarks");
      setAuthMode("login");
      setAuthNotice("Sign in to view your bookmarks.");
      setAuthOpen(true);
      return;
    }
    showHome("bookmarks");
  };

  const showTagSubscriptions = () => {
    if (!currentUser) {
      setPostAuthSort("subscriptions");
      setAuthMode("login");
      setAuthNotice("Sign in to follow tags.");
      setAuthOpen(true);
      return;
    }
    showHome("subscriptions");
  };

  const showTag = (tag: string) => {
    const cleaned = tag.replace(/^#/, "").trim();
    if (!cleaned) {
      return;
    }
    setSelectedArtwork(null);
    setArtworkDetail(null);
    setNovelDetail(null);
    pushRoute(`/tags/${encodeURIComponent(cleaned)}`, "tag", "", "", "", cleaned);
  };

  const showCreatorDiscover = () => {
    pushRoute("/creators", "creatorDiscover");
  };

  const showRankings = () => {
    pushRoute("/rankings", "rankings");
  };

  const showNotifications = () => {
    if (!currentUser) {
      openAuth("login");
      setAuthNotice("Sign in to view notifications.");
      return;
    }
    setNotificationsOpen(false);
    pushRoute("/notifications", "notifications");
  };

  const showCollections = () => {
    if (!currentUser) {
      openAuth("login");
      setAuthNotice("Sign in to manage collections.");
      return;
    }
    pushRoute("/collections", "collections");
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
    pushRoute(`/collections/${encodeURIComponent(collectionId)}`, "collection", "", collectionId);
  };

  const showSeriesList = () => {
    if (!currentUser) {
      openAuth("login");
      setAuthNotice("Sign in to manage series.");
      return;
    }
    pushRoute("/series", "seriesList");
  };

  const showSeries = (seriesId: string) => {
    if (!seriesId) {
      return;
    }
    setSelectedArtwork(null);
    setArtworkDetail(null);
    setNovelDetail(null);
    pushRoute(`/series/${encodeURIComponent(seriesId)}`, "series", "", "", seriesId);
  };

  const showAnalytics = () => {
    if (!currentUser) {
      openAuth("login");
      setAuthNotice("Sign in to view creator analytics.");
      return;
    }
    pushRoute("/analytics", "analytics");
  };

  const showDashboard = () => {
    if (!canModerate) {
      setDashboardMessage("Moderator access is required.");
      openAuth("login");
      return;
    }
    pushRoute("/#dashboard", "dashboard");
  };

  const showProfile = (username: string) => {
    const cleaned = username.replace(/^@/, "").trim();
    if (!cleaned) {
      return;
    }
    pushRoute(`/@${encodeURIComponent(cleaned)}`, "profile", cleaned);
  };

  const showProfileSettings = () => {
    if (!currentUser) {
      openAuth("login");
      return;
    }
    pushRoute("/settings/profile", "profileSettings");
  };

  const showPrivacySecurity = () => {
    if (!currentUser) {
      openAuth("login");
      return;
    }
    pushRoute("/settings/privacy-security", "privacySecurity");
  };

  const showPolicy = (nextView: "terms" | "privacy") => {
    pushRoute(nextView === "terms" ? "/terms" : "/privacy", nextView);
  };

  const openArtwork = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setRouteArtworkId(artwork.id);
    setRouteNovelId("");
    setView("home");
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
    setQuery(`#${tag}`);
    setSearchSuggestionsOpen(false);
    showTag(tag);
  };

  const openSuggestedCreator = (username: string) => {
    setQuery(`@${username}`);
    setSearchSuggestionsOpen(false);
    showProfile(username);
  };

  const openSuggestedArtwork = (artwork: SearchSuggestionsResponse["artworks"][number]) => {
    setQuery(artwork.title);
    setSearchSuggestionsOpen(false);
    openArtworkById(artwork.id);
  };

  const closeArtwork = () => {
    setSelectedArtwork(null);
    setArtworkDetail(null);
    setRouteArtworkId("");
    if (window.location.pathname.startsWith("/artworks/")) {
      pushRoute("/", "home");
    }
  };

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthNotice("");
    setAuthOpen(true);
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

  const handleAuthSuccess = (payload: AuthResponse) => {
    setCurrentUser(payload.user);
    setCsrfToken(payload.csrfToken);
    setAuthNotice(payload.message);
    setAuthOpen(false);
    if (postAuthSort) {
      showHome(postAuthSort);
      setPostAuthSort(null);
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
      if (
        view === "dashboard" ||
        view === "collections" ||
        view === "collection" ||
        view === "analytics" ||
        view === "seriesList" ||
        view === "series" ||
        view === "profileSettings" ||
        view === "privacySecurity" ||
        sort === "bookmarks" ||
        sort === "subscriptions"
      ) {
        showHome("latest");
      }
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
    setSelectedArtwork(null);
    setArtworkDetail(null);
    setAuthNotice(payload.message);
    showHome("latest");
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

  const handleLoadMoreGallery = async () => {
    if (!gallery?.nextCursor) {
      return;
    }
    setGalleryLoadingMore(true);
    const params = new URLSearchParams(galleryParams);
    params.set("cursor", gallery.nextCursor);
    try {
      const response = await fetch(`/api/gallery?${params.toString()}`);
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

  const handleSettingsUser = (user: AuthUser, notice = "Settings saved.") => {
    setCurrentUser(user);
    setAuthNotice(notice);
    setContentAccessRevision((revision) => revision + 1);
  };

  const searchSuggestionQueryActive = searchSuggestions?.query === query.trim();
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
            <div className="brand-mark">N</div>
            <div className="brand-wordmark" aria-label="NEHub">
              <strong>NEHub</strong>
              <span>art diary</span>
            </div>
            <nav className="main-nav" aria-label="Content types">
              <button
                className={classNames(view === "home" && "is-active")}
                type="button"
                onClick={() => showHome("latest")}
              >
                Illustrations
              </button>
              <button type="button">Manga</button>
              <button
                className={classNames((view === "novels" || view === "novel") && "is-active")}
                type="button"
                onClick={showNovels}
              >
                Novels
              </button>
            </nav>
          </div>

          <div className={classNames("searchbox", searchSuggestionsOpen && "is-open")}>
            <Search size={18} />
            <input
              value={query}
              onBlur={() => {
                window.setTimeout(() => setSearchSuggestionsOpen(false), 120);
              }}
              onChange={(event) => {
                setQuery(event.target.value);
                setSearchSuggestionsOpen(true);
              }}
              onFocus={() => setSearchSuggestionsOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setSearchSuggestionsOpen(false);
                }
              }}
              placeholder="Search works, creators, tags"
              type="search"
            />
            {searchSuggestionsOpen && query.trim().length >= 2 ? (
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
              onClick={openUpload}
            >
              <ImageUp size={17} />
              Post
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
          <button
            className={classNames("menu-item", view === "home" && sort === "latest" && "is-active")}
            type="button"
            onClick={() => showHome("latest")}
          >
            <Home size={18} />
            Home
          </button>
          <button
            className={classNames("menu-item", view === "home" && sort === "following" && "is-active")}
            type="button"
            onClick={() => showHome("following")}
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
            className={classNames("menu-item", view === "home" && sort === "subscriptions" && "is-active")}
            type="button"
            onClick={showTagSubscriptions}
          >
            <Bell size={18} />
            Tags
          </button>
          <button
            className={classNames("menu-item", isNovelSection && "is-active")}
            type="button"
            onClick={showNovels}
          >
            <NotebookText size={18} />
            Novels
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
            className={classNames("menu-item", view === "home" && sort === "bookmarks" && "is-active")}
            type="button"
            onClick={showBookmarks}
          >
            <Bookmark size={18} />
            Bookmarks
          </button>
          <button
            className={classNames("menu-item", view === "collectionDiscover" && "is-active")}
            type="button"
            onClick={showCollectionDiscover}
          >
            <FolderOpen size={18} />
            Collections
          </button>
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
        </aside>

        {view === "dashboard" ? (
          <Dashboard
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
            onUpload={openUpload}
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
            onDeleteReportedComment={handleDeleteReportedComment}
            onToggleUserSuspension={handleToggleUserSuspension}
            onSuspendReportedUser={handleSuspendReportedUser}
            onSaveTagAlias={handleSaveTagAlias}
            onDeleteTagAlias={handleDeleteTagAlias}
            onSaveTagImplication={handleSaveTagImplication}
            onDeleteTagImplication={handleDeleteTagImplication}
          />
        ) : view === "novels" ? (
          <NovelsPage
            data={novelsData}
            matureFilter={matureFilter}
            query={query}
            onMatureFilterChange={setMatureFilter}
            onAuthRequired={() => openAuth("login")}
            onOpenNovel={openNovel}
            onOpenProfile={showProfile}
            onPrivacySecurity={showPrivacySecurity}
          />
        ) : view === "novel" ? (
          <NovelDetailPage
            detail={novelDetail}
            loading={novelLoading}
            onBack={showNovels}
            onAuthRequired={() => openAuth("login")}
            onOpenNovel={openNovel}
            onOpenProfile={showProfile}
            onPrivacySecurity={showPrivacySecurity}
          />
        ) : view === "profile" ? (
          <ProfilePage
            username={profileUsername}
            csrfToken={csrfToken}
            siteKey={authConfig?.turnstileSiteKey ?? ""}
            currentUser={currentUser}
            onAuthRequired={() => openAuth("login")}
            onBookmark={handleBookmark}
            onOpenCollection={showCollection}
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
            data={notifications}
            currentUser={currentUser}
            onAuthRequired={() => openAuth("login")}
            onMarkRead={handleMarkNotificationsRead}
            onOpenNotification={handleOpenNotification}
            onRefresh={loadNotifications}
          />
        ) : view === "analytics" ? (
          <CreatorAnalyticsPage
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
          <CollectionsPage
            collections={collections?.collections ?? []}
            currentUser={currentUser}
            onAuthRequired={() => openAuth("login")}
            onCreateCollection={handleCreateCollection}
            onOpenCollection={showCollection}
          />
        ) : view === "collection" ? (
          <CollectionPage
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
        ) : view === "seriesList" ? (
          <SeriesListPage
            seriesList={seriesList?.series ?? []}
            currentUser={currentUser}
            onAuthRequired={() => openAuth("login")}
            onCreateSeries={handleCreateSeries}
            onOpenSeries={showSeries}
          />
        ) : view === "series" ? (
          <SeriesPage
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
        ) : view === "profileSettings" ? (
          <ProfileSettingsPage
            csrfToken={csrfToken}
            currentUser={currentUser}
            onAuthRequired={() => openAuth("login")}
            onOpenPrivacySecurity={showPrivacySecurity}
            onOpenProfile={showProfile}
            onSaved={handleSettingsUser}
          />
        ) : view === "privacySecurity" ? (
          <PrivacySecurityPage
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
            onHome={() => showHome("latest")}
            onOpenPrivacySecurity={showPrivacySecurity}
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
            onClose={() => showHome("latest")}
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
        ) : (
          <>
            <section className="feed-main">
              <MatureAccessNotice
                matureAccess={gallery?.matureAccess ?? null}
                onLogin={() => openAuth("login")}
                onPrivacySecurity={showPrivacySecurity}
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
                      onChange={(event) => setMatureFilter(event.target.value as MatureFilter)}
                    >
                      {matureFilterOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="filter-chip"
                    type="button"
                    onClick={() => {
                      setActiveTag("");
                      setQuery("");
                      setMatureFilter("all");
                    }}
                  >
                    {filterLabel}
                    <ChevronDown size={15} />
                  </button>
                </div>
              </div>

              {showHomeSortTabs ? (
                <div className="work-tabs" aria-label="Sort artwork">
                  {homeSortOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        className={classNames("work-tab", sort === option.value && "is-active")}
                        type="button"
                        onClick={() => setSort(option.value)}
                      >
                        <Icon size={16} />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <div className="tag-row" aria-label="Popular tags">
                {prominentTags.map((tag) => {
                  const subscribed = subscribedTagSet.has(tag.name.toLowerCase());
                  return (
                    <span className="tag-control" key={tag.name}>
                      <button
                        className="tag-pill"
                        type="button"
                        onClick={() => showTag(tag.name)}
                      >
                        #{tag.name}
                        <span>{tag.count}</span>
                      </button>
                      <button
                        className={classNames("tag-follow-button", subscribed && "is-active")}
                        type="button"
                        aria-label={`${subscribed ? "Unfollow" : "Follow"} #${tag.name}`}
                        onClick={() => handleToggleTagSubscription(tag.name)}
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
                    onSelect={openArtwork}
                    onOpenPage={openArtworkPage}
                    onBookmark={handleBookmark}
                    onOpenProfile={showProfile}
                  />
                ))}
              </div>
              {gallery?.nextCursor ? (
                <div className="load-more-row">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={handleLoadMoreGallery}
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
                        onClick={() => setRankingPeriod(period)}
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
                    onClick={() => openArtwork(artwork)}
                  >
                    <span className="rank-number">{index + 1}</span>
                    <img
                      src={artwork.thumbnailUrl}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                    <span>
                      <strong>{artwork.title}</strong>
                      <small>
                        {formatCount(score || artwork.likeCount)} recent likes
                      </small>
                    </span>
                  </button>
                ))}
                {rankingItems.length === 0 ? (
                  <p className="muted">No ranked works yet.</p>
                ) : null}
              </section>

              <ActivityPanel
                data={activityData}
                onOpenArtwork={openArtwork}
                onOpenProfile={showProfile}
              />

              <section className="side-panel creator-panel">
                <div className="panel-title">
                  <ShieldCheck size={18} />
                  Recommended users
                </div>
                {(gallery?.creators ?? []).slice(0, 5).map((creator) => (
                  <button
                    className="creator-row creator-row-link"
                    key={creator.id}
                    type="button"
                    onClick={() => showProfile(creator.handle)}
                  >
                    {creator.avatarUrl ? (
                      <img src={creator.avatarUrl} alt="" />
                    ) : (
                      <DefaultAvatar className="creator-row-avatar-fallback" name={creator.displayName} />
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
        )}
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

      {authOpen ? (
        <AuthDialog
          mode={authMode}
          siteKey={authConfig?.turnstileSiteKey ?? ""}
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
  initialResetToken: string;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
  onResetTokenConsumed: () => void;
  onSuccess: (payload: AuthResponse) => void;
};

function AuthDialog({
  mode,
  siteKey,
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
          code: String(formData.get("code") ?? "")
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
        body: JSON.stringify(passkeyAssertionPayload(credential))
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
          turnstileToken
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
  data: NotificationsResponse | null;
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onMarkRead: (notification?: UserNotification) => Promise<void> | void;
  onOpenNotification: (notification: UserNotification) => Promise<void> | void;
  onRefresh: () => Promise<void>;
};

function NotificationsPage({
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
      <section className="content-main notification-page">
        <p className="empty-feed">Sign in to view notifications.</p>
        <button className="primary-button" type="button" onClick={onAuthRequired}>
          <LogIn size={17} />
          Sign in
        </button>
      </section>
    );
  }

  return (
    <section className="content-main notification-page">
      <div className="settings-heading notification-page-heading">
        <div>
          <p className="eyebrow">Notifications</p>
          <h1>Notification center</h1>
          <p>
            {data
              ? `${formatCount(data.unreadCount)} unread updates from likes, comments, follows, and moderation.`
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
          const targetLabel = notification.artworkId
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
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onOpenArtwork: (artwork: Artwork) => void;
};

function CreatorAnalyticsPage({
  currentUser,
  onAuthRequired,
  onOpenArtwork
}: CreatorAnalyticsPageProps) {
  const [data, setData] = useState<CreatorAnalyticsResponse | null>(null);
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
      <section className="content-main analytics-page">
        <p className="empty-feed">Sign in to view creator analytics.</p>
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
    <section className="content-main analytics-page">
      <div className="settings-heading analytics-heading">
        <div>
          <p className="eyebrow">Creator studio</p>
          <h1>Artwork analytics</h1>
          <p>
            {data
              ? `${formatCount(summary?.views30d ?? 0)} views in the last 30 days.`
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
            <MetricTile label="Artworks" value={formatCount(summary?.artworks ?? 0)} />
            <MetricTile label="Mature works" value={formatCount(summary?.matureArtworks ?? 0)} />
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
                <p className="muted">Post artwork to start collecting analytics.</p>
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
          artwork per day.
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

type ActivityPanelProps = {
  data: ActivityResponse | null;
  onOpenArtwork: (artwork: Artwork) => void;
  onOpenProfile: (username: string) => void;
};

function ActivityPanel({ data, onOpenArtwork, onOpenProfile }: ActivityPanelProps) {
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
  onOpenProfile: (username: string) => void;
};

function ActivityRow({ item, onOpenArtwork, onOpenProfile }: ActivityRowProps) {
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

function Dashboard({
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
          <p>Worker, D1, R2, and content pipeline status for NEHub.</p>
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
  username: string;
  csrfToken: string;
  siteKey: string;
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onBookmark: (artwork: Artwork, visibility?: BookmarkVisibility) => void;
  onOpenCollection: (collectionId: string) => void;
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
  collections,
  currentUser,
  onAuthRequired,
  onCreateCollection,
  onOpenCollection
}: CollectionsPageProps) {
  const [name, setName] = useState("");
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
      <section className="content-main collection-page">
        <p className="empty-feed">Sign in to manage collection folders.</p>
        <button className="primary-button" type="button" onClick={onAuthRequired}>
          <LogIn size={17} />
          Sign in
        </button>
      </section>
    );
  }

  return (
    <section className="content-main collection-page">
      <div className="settings-heading collection-heading">
        <div>
          <p className="eyebrow">Collections</p>
          <h1>Artwork folders</h1>
          <p>Group saved works into private folders, then publish selected folders when they are ready.</p>
        </div>
      </div>

      <form className="collection-page-create" onSubmit={handleSubmit}>
        <input
          value={name}
          minLength={2}
          maxLength={60}
          onChange={(event) => setName(event.target.value)}
          placeholder="New folder name"
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
                {formatCount(collection.itemCount)} works · {collection.visibility}
              </small>
            </span>
            {collection.visibility === "public" ? <Eye size={16} /> : <Lock size={16} />}
          </button>
        ))}
      </div>
      {collections.length === 0 ? (
        <p className="empty-feed">No folders yet. Create one, then add works from an artwork page.</p>
      ) : null}
    </section>
  );
}

type CollectionPageProps = {
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

  return (
    <section className="content-main collection-page">
      {loading ? <p className="empty-feed">Loading collection.</p> : null}
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
              Folders
            </button>
            <div>
              <p className="eyebrow">Collection folder</p>
              <h1>{collection.name}</h1>
              <p>{collection.description || "No description."}</p>
              <div className="profile-meta">
                <button className="text-button" type="button" onClick={() => onOpenProfile(owner.handle)}>
                  @{owner.handle}
                </button>
                <span>{formatCount(detail.totalCount)} visible works</span>
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
                  <strong>Cover artwork</strong>
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
            <p className="empty-feed">No visible works in this folder.</p>
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
  seriesList: ArtworkSeries[];
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onCreateSeries: (title: string) => Promise<string>;
  onOpenSeries: (seriesId: string) => void;
};

function SeriesListPage({
  seriesList,
  currentUser,
  onAuthRequired,
  onCreateSeries,
  onOpenSeries
}: SeriesListPageProps) {
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
      setMessage(error instanceof Error ? error.message : "Unable to create series.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <section className="content-main collection-page series-page">
        <p className="empty-feed">Sign in to manage artwork series.</p>
        <button className="primary-button" type="button" onClick={onAuthRequired}>
          <LogIn size={17} />
          Sign in
        </button>
      </section>
    );
  }

  return (
    <section className="content-main collection-page series-page">
      <div className="settings-heading collection-heading">
        <div>
          <p className="eyebrow">Series</p>
          <h1>Artwork series</h1>
          <p>Order your own works into public or private multi-part galleries.</p>
        </div>
      </div>

      <form className="collection-page-create" onSubmit={handleSubmit}>
        <input
          value={title}
          minLength={2}
          maxLength={80}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="New series title"
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
                {formatCount(series.itemCount)} works · {series.visibility}
              </small>
            </span>
            {series.visibility === "public" ? <Eye size={16} /> : <Lock size={16} />}
          </button>
        ))}
      </div>
      {seriesList.length === 0 ? (
        <p className="empty-feed">No series yet. Create one, then add your works from an artwork page.</p>
      ) : null}
    </section>
  );
}

type SeriesPageProps = {
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

  return (
    <section className="content-main collection-page series-page">
      {loading ? <p className="empty-feed">Loading series.</p> : null}
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
              Series
            </button>
            <div>
              <p className="eyebrow">Artwork series</p>
              <h1>{series.title}</h1>
              <p>{series.description || "No description."}</p>
              <div className="profile-meta">
                <button className="text-button" type="button" onClick={() => onOpenProfile(owner.handle)}>
                  @{owner.handle}
                </button>
                <span>{formatCount(detail.totalCount)} visible works</span>
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
                  <strong>Cover artwork</strong>
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
                  {saving ? "Saving" : "Save series"}
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
            <p className="empty-feed">No visible works in this series.</p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

type ProfileTab = "works" | "public" | "private" | "collections" | "series";

function ProfilePage({
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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessage("");
    setProfileData(null);
    setActiveTab("works");
    setFollowListMode(null);
    setFollowListData(null);
    setFollowListMessage("");

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
  const tabs: Array<{ id: ProfileTab; label: string; count: number; icon: typeof Images }> = profileData
    ? [
        { id: "works", label: "Works", count: profileData.stats.artworks, icon: Images },
        {
          id: "public",
          label: "Public bookmarks",
          count: profileData.stats.publicBookmarks,
          icon: Bookmark
        },
        {
          id: "collections",
          label: "Collections",
          count: profileData.stats.publicCollections,
          icon: FolderOpen
        },
        {
          id: "series",
          label: "Series",
          count: profileData.stats.publicSeries,
          icon: ListOrdered
        },
        ...(ownProfile
          ? [
              {
                id: "private" as const,
                label: "Private bookmarks",
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
    <section className="content-main profile-page">
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
              <p className="eyebrow">Creator profile</p>
              <h1>{profile.displayName}</h1>
              <div className="profile-handle">
                <AtSign size={15} />
                {profile.username}
              </div>
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
                <span>{formatCount(profileData.stats.totalViews)} views</span>
                {ownProfile && currentUser ? (
                  <>
                    <span>{formatCount(currentUser.storage.siteCredits)} credits</span>
                    <span>{formatCount(currentUser.storage.remainingImages)} image slots</span>
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
                      {formatCount(collection.itemCount)} works · Updated{" "}
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
                      {formatCount(series.itemCount)} works · Updated{" "}
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
                ? "No public collections yet."
                : activeTab === "series"
                  ? "No public series yet."
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

type ProfileSettingsPageProps = {
  csrfToken: string;
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onOpenPrivacySecurity: () => void;
  onOpenProfile: (username: string) => void;
  onSaved: (user: AuthUser, notice?: string) => void;
};

function ProfileSettingsPage({
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

  return (
    <section className="content-main settings-page">
      <div className="settings-heading">
        <div>
          <p className="eyebrow">Account</p>
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
  const [totpSetup, setTotpSetup] = useState<TotpSetupResponse | null>(null);
  const [totpCode, setTotpCode] = useState("");
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
  const [sessionSaving, setSessionSaving] = useState<string | null>(null);
  const [unblockingUser, setUnblockingUser] = useState<string | null>(null);

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

  const handleTotpStart = async () => {
    if (securitySaving) {
      return;
    }
    setSecuritySaving(true);
    setSecurityMessage("");
    try {
      const response = await fetch("/api/settings/security/totp/start", {
        method: "POST",
        credentials: "include",
        headers: {
          [csrfHeaderName]: csrfToken
        }
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
    setSecuritySaving(true);
    setSecurityMessage("");
    try {
      const response = await fetch("/api/settings/security/totp", {
        method: "DELETE",
        credentials: "include",
        headers: {
          [csrfHeaderName]: csrfToken
        }
      });
      const payload = (await response.json()) as SecuritySettingsResponse | { message?: string };
      if (!response.ok || !("twoStep" in payload)) {
        throw new Error(payload.message ?? "Authenticator app could not be disabled.");
      }
      setTotpSetup(null);
      applySecuritySettingsResponse(payload);
    } catch (error) {
      setSecurityMessage(error instanceof Error ? error.message : "Authenticator app could not be disabled.");
    } finally {
      setSecuritySaving(false);
    }
  };

  const handleEmailMfaToggle = async (enabled: boolean) => {
    if (securitySaving) {
      return;
    }
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
        body: JSON.stringify({ enabled })
      });
      const payload = (await response.json()) as SecuritySettingsResponse | { message?: string };
      if (!response.ok || !("twoStep" in payload)) {
        throw new Error(payload.message ?? "Email sign-in codes could not be updated.");
      }
      applySecuritySettingsResponse(payload);
    } catch (error) {
      setSecurityMessage(
        error instanceof Error ? error.message : "Email sign-in codes could not be updated."
      );
    } finally {
      setSecuritySaving(false);
    }
  };

  const handleAddPasskey = async () => {
    if (securitySaving) {
      return;
    }
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
        body: JSON.stringify({ name: passkeyName })
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
        body: JSON.stringify(passkeyCreationPayload(credential, passkeyName))
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

  const handleDeletePasskey = async (id: string) => {
    if (securitySaving) {
      return;
    }
    setSecuritySaving(true);
    setSecurityMessage("");
    try {
      const response = await fetch(`/api/settings/security/passkeys/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          [csrfHeaderName]: csrfToken
        }
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

  return (
    <section className="content-main settings-page">
      <div className="settings-heading">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Privacy & security</h1>
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
                <button className="primary-button" type="submit" disabled={saving}>
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
                <button className="primary-button" type="submit" disabled={saving}>
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
              <div className="panel-title">
                <ShieldCheck size={18} />
                Two-step verification
              </div>
              {securityLoading ? <p className="muted">Loading account security.</p> : null}
              <div className="security-option-list">
                <article className="security-option">
                  <div>
                    <strong>Authenticator app</strong>
                    <span>{securitySettings?.twoStep.totpEnabled ? "Enabled" : "Off"}</span>
                  </div>
                  {securitySettings?.twoStep.totpEnabled ? (
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
                <article className="security-option">
                  <div>
                    <strong>Email codes</strong>
                    <span>{securitySettings?.twoStep.emailEnabled ? "Enabled" : "Off"}</span>
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={securitySaving}
                    onClick={() => void handleEmailMfaToggle(!securitySettings?.twoStep.emailEnabled)}
                  >
                    <MailCheck size={16} />
                    {securitySettings?.twoStep.emailEnabled ? "Disable" : "Enable"}
                  </button>
                </article>
              </div>
            </div>
          </section>

          <section className="settings-form passkeys-form">
            <div className="settings-panel">
              <div className="panel-title">
                <KeyRound size={18} />
                Passkeys
              </div>
              <div className="passkey-create-row">
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
                <p className="muted">No passkeys.</p>
              )}
              {securityMessage ? <p className="settings-message">{securityMessage}</p> : null}
            </div>
          </section>

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
  | { kind: "terms"; onOpenPrivacy: () => void; onOpenTerms?: never }
  | { kind: "privacy"; onOpenTerms: () => void; onOpenPrivacy?: never };

function PolicyPage(props: PolicyPageProps) {
  const isTerms = props.kind === "terms";
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
    <section className="content-main policy-page">
      <div className="policy-heading">
        <p className="eyebrow">NEHub</p>
        <h1>{isTerms ? "Terms of Use" : "Privacy Policy"}</h1>
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

type NovelsPageProps = {
  data: NovelListResponse | null;
  matureFilter: MatureFilter;
  query: string;
  onMatureFilterChange: (filter: MatureFilter) => void;
  onAuthRequired: () => void;
  onOpenNovel: (novelId: string) => void;
  onOpenProfile: (username: string) => void;
  onPrivacySecurity: () => void;
};

function NovelsPage({
  data,
  matureFilter,
  query,
  onMatureFilterChange,
  onAuthRequired,
  onOpenNovel,
  onOpenProfile,
  onPrivacySecurity
}: NovelsPageProps) {
  const novels = data?.novels ?? [];
  const featuredNovel = data?.featuredNovel ?? novels[0] ?? null;
  const totalWords = novels.reduce((sum, novel) => sum + novel.wordCount, 0);

  return (
    <section className="content-main novels-page">
      <MatureAccessNotice matureAccess={data?.matureAccess ?? null} onLogin={onAuthRequired} onPrivacySecurity={onPrivacySecurity} />
      <div className="novels-hero">
        <div className="novels-hero-copy">
          <p className="eyebrow">NEHub novels</p>
          <h1>Latest creator fiction</h1>
          <p>
            Short stories, serial chapters, and luminous fragments from NEHub creators.
          </p>
          <div className="novels-hero-stats" aria-label="Novel stats">
            <span>
              <strong>{formatCount(data?.totalCount ?? novels.length)}</strong>
              novels
            </span>
            <span>
              <strong>{formatCount(totalWords)}</strong>
              words
            </span>
            <span>
              <strong>{formatCount(data?.tags.length ?? 0)}</strong>
              tags
            </span>
          </div>
        </div>
        {featuredNovel ? (
          <button
            className="featured-novel"
            type="button"
            onClick={() => onOpenNovel(featuredNovel.id)}
            style={{ "--novel-cover": featuredNovel.coverColor } as CSSProperties}
          >
            <span className="novel-cover-mark">N</span>
            <span>
              <small>Featured</small>
              <strong>{featuredNovel.title}</strong>
              <em>{featuredNovel.excerpt}</em>
            </span>
          </button>
        ) : null}
      </div>

      <div className="novels-toolbar">
        <div>
          <h2>{query.trim() ? "Novel search results" : "Latest novels"}</h2>
          <p>
            {data
              ? `${formatCount(novels.length)} readable ${novels.length === 1 ? "story" : "stories"}`
              : "Loading novels."}
          </p>
        </div>
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
      </div>

      {data?.tags.length ? (
        <div className="tag-row novel-tag-row" aria-label="Novel tags">
          {data.tags.slice(0, 10).map((tag) => (
            <span className="tag-pill novel-tag-pill" key={tag.name}>
              #{tag.name}
              <span>{tag.count}</span>
            </span>
          ))}
        </div>
      ) : null}

      <div className="novel-grid" aria-live="polite">
        {novels.map((novel, index) => (
          <NovelCard
            key={novel.id}
            novel={novel}
            index={index}
            onOpenNovel={onOpenNovel}
            onOpenProfile={onOpenProfile}
          />
        ))}
      </div>

      {!data ? <p className="empty-feed">Loading novels.</p> : null}
      {data && novels.length === 0 ? (
        <p className="empty-feed">No novels match this view yet.</p>
      ) : null}

    </section>
  );
}

type NovelCardProps = {
  novel: Novel;
  index: number;
  onOpenNovel: (novelId: string) => void;
  onOpenProfile: (username: string) => void;
};

function NovelCard({ novel, index, onOpenNovel, onOpenProfile }: NovelCardProps) {
  const novelPath = `/novels/${encodeURIComponent(novel.id)}`;
  return (
    <article
      className="novel-card"
      style={{ "--novel-cover": novel.coverColor, animationDelay: `${Math.min(index * 36, 260)}ms` } as CSSProperties}
    >
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
          <small>{novel.id}</small>
          <strong>{novel.title}</strong>
          <em>{novel.excerpt}</em>
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
  onBack: () => void;
  onAuthRequired: () => void;
  onOpenNovel: (novelId: string) => void;
  onOpenProfile: (username: string) => void;
  onPrivacySecurity: () => void;
};

function NovelDetailPage({
  detail,
  loading,
  onBack,
  onAuthRequired,
  onOpenNovel,
  onOpenProfile,
  onPrivacySecurity
}: NovelDetailPageProps) {
  if (!detail) {
    return (
      <section className="content-main novel-detail-page">
        <p className="empty-feed">{loading ? "Loading novel." : "Novel could not be loaded."}</p>
      </section>
    );
  }
  const novel = detail.novel;
  const paragraphs = novel.body.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const relatedNovels = detail.relatedNovels;

  return (
    <article className="content-main novel-detail-page">
      <MatureAccessNotice matureAccess={detail?.matureAccess ?? null} onLogin={onAuthRequired} onPrivacySecurity={onPrivacySecurity} />
      <header className="novel-detail-hero" style={{ "--novel-cover": novel.coverColor } as CSSProperties}>
        <button className="secondary-button novel-back-button" type="button" onClick={onBack}>
          <ChevronUp size={16} />
          Novels
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
        <div className="novel-detail-metrics" aria-label="Novel metrics">
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
        </div>
      </header>

      <div className="novel-reading-layout">
        <div className="novel-body">
          {paragraphs.map((paragraph, index) => (
            <p key={`${novel.id}-${index}`}>{paragraph}</p>
          ))}
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
    </article>
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
                  {artworkVisibilityOptions.map((option) => (
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
  onTagsChange: (tags: string[]) => void;
};

function TagChipEditor({
  active,
  label,
  tags,
  hiddenName,
  placeholder = "landscape, fanart, original",
  onTagsChange
}: TagChipEditorProps) {
  const [tagDraft, setTagDraft] = useState("");
  const [tagSuggestions, setTagSuggestions] = useState<SearchSuggestionsResponse["tags"]>([]);
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
      fetch(`/api/search/suggestions?q=${encodeURIComponent(draft)}&limit=8`, {
        credentials: "include",
        signal: controller.signal
      })
        .then(async (response) => {
          const payload = (await response.json()) as SearchSuggestionsResponse | { message?: string };
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
  }, [active, tagDraft]);

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
