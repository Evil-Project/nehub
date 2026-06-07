import {
  Activity,
  AtSign,
  BarChart3,
  Bell,
  Bookmark,
  Calendar,
  ChevronDown,
  Cloud,
  Database,
  Eye,
  EyeOff,
  FileText,
  Flame,
  Grid3X3,
  HardDrive,
  Heart,
  Home,
  ImageUp,
  Images,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  MailCheck,
  MessageCircle,
  Search,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  UserCog,
  UserPlus,
  UserRound,
  X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type {
  AuthConfigResponse,
  AuthResponse,
  AuthSessionResponse,
  AuthUser,
  AdminStatsResponse,
  Artwork,
  ArtworkResponse,
  BookmarkVisibility,
  GalleryResponse,
  MatureAccess,
  PrivacySecuritySettingsResponse,
  ProfileSettingsResponse,
  SortMode,
  UserProfileResponse,
  UploadResponse
} from "../shared/types";

type HealthResponse = {
  ok: boolean;
  app: string;
  storage: {
    d1: boolean;
    r2: boolean;
  };
};

const sortOptions: { value: SortMode; label: string; icon: typeof Grid3X3 }[] = [
  { value: "latest", label: "Latest", icon: Grid3X3 },
  { value: "following", label: "Following", icon: Sparkles },
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

const classNames = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

const csrfHeaderName = "x-csrf-token";
const policyUpdatedDate = "June 7, 2026";

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

type ViewMode =
  | "home"
  | "dashboard"
  | "profile"
  | "profileSettings"
  | "privacySecurity"
  | "terms"
  | "privacy";
type AuthMode = "login" | "register";
type TurnstileAction = AuthMode | "resend";

const getInitialRoute = (): { view: ViewMode; username: string } => {
  if (typeof window === "undefined") {
    return { view: "home", username: "" };
  }
  if (window.location.hash === "#dashboard") {
    return { view: "dashboard", username: "" };
  }
  const pathname = decodeURIComponent(window.location.pathname);
  if (pathname.startsWith("/@")) {
    return { view: "profile", username: pathname.slice(2).replace(/^\/+|\/+$/g, "") };
  }
  if (pathname === "/settings/profile") {
    return { view: "profileSettings", username: "" };
  }
  if (pathname === "/settings/privacy-security") {
    return { view: "privacySecurity", username: "" };
  }
  if (pathname === "/terms") {
    return { view: "terms", username: "" };
  }
  if (pathname === "/privacy") {
    return { view: "privacy", username: "" };
  }
  return { view: "home", username: "" };
};

function App() {
  const initialRoute = useMemo(getInitialRoute, []);
  const [gallery, setGallery] = useState<GalleryResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStatsResponse | null>(null);
  const [dashboardMessage, setDashboardMessage] = useState("");
  const [authConfig, setAuthConfig] = useState<AuthConfigResponse | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [csrfToken, setCsrfToken] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authNotice, setAuthNotice] = useState("");
  const [view, setView] = useState<ViewMode>(initialRoute.view);
  const [profileUsername, setProfileUsername] = useState(initialRoute.username);
  const [sort, setSort] = useState<SortMode>("latest");
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [artworkDetail, setArtworkDetail] = useState<ArtworkResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [postAuthSort, setPostAuthSort] = useState<SortMode | null>(null);
  const [contentAccessRevision, setContentAccessRevision] = useState(0);

  const galleryUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("sort", sort);
    if (query.trim()) {
      params.set("q", query.trim());
    }
    if (activeTag) {
      params.set("tag", activeTag);
    }
    return `/api/gallery?${params.toString()}`;
  }, [activeTag, query, sort]);

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

    fetch("/api/auth/session", { credentials: "include" })
      .then((response) => response.json() as Promise<AuthSessionResponse>)
      .then((session) => {
        if (!cancelled) {
          setCurrentUser(session.user);
          setCsrfToken(session.csrfToken ?? "");
        }
      })
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
    if (verified === "1") {
      setAuthNotice("Email verified. Your account is ready.");
    } else if (verified === "invalid") {
      setAuthNotice("Verification link is invalid or expired.");
    }
    if (verified) {
      params.delete("verified");
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
  }, []);

  useEffect(() => {
    if (view !== "dashboard") {
      return;
    }
    if (!authReady) {
      return;
    }
    if (currentUser?.role !== "admin") {
      setDashboardMessage("Administrator access is required.");
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
  }, [authReady, currentUser?.role, view]);

  useEffect(() => {
    const handleRouteChange = () => {
      const route = getInitialRoute();
      setView(route.view);
      setProfileUsername(route.username);
    };

    window.addEventListener("hashchange", handleRouteChange);
    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("hashchange", handleRouteChange);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  useEffect(() => {
    if (!selectedArtwork) {
      setArtworkDetail(null);
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
  }, [selectedArtwork]);

  const artworks = gallery?.artworks ?? [];
  const prominentTags = gallery?.tags.slice(0, 12) ?? [];
  const ranking = [...artworks].sort((left, right) => right.likeCount - left.likeCount);
  const totalLikes = artworks.reduce((sum, artwork) => sum + artwork.likeCount, 0);
  const totalViews = artworks.reduce((sum, artwork) => sum + artwork.viewCount, 0);
  const isBookmarksView = sort === "bookmarks";
  const feedTitle = isBookmarksView ? "Bookmarked illustrations" : "Recommended illustrations";
  const feedMeta = isBookmarksView
    ? `${formatCount(artworks.length)} saved ${artworks.length === 1 ? "work" : "works"}`
    : `${formatCount(totalLikes)} likes across ${formatCount(totalViews)} views`;
  const filterLabel = isBookmarksView ? "All bookmarks" : "All work";

  const pushRoute = (path: string, nextView: ViewMode, username = "") => {
    setView(nextView);
    setProfileUsername(username);
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== path) {
      window.history.pushState(null, "", path);
    }
  };

  const showHome = (nextSort: SortMode) => {
    pushRoute("/", "home");
    setSort(nextSort);
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

  const showDashboard = () => {
    if (currentUser?.role !== "admin") {
      setDashboardMessage("Administrator access is required.");
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
      if (view === "dashboard" || view === "profileSettings" || view === "privacySecurity" || sort === "bookmarks") {
        showHome("latest");
      }
    }
    setAuthNotice(payload.message);
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

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/upload", {
      method: "POST",
      credentials: "include",
      headers: csrfToken ? { [csrfHeaderName]: csrfToken } : undefined,
      body: formData
    });
    const payload = (await response.json()) as UploadResponse | { message: string };

    if (!response.ok || !("artwork" in payload)) {
      setUploadMessage(payload.message);
      return;
    }

    setGallery((current) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        artworks: [payload.artwork, ...current.artworks]
      };
    });
    setUploadMessage(payload.message);
    form.reset();
  };

  const handleSettingsUser = (user: AuthUser) => {
    setCurrentUser(user);
    setAuthNotice("Settings saved.");
    setContentAccessRevision((revision) => revision + 1);
  };

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
              <button className="is-active" type="button">
                Illustrations
              </button>
              <button type="button">Manga</button>
              <button type="button">Novels</button>
            </nav>
          </div>

          <div className="searchbox">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search works, creators, tags"
              type="search"
            />
          </div>

          <div className="header-actions">
            <button className="icon-button" type="button" aria-label="Notifications">
              <Bell size={18} />
            </button>
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

      <div className="page-frame">
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
            className={classNames("menu-item", view === "home" && sort === "popular" && "is-active")}
            type="button"
            onClick={() => showHome("popular")}
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
          {currentUser?.role === "admin" ? (
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
            message={dashboardMessage}
            source={gallery?.source ?? "empty"}
            tagsCount={gallery?.tags.length ?? 0}
            creatorsCount={gallery?.creators.length ?? 0}
            totalLikes={totalLikes}
            totalViews={totalViews}
            onUpload={openUpload}
          />
        ) : view === "profile" ? (
          <ProfilePage
            username={profileUsername}
            currentUser={currentUser}
            onAuthRequired={() => openAuth("login")}
            onBookmark={handleBookmark}
            onOpenProfile={showProfile}
            onOpenPrivacySecurity={showPrivacySecurity}
            onOpenProfileSettings={showProfileSettings}
            onSelectArtwork={setSelectedArtwork}
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
            onOpenProfileSettings={showProfileSettings}
            onSaved={handleSettingsUser}
          />
        ) : view === "terms" ? (
          <PolicyPage kind="terms" onOpenPrivacy={() => showPolicy("privacy")} />
        ) : view === "privacy" ? (
          <PolicyPage kind="privacy" onOpenTerms={() => showPolicy("terms")} />
        ) : (
          <>
            <section className="feed-main">
              <AccountNotice
                notice={dashboardMessage || authNotice}
                siteKey={authConfig?.turnstileSiteKey ?? ""}
                user={currentUser}
                onDismiss={() => {
                  setAuthNotice("");
                  setDashboardMessage("");
                }}
                onResend={handleResendVerification}
              />
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
                <button
                  className="filter-chip"
                  type="button"
                  onClick={() => {
                    setActiveTag("");
                    setQuery("");
                  }}
                >
                  {filterLabel}
                  <ChevronDown size={15} />
                </button>
              </div>

              <div className="work-tabs" aria-label="Sort artwork">
                {sortOptions.map((option) => {
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

              <div className="tag-row" aria-label="Popular tags">
                {prominentTags.map((tag) => (
                  <button
                    key={tag.name}
                    className={classNames("tag-pill", activeTag === tag.name && "is-active")}
                    type="button"
                    onClick={() => setActiveTag(activeTag === tag.name ? "" : tag.name)}
                  >
                    #{tag.name}
                    <span>{tag.count}</span>
                  </button>
                ))}
              </div>

              <div className="art-grid" aria-live="polite">
                {artworks.map((artwork, index) => (
                  <ArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    index={index}
                    onSelect={setSelectedArtwork}
                    onBookmark={handleBookmark}
                    onOpenProfile={showProfile}
                  />
                ))}
              </div>
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
                <div className="panel-title">
                  <Trophy size={18} />
                  Daily ranking
                </div>
                {ranking.slice(0, 5).map((artwork, index) => (
                  <button
                    className="ranking-row"
                    key={artwork.id}
                    type="button"
                    onClick={() => setSelectedArtwork(artwork)}
                  >
                    <span className="rank-number">{index + 1}</span>
                    <img src={artwork.thumbnailUrl} alt="" />
                    <span>
                      <strong>{artwork.title}</strong>
                      <small>{formatCount(artwork.likeCount)} likes</small>
                    </span>
                  </button>
                ))}
              </section>

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
                    <img src={creator.avatarUrl} alt="" />
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
          onClose={() => setSelectedArtwork(null)}
          onLike={handleLike}
          onBookmark={handleBookmark}
          onOpenProfile={showProfile}
        />
      ) : null}

      <UploadDrawer
        open={uploadOpen}
        message={uploadMessage}
        matureAccess={gallery?.matureAccess ?? null}
        onClose={() => setUploadOpen(false)}
        onOpenPrivacySecurity={showPrivacySecurity}
        onSubmit={handleUpload}
      />

      {authOpen ? (
        <AuthDialog
          mode={authMode}
          siteKey={authConfig?.turnstileSiteKey ?? ""}
          onClose={() => setAuthOpen(false)}
          onModeChange={setAuthMode}
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
      <span className={classNames("verify-dot", (user.emailVerified || user.role === "admin") && "is-verified")} />
      <button className="account-name" type="button" onClick={onProfile}>
        {user.displayName}
      </button>
      <small>{user.role === "admin" ? "Admin" : user.emailVerified ? "Verified" : "Pending"}</small>
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
          <strong>{needsVerification ? "Verify your email" : notice}</strong>
          {needsVerification ? <span>{notice || "Check your inbox for the account link."}</span> : null}
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
        size: compact ? "compact" : "normal"
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
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
  onSuccess: (payload: AuthResponse) => void;
};

function AuthDialog({ mode, siteKey, onClose, onModeChange, onSuccess }: AuthDialogProps) {
  const [turnstileToken, setTurnstileToken] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isRegister = mode === "register";

  const handleModeChange = (nextMode: AuthMode) => {
    setMessage("");
    setTurnstileToken("");
    onModeChange(nextMode);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
      const payload = (await response.json()) as AuthResponse | { message: string };
      if (!response.ok || !("user" in payload)) {
        setMessage(payload.message);
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
          <h2>{isRegister ? "Create account" : "Welcome back"}</h2>
        </div>
        <div className="auth-panel">
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
            {message ? <p className="auth-message">{message}</p> : null}
          </form>
        </div>
      </section>
    </div>
  );
}

type DashboardProps = {
  artworks: Artwork[];
  health: HealthResponse | null;
  adminStats: AdminStatsResponse | null;
  message: string;
  source: GalleryResponse["source"];
  tagsCount: number;
  creatorsCount: number;
  totalLikes: number;
  totalViews: number;
  onUpload: () => void;
};

function Dashboard({
  artworks,
  health,
  adminStats,
  message,
  source,
  tagsCount,
  creatorsCount,
  totalLikes,
  totalViews,
  onUpload
}: DashboardProps) {
  const recent = [...artworks].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
  const contentStats = adminStats?.content;
  const accountStats = adminStats?.accounts;

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

        <section className="dashboard-panel recent-users-panel">
          <div className="panel-title">
            <ShieldCheck size={18} />
            Recent users
          </div>
          {(adminStats?.recentUsers ?? []).map((user) => (
            <div className="admin-user-row" key={user.id}>
              <span className={classNames("verify-dot", user.emailVerified && "is-verified")} />
              <div>
                <strong>{user.displayName}</strong>
                <span>
                  @{user.username} · {user.role} · {dateFormat.format(new Date(user.createdAt))}
                </span>
              </div>
            </div>
          ))}
          {adminStats && adminStats.recentUsers.length === 0 ? (
            <p className="muted">No users yet.</p>
          ) : null}
        </section>

        <section className="dashboard-panel recent-panel">
          <div className="panel-title">
            <Grid3X3 size={18} />
            Recent works
          </div>
          {recent.slice(0, 6).map((artwork) => (
            <div className="recent-row" key={artwork.id}>
              <img src={artwork.thumbnailUrl} alt="" />
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

type ProfilePageProps = {
  username: string;
  currentUser: AuthUser | null;
  onAuthRequired: () => void;
  onBookmark: (artwork: Artwork, visibility?: BookmarkVisibility) => void;
  onOpenProfile: (username: string) => void;
  onOpenPrivacySecurity: () => void;
  onOpenProfileSettings: () => void;
  onSelectArtwork: (artwork: Artwork) => void;
};

type ProfileTab = "works" | "public" | "private";

function ProfilePage({
  username,
  currentUser,
  onAuthRequired,
  onBookmark,
  onOpenProfile,
  onOpenPrivacySecurity,
  onOpenProfileSettings,
  onSelectArtwork
}: ProfilePageProps) {
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<ProfileTab>("works");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessage("");
    setProfileData(null);
    setActiveTab("works");

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
  }, [currentUser?.id, username]);

  const profile = profileData?.profile;
  const ownProfile = Boolean(profile?.ownProfile);
  const tabs: Array<{ id: ProfileTab; label: string; count: number; icon: typeof Images }> = profileData
    ? [
        { id: "works", label: "Works", count: profileData.stats.artworks, icon: Images },
        {
          id: "public",
          label: "Public bookmarks",
          count: profileData.stats.publicBookmarks,
          icon: Bookmark
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
              <div className="profile-avatar profile-avatar-fallback">
                {profile.displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="profile-copy">
              <p className="eyebrow">Creator profile</p>
              <h1>{profile.displayName}</h1>
              <div className="profile-handle">
                <AtSign size={15} />
                {profile.username}
              </div>
              {profile.bio ? <p>{profile.bio}</p> : null}
              <div className="profile-meta">
                <span>{formatCount(profile.followerCount)} followers</span>
                <span>{formatCount(profileData.stats.totalLikes)} likes</span>
                <span>{formatCount(profileData.stats.totalViews)} views</span>
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
              <button className="secondary-button profile-follow-button" type="button">
                <UserPlus size={16} />
                Follow
              </button>
            ) : (
              <button className="secondary-button profile-follow-button" type="button" onClick={onAuthRequired}>
                <LogIn size={16} />
                Sign in
              </button>
            )}
          </div>

          <MatureAccessNotice
            matureAccess={profileData.matureAccess}
            onLogin={onAuthRequired}
            onPrivacySecurity={onOpenPrivacySecurity}
          />

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
          {visibleArtworks.length === 0 ? (
            <p className="empty-feed">No works in this section.</p>
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
  onSaved: (user: AuthUser) => void;
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
    bio: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      onSaved(payload.user);
      setMessage("Profile saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profile could not be saved.");
    } finally {
      setSaving(false);
    }
  };

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
      {!currentUser ? (
        <button className="primary-button" type="button" onClick={onAuthRequired}>
          <LogIn size={17} />
          Sign in
        </button>
      ) : null}
      {settings ? (
        <form className="settings-form" onSubmit={handleSubmit}>
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
            Avatar URL
            <input
              value={formState.avatarUrl}
              maxLength={500}
              onChange={(event) => setFormState((current) => ({ ...current, avatarUrl: event.target.value }))}
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
  onOpenProfileSettings: () => void;
  onSaved: (user: AuthUser) => void;
};

function PrivacySecurityPage({
  csrfToken,
  currentUser,
  onAuthRequired,
  onOpenProfileSettings,
  onSaved
}: PrivacySecurityPageProps) {
  const [settings, setSettings] = useState<PrivacySecuritySettingsResponse | null>(null);
  const [bookmarkDefaultVisibility, setBookmarkDefaultVisibility] =
    useState<BookmarkVisibility>("public");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [matureContentEnabled, setMatureContentEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
          setDateOfBirth(payload.privacy.dateOfBirth ?? "");
          setMatureContentEnabled(payload.privacy.matureContentEnabled);
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/settings/privacy-security", {
        method: "PUT",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          [csrfHeaderName]: csrfToken
        },
        body: JSON.stringify({
          bookmarkDefaultVisibility,
          dateOfBirth: dateOfBirth || null,
          matureContentEnabled
        })
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
      setDateOfBirth(payload.privacy.dateOfBirth ?? "");
      setMatureContentEnabled(payload.privacy.matureContentEnabled);
      onSaved(payload.user);
      setMessage("Privacy settings saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Privacy settings could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const matureAccess = settings?.matureAccess ?? null;

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
        <form className="settings-form privacy-form" onSubmit={handleSubmit}>
          <section className="settings-panel">
            <div className="panel-title">
              <Bookmark size={18} />
              Bookmark default
            </div>
            <div className="segmented-control" aria-label="Default bookmark visibility">
              <button
                className={classNames(bookmarkDefaultVisibility === "public" && "is-active")}
                type="button"
                onClick={() => setBookmarkDefaultVisibility("public")}
              >
                <Eye size={16} />
                Public
              </button>
              <button
                className={classNames(bookmarkDefaultVisibility === "private" && "is-active")}
                type="button"
                onClick={() => setBookmarkDefaultVisibility("private")}
              >
                <Lock size={16} />
                Private
              </button>
            </div>
          </section>

          <section className="settings-panel">
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
          </section>

          <div className="settings-actions">
            <button className="primary-button" type="submit" disabled={saving}>
              <ShieldCheck size={17} />
              {saving ? "Saving" : "Save privacy"}
            </button>
          </div>
        </form>
      ) : null}
      {message ? <p className="settings-message">{message}</p> : null}
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

type ArtworkCardProps = {
  artwork: Artwork;
  index: number;
  onSelect: (artwork: Artwork) => void;
  onBookmark: (artwork: Artwork, visibility?: BookmarkVisibility) => void;
  onOpenProfile: (username: string) => void;
};

function ArtworkCard({
  artwork,
  index,
  onSelect,
  onBookmark,
  onOpenProfile
}: ArtworkCardProps) {
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
        <img src={artwork.thumbnailUrl} alt={artwork.title} loading="lazy" />
      </button>
      <div className="art-card-body">
        <h3>{artwork.title}</h3>
        <button className="creator-mini creator-mini-link" type="button" onClick={() => onOpenProfile(artwork.creator.handle)}>
          <img src={artwork.creator.avatarUrl} alt="" />
          <span>{artwork.creator.displayName}</span>
        </button>
      </div>
      <div className="art-stats">
        <span>
          <Heart size={14} />
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
          onClick={() => onBookmark(artwork)}
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
  onClose: () => void;
  onLike: (artwork: Artwork) => void;
  onBookmark: (artwork: Artwork, visibility?: BookmarkVisibility) => void;
  onOpenProfile: (username: string) => void;
};

function ArtworkDialog({
  detail,
  fallbackArtwork,
  loading,
  onClose,
  onLike,
  onBookmark,
  onOpenProfile
}: ArtworkDialogProps) {
  const artwork = detail?.artwork ?? fallbackArtwork;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="art-modal">
        <button className="close-button" type="button" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        <div className="modal-art-stage">
          <img src={artwork.imageUrl} alt={artwork.title} />
        </div>
        <aside className="modal-detail">
          <button className="artist-block artist-block-link" type="button" onClick={() => onOpenProfile(artwork.creator.handle)}>
            <img src={artwork.creator.avatarUrl} alt="" />
            <div>
              <strong>{artwork.creator.displayName}</strong>
              <span>@{artwork.creator.handle}</span>
            </div>
          </button>
          <h2>{artwork.title}</h2>
          <p>{artwork.caption}</p>
          <div className="tag-row modal-tags">
            {artwork.tags.map((tag) => (
              <span className="tag-pill" key={tag}>
                #{tag}
              </span>
            ))}
          </div>
          <div className="modal-actions">
            <button className="primary-button" type="button" onClick={() => onLike(artwork)}>
              <Heart size={17} />
              {formatCount(artwork.likeCount)}
            </button>
            <button
              className={classNames("secondary-button", artwork.bookmarked && "is-active")}
              type="button"
              onClick={() => onBookmark(artwork)}
            >
              <Bookmark size={17} fill={artwork.bookmarked ? "currentColor" : "none"} />
              {artwork.bookmarked ? "Bookmarked" : "Bookmark"}
              <span>{formatCount(artwork.bookmarkCount)}</span>
            </button>
          </div>
          <div className="bookmark-privacy-control" aria-label="Bookmark visibility">
            <button
              className={classNames(artwork.bookmarkVisibility === "public" && "is-active")}
              type="button"
              onClick={() => onBookmark(artwork, "public")}
            >
              <Eye size={15} />
              Public
            </button>
            <button
              className={classNames(artwork.bookmarkVisibility === "private" && "is-active")}
              type="button"
              onClick={() => onBookmark(artwork, "private")}
            >
              <Lock size={15} />
              Private
            </button>
          </div>
          <div className="comment-list">
            <div className="panel-title">
              <MessageCircle size={18} />
              Comments
            </div>
            {loading ? <p className="muted">Loading comments</p> : null}
            {(detail?.comments ?? []).map((comment) => (
              <div className="comment-row" key={comment.id}>
                <strong>{comment.author}</strong>
                <p>{comment.body}</p>
              </div>
            ))}
            {!loading && (detail?.comments ?? []).length === 0 ? (
              <p className="muted">No comments yet.</p>
            ) : null}
          </div>
        </aside>
      </section>
    </div>
  );
}

type UploadDrawerProps = {
  open: boolean;
  message: string;
  matureAccess: MatureAccess | null;
  onClose: () => void;
  onOpenPrivacySecurity: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function UploadDrawer({
  open,
  message,
  matureAccess,
  onClose,
  onOpenPrivacySecurity,
  onSubmit
}: UploadDrawerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState("Choose image");
  const matureBlocked = matureAccess ? !matureAccess.allowed : true;

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
        <form onSubmit={onSubmit} className="upload-form">
          <label>
            Title
            <input name="title" minLength={2} maxLength={120} required />
          </label>
          <label>
            Caption
            <textarea name="caption" rows={4} maxLength={800} />
          </label>
          <label>
            Tags
            <input name="tags" defaultValue="original, study" />
          </label>
          <label className="toggle-row">
            <span>Mature content</span>
            <input name="mature" type="checkbox" value="true" disabled={matureBlocked} />
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
          <button
            className="file-picker"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageUp size={18} />
            {fileName}
          </button>
          <input
            ref={fileInputRef}
            className="visually-hidden"
            name="file"
            type="file"
            accept="image/*"
            required
            onChange={(event) => {
              const file = event.target.files?.[0];
              setFileName(file?.name ?? "Choose image");
            }}
          />
          <button className="primary-button" type="submit">
            <ImageUp size={18} />
            Publish
          </button>
          {message ? <p className="upload-message">{message}</p> : null}
        </form>
      </aside>
    </div>
  );
}

export default App;
