import { Hono } from "hono";
import { EmailMessage } from "cloudflare:email";
import { z } from "zod";
import type { Context } from "hono";
import type {
  AuthConfigResponse,
  AuthResponse,
  AuthSessionResponse,
  AuthUser,
  AdminStatsResponse,
  Artwork,
  ArtworkResponse,
  Comment,
  Creator,
  GalleryResponse,
  SortMode,
  UploadResponse
} from "../shared/types";
type Bindings = Env;
type AppContext = Context<{ Bindings: Bindings }>;

const app = new Hono<{ Bindings: Bindings }>();

const sessionCookieName = "nehub_session";
const csrfCookieName = "nehub_csrf";
const csrfHeaderName = "x-csrf-token";
const sessionDurationSeconds = 60 * 60 * 24 * 30;
const verificationTokenDurationSeconds = 60 * 60 * 24;
const passwordIterations = 120_000;
const passwordKeyLengthBytes = 32;
const maxUploadBytes = 10 * 1024 * 1024;
const bootstrapPasswordHash = "bootstrap-env";
const allowedUploadTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"]
]);

const uploadSchema = z.object({
  title: z.string().trim().min(2).max(120),
  caption: z.string().trim().max(800).default(""),
  tags: z.string().trim().max(240).default("original"),
  mature: z.enum(["true", "false"]).default("false")
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

const resendVerificationSchema = z.object({
  turnstileToken: z.string().min(1).max(4096)
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

const randomToken = (bytes = 32) => {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return toBase64Url(buffer);
};

const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(value));
  return toBase64Url(new Uint8Array(digest));
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

  const salt = fromBase64Url(saltValue);
  const expected = fromBase64Url(hashValue);
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
};

const getCookie = (request: Request, name: string) => {
  const header = request.headers.get("cookie");
  if (!header) {
    return undefined;
  }
  for (const part of header.split(";")) {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (rawKey === name) {
      return decodeURIComponent(rawValue.join("="));
    }
  }
  return undefined;
};

const secureCookieSuffix = (context: AppContext) => {
  const requestUrl = new URL(context.req.url);
  const forwardedProto = context.req.header("X-Forwarded-Proto");
  if (
    requestUrl.protocol === "https:" ||
    forwardedProto === "https" ||
    context.env.PUBLIC_APP_URL.startsWith("https://")
  ) {
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

const toIsoAfterSeconds = (seconds: number) =>
  new Date(Date.now() + seconds * 1000).toISOString();

const asSortMode = (value: string | null): SortMode => {
  if (
    value === "latest" ||
    value === "popular" ||
    value === "rising" ||
    value === "following" ||
    value === "bookmarks"
  ) {
    return value;
  }
  return "latest";
};

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

const filterAndSort = (
  artworks: Artwork[],
  search: string,
  tag: string,
  sort: SortMode
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

  if (sort === "bookmarks") {
    return result
      .filter((artwork) => artwork.bookmarked)
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
  creator_id: string;
  creator_handle: string;
  creator_display_name: string;
  creator_avatar_url: string;
  creator_bio: string;
  creator_follower_count: number;
  creator_following: number;
};

type CommentRow = {
  id: string;
  author: string;
  body: string;
  created_at: string;
};

type UserRow = {
  id: string;
  email: string;
  username: string;
  display_name: string;
  password_hash: string;
  role: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
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

const artworkFromRow = (row: ArtworkRow): Artwork => ({
  id: row.id,
  title: row.title,
  caption: row.caption,
  imageUrl: row.image_url,
  thumbnailUrl: row.thumbnail_url,
  width: row.width,
  height: row.height,
  dominantColor: row.dominant_color,
  tags: parseTags(row.tags_json),
  likeCount: row.like_count,
  bookmarkCount: row.bookmark_count,
  bookmarked: false,
  viewCount: row.view_count,
  commentCount: row.comment_count,
  createdAt: row.created_at,
  mature: Boolean(row.mature),
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

const commentFromRow = (row: CommentRow): Comment => ({
  id: row.id,
  author: row.author,
  body: row.body,
  createdAt: row.created_at
});

const authUserFromRow = (row: UserRow): AuthUser => ({
  id: row.id,
  email: row.email,
  username: row.username,
  displayName: row.display_name,
  role: row.role === "admin" ? "admin" : "member",
  emailVerified: Boolean(row.email_verified_at)
});

const requireD1 = (db: D1Database | undefined) => {
  if (!db) {
    throw new Error("D1 database is not bound");
  }
  return db;
};

const verifyTurnstile = async (
  context: AppContext,
  token: string,
  expectedAction: "register" | "login" | "resend"
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

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData
    }
  );
  const result = (await response.json()) as TurnstileResponse;
  if (!result.success) {
    return { ok: false, message: "Turnstile challenge failed." };
  }
  if (result.action && result.action !== expectedAction) {
    return { ok: false, message: "Turnstile action did not match this form." };
  }
  return { ok: true };
};

const escapeHeader = (value: string) => value.replace(/[\r\n"]/g, "");

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

const sendVerificationEmail = async (
  env: Bindings,
  user: AuthUser,
  verificationToken: string
) => {
  const appUrl = env.PUBLIC_APP_URL.replace(/\/$/, "");
  const verificationUrl = `${appUrl}/api/auth/verify-email?token=${encodeURIComponent(
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

const createSession = async (db: D1Database, userId: string) => {
  const token = randomToken(32);
  await db
    .prepare(
      `INSERT INTO auth_sessions
        (id, user_id, session_hash, expires_at)
       VALUES (?, ?, ?, ?)`
    )
    .bind(
      `ses_${crypto.randomUUID().replaceAll("-", "")}`,
      userId,
      await sha256(token),
      toIsoAfterSeconds(sessionDurationSeconds)
    )
    .run();
  return token;
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

  await db
    .prepare("UPDATE auth_sessions SET last_seen_at = CURRENT_TIMESTAMP WHERE session_hash = ?")
    .bind(tokenHash)
    .run();

  return authUserFromRow(row);
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
    creators.id AS creator_id,
    creators.handle AS creator_handle,
    creators.display_name AS creator_display_name,
    creators.avatar_url AS creator_avatar_url,
    creators.bio AS creator_bio,
    creators.follower_count AS creator_follower_count,
    creators.following AS creator_following
  FROM artworks
  JOIN creators ON creators.id = artworks.creator_id
`;

const getD1Artworks = async (db: D1Database) => {
  const result = await db
    .prepare(`${artworkSelect} ORDER BY datetime(artworks.created_at) DESC`)
    .all<ArtworkRow>();
  return result.results.map(artworkFromRow);
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
        `SELECT artwork_id
         FROM user_bookmarks
         WHERE user_id = ?
           AND artwork_id IN (${placeholders})`
      )
      .bind(viewerId, ...artworks.map((artwork) => artwork.id))
      .all<{ artwork_id: string }>();
    const bookmarkedIds = new Set(result.results.map((row) => row.artwork_id));
    return artworks.map((artwork) => ({
      ...artwork,
      bookmarked: bookmarkedIds.has(artwork.id)
    }));
  } catch (error) {
    console.warn("Unable to read viewer bookmarks", error);
    return artworks;
  }
};

const getD1Creators = async (db: D1Database) => {
  const result = await db
    .prepare(
      `SELECT
        id,
        handle,
        display_name,
        avatar_url,
        bio,
        follower_count,
        following
      FROM creators
      ORDER BY follower_count DESC`
    )
    .all<{
      id: string;
      handle: string;
      display_name: string;
      avatar_url: string;
      bio: string;
      follower_count: number;
      following: number;
    }>();

  return result.results.map(
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
};

const maybeGetD1Gallery = async (db: D1Database | undefined, viewerId?: string) => {
  if (!db) {
    return undefined;
  }

  try {
    const [rawArtworks, creators] = await Promise.all([getD1Artworks(db), getD1Creators(db)]);
    const artworks = await withViewerBookmarks(db, viewerId, rawArtworks);
    if (artworks.length === 0) {
      return undefined;
    }
    return { artworks, creators };
  } catch (error) {
    console.warn("Unable to read gallery from D1", error);
    return undefined;
  }
};

const getArtworkFromD1 = async (db: D1Database, id: string, viewerId?: string) => {
  const artwork = await db
    .prepare(`${artworkSelect} WHERE artworks.id = ? LIMIT 1`)
    .bind(id)
    .first<ArtworkRow>();
  if (!artwork) {
    return undefined;
  }

  const comments = await db
    .prepare(
      `SELECT id, author, body, created_at
       FROM comments
       WHERE artwork_id = ?
       ORDER BY datetime(created_at) DESC
       LIMIT 30`
    )
    .bind(id)
    .all<CommentRow>();

  const [artworkWithBookmarks] = await withViewerBookmarks(db, viewerId, [
    artworkFromRow(artwork)
  ]);

  return {
    artwork: artworkWithBookmarks,
    comments: comments.results.map(commentFromRow)
  };
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
  return context.json<AuthSessionResponse>({ user: user ?? null, csrfToken });
});

app.post("/api/auth/register", async (context) => {
  if (!context.env.DB) {
    return authUnavailable(context);
  }

  const parsed = await parseJson(context, registerSchema);
  if (!parsed.success) {
    return context.json({ message: "Registration details are invalid." }, 400);
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
      .bind(userId, email, username, displayName, await hashPassword(parsed.data.password))
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
  const sessionToken = await createSession(context.env.DB, authUser.id);
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
      created_at,
      updated_at
     FROM users
     WHERE email = ? OR username = ?
     LIMIT 1`
  )
    .bind(identifier, identifier)
    .first<UserRow>();

  let validPassword = user
    ? await verifyPassword(parsed.data.password, user.password_hash)
    : false;
  if (
    user &&
    !validPassword &&
    user.password_hash === bootstrapPasswordHash &&
    context.env.ADMIN_BOOTSTRAP_PASSWORD &&
    (await constantTimeStringEqual(parsed.data.password, context.env.ADMIN_BOOTSTRAP_PASSWORD))
  ) {
    await context.env.DB.prepare(
      "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND password_hash = ?"
    )
      .bind(await hashPassword(parsed.data.password), user.id, bootstrapPasswordHash)
      .run();
    validPassword = true;
  }

  if (!user || !validPassword) {
    return context.json({ message: "Email, username, or password is incorrect." }, 401);
  }

  const sessionToken = await createSession(context.env.DB, user.id);
  context.header("Set-Cookie", sessionCookie(context, sessionToken), { append: true });
  const csrfToken = await issueCsrfToken(context, sessionToken);

  return context.json<AuthResponse>({
    user: authUserFromRow(user),
    csrfToken,
    message: "Signed in."
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
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  if (user.emailVerified) {
    return context.json({ message: "Your email is already verified.", user });
  }

  const turnstile = await verifyTurnstile(context, parsed.data.turnstileToken, "resend");
  if (!turnstile.ok) {
    return context.json({ message: turnstile.message }, 403);
  }

  const verificationToken = await createVerificationToken(context.env.DB, user.id);
  await sendVerificationEmail(context.env, user, verificationToken);
  return context.json({ message: "Verification email sent.", user });
});

app.get("/api/auth/verify-email", async (context) => {
  if (!context.env.DB) {
    return context.text("D1 database is required for accounts.", 503);
  }

  const token = context.req.query("token");
  if (!token) {
    return context.text("Verification token is missing.", 400);
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
    return context.redirect("/?verified=invalid", 302);
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

  return context.redirect("/?verified=1", 302);
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
          SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS admins
         FROM users`
      )
      .first<{
        total_users: number;
        verified_users: number | null;
        admins: number | null;
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
    recentUsers: recentUsers.results.map((row) => ({
      id: row.id,
      email: row.email,
      username: row.username,
      displayName: row.display_name,
      role: row.role === "admin" ? "admin" : "member",
      emailVerified: Boolean(row.email_verified_at),
      createdAt: row.created_at
    }))
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
  const viewer = await getCurrentUser(context.env.DB, context.req.raw);
  const d1Gallery = await maybeGetD1Gallery(context.env.DB, viewer?.id);
  const allArtworks = d1Gallery?.artworks ?? [];
  const creators = d1Gallery?.creators ?? [];
  const artworks = filterAndSort(allArtworks, search, tag, sort);

  return context.json<GalleryResponse>({
    artworks,
    creators,
    tags: tagCounts(allArtworks),
    source: d1Gallery ? "d1" : "empty"
  });
});

app.get("/api/artworks/:id", async (context) => {
  const id = context.req.param("id");

  if (context.env.DB) {
    try {
      const viewer = await getCurrentUser(context.env.DB, context.req.raw);
      const d1Artwork = await getArtworkFromD1(context.env.DB, id, viewer?.id);
      if (d1Artwork) {
        return context.json<ArtworkResponse>({ ...d1Artwork, source: "d1" });
      }
    } catch (error) {
      console.warn("Unable to read artwork from D1", error);
    }
  }

  return context.json({ message: "Artwork not found" }, 404);
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
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  try {
    await context.env.DB.prepare(
      "UPDATE artworks SET like_count = like_count + 1 WHERE id = ?"
    )
      .bind(id)
      .run();
    const updated = await getArtworkFromD1(context.env.DB, id, user.id);
    if (updated) {
      return context.json({ artwork: updated.artwork });
    }
  } catch (error) {
    console.warn("Unable to persist like", error);
  }

  return context.json({ message: "Artwork not found" }, 404);
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

  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const artworkExists = await context.env.DB.prepare(
    "SELECT id FROM artworks WHERE id = ? LIMIT 1"
  )
    .bind(id)
    .first<{ id: string }>();
  if (!artworkExists) {
    return context.json({ message: "Artwork not found" }, 404);
  }

  const existing = await context.env.DB.prepare(
    "SELECT artwork_id FROM user_bookmarks WHERE user_id = ? AND artwork_id = ? LIMIT 1"
  )
    .bind(user.id, id)
    .first<{ artwork_id: string }>();

  if (existing) {
    await context.env.DB.batch([
      context.env.DB.prepare(
        "DELETE FROM user_bookmarks WHERE user_id = ? AND artwork_id = ?"
      ).bind(user.id, id),
      context.env.DB.prepare(
        "UPDATE artworks SET bookmark_count = MAX(bookmark_count - 1, 0) WHERE id = ?"
      ).bind(id)
    ]);
  } else {
    await context.env.DB.batch([
      context.env.DB.prepare(
        "INSERT INTO user_bookmarks (user_id, artwork_id) VALUES (?, ?)"
      ).bind(user.id, id),
      context.env.DB.prepare(
        "UPDATE artworks SET bookmark_count = bookmark_count + 1 WHERE id = ?"
      ).bind(id)
    ]);
  }

  const updated = await getArtworkFromD1(context.env.DB, id, user.id);
  if (!updated) {
    return context.json({ message: "Artwork not found" }, 404);
  }

  return context.json({ artwork: updated.artwork });
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
  const csrfError = await validateCsrf(context);
  if (csrfError) {
    return csrfError;
  }

  const body = await context.req.parseBody();
  const file = body.file;

  const parsed = uploadSchema.safeParse({
    title: body.title,
    caption: body.caption,
    tags: body.tags,
    mature: body.mature
  });

  if (!parsed.success) {
    return context.json({ message: "Upload metadata is invalid" }, 400);
  }

  if (!(file instanceof File)) {
    return context.json({ message: "Artwork file is required" }, 400);
  }
  if (file.size > maxUploadBytes) {
    return context.json({ message: "Artwork file must be 10 MB or smaller." }, 413);
  }
  const extension = allowedUploadTypes.get(file.type);
  if (!extension) {
    return context.json({ message: "Artwork file must be JPEG, PNG, WebP, or GIF." }, 415);
  }

  const id = `art_${crypto.randomUUID().replaceAll("-", "")}`;
  const objectKey = `artworks/${id}.${extension}`;
  const objectUrl = `/media/${objectKey}`;
  const tags = parsed.data.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
  const now = new Date().toISOString();

  await context.env.ARTWORKS.put(objectKey, file.stream(), {
    httpMetadata: {
      contentType: file.type || "application/octet-stream"
    },
    customMetadata: {
      title: parsed.data.title
    }
  });

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
    imageUrl: objectUrl,
    thumbnailUrl: objectUrl,
    width: 1200,
    height: 1600,
    dominantColor: "#0f766e",
    creator,
    tags: tags.length > 0 ? tags : ["original"],
    likeCount: 0,
    bookmarkCount: 0,
    bookmarked: false,
    viewCount: 0,
    commentCount: 0,
    createdAt: now,
    mature: parsed.data.mature === "true"
  };

  await context.env.DB.prepare(
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
      mature
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
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
      artwork.mature ? 1 : 0
    )
    .run();

  return context.json<UploadResponse>({
    artwork,
    persisted: true,
    message: "Artwork published."
  });
});

app.get("/media/*", async (context) => {
  if (!context.env.ARTWORKS) {
    return context.json({ message: "R2 bucket is not bound" }, 404);
  }

  const key = context.req.path.replace(/^\/media\//, "");
  if (!key.startsWith("artworks/") || key.includes("..")) {
    return context.json({ message: "Object not found" }, 404);
  }
  const object = await context.env.ARTWORKS.get(key);
  if (!object) {
    return context.json({ message: "Object not found" }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
});

app.notFound((context) => context.env.ASSETS.fetch(context.req.raw));

export default app;
