import {
  bigint,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
  index,
  json,
  real,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const chatModeEnum = pgEnum("chat_mode", ["chat", "vibe-code", "research"]);
export const messageRoleEnum = pgEnum("message_role", ["user", "assistant", "system"]);
export const requestTypeEnum = pgEnum("request_type", ["chat", "image", "code", "research"]);
export const imageStatusEnum = pgEnum("image_status", ["pending", "completed", "failed"]);
export const generationKindEnum = pgEnum("generation_kind", ["image", "video", "music"]);
export const agentStatusEnum = pgEnum("agent_status", ["active", "paused", "archived"]);
export const queueStatusEnum = pgEnum("queue_status", ["pending", "approved", "rejected", "executed"]);
export const savedItemKindEnum = pgEnum("saved_item_kind", [
  "vibe-project",
  "image",
  "video",
  "music",
  "audio",
  "document",
  "chat",
  "agent",
  "other",
]);
export const monetizedTargetEnum = pgEnum("monetized_target", [
  "agent",
  "mcp",
  "http",
  "tool",
]);
export const paymentEventStatusEnum = pgEnum("payment_event_status", [
  "verified",
  "settled",
  "failed",
]);
export const airdropClaimStatusEnum = pgEnum("airdrop_claim_status", [
  "pending",
  "sent",
  "failed",
  "skipped",
]);

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  walletAddress: varchar("walletAddress", { length: 64 }),
  clawdBalance: real("clawdBalance").default(0),
  isTokenGated: boolean("isTokenGated").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  // Telegram identity — populated when user logs in via Privy Telegram bot
  telegramUserId: varchar("telegramUserId", { length: 64 }),
  telegramUsername: varchar("telegramUsername", { length: 64 }),
  // Telegram chat ID where the bot sends trade confirmations
  telegramChatId: varchar("telegramChatId", { length: 64 }),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Chat Sessions ────────────────────────────────────────────────────────────
export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 255 }).default("New Session"),
  model: varchar("model", { length: 64 }).default("grok-4-1-fast"),
  mode: chatModeEnum("mode").default("chat"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;

// ─── Chat Messages ────────────────────────────────────────────────────────────
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  userId: integer("userId").notNull(),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  model: varchar("model", { length: 64 }),
  promptTokens: integer("promptTokens").default(0),
  completionTokens: integer("completionTokens").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;

// ─── AI Usage Tracking ────────────────────────────────────────────────────────
export const aiUsage = pgTable("ai_usage", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  sessionId: integer("sessionId"),
  model: varchar("model", { length: 64 }).notNull(),
  promptTokens: integer("promptTokens").default(0),
  completionTokens: integer("completionTokens").default(0),
  totalTokens: integer("totalTokens").default(0),
  requestType: requestTypeEnum("requestType").default("chat"),
  costEstimate: real("costEstimate").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiUsage = typeof aiUsage.$inferSelect;

// ─── Image Generations ────────────────────────────────────────────────────────
export const imageGenerations = pgTable("image_generations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  prompt: text("prompt").notNull(),
  model: varchar("model", { length: 64 }).default("fal-ai/flux/schnell"),
  imageUrl: text("imageUrl"),
  s3Key: text("s3Key"),
  status: imageStatusEnum("status").default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ImageGeneration = typeof imageGenerations.$inferSelect;

// ─── Unified generations feed (image + video + music, powers trending) ──────
export const generations = pgTable("generations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  kind: generationKindEnum("kind").notNull(),
  prompt: text("prompt").notNull(),
  model: varchar("model", { length: 128 }),
  mediaUrl: text("mediaUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  durationSeconds: integer("durationSeconds"),
  isPublic: boolean("isPublic").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Generation = typeof generations.$inferSelect;
export type InsertGeneration = typeof generations.$inferInsert;

// ─── Agent Wallets ────────────────────────────────────────────────────────────
export const agentWallets = pgTable("agent_wallets", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  walletAddress: varchar("walletAddress", { length: 64 }),
  privyWalletId: varchar("privyWalletId", { length: 128 }),
  isSimulated: boolean("isSimulated").default(true),
  solBalance: real("solBalance").default(0),
  totalPnlUsd: real("totalPnlUsd").default(0),
  winRate: real("winRate").default(0),
  tradeCount: integer("tradeCount").default(0),
  status: agentStatusEnum("status").default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentWallet = typeof agentWallets.$inferSelect;

// ─── Agent Wallet Queue ───────────────────────────────────────────────────────
export const agentWalletQueue = pgTable("agent_wallet_queue", {
  id: serial("id").primaryKey(),
  agentWalletId: integer("agentWalletId").notNull(),
  userId: integer("userId").notNull(),
  action: varchar("action", { length: 64 }).notNull(),
  params: json("params"),
  status: queueStatusEnum("status").default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});

export type AgentWalletQueueItem = typeof agentWalletQueue.$inferSelect;

// ─── Wallet Connections ───────────────────────────────────────────────────────
export const walletConnections = pgTable("wallet_connections", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  walletAddress: varchar("walletAddress", { length: 64 }).notNull(),
  clawdBalance: real("clawdBalance").default(0),
  solBalance: real("solBalance").default(0),
  isVerified: boolean("isVerified").default(false),
  connectedAt: timestamp("connectedAt").defaultNow().notNull(),
  lastChecked: timestamp("lastChecked").defaultNow().notNull(),
});

export type WalletConnection = typeof walletConnections.$inferSelect;

// ─── Telegram Links (web app user ↔ Telegram identity) ───────────────────────
export const telegramLinks = pgTable("telegram_links", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  telegramUserId: varchar("telegramUserId", { length: 64 }).notNull().unique(),
  telegramChatId: varchar("telegramChatId", { length: 64 }).notNull(),
  telegramUsername: varchar("telegramUsername", { length: 64 }),
  telegramFirstName: varchar("telegramFirstName", { length: 128 }),
  telegramLastName: varchar("telegramLastName", { length: 128 }),
  linkedAt: timestamp("linkedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TelegramLink = typeof telegramLinks.$inferSelect;

// ─── Telegram Link Challenges (one-time deep-link tokens) ────────────────────
export const telegramLinkChallenges = pgTable("telegram_link_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  tokenHash: varchar("tokenHash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  consumedAt: timestamp("consumedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TelegramLinkChallenge = typeof telegramLinkChallenges.$inferSelect;

// ─── CLI Pair Codes (solana-clawd CLI ↔ web pairing) ────────────────────────
export const cliPairCodes = pgTable("cli_pair_codes", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  walletAddress: varchar("walletAddress", { length: 64 }).notNull(),
  codeHash: varchar("codeHash", { length: 64 }).notNull().unique(),
  label: varchar("label", { length: 128 }),
  expiresAt: timestamp("expiresAt").notNull(),
  consumedAt: timestamp("consumedAt"),
  consumedApiKeyId: integer("consumedApiKeyId"),
  consumedDevice: text("consumedDevice"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CliPairCode = typeof cliPairCodes.$inferSelect;

// ─── API Keys ─────────────────────────────────────────────────────────────────
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  agentWalletId: integer("agentWalletId"),         // null = user key, set = agent key
  name: varchar("name", { length: 128 }).notNull(),
  keyPrefix: varchar("key_prefix", { length: 16 }).notNull(),   // e.g. "clawd_sk_01ab"
  keyHash: varchar("key_hash", { length: 64 }).notNull(),       // SHA-256 of full key
  scopes: json("scopes").default([]).notNull(),                 // string[]
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;

// ─── API Key Audit Log ─────────────────────────────────────────────────────────
export const apiKeyAuditLog = pgTable("api_key_audit_log", {
  id: serial("id").primaryKey(),
  apiKeyId: integer("api_key_id").notNull(),
  userId: integer("userId").notNull(),
  event: varchar("event", { length: 64 }).notNull(),   // "used", "created", "revoked", "failed"
  route: text("route"),
  ipAddress: varchar("ip_address", { length: 64 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ApiKeyAuditLogEntry = typeof apiKeyAuditLog.$inferSelect;

// ─── Saved Items (Cloudflare R2 user vault) ──────────────────────────────────
// Every row points at an object in the `clawd` R2 bucket under
// `users/<openId>/…`. Source is the page/module the user saved from (e.g.
// "vibe", "image-studio") so the drawer can group things by origin.
export const savedItems = pgTable("saved_items", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  kind: savedItemKindEnum("kind").default("other").notNull(),
  source: varchar("source", { length: 64 }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  r2Key: text("r2Key").notNull(),
  contentType: varchar("contentType", { length: 128 }),
  sizeBytes: integer("sizeBytes").default(0),
  thumbnailUrl: text("thumbnailUrl"),
  metadata: json("metadata"),
  isPublic: boolean("isPublic").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SavedItem = typeof savedItems.$inferSelect;
export type InsertSavedItem = typeof savedItems.$inferInsert;

// ─── Monetized Agents (x402 recipient routing) ───────────────────────────────
// Each row says "when a payment comes in for this agent/MCP/URL, send the
// USDC to <recipientWallet> and credit the platform a <commissionBps> cut."
// slug is the public identifier echoed in paymentRequirements; treasury is
// the fallback when no slug matches.
export const monetizedAgents = pgTable("monetized_agents", {
  id: serial("id").primaryKey(),
  ownerUserId: integer("ownerUserId").notNull(),
  slug: varchar("slug", { length: 96 }).notNull().unique(),
  target: monetizedTargetEnum("target").default("agent").notNull(),
  label: varchar("label", { length: 160 }).notNull(),
  description: text("description"),
  // Solana wallet address that receives USDC for this agent.
  recipientWallet: varchar("recipientWallet", { length: 64 }).notNull(),
  // Optional reference to the agent registry row if this monetizes an
  // agent_wallet or on-chain agent identity.
  agentWalletId: integer("agentWalletId"),
  agentAddress: varchar("agentAddress", { length: 64 }),
  // Default price per billable unit (e.g. per call / per 1K tokens) in atomic
  // USDC (6 decimals). Callers can ask for more; they cannot pay less.
  pricePerCallAtomic: integer("pricePerCallAtomic").default(0).notNull(),
  // Platform commission in basis points. 1000 bps = 10%. Applied to the
  // atomic transfer amount and accrued off-chain (payment_events.commissionAtomic).
  commissionBps: integer("commissionBps").default(1000).notNull(),
  network: varchar("network", { length: 32 }).default("solana-mainnet").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MonetizedAgent = typeof monetizedAgents.$inferSelect;
export type InsertMonetizedAgent = typeof monetizedAgents.$inferInsert;

// ─── Payment Events (every /verify + /settle attempt) ────────────────────────
// Dual-purpose: (1) lets the owner see earnings per agent, (2) gives the
// platform an auditable record of commission owed. One row per facilitator
// call; status transitions verified → settled or verified → failed.
export const paymentEvents = pgTable("payment_events", {
  id: serial("id").primaryKey(),
  monetizedAgentId: integer("monetizedAgentId"),
  // The wallet that actually signed the USDC transfer (the payer).
  payerWallet: varchar("payerWallet", { length: 64 }),
  // The recipient wallet used on this transaction — copied from the agent
  // row at event time so later edits can't rewrite history.
  recipientWallet: varchar("recipientWallet", { length: 64 }).notNull(),
  amountAtomic: integer("amountAtomic").default(0).notNull(),
  commissionAtomic: integer("commissionAtomic").default(0).notNull(),
  commissionBps: integer("commissionBps").default(0).notNull(),
  network: varchar("network", { length: 32 }).notNull(),
  mint: varchar("mint", { length: 64 }).notNull(),
  signature: varchar("signature", { length: 128 }),
  status: paymentEventStatusEnum("status").default("verified").notNull(),
  reason: text("reason"),
  route: text("route"),
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PaymentEvent = typeof paymentEvents.$inferSelect;
export type InsertPaymentEvent = typeof paymentEvents.$inferInsert;

// ─── Install Executions (every run of the /install.sh one-liner) ─────────────
// Rows are keyed by a per-invocation hash emitted by the install script. The
// same wallet can run install many times (different machines), but each
// unique install → at most one airdrop claim.
export const installExecutions = pgTable("install_executions", {
  id: serial("id").primaryKey(),
  installHash: varchar("installHash", { length: 64 }).notNull().unique(),
  walletAddress: varchar("walletAddress", { length: 64 }),
  userId: integer("userId"),
  source: varchar("source", { length: 64 }).default("install.sh"),
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  os: varchar("os", { length: 32 }),
  arch: varchar("arch", { length: 32 }),
  version: varchar("version", { length: 32 }),
  metadata: json("metadata"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InstallExecution = typeof installExecutions.$inferSelect;
export type InsertInstallExecution = typeof installExecutions.$inferInsert;

// ─── Airdrop Claims ($CLAWD payout per verified install) ─────────────────────
// Unique on (installHash, walletAddress) so a wallet can only claim once per
// install. status transitions pending → sent | failed | skipped.
export const airdropClaims = pgTable("airdrop_claims", {
  id: serial("id").primaryKey(),
  installHash: varchar("installHash", { length: 64 }).notNull(),
  walletAddress: varchar("walletAddress", { length: 64 }).notNull(),
  userId: integer("userId"),
  amountAtomic: bigint("amountAtomic", { mode: "bigint" }).default(0n).notNull(),
  amountUi: real("amountUi").default(0).notNull(),
  mint: varchar("mint", { length: 64 }).notNull(),
  status: airdropClaimStatusEnum("status").default("pending").notNull(),
  signature: varchar("signature", { length: 128 }),
  reason: text("reason"),
  claimedAt: timestamp("claimedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AirdropClaim = typeof airdropClaims.$inferSelect;
export type InsertAirdropClaim = typeof airdropClaims.$inferInsert;

// ─── X (Twitter) Verification Codes ──────────────────────────────────────────
// One-time codes a wallet holder tweets to prove control of an X handle.
// Consumed by the registrar `/verify-tweet` step to issue an API key.
export const xVerificationCodes = pgTable("x_verification_codes", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("walletAddress", { length: 64 }).notNull(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  xHandle: varchar("xHandle", { length: 64 }),
  tweetId: varchar("tweetId", { length: 64 }),
  verified: boolean("verified").default(false).notNull(),
  verifiedAt: timestamp("verifiedAt"),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type XVerificationCode = typeof xVerificationCodes.$inferSelect;
export type InsertXVerificationCode = typeof xVerificationCodes.$inferInsert;

// ─── Hub Docs (docs/*.md mirrored for searchable/help surfaces) ─────────────
// The migration seeds the known docs list; scripts/sync-hub-docs.ts can load
// current Markdown bodies + hashes from disk into Postgres for hub search/RAG.
export const hubDocs = pgTable(
  "hub_docs",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 96 }).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    summary: text("summary").notNull(),
    sourcePath: text("sourcePath").notNull(),
    routePath: text("routePath").notNull(),
    canonicalUrl: text("canonicalUrl").notNull(),
    readWhen: json("readWhen").default([]).notNull(),
    content: text("content"),
    contentHash: varchar("contentHash", { length: 64 }),
    published: boolean("published").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("hub_docs_slug_idx").on(table.slug),
    publishedIdx: index("hub_docs_published_idx").on(table.published),
  }),
);

export type HubDoc = typeof hubDocs.$inferSelect;
export type InsertHubDoc = typeof hubDocs.$inferInsert;
