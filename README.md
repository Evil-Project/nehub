# NEHub

NEHub is a Pixiv-like artwork sharing app built as one Cloudflare-native deployment:

- **React 19 + Vite** for the artwork discovery UI.
- **Cloudflare Workers Static Assets** for serving the SPA.
- **Hono** for API routes on the same Worker.
- **Cloudflare D1** for creators, artwork metadata, comments, follows, and collections.
- **Cloudflare R2** for uploaded original artwork files.
- **Cloudflare Turnstile** for register, login, and verification-email resend protection.
- **Cloudflare Email Routing Workers** for account verification email.

Bind D1 and R2 to begin publishing artwork; the gallery starts empty until creators sign in and upload their own work.

## Local Development

```bash
npm install
npm run build
npm run dev
```

The Worker runs at `http://localhost:8787`.

For a browser-only Vite loop while editing UI:

```bash
npm run dev:client
```

## Cloudflare Setup

Create a D1 database:

```bash
npx wrangler d1 create nehub-db
```

Copy the returned `database_id` into `wrangler.jsonc`.

Create an R2 bucket:

```bash
npx wrangler r2 bucket create nehub-artworks
```

Create a Turnstile widget and set its public site key in `wrangler.jsonc`:

```jsonc
"PUBLIC_TURNSTILE_SITE_KEY": "your-turnstile-site-key"
```

Keep the Turnstile secret server-side:

```bash
npx wrangler secret put TURNSTILE_SECRET_KEY
```

For local development, put the same secret in `.dev.vars`:

```bash
TURNSTILE_SECRET_KEY=your-turnstile-secret-key
```

The checked-in local public site key is Cloudflare's always-pass testing key. To exercise the full local flow with that key, run Wrangler with the matching testing secret:

```bash
npx wrangler dev --port 8787 \
  --var TURNSTILE_SECRET_KEY:1x0000000000000000000000000000000AA \
  --var ADMIN_BOOTSTRAP_PASSWORD:use-a-strong-local-password
```

Configure Email Routing for Workers and set `AUTH_EMAIL_FROM` to an allowed sender address for your zone. The Worker uses the `EMAIL` `send_email` binding from `wrangler.jsonc` to send verification links.

The schema creates a locked default administrator account:

- Email or username: `admin@nehub.local` or `admin`

Set `ADMIN_BOOTSTRAP_PASSWORD` only for the first admin login. After a successful login, the Worker stores a normal password hash in D1. Use a strong unique password and remove or rotate the bootstrap secret before exposing a deployed environment.

Apply the schema:

```bash
npm run db:migrate:local
npm run db:migrate:remote
```

Deploy:

```bash
npm run deploy
```

## API Surface

- `GET /api/health` reports Worker, D1, and R2 binding status.
- `GET /api/auth/config` returns the public Turnstile site key.
- `GET /api/auth/session` returns the current signed-in user from the HttpOnly session cookie.
- Cookie-authenticated POST routes require the `x-csrf-token` returned by auth/session responses.
- `POST /api/auth/register` creates an account, validates Turnstile, sends a verification email, and starts a session.
- `POST /api/auth/login` validates Turnstile and starts a session.
- `POST /api/auth/logout` clears the current session.
- `POST /api/auth/resend-verification` validates Turnstile and sends a new verification email.
- `GET /api/auth/verify-email?token=` verifies an account email link.
- `GET /api/gallery?sort=latest|popular|rising|following&q=&tag=` returns the feed.
- `GET /api/artworks/:id` returns artwork detail and comments.
- `POST /api/artworks/:id/like` increments likes.
- `POST /api/upload` accepts multipart artwork uploads.
- `GET /media/*` streams uploaded R2 objects.
