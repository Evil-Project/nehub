# NEHub

NEHub is a Pixiv-like artwork sharing app built as one Cloudflare-native deployment:

- **React 19 + Vite** for the artwork discovery UI.
- **Cloudflare Workers Static Assets** for serving the SPA.
- **Hono** for API routes on the same Worker.
- **Cloudflare D1** for creators, artwork metadata, comments, follows, and collections.
- **D1-backed rate limits** protect auth, uploads, comments, reports, social actions, collections, notifications, and admin mutations.
- **D1-backed activity feeds** surface followed-creator and global community events.
- **D1-backed tag governance** supports canonical aliases, implied tags, and indexed tag counts.
- **D1 FTS search** indexes artwork titles, captions, tags, and creator names.
- **Cloudflare R2** for uploaded original artwork files.
- **Cloudflare Turnstile** for register, login, verification-email resend, uploads, comments, and reports.
- **Cloudflare Email Routing Workers** for account verification, password reset, email-change confirmation, and security notice email.

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
- In `Dashboard`, search the User directory by username/email, filter suspended or unverified accounts, and confirm suspend/restore updates the row.
- In `Dashboard`, add a tag alias and an implied-tag rule, then confirm the Tag governance panel lists both.
- In `Dashboard`, switch moderation queue status, target, reason, and limit filters and confirm the report count updates.
- Click `Post`, add tag chips with autocomplete, upload one or more images, and confirm a `Public` artwork appears in the latest feed with dimensions matching the uploaded image.
- Open an owned artwork, click `Edit`, update tags with autocomplete chips, and confirm the saved tags appear in the detail modal.
- Open an owned artwork, click `Edit`, add pages to the post, and confirm the new pages appear in the detail modal without changing the current cover.
- For a multi-image artwork, open `Edit`, move image pages, save the order, and confirm page 1 becomes the feed thumbnail cover.
- For a multi-image artwork, remove one page in `Edit` and confirm the artwork stays published with the remaining first page as the feed thumbnail cover.
- Upload an `Unlisted` artwork and confirm it opens by direct URL but does not appear in latest/search/rankings; upload a `Private` artwork and confirm only the owner/admin can open it.
- Inspect a feed card image and confirm it uses `/media-thumbnail/artworks/...`; the detail modal should still load the original `/media/artworks/...` file.
- Confirm the right-rail activity panel shows global activity when signed out and followed-creator activity after following an artist.
- Click an artwork card bookmark icon, open `Bookmarks`, and confirm the saved work appears.
- Open an artwork detail modal and use the `Bookmark` button to toggle the saved state and count.
- In the artwork detail modal, choose `Public` and `Private` bookmark visibility and confirm the profile bookmark tabs reflect the choice.
- Open your account chip or `/@admin` and confirm the profile page shows works, public/private bookmark tabs, and follower/following lists.
- Open `Privacy`, set profile visibility, configure notification preferences, review blocked users, download an account-data export, set a date of birth, enable mature content, and save.
- For a disposable account, use `Privacy` to deactivate the account and confirm its profile/works disappear and the browser is signed out.
- Add one or more muted tags in `Privacy` and confirm matching works by other creators disappear from feeds/search.
- Set profile visibility to `Members` or `Private` and confirm signed-out profile/gallery access is restricted as expected.
- Confirm `Restricted` and `Adult` uploads are blocked until the signed-in user has an adult date of birth and mature content enabled.
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

To exercise the local flow with Cloudflare's always-pass Turnstile testing secret, pass the matching testing site key and secret to Wrangler:

```bash
npx wrangler dev --port 8787 \
  --var PUBLIC_TURNSTILE_SITE_KEY:1x00000000000000000000AA \
  --var TURNSTILE_SECRET_KEY:1x0000000000000000000000000000000AA \
  --var ADMIN_BOOTSTRAP_PASSWORD:use-a-strong-local-password
```

Configure Email Routing for Workers and set `AUTH_EMAIL_FROM` to an allowed sender address for your zone. The Worker uses the `EMAIL` `send_email` binding from `wrangler.jsonc` to send verification links, password reset links, email-change confirmations, and account security notices.

Set `MATURE_RESTRICTED_REGIONS` to a comma-separated list of ISO 3166-1 alpha-2 country codes where mature content must be hidden:

```jsonc
"MATURE_RESTRICTED_REGIONS": "KP,IR"
```

The Worker reads Cloudflare's request country metadata and the `CF-IPCountry` header. Mature gallery results, profile results, artwork detail responses, likes, bookmarks, uploads, and direct `/media/artworks/*` streams are denied when the country is restricted.

Uploaded artwork originals are byte-sniffed as JPEG, PNG, WebP, or GIF before storage, and detected image dimensions are written to D1/R2 metadata. Originals are stored in R2 under `/media/artworks/...`. Feed thumbnails are served through `/media-thumbnail/artworks/...`, which applies Cloudflare Image Resizing in production and falls back to the original object during local development. Public, general-audience media is cached immutably; private profiles, members-only profiles, mature content, and signed-in media requests use `private, no-store` responses.

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

### GitHub Actions Deploy

The repository includes `.github/workflows/deploy.yml` for automatic Cloudflare deployment. It runs on pushes to `main` and can also be started manually from the Actions tab.

Add these repository secrets before using the workflow:

- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with permission to create/read D1 databases, create/read R2 buckets, deploy Workers, and upload Worker secrets.
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID for the target account.
- `TURNSTILE_SECRET_KEY`: production Turnstile secret key.

Add these production repository variables before using the workflow:

- `PUBLIC_APP_URL`: production HTTPS origin, for example `https://app.your-domain.com`.
- `PUBLIC_TURNSTILE_SITE_KEY`: production Turnstile site key.
- `AUTH_EMAIL_FROM`: allowed Cloudflare Email Routing sender.

Optional repository variables override resource names and production settings:

- `D1_DATABASE_NAME`: defaults to `nehub-db`.
- `D1_LOCATION`: optional D1 location hint, such as `wnam`, `enam`, `weur`, or `apac`.
- `R2_BUCKET_NAME`: defaults to `nehub-artworks`.
- `R2_LOCATION`: optional R2 location hint, such as `wnam`, `enam`, `weur`, or `apac`.
- `PUBLIC_APP_NAME`: defaults to `NEHub`.
- `MATURE_RESTRICTED_REGIONS`: comma-separated ISO 3166-1 alpha-2 country codes.

The workflow installs dependencies with `npm ci`, runs `npm run check`, builds with `npm run build`, runs `scripts/provision-cloudflare.mjs`, applies pending remote D1 migrations, and deploys with `npx wrangler deploy`. Production deploys fail early if required values are missing or still use local/test placeholders.

Provisioning is idempotent. The script reuses an existing D1 database or R2 bucket by name, creates missing ones, writes a temporary CI Wrangler config with the discovered D1 database ID, and deploys the Worker vars from that generated config.

Cloudflare Email Routing and the Turnstile widget still need to exist in the Cloudflare account. The workflow publishes their configured production values, but it does not create Email Routing, generate Turnstile keys, or deploy `ADMIN_BOOTSTRAP_PASSWORD`.

## API Surface

- `GET /api/health` reports Worker, D1, and R2 binding status.
- `GET /api/auth/config` returns the public Turnstile site key.
- `GET /api/auth/session` returns the current signed-in user from the HttpOnly session cookie.
- Cookie-authenticated POST routes require the `x-csrf-token` returned by auth/session responses.
- Rate-limited routes return HTTP `429` with `Retry-After` and a JSON message when a user or IP exceeds the configured action window.
- `POST /api/auth/register` creates an account, validates Turnstile, sends a verification email, and starts a session.
- `POST /api/auth/login` validates Turnstile and starts a session.
- `POST /api/auth/password-reset/request` validates Turnstile and sends a non-enumerating password reset email when the account exists.
- `POST /api/auth/password-reset/confirm` validates Turnstile, consumes a reset token, updates the password, and revokes all sessions.
- `POST /api/auth/logout` clears the current session.
- `POST /api/auth/resend-verification` validates Turnstile and sends a new verification email.
- `GET /api/auth/verify-email?token=` verifies an account email link.
- `GET /api/notifications` returns the signed-in user's recent notifications and unread count.
- `POST /api/notifications/read` marks one notification or all notifications as read.
- `GET /api/activity?scope=global|following&limit=&cursor=` returns public or followed-creator activity with mature and block filtering.
- `GET /api/search/suggestions?q=&limit=` returns access-filtered tag, creator, and artwork suggestions for the header search bar.
- `GET /api/analytics/creator` returns signed-in creator totals, 30-day view/interaction trends, and top/recent owned artworks.
- `GET /api/creators?sort=popular|active|newest&q=&limit=&cursor=` returns searchable creator discovery cards with follow state, visible artwork counts, preview thumbnails, mature access state, and an opaque cursor.
- `GET /api/tags/subscriptions` returns the signed-in user's followed tags.
- `GET /api/tags/:tag?sort=latest|popular|rising&rating=all|general|restricted|adult&limit=&cursor=` returns a shareable tag page with artworks, related tags, follow state, mature access state, and an opaque cursor.
- `POST /api/tags/:tag/subscribe` toggles a followed tag for the signed-in user.
- `GET /api/collections` returns the signed-in user's artwork collections.
- `GET /api/collections/discover?sort=updated|largest&q=&limit=&cursor=` returns searchable public collection folders with owners, preview thumbnails, mature access state, and an opaque cursor.
- `POST /api/collections` creates a private collection folder.
- `GET /api/collections/:id?limit=&cursor=` returns a collection detail page with visible artworks and an opaque item cursor.
- `PUT /api/collections/:id` updates the owner's collection name, description, public/private visibility, and optional `coverArtworkId`.
- `DELETE /api/collections/:id` deletes the owner's collection folder.
- `POST /api/collections/:id/items` toggles an artwork in a collection.
- `GET /api/series` returns the signed-in user's ordered artwork series.
- `POST /api/series` creates a private artwork series.
- `GET /api/series/:id?limit=&cursor=` returns a series detail page with ordered visible artworks and an opaque item cursor.
- `PUT /api/series/:id` updates the owner's series title, description, public/private visibility, and optional `coverArtworkId`.
- `DELETE /api/series/:id` deletes the owner's artwork series.
- `POST /api/series/:id/items` toggles one of the owner's artworks in a series, with optional `position` for ordering.
- `GET /api/admin/stats` returns account, content, and binding metrics for administrators.
- `GET /api/admin/audit-log?limit=` returns recent administrator moderation and governance actions for the dashboard audit trail.
- `GET /api/admin/reports?status=open|resolved|dismissed&targetType=all|artwork|comment|user&reason=all|spam|abuse|illegal|copyright|other&limit=` returns filtered moderation reports and total count for administrators.
- `POST /api/admin/reports/:id/resolve` resolves or dismisses a moderation report.
- `POST /api/admin/artworks/:id/moderation` hides or restores an artwork for administrators.
- `GET /api/admin/users?q=&status=all|active|suspended|unverified|admin&limit=` returns a searchable account directory with total count for administrators.
- `POST /api/admin/users/:id/suspension` suspends or restores a member account for administrators.
- `GET /api/admin/tags` returns indexed top tags, aliases, and implied-tag rules for administrators.
- `POST /api/admin/tags/aliases` creates or updates a canonical tag alias and reindexes artwork tags.
- `DELETE /api/admin/tags/aliases/:sourceTag` removes an alias for future tag normalization.
- `POST /api/admin/tags/implications` creates an implied-tag rule and reindexes artwork tags.
- `DELETE /api/admin/tags/implications/:sourceTag/:targetTag` removes an implication rule for future tag normalization.
- `GET /api/gallery?sort=latest|popular|rising|following|bookmarks|subscriptions&q=&tag=&rating=all|general|restricted|adult&limit=&cursor=` returns a paginated feed plus `matureAccess`; gallery feeds use D1 keyset pagination with opaque cursors, including search, tag, and personalized filters. Discovery feeds include only `Public` artwork.
- `GET /api/rankings?period=daily|weekly&limit=` returns D1-backed rankings from recent per-user likes.
- `GET /api/users/:username/profile?section=artworks|publicBookmarks|privateBookmarks|publicCollections|publicSeries&cursor=` returns profile data plus first-page or section-specific profile works, bookmarks, public collection folders, and public series with per-section cursors; private bookmarks only load for the owner.
- `GET /api/users/:username/follows?mode=followers|following&limit=&cursor=` returns a profile's visible follower or following list with viewer-specific follow state and an opaque cursor.
- `POST /api/users/:username/follow` toggles following a creator for the signed-in user.
- `POST /api/users/:username/block` toggles blocking a user and hides blocked relationships from feeds and profiles.
- `POST /api/users/:username/report` lets signed-in users report abusive profiles with Turnstile validation.
- `GET /api/settings/profile` and `PUT /api/settings/profile` read and update username, display name, avatar URL, and bio.
- `GET /api/settings/privacy-security` and `PUT /api/settings/privacy-security` read and update profile visibility, bookmark default visibility, date of birth, mature-content preference, and muted tags.
- `GET /api/settings/notification-preferences` and `PUT /api/settings/notification-preferences` read and update like, comment, follow, and moderation notification toggles.
- `GET /api/settings/blocked-users` lists the signed-in user's blocked accounts for Privacy & Security.
- `DELETE /api/settings/blocked-users/:username` unblocks a user from Privacy & Security.
- `GET /api/settings/export` downloads a JSON account-data export for the signed-in user, including privacy and notification preferences.
- `POST /api/settings/account/deactivate` verifies the current password, hides the account by making the profile private, removes follow relationships, deactivates login, and revokes all sessions.
- `PUT /api/settings/password` changes the signed-in user's password, keeps the current browser session active, and revokes other active sessions.
- `POST /api/settings/email/request` verifies the current password and sends an email-change confirmation link to the new address.
- `GET /api/settings/email/confirm?token=` consumes an email-change link, verifies the new address, updates the login email, and revokes other sessions.
- `GET /api/settings/sessions` lists the signed-in user's active browser sessions.
- `POST /api/settings/sessions/revoke-others` revokes every active session except the current browser.
- `DELETE /api/settings/sessions/:id` revokes one other active session.
- `GET /api/artworks/:id` records one unique daily view per viewer/IP, then returns artwork detail, comments, and access-filtered related works. `Unlisted` works open by direct URL; `Private` works require the owner or an administrator.
- `PUT /api/artworks/:id` updates title, caption, tags, mature rating, and artwork visibility for the owner or an administrator.
- `POST /api/artworks/:id/images` appends images to an existing artwork for the owner or an administrator, preserving byte validation, R2 metadata, and the 8-image limit.
- `PUT /api/artworks/:id/images/order` reorders every image in a multi-image artwork for the owner or an administrator and promotes the first image to the artwork cover.
- `DELETE /api/artworks/:id/images/:imageId` removes one image from a multi-image artwork for the owner or an administrator, keeps at least one image, and promotes the first remaining image to the artwork cover.
- `POST /api/artworks/:id/like` toggles the signed-in user's like and returns updated artwork state.
- `POST /api/artworks/:id/comments` adds an authenticated comment or reply with optional `parentId` and Turnstile validation.
- `POST /api/artworks/:id/report` lets signed-in users report artwork for moderation with Turnstile validation.
- `POST /api/artworks/:id/bookmark` toggles the signed-in user's bookmark; send `{ "visibility": "public" }` or `{ "visibility": "private" }` to save or change bookmark visibility.
- `DELETE /api/artworks/:id` deletes an artwork for its owner or an administrator and removes stored R2 objects.
- `DELETE /api/comments/:id` soft-deletes a comment for its author, the artwork owner, or an administrator.
- `POST /api/comments/:id/report` lets signed-in users report comments for moderation with Turnstile validation.
- `PUT /api/comments/:id` edits a comment for its author or an administrator.
- `POST /api/upload` accepts multipart artwork uploads with up to 8 byte-validated JPEG, PNG, WebP, or GIF images in the `files` field, stores detected dimensions, and supports `matureRating=general|restricted|adult`, `visibility=public|unlisted|private`, and Turnstile validation.
- `GET /media/*` streams uploaded R2 objects.
- `GET /media-thumbnail/*` streams Cloudflare-resized thumbnails with the same profile, mature-content, block, and region gates as originals.

## App Routes

- `/` shows the artwork feed.
- `/artworks/:id` opens a shareable artwork detail view with OpenGraph metadata.
- `/rankings` shows daily and weekly artwork rankings from recent likes.
- `/creators` browses and searches public creator profiles.
- `/notifications` shows the signed-in user's notification center.
- `/analytics` shows signed-in creator artwork totals, 30-day trends, and top/recent works.
- `/tags/:tag` shows a shareable tag channel with related tags and paginated artwork.
- `/@username` shows a public user profile.
- `/collections/discover` browses public community collection folders.
- `/collections` lists the signed-in user's collection folders.
- `/collections/:id` shows a collection folder with paginated artwork.
- `/series` lists the signed-in user's artwork series.
- `/series/:id` shows an ordered artwork series with paginated artwork.
- `/settings/profile` edits the signed-in user's profile.
- `/settings/privacy-security` edits bookmark defaults, date of birth, and mature-content access.
- `/terms` shows the Terms of Use.
- `/privacy` shows the Privacy Policy.
