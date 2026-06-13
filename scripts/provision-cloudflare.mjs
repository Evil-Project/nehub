import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

const sourceConfigPath = "wrangler.jsonc";
const ciConfigPath = "wrangler.ci.jsonc";
const ciSecretsPath = ".wrangler/ci-secrets.json";

const stripJsonc = (value) =>
  value
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

const runWrangler = (args, options = {}) => {
  const result = spawnSync("npx", ["wrangler", ...args], {
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit"
  });

  if (!options.allowFailure && result.status !== 0) {
    const stderr = result.stderr?.trim();
    const stdout = result.stdout?.trim();
    const detail = [stderr, stdout].filter(Boolean).join("\n");
    throw new Error(
      [`wrangler ${args.join(" ")} failed`, detail].filter(Boolean).join("\n")
    );
  }

  return result;
};

const runWranglerWithHint = (args, hint, options = {}) => {
  try {
    return runWrangler(args, options);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${message}\n\n${hint}`);
  }
};

const getEnv = (name, fallback = "") => {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
};

const requireEnv = (name) => {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`${name} must be set for production deploys`);
  }
  return value;
};

const isProductionDeploy = getEnv("CI_PRODUCTION_DEPLOY") === "true";

const assertProductionValue = (name, value) => {
  if (!isProductionDeploy) {
    return;
  }

  if (!value) {
    throw new Error(`${name} must be set for production deploys`);
  }

  if (value.includes("localhost") || value.endsWith(".local")) {
    throw new Error(`${name} must not use a local development value`);
  }

  if (value.includes("replace-with-") || value.includes("example.com")) {
    throw new Error(`${name} must not use a placeholder value`);
  }

  if (/^1x0+AA$/.test(value)) {
    throw new Error(`${name} must not use Cloudflare's Turnstile test key`);
  }
};

const assertCloudflareAccountId = (value) => {
  if (!/^[0-9a-f]{32}$/i.test(value)) {
    throw new Error(
      "CLOUDFLARE_ACCOUNT_ID must be the 32-character Cloudflare account ID, not an account name, email, or zone ID"
    );
  }
};

const getCloudflareAccounts = (required) => {
  const result = runWrangler(["whoami", "--json"], {
    allowFailure: !required,
    capture: true
  });

  if (result.status !== 0) {
    return [];
  }

  const payload = JSON.parse(result.stdout || "{}");
  return Array.isArray(payload.accounts) ? payload.accounts : [];
};

const resolveCloudflareAccountId = () => {
  const configuredAccountId = getEnv("CLOUDFLARE_ACCOUNT_ID");
  const configuredAccountIdIsValid =
    configuredAccountId && /^[0-9a-f]{32}$/i.test(configuredAccountId);
  const accounts = getCloudflareAccounts(!configuredAccountIdIsValid);

  if (configuredAccountId) {
    if (!configuredAccountIdIsValid) {
      if (accounts.length === 1 && accounts[0]?.id) {
        process.env.CLOUDFLARE_ACCOUNT_ID = accounts[0].id;
        console.log(
          `Ignoring invalid CLOUDFLARE_ACCOUNT_ID and using Cloudflare account ${accounts[0].name ?? accounts[0].id}`
        );
        return accounts[0].id;
      }
      assertCloudflareAccountId(configuredAccountId);
    }

    if (accounts.length === 0 || accounts.some((account) => account.id === configuredAccountId)) {
      return configuredAccountId;
    }

    if (accounts.length === 1 && accounts[0]?.id) {
      process.env.CLOUDFLARE_ACCOUNT_ID = accounts[0].id;
      console.log(
        `Ignoring CLOUDFLARE_ACCOUNT_ID because the token only has access to ${accounts[0].name ?? accounts[0].id}`
      );
      return accounts[0].id;
    }

    const accountList = accounts
      .map((account) => `${account.name ?? "Unnamed account"} (${account.id})`)
      .join(", ");
    throw new Error(
      `CLOUDFLARE_ACCOUNT_ID does not match an account available to the token. Available accounts: ${accountList}`
    );
  }

  if (accounts.length === 1 && accounts[0]?.id) {
    process.env.CLOUDFLARE_ACCOUNT_ID = accounts[0].id;
    console.log(`Using Cloudflare account ${accounts[0].name ?? accounts[0].id}`);
    return accounts[0].id;
  }

  if (accounts.length > 1) {
    const accountList = accounts
      .map((account) => `${account.name ?? "Unnamed account"} (${account.id})`)
      .join(", ");
    throw new Error(
      `CLOUDFLARE_ACCOUNT_ID must be set when the token can access multiple accounts: ${accountList}`
    );
  }

  throw new Error(
    "CLOUDFLARE_ACCOUNT_ID could not be inferred. Check CLOUDFLARE_API_TOKEN permissions or set CLOUDFLARE_ACCOUNT_ID explicitly."
  );
};

const writeGithubOutput = (outputs) => {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (!outputFile) {
    return;
  }

  const lines = Object.entries(outputs).map(([key, value]) => `${key}=${value}`);
  writeFileSync(outputFile, `${lines.join("\n")}\n`, { flag: "a" });
};

const writeGithubEnv = (values) => {
  const envFile = process.env.GITHUB_ENV;
  if (!envFile) {
    return;
  }

  const lines = Object.entries(values).map(([key, value]) => `${key}=${value}`);
  writeFileSync(envFile, `${lines.join("\n")}\n`, { flag: "a" });
};

const config = JSON.parse(stripJsonc(readFileSync(sourceConfigPath, "utf8")));
const d1Binding = config.d1_databases?.[0];
const r2Binding = config.r2_buckets?.[0];

if (!d1Binding) {
  throw new Error("wrangler.jsonc must define one D1 database binding");
}

if (!r2Binding) {
  throw new Error("wrangler.jsonc must define one R2 bucket binding");
}

const databaseName = getEnv("D1_DATABASE_NAME", d1Binding.database_name);
const bucketName = getEnv("R2_BUCKET_NAME", r2Binding.bucket_name);
const d1Location = getEnv("D1_LOCATION");
const r2Location = getEnv("R2_LOCATION");

const vars = {
  ...config.vars,
  PUBLIC_APP_NAME: getEnv("PUBLIC_APP_NAME", config.vars?.PUBLIC_APP_NAME),
  PUBLIC_APP_URL: getEnv(
    "PUBLIC_APP_URL",
    isProductionDeploy ? "" : config.vars?.PUBLIC_APP_URL
  ),
  PUBLIC_ARTWORK_MEDIA_URL: getEnv(
    "PUBLIC_ARTWORK_MEDIA_URL",
    isProductionDeploy ? "" : config.vars?.PUBLIC_ARTWORK_MEDIA_URL
  ),
  PUBLIC_TURNSTILE_SITE_KEY: getEnv(
    "PUBLIC_TURNSTILE_SITE_KEY",
    isProductionDeploy ? "" : config.vars?.PUBLIC_TURNSTILE_SITE_KEY
  ),
  AUTH_EMAIL_FROM: getEnv(
    "AUTH_EMAIL_FROM",
    isProductionDeploy ? "" : config.vars?.AUTH_EMAIL_FROM
  ),
  DISCORD_CLIENT_ID: getEnv("DISCORD_CLIENT_ID", config.vars?.DISCORD_CLIENT_ID),
  DISCORD_REDIRECT_URI: getEnv("DISCORD_REDIRECT_URI", config.vars?.DISCORD_REDIRECT_URI),
  MATURE_RESTRICTED_REGIONS: getEnv(
    "MATURE_RESTRICTED_REGIONS",
    config.vars?.MATURE_RESTRICTED_REGIONS
  )
};

let accountId = "";
if (isProductionDeploy) {
  requireEnv("CLOUDFLARE_API_TOKEN");
  accountId = resolveCloudflareAccountId();
  writeGithubEnv({ CLOUDFLARE_ACCOUNT_ID: accountId });
  assertProductionValue("TURNSTILE_SECRET_KEY", requireEnv("TURNSTILE_SECRET_KEY"));
  assertProductionValue("PUBLIC_APP_URL", vars.PUBLIC_APP_URL);
  assertProductionValue("PUBLIC_ARTWORK_MEDIA_URL", vars.PUBLIC_ARTWORK_MEDIA_URL);
  assertProductionValue("PUBLIC_TURNSTILE_SITE_KEY", vars.PUBLIC_TURNSTILE_SITE_KEY);
  assertProductionValue("AUTH_EMAIL_FROM", vars.AUTH_EMAIL_FROM);
  const discordClientSecret = getEnv("DISCORD_CLIENT_SECRET");
  if (vars.DISCORD_CLIENT_ID || discordClientSecret) {
    assertProductionValue("DISCORD_CLIENT_ID", vars.DISCORD_CLIENT_ID);
    assertProductionValue("DISCORD_CLIENT_SECRET", requireEnv("DISCORD_CLIENT_SECRET"));
  }
  if (vars.DISCORD_REDIRECT_URI) {
    assertProductionValue("DISCORD_REDIRECT_URI", vars.DISCORD_REDIRECT_URI);
    if (!vars.DISCORD_REDIRECT_URI.startsWith("https://")) {
      throw new Error("DISCORD_REDIRECT_URI must use https:// for production deploys");
    }
  }

  if (!vars.PUBLIC_APP_URL.startsWith("https://")) {
    throw new Error("PUBLIC_APP_URL must use https:// for production deploys");
  }
  if (
    vars.PUBLIC_ARTWORK_MEDIA_URL &&
    !vars.PUBLIC_ARTWORK_MEDIA_URL.startsWith("https://") &&
    !vars.PUBLIC_ARTWORK_MEDIA_URL.startsWith("/")
  ) {
    throw new Error("PUBLIC_ARTWORK_MEDIA_URL must use https:// or a root-relative path");
  }
}

const findD1Database = () => {
  const result = runWranglerWithHint(
    ["d1", "list", "--json"],
    "Automatic first-run provisioning needs the Cloudflare API token to include D1 read/edit access for the target account.",
    { capture: true }
  );
  const databases = JSON.parse(result.stdout || "[]");
  return databases.find((database) => database.name === databaseName);
};

let database = findD1Database();
if (!database) {
  const args = ["d1", "create", databaseName];
  if (d1Location) {
    args.push("--location", d1Location);
  }
  runWranglerWithHint(
    args,
    "Automatic first-run provisioning needs the Cloudflare API token to include D1 edit access for the target account."
  );
  database = findD1Database();
}

const databaseId = database?.uuid || database?.id;
if (!databaseId) {
  throw new Error(`Could not resolve D1 database ID for ${databaseName}`);
}

const bucketInfo = runWranglerWithHint(
  ["r2", "bucket", "info", bucketName],
  "Automatic first-run provisioning needs the Cloudflare API token to include R2 read/edit access for the target account.",
  {
    allowFailure: true,
    capture: true
  }
);

if (bucketInfo.status !== 0) {
  const args = ["r2", "bucket", "create", bucketName];
  if (r2Location) {
    args.push("--location", r2Location);
  }
  runWranglerWithHint(
    args,
    "Automatic first-run provisioning needs the Cloudflare API token to include R2 edit access for the target account."
  );
}

const ciConfig = {
  ...config,
  d1_databases: [
    {
      binding: d1Binding.binding,
      database_name: databaseName,
      database_id: databaseId
    }
  ],
  r2_buckets: [
    {
      binding: r2Binding.binding,
      bucket_name: bucketName
    }
  ],
  vars
};

mkdirSync(dirname(ciConfigPath), { recursive: true });
writeFileSync(ciConfigPath, `${JSON.stringify(ciConfig, null, 2)}\n`);

const secrets = {};
for (const key of ["TURNSTILE_SECRET_KEY", "ADMIN_BOOTSTRAP_PASSWORD", "DISCORD_CLIENT_SECRET"]) {
  const value = getEnv(key);
  if (value) {
    secrets[key] = value;
  }
}

const hasSecrets = Object.keys(secrets).length > 0;
if (hasSecrets) {
  mkdirSync(dirname(ciSecretsPath), { recursive: true });
  writeFileSync(ciSecretsPath, `${JSON.stringify(secrets, null, 2)}\n`);
}

writeGithubOutput({
  wrangler_config: ciConfigPath,
  secrets_file: hasSecrets ? ciSecretsPath : "",
  has_secrets: hasSecrets ? "true" : "false",
  cloudflare_account_id: accountId,
  d1_database_name: databaseName,
  r2_bucket_name: bucketName
});

console.log(`Using D1 database ${databaseName} (${databaseId})`);
console.log(`Using R2 bucket ${bucketName}`);
console.log(`Wrote ${ciConfigPath}`);
