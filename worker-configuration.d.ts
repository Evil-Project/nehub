interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
  ARTWORKS?: R2Bucket;
  EMAIL?: SendEmail;
  PUBLIC_APP_NAME: string;
  PUBLIC_APP_URL: string;
  PUBLIC_ARTWORK_MEDIA_URL?: string;
  PUBLIC_TURNSTILE_SITE_KEY: string;
  AUTH_EMAIL_FROM: string;
  TURNSTILE_SECRET_KEY?: string;
  ADMIN_BOOTSTRAP_PASSWORD?: string;
  DISCORD_CLIENT_ID?: string;
  DISCORD_CLIENT_SECRET?: string;
  DISCORD_REDIRECT_URI?: string;
  MATURE_RESTRICTED_REGIONS?: string;
}
