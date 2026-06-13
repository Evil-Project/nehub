# Repository Guidelines

## Project Structure & Module Organization

NEHub is a Cloudflare-native artwork sharing app. Client code lives in `src/client/` with `App.tsx`, `main.tsx`, and `styles.css`. Worker API code lives in `src/worker/index.ts` and uses Hono with Cloudflare bindings. Shared request and response contracts live in `src/shared/types.ts`; update these when Worker responses or client expectations change. D1 schema changes belong in `migrations/` using numbered SQL files. Static public assets belong in `public/`; production build output goes to ignored `dist/`.

## Build, Test, and Development Commands

- `npm install`: install dependencies.
- `npm run dev`: build the client, then run the Worker locally with Wrangler.
- `npm run dev:client`: run only the Vite client loop for UI work.
- `npm run check`: run TypeScript with `tsc --noEmit`.
- `npm run build`: create the production Vite bundle.
- `npm run db:migrate:local`: apply D1 migrations to the local database.
- `npm run db:migrate:remote`: apply migrations to the configured remote D1 database.
- `npm run deploy`: build and deploy with Wrangler.

For local auth testing, use Wrangler `--var TURNSTILE_SECRET_KEY:1x0000000000000000000000000000000AA` with the checked-in Turnstile test site key.

## Coding Style & Naming Conventions

Use TypeScript, React function components, and existing Hono route patterns. Keep indentation at two spaces, prefer `const`, and keep shared DTO names explicit, such as `GalleryResponse` or `PrivacySecuritySettingsResponse`. Use camelCase in TypeScript and snake_case only for database columns. Keep CSS class names kebab-case and scoped to existing page/component concepts.

## Testing Guidelines

There is no dedicated unit test runner yet. Before submitting changes, run `npm run check`, `npm run build`, and relevant D1 migrations. For Worker behavior, use `wrangler dev` plus `curl` smoke tests against routes such as `/api/health`, `/api/gallery`, and authenticated settings routes. If a test framework is added later, place tests near the changed module and document the new script here.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commits, for example `feat: add authenticated artwork workflows`. Use concise messages like `feat: add profile privacy settings` or `fix: hide restricted mature media`. Pull requests should describe the user-facing change, list verification commands, mention migrations or new Cloudflare vars, and include screenshots for UI changes.

## Security & Configuration Tips

Do not commit secrets or `.env` files. Keep `wrangler.jsonc` public vars non-sensitive; use Wrangler secrets for `TURNSTILE_SECRET_KEY` and bootstrap credentials. Review CSRF handling, auth checks, mature-content gates, and direct `/media/*` access when touching account or artwork routes.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
