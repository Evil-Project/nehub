import { existsSync, readFileSync, writeFileSync } from "node:fs";

const defaultConfigPath = "wrangler.jsonc";
const configPath = process.env.STATIC_VARS_CONFIG?.trim() || defaultConfigPath;
const distIndexPath = "dist/client/index.html";
const distRobotsPath = "dist/client/robots.txt";
const distSitemapPath = "dist/client/sitemap.xml";

const stripJsonc = (value) =>
  value
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

const readConfig = () => {
  if (!existsSync(configPath)) {
    throw new Error(`${configPath} does not exist`);
  }
  return JSON.parse(stripJsonc(readFileSync(configPath, "utf8")));
};

const getEnv = (name, fallback = "") => {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
};

const normalizeOrigin = (value) => value.trim().replace(/\/+$/, "");

const hasPlaceholderValue = (value) =>
  value.includes("replace-with-") || value.includes("example.com") || value.includes("localhost");

const assertProductionValue = (name, value) => {
  if (!value) {
    throw new Error(`${name} must be set before syncing production static assets`);
  }
  if (hasPlaceholderValue(value)) {
    throw new Error(`${name} must not use a placeholder value for production static assets`);
  }
};

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const upsertHeadTag = (html, matcher, tag) => {
  if (matcher.test(html)) {
    return html.replace(matcher, tag);
  }
  return html.replace("</head>", `    ${tag}\n  </head>`);
};

const setMetaName = (html, name, content) =>
  upsertHeadTag(
    html,
    new RegExp(`<meta\\s+name="${name}"[^>]*>`, "i"),
    `<meta name="${name}" content="${escapeHtml(content)}" />`
  );

const setMetaProperty = (html, property, content) =>
  upsertHeadTag(
    html,
    new RegExp(`<meta\\s+property="${property}"[^>]*>`, "i"),
    `<meta property="${property}" content="${escapeHtml(content)}" />`
  );

const setCanonical = (html, href) =>
  upsertHeadTag(
    html,
    /<link\s+rel="canonical"[^>]*>/i,
    `<link rel="canonical" href="${escapeHtml(href)}" />`
  );

const sitemapEntry = (appUrl, path, priority) =>
  `  <url>
    <loc>${escapeXml(`${appUrl}${path}`)}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <priority>${priority}</priority>
  </url>`;

if (!existsSync(distIndexPath)) {
  throw new Error(`${distIndexPath} does not exist. Run vite build before syncing static vars.`);
}

const config = readConfig();
const vars = config.vars ?? {};
const appName = getEnv("PUBLIC_APP_NAME", vars.PUBLIC_APP_NAME || "NEHub");
const appUrl = normalizeOrigin(getEnv("PUBLIC_APP_URL", vars.PUBLIC_APP_URL || ""));
const artworkMediaUrl = getEnv("PUBLIC_ARTWORK_MEDIA_URL", vars.PUBLIC_ARTWORK_MEDIA_URL || "");
const turnstileSiteKey = getEnv("PUBLIC_TURNSTILE_SITE_KEY", vars.PUBLIC_TURNSTILE_SITE_KEY || "");
const strict = process.env.CI_PRODUCTION_DEPLOY === "true" || process.env.STATIC_VARS_STRICT === "true";

if (strict) {
  assertProductionValue("PUBLIC_APP_URL", appUrl);
  assertProductionValue("PUBLIC_ARTWORK_MEDIA_URL", artworkMediaUrl);
  assertProductionValue("PUBLIC_TURNSTILE_SITE_KEY", turnstileSiteKey);
}

if (!appUrl) {
  console.warn("PUBLIC_APP_URL is not set; static canonical, robots, and sitemap URLs were not updated.");
  process.exit(0);
}

const title = `${appName} - Illustrations and Novels`;
const description = `${appName} is a Cloudflare-native community for discovering illustrations, serialized novels, creators, tags, rankings, and reading lists.`;
const rootUrl = `${appUrl}/`;
let html = readFileSync(distIndexPath, "utf8");

html = html
  .replaceAll("https://nehub.example.com", appUrl)
  .replaceAll("https://art.example.com/", artworkMediaUrl)
  .replaceAll("https://art.example.com", artworkMediaUrl.replace(/\/+$/, ""))
  .replaceAll("replace-with-cloudflare-turnstile-site-key", turnstileSiteKey);
html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
html = setMetaName(html, "description", description);
html = setMetaName(html, "application-name", appName);
html = setCanonical(html, rootUrl);
html = setMetaProperty(html, "og:site_name", appName);
html = setMetaProperty(html, "og:title", title);
html = setMetaProperty(html, "og:description", description);
html = setMetaProperty(html, "og:url", rootUrl);
html = setMetaName(html, "twitter:title", title);
html = setMetaName(html, "twitter:description", description);

writeFileSync(distIndexPath, html);

writeFileSync(
  distRobotsPath,
  [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /dashboard",
    "Disallow: /settings/",
    "Disallow: /notifications",
    "Disallow: /analytics",
    "Disallow: /novels/dashboard",
    "Disallow: /novels/settings/",
    "Disallow: /novels/notifications",
    "Disallow: /novels/analytics",
    `Sitemap: ${appUrl}/sitemap.xml`,
    ""
  ].join("\n")
);

writeFileSync(
  distSitemapPath,
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[
  sitemapEntry(appUrl, "/", "1.0"),
  sitemapEntry(appUrl, "/rankings", "0.8"),
  sitemapEntry(appUrl, "/creators", "0.8"),
  sitemapEntry(appUrl, "/collections/discover", "0.7"),
  sitemapEntry(appUrl, "/series", "0.7"),
  sitemapEntry(appUrl, "/novels", "0.9"),
  sitemapEntry(appUrl, "/novels/rankings", "0.8"),
  sitemapEntry(appUrl, "/novels/creators", "0.8"),
  sitemapEntry(appUrl, "/novels/tags", "0.7")
].join("\n")}
</urlset>
`
);

console.log(`Synced static public vars for ${appName} (${appUrl})`);
