import {
  Activity,
  BarChart3,
  Bell,
  Bookmark,
  ChevronDown,
  Cloud,
  Database,
  Eye,
  Flame,
  Grid3X3,
  HardDrive,
  Heart,
  Home,
  ImageUp,
  LogIn,
  LogOut,
  MailCheck,
  MessageCircle,
  Search,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
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
  Artwork,
  ArtworkResponse,
  GalleryResponse,
  SortMode,
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
  { value: "popular", label: "Popular", icon: Flame },
  { value: "rising", label: "Rising", icon: TrendingUp },
  { value: "following", label: "Following", icon: Sparkles }
];

const numberFormat = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1
});

const dateFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric"
});

const formatCount = (value: number) => numberFormat.format(value);

const classNames = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

type ViewMode = "home" | "dashboard";
type AuthMode = "login" | "register";
type TurnstileAction = AuthMode | "resend";

const getInitialView = (): ViewMode => {
  if (typeof window === "undefined") {
    return "home";
  }
  return window.location.hash === "#dashboard" ? "dashboard" : "home";
};

function App() {
  const [gallery, setGallery] = useState<GalleryResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [authConfig, setAuthConfig] = useState<AuthConfigResponse | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authNotice, setAuthNotice] = useState("");
  const [view, setView] = useState<ViewMode>(getInitialView);
  const [sort, setSort] = useState<SortMode>("latest");
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [artworkDetail, setArtworkDetail] = useState<ArtworkResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

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
  }, [galleryUrl]);

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
        }
      })
      .catch((error: unknown) => {
        console.error("Unable to load auth session", error);
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

    fetch("/api/health")
      .then((response) => response.json() as Promise<HealthResponse>)
      .then(setHealth)
      .catch((error: unknown) => {
        console.error("Unable to load health state", error);
      });
  }, [view]);

  useEffect(() => {
    const handleHashChange = () => {
      setView(getInitialView());
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
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

  const showHome = (nextSort: SortMode) => {
    setView("home");
    setSort(nextSort);
    if (window.location.hash) {
      window.history.pushState(null, "", window.location.pathname + window.location.search);
    }
  };

  const showDashboard = () => {
    setView("dashboard");
    if (window.location.hash !== "#dashboard") {
      window.location.hash = "dashboard";
    }
  };

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthNotice("");
    setAuthOpen(true);
  };

  const openUpload = () => {
    if (!currentUser) {
      openAuth("register");
      return;
    }
    setUploadOpen(true);
  };

  const handleAuthSuccess = (payload: AuthResponse) => {
    setCurrentUser(payload.user);
    setAuthNotice(payload.message);
    setAuthOpen(false);
  };

  const handleLogout = async () => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });
    const payload = (await response.json().catch(() => ({ message: "Signed out." }))) as {
      message: string;
    };
    setCurrentUser(null);
    setAuthNotice(payload.message);
  };

  const handleResendVerification = useCallback(async (turnstileToken: string) => {
    const response = await fetch("/api/auth/resend-verification", {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json"
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
  }, []);

  const handleLike = async (artwork: Artwork) => {
    const response = await fetch(`/api/artworks/${artwork.id}/like`, {
      method: "POST"
    });
    const payload = (await response.json()) as { artwork: Artwork };
    setGallery((current) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        artworks: current.artworks.map((item) =>
          item.id === payload.artwork.id ? payload.artwork : item
        )
      };
    });
    setSelectedArtwork((current) =>
      current?.id === payload.artwork.id ? payload.artwork : current
    );
    setArtworkDetail((current) =>
      current?.artwork.id === payload.artwork.id
        ? { ...current, artwork: payload.artwork }
        : current
    );
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/upload", {
      method: "POST",
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
            className="menu-item"
            type="button"
            onClick={() => showHome("latest")}
          >
            <Bookmark size={18} />
            Bookmarks
          </button>
          <button
            className={classNames("menu-item", view === "dashboard" && "is-active")}
            type="button"
            onClick={showDashboard}
          >
            <BarChart3 size={18} />
            Dashboard
          </button>
        </aside>

        {view === "dashboard" ? (
          <Dashboard
            artworks={artworks}
            health={health}
            source={gallery?.source ?? "seed"}
            tagsCount={gallery?.tags.length ?? 0}
            creatorsCount={gallery?.creators.length ?? 0}
            totalLikes={totalLikes}
            totalViews={totalViews}
            onUpload={openUpload}
          />
        ) : (
          <>
            <section className="feed-main">
              <AccountNotice
                notice={authNotice}
                siteKey={authConfig?.turnstileSiteKey ?? ""}
                user={currentUser}
                onDismiss={() => setAuthNotice("")}
                onResend={handleResendVerification}
              />
              <div className="section-heading">
                <div>
                  <h1>Recommended illustrations</h1>
                  <p>{formatCount(totalLikes)} likes across {formatCount(totalViews)} views</p>
                </div>
                <button
                  className="filter-chip"
                  type="button"
                  onClick={() => {
                    setActiveTag("");
                    setQuery("");
                  }}
                >
                  All work
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
                    onLike={handleLike}
                  />
                ))}
              </div>
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
                  <div className="creator-row" key={creator.id}>
                    <img src={creator.avatarUrl} alt="" />
                    <div>
                      <strong>{creator.displayName}</strong>
                      <span>@{creator.handle}</span>
                    </div>
                    <button type="button" aria-label={`Follow ${creator.displayName}`}>
                      <UserPlus size={15} />
                    </button>
                  </div>
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
        />
      ) : null}

      <UploadDrawer
        open={uploadOpen}
        message={uploadMessage}
        onClose={() => setUploadOpen(false)}
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
};

function AccountControl({ user, onLogin, onRegister, onLogout }: AccountControlProps) {
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
    <div className="account-chip">
      <span className={classNames("verify-dot", user.emailVerified && "is-verified")} />
      <span className="account-name">{user.displayName}</span>
      <small>{user.emailVerified ? "Verified" : "Pending"}</small>
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

  return (
    <section className="dashboard-main" aria-label="Operations dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">Operations</p>
          <h1>Cloudflare dashboard</h1>
          <p>Worker, D1, R2, and content pipeline status for NEHub.</p>
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
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-panel metric-panel">
          <div className="panel-title">
            <Activity size={18} />
            Content metrics
          </div>
          <div className="metric-grid">
            <MetricTile label="Artworks" value={formatCount(artworks.length)} />
            <MetricTile label="Creators" value={formatCount(creatorsCount)} />
            <MetricTile label="Tags" value={formatCount(tagsCount)} />
            <MetricTile label="Likes" value={formatCount(totalLikes)} />
            <MetricTile label="Views" value={formatCount(totalViews)} />
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
            value={source === "d1" ? "Persisted" : "Seeded"}
            active={source === "d1"}
          />
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
  onLike: (artwork: Artwork) => void;
};

function ArtworkCard({ artwork, index, onSelect, onLike }: ArtworkCardProps) {
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
        <div className="creator-mini">
          <img src={artwork.creator.avatarUrl} alt="" />
          <span>{artwork.creator.displayName}</span>
        </div>
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
          className="bookmark-button"
          type="button"
          onClick={() => onLike(artwork)}
          aria-label={`Like ${artwork.title}`}
        >
          <Heart size={15} />
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
};

function ArtworkDialog({
  detail,
  fallbackArtwork,
  loading,
  onClose,
  onLike
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
          <div className="artist-block">
            <img src={artwork.creator.avatarUrl} alt="" />
            <div>
              <strong>{artwork.creator.displayName}</strong>
              <span>@{artwork.creator.handle}</span>
            </div>
          </div>
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
            <button className="secondary-button" type="button">
              <Bookmark size={17} />
              Bookmark
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
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function UploadDrawer({ open, message, onClose, onSubmit }: UploadDrawerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState("Choose image");

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
            <input name="mature" type="checkbox" value="true" />
          </label>
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
