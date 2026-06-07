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

## Local Testing

Run the same checks used before committing:

```bash
npm install
npm run check
npm run build
npm run db:migrate:local
```

Start the Worker with Cloudflare's local Turnstile test secret and an admin bootstrap password:

```bash
npx wrangler dev --port 8787 \
  --var TURNSTILE_SECRET_KEY:1x0000000000000000000000000000000AA \
  --var ADMIN_BOOTSTRAP_PASSWORD:LocalAdminTest123! \
  --var MATURE_RESTRICTED_REGIONS:KP,IR
```

Open `http://localhost:8787`.

The default administrator account is:

- Email or username: `admin@nehub.local` or `admin`
- Password: the `ADMIN_BOOTSTRAP_PASSWORD` value on the first successful login

After the first successful admin login, the Worker stores a normal password hash in local D1. If the account was already bootstrapped earlier, keep using the saved local password instead of changing the `ADMIN_BOOTSTRAP_PASSWORD` value.

Browser checks:

- Sign in as the default admin and confirm the `Dashboard` menu item is visible.
- Open `Dashboard` and confirm account, content, D1, R2, and email binding status panels render.
- Click `Post`, upload an image, and confirm the new artwork appears in the latest feed.
- Click an artwork card bookmark icon, open `Bookmarks`, and confirm the saved work appears.
- Open an artwork detail modal and use the `Bookmark` button to toggle the saved state and count.
- In the artwork detail modal, choose `Public` and `Private` bookmark visibility and confirm the profile bookmark tabs reflect the choice.
- Open your account chip or `/@admin` and confirm the profile page shows works plus public and private bookmark tabs.
- Open `Privacy`, set a date of birth, enable mature content, and save.
- Confirm mature uploads are blocked until the signed-in user has an adult date of birth and mature content enabled.
- Sign out and sign back in, then confirm saved bookmarks still appear for the same account.

To test region hiding locally, start Wrangler with a test country in `MATURE_RESTRICTED_REGIONS`, then send `CF-IPCountry` on API requests:

```bash
curl -H "CF-IPCountry: KP" http://localhost:8787/api/gallery
```

The response includes `matureAccess`; when `restrictedRegion` is true, mature artwork is omitted even if the account age setting allows it.

Registration uses the checked-in Turnstile testing site key and the testing secret above. Verification email delivery requires the Cloudflare `EMAIL` binding, so new local accounts may remain pending unless email is configured. Use the default verified admin account for dashboard, upload, like, and bookmark testing.

API smoke checks:

```bash
curl http://localhost:8787/api/health
curl http://localhost:8787/api/auth/session
curl http://localhost:8787/api/gallery
curl "http://localhost:8787/api/gallery?sort=bookmarks"
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

Set `MATURE_RESTRICTED_REGIONS` to a comma-separated list of ISO 3166-1 alpha-2 country codes where mature content must be hidden:

```jsonc
"MATURE_RESTRICTED_REGIONS": "KP,IR"
```

The Worker reads Cloudflare's request country metadata and the `CF-IPCountry` header. Mature gallery results, profile results, artwork detail responses, likes, bookmarks, uploads, and direct `/media/artworks/*` streams are denied when the country is restricted.

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
- `GET /api/admin/stats` returns account, content, and binding metrics for administrators.
- `GET /api/gallery?sort=latest|popular|rising|following|bookmarks&q=&tag=` returns the feed plus `matureAccess`.
- `GET /api/users/:username/profile` returns public profile data, works, public bookmarks, and the owner's private bookmarks.
- `GET /api/settings/profile` and `PUT /api/settings/profile` read and update username, display name, avatar URL, and bio.
- `GET /api/settings/privacy-security` and `PUT /api/settings/privacy-security` read and update bookmark default visibility, date of birth, and mature-content preference.
- `GET /api/artworks/:id` returns artwork detail and comments.
- `POST /api/artworks/:id/like` increments likes.
- `POST /api/artworks/:id/bookmark` toggles the signed-in user's bookmark; send `{ "visibility": "public" }` or `{ "visibility": "private" }` to save or change bookmark visibility.
- `POST /api/upload` accepts multipart artwork uploads.
- `GET /media/*` streams uploaded R2 objects.

## App Routes

- `/` shows the artwork feed.
- `/@username` shows a public user profile.
- `/settings/profile` edits the signed-in user's profile.
- `/settings/privacy-security` edits bookmark defaults, date of birth, and mature-content access.
- `/terms` shows the Terms of Use.
- `/privacy` shows the Privacy Policy.
