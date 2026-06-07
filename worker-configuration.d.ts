interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
  ARTWORKS?: R2Bucket;
  EMAIL?: SendEmail;
  PUBLIC_APP_NAME: string;
  PUBLIC_APP_URL: string;
  PUBLIC_TURNSTILE_SITE_KEY: string;
  AUTH_EMAIL_FROM: string;
  TURNSTILE_SECRET_KEY?: string;
  ADMIN_BOOTSTRAP_PASSWORD?: string;
  MATURE_RESTRICTED_REGIONS?: string;
}
