import {
  App,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  normalizePath,
  requestUrl,
} from "obsidian";

type MemoryType = "episodic" | "working" | "semantic" | "competence" | "plan_graph";

interface OpenClawdSettings {
  rootFolder: string;
  defaultAgent: string;
  defaultSensitivity: "public" | "low" | "medium" | "high" | "hyper";
  wikiQueuePath: string;
  membrainQueuePath: string;
  honchoQueuePath: string;
  localBridgeUrl: string;
  syncToLocalBridge: boolean;
}

interface MemoryDraft {
  title: string;
  memoryType: MemoryType;
  subject: string;
  tags: string;
  body: string;
}

const DEFAULT_SETTINGS: OpenClawdSettings = {
  rootFolder: "OpenClawd",
  defaultAgent: "clawd-analyst",
  defaultSensitivity: "low",
  wikiQueuePath: ".openclawd/openclawd-memory-notes.jsonl",
  membrainQueuePath: ".openclawd/membrain-ingest.jsonl",
  honchoQueuePath: ".openclawd/honcho-session.jsonl",
  localBridgeUrl: "http://127.0.0.1:8787/v1/obsidian/ingest",
  syncToLocalBridge: false,
};

const MEMORY_TYPES: MemoryType[] = ["episodic", "working", "semantic", "competence", "plan_graph"];

export default class OpenClawdObsidianPlugin extends Plugin {
  settings: OpenClawdSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    console.log("loading OpenClawd Obsidian plugin");

    this.addRibbonIcon("brain-circuit", "OpenClawd: export active note", async () => {
      await this.exportActiveNote();
    });

    this.addCommand({
      id: "initialize-openclawd-vault",
      name: "Initialize OpenClawd vault",
      callback: async () => this.initializeVault(),
    });

    this.addCommand({
      id: "create-trading-memory-note",
      name: "Create trading memory note",
      callback: () => new TradingMemoryModal(this.app, this, (draft) => this.createMemoryNote(draft)).open(),
    });

    this.addCommand({
      id: "export-active-note-to-memory",
      name: "Export active note to OpenClawd memory queues",
      callback: async () => this.exportActiveNote(),
    });

    this.addCommand({
      id: "sync-active-note-to-openclawd-bridge",
      name: "Sync active note to local OpenClawd bridge",
      callback: async () => this.syncActiveNoteToBridge(),
    });

    this.addSettingTab(new OpenClawdSettingTab(this.app, this));
  }

  async onunload() {
    console.log("unloading OpenClawd Obsidian plugin");
  }

  async loadSettings() {
    this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async initializeVault() {
    const root = normalizePath(this.settings.rootFolder);
    await this.ensureFolder(root);
    await this.ensureFolder(`${root}/Runbooks`);
    await this.ensureFolder(`${root}/Research`);
    await this.ensureFolder(`${root}/Memory`);
    await this.ensureFolder(`${root}/Submissions`);
    await this.ensureFolder(".openclawd");

    await this.writeIfMissing(
      `${root}/Runbooks/Clawd Home.md`,
      [
        "---",
        "openclawd:",
        "  type: runbook",
        "  agent: clawd-monitor",
        "---",
        "# Clawd Home",
        "",
        "Use this vault for OpenClawd runbooks, trading research, agent memory, and submission notes.",
        "",
        "- Link research with [[Solana Research]]",
        "- Track tasks with #todo",
        "- Export durable findings with the OpenClawd command palette actions",
      ].join("\n"),
    );

    await this.writeIfMissing(
      `${root}/Research/Solana Research.md`,
      [
        "---",
        "openclawd:",
        "  type: research",
        "  memory_type: semantic",
        "  sensitivity: low",
        "---",
        "# Solana Research",
        "",
        "Daily notes for tokens, protocols, wallet observations, and DeFi agent decisions.",
        "",
        "Related: [[Clawd Home]]",
      ].join("\n"),
    );

    await this.writeIfMissing(
      `${root}/Memory/Membrain Ingestion.md`,
      [
        "# Membrain Ingestion",
        "",
        "OpenClawd exports note records into `.openclawd/membrain-ingest.jsonl` for the Membrain daemon or bridge to ingest.",
        "",
        "Memory types map to Membrain records: episodic, working, semantic, competence, and plan_graph.",
      ].join("\n"),
    );

    await this.writeIfMissing(
      `${root}/Memory/Honcho Session.md`,
      [
        "# Honcho Session",
        "",
        "OpenClawd exports note messages into `.openclawd/honcho-session.jsonl` for Honcho-style peer and session replay.",
        "",
        "No API keys or wallet secrets are stored in this vault by default.",
      ].join("\n"),
    );

    await this.writeIfMissing(
      `${root}/Memory/OpenClawd Memory Wiki.md`,
      [
        "# OpenClawd Memory Wiki",
        "",
        "OpenClawd exports Obsidian notes into `.openclawd/openclawd-memory-notes.jsonl` using the lightweight OpenClawd Memory model.",
        "",
        "This is the file-first layer between the wiki and derived memory systems: markdown remains the source of truth, while Membrain and Honcho consume structured exports.",
        "",
        "Sources line up with the OpenClawd Memory service: `manual`, `llm_wiki`, `dark_ralph`, `clawd_tui`, and `system`.",
      ].join("\n"),
    );

    await this.writeIfMissing(`${root}/Submissions/File Over Agent Memory.md`, fileOverAgentMemory(settingsWithRoot(this.settings, root)));
    await this.writeIfMissing(`${root}/Submissions/Official Obsidian Submission.md`, officialSubmission(this.settings));
    new Notice("OpenClawd vault initialized");
  }

  async createMemoryNote(draft: MemoryDraft) {
    const root = normalizePath(this.settings.rootFolder);
    const folder = `${root}/Research`;
    await this.ensureFolder(folder);
    const title = sanitizeFileName(draft.title || `${draft.subject} ${draft.memoryType}`);
    const tags = normalizeTags(draft.tags);
    const path = await this.nextAvailablePath(`${folder}/${title}.md`);
    const content = buildMemoryNote(draft, tags, this.settings);
    await this.app.vault.create(path, content);
    const file = this.app.vault.getAbstractFileByPath(path);
    if (file instanceof TFile) {
      await this.app.workspace.getLeaf(false).openFile(file);
    }
    new Notice("OpenClawd memory note created");
  }

  async exportActiveNote() {
    const file = this.app.workspace.getActiveFile();
    if (!file) {
      new Notice("Open a note before exporting to OpenClawd memory");
      return;
    }

    const body = await this.app.vault.read(file);
    const record = buildMemoryRecord(file, body, this.settings);
    await this.appendJsonl(this.settings.wikiQueuePath, buildOpenClawdMemoryNote(file, body, this.settings));
    await this.appendJsonl(this.settings.membrainQueuePath, record);
    await this.appendJsonl(this.settings.honchoQueuePath, buildHonchoMessage(file, body, this.settings));

    if (this.settings.syncToLocalBridge) {
      await this.postToBridge(record);
    }

    new Notice("Exported active note to OpenClawd memory queues");
  }

  async syncActiveNoteToBridge() {
    const file = this.app.workspace.getActiveFile();
    if (!file) {
      new Notice("Open a note before syncing to the OpenClawd bridge");
      return;
    }

    const body = await this.app.vault.read(file);
    await this.postToBridge(buildMemoryRecord(file, body, this.settings));
    new Notice("Synced active note to local OpenClawd bridge");
  }

  async postToBridge(payload: unknown) {
    try {
      await requestUrl({
        url: this.settings.localBridgeUrl,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      new Notice(`OpenClawd bridge sync failed: ${message}`);
    }
  }

  async appendJsonl(path: string, value: unknown) {
    const normalized = normalizePath(path);
    await this.ensureParentFolder(normalized);
    const line = `${JSON.stringify(value)}\n`;
    if (await this.app.vault.adapter.exists(normalized)) {
      const current = await this.app.vault.adapter.read(normalized);
      await this.app.vault.adapter.write(normalized, current.endsWith("\n") ? `${current}${line}` : `${current}\n${line}`);
    } else {
      await this.app.vault.adapter.write(normalized, line);
    }
  }

  async writeIfMissing(path: string, content: string) {
    const normalized = normalizePath(path);
    if (!(await this.app.vault.adapter.exists(normalized))) {
      await this.ensureParentFolder(normalized);
      await this.app.vault.create(normalized, content);
    }
  }

  async nextAvailablePath(path: string): Promise<string> {
    const normalized = normalizePath(path);
    if (!(await this.app.vault.adapter.exists(normalized))) return normalized;
    const dot = normalized.lastIndexOf(".");
    const base = dot >= 0 ? normalized.slice(0, dot) : normalized;
    const ext = dot >= 0 ? normalized.slice(dot) : "";
    for (let index = 2; index < 1000; index += 1) {
      const candidate = `${base} ${index}${ext}`;
      if (!(await this.app.vault.adapter.exists(candidate))) return candidate;
    }
    throw new Error(`Unable to find available path for ${normalized}`);
  }

  async ensureParentFolder(path: string) {
    const parts = normalizePath(path).split("/");
    parts.pop();
    if (parts.length > 0) {
      await this.ensureFolder(parts.join("/"));
    }
  }

  async ensureFolder(path: string) {
    const normalized = normalizePath(path);
    if (!normalized || normalized === ".") return;
    const parts = normalized.split("/");
    let current = "";
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      if (!(await this.app.vault.adapter.exists(current))) {
        await this.app.vault.createFolder(current);
      }
    }
  }
}

class TradingMemoryModal extends Modal {
  private draft: MemoryDraft = {
    title: "",
    memoryType: "semantic",
    subject: "$CLAWD",
    tags: "openclawd, solana",
    body: "",
  };

  constructor(app: App, private plugin: OpenClawdObsidianPlugin, private onSubmit: (draft: MemoryDraft) => Promise<void>) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("openclawd-modal");
    contentEl.createEl("h2", { text: "OpenClawd Trading Memory" });

    new Setting(contentEl).setName("Title").addText((text) =>
      text.setPlaceholder("CLAWD liquidity observation").onChange((value) => {
        this.draft.title = value;
      }),
    );

    new Setting(contentEl).setName("Memory type").addDropdown((dropdown) => {
      for (const type of MEMORY_TYPES) dropdown.addOption(type, type);
      dropdown.setValue(this.draft.memoryType).onChange((value) => {
        this.draft.memoryType = value as MemoryType;
      });
    });

    new Setting(contentEl).setName("Subject").addText((text) =>
      text.setValue(this.draft.subject).onChange((value) => {
        this.draft.subject = value;
      }),
    );

    new Setting(contentEl).setName("Tags").addText((text) =>
      text.setValue(this.draft.tags).onChange((value) => {
        this.draft.tags = value;
      }),
    );

    new Setting(contentEl).setName("Body").addTextArea((text) =>
      text.setPlaceholder("What did the agent, wallet, market, or operator learn?").onChange((value) => {
        this.draft.body = value;
      }),
    );

    new Setting(contentEl).addButton((button) =>
      button
        .setButtonText("Create note")
        .setCta()
        .onClick(async () => {
          await this.onSubmit(this.draft);
          this.close();
        }),
    );
  }

  onClose() {
    this.contentEl.empty();
  }
}

class OpenClawdSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: OpenClawdObsidianPlugin) {
    super(app, plugin);
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "OpenClawd" });

    new Setting(containerEl).setName("Root folder").setDesc("Folder where OpenClawd notes are created.").addText((text) =>
      text.setValue(this.plugin.settings.rootFolder).onChange(async (value) => {
        this.plugin.settings.rootFolder = value.trim() || DEFAULT_SETTINGS.rootFolder;
        await this.plugin.saveSettings();
      }),
    );

    new Setting(containerEl).setName("Default agent").setDesc("Agent name written into frontmatter and Honcho exports.").addText((text) =>
      text.setValue(this.plugin.settings.defaultAgent).onChange(async (value) => {
        this.plugin.settings.defaultAgent = value.trim() || DEFAULT_SETTINGS.defaultAgent;
        await this.plugin.saveSettings();
      }),
    );

    new Setting(containerEl).setName("Default sensitivity").addDropdown((dropdown) =>
      dropdown
        .addOptions({ public: "public", low: "low", medium: "medium", high: "high", hyper: "hyper" })
        .setValue(this.plugin.settings.defaultSensitivity)
        .onChange(async (value) => {
          this.plugin.settings.defaultSensitivity = value as OpenClawdSettings["defaultSensitivity"];
          await this.plugin.saveSettings();
        }),
    );

    new Setting(containerEl).setName("OpenClawd Memory wiki queue path").addText((text) =>
      text.setValue(this.plugin.settings.wikiQueuePath).onChange(async (value) => {
        this.plugin.settings.wikiQueuePath = value.trim() || DEFAULT_SETTINGS.wikiQueuePath;
        await this.plugin.saveSettings();
      }),
    );

    new Setting(containerEl).setName("Membrain queue path").addText((text) =>
      text.setValue(this.plugin.settings.membrainQueuePath).onChange(async (value) => {
        this.plugin.settings.membrainQueuePath = value.trim() || DEFAULT_SETTINGS.membrainQueuePath;
        await this.plugin.saveSettings();
      }),
    );

    new Setting(containerEl).setName("Honcho queue path").addText((text) =>
      text.setValue(this.plugin.settings.honchoQueuePath).onChange(async (value) => {
        this.plugin.settings.honchoQueuePath = value.trim() || DEFAULT_SETTINGS.honchoQueuePath;
        await this.plugin.saveSettings();
      }),
    );

    new Setting(containerEl).setName("Local bridge URL").addText((text) =>
      text.setValue(this.plugin.settings.localBridgeUrl).onChange(async (value) => {
        this.plugin.settings.localBridgeUrl = value.trim() || DEFAULT_SETTINGS.localBridgeUrl;
        await this.plugin.saveSettings();
      }),
    );

    new Setting(containerEl).setName("Sync exports to local bridge").setDesc("Off by default. Export always writes local JSONL queues first.").addToggle((toggle) =>
      toggle.setValue(this.plugin.settings.syncToLocalBridge).onChange(async (value) => {
        this.plugin.settings.syncToLocalBridge = value;
        await this.plugin.saveSettings();
      }),
    );

    containerEl.createDiv({
      cls: "openclawd-sync-status",
      text: "Official submission mode avoids secrets: notes export to vault-local queues unless local bridge sync is enabled.",
    });
  }
}

function buildMemoryNote(draft: MemoryDraft, tags: string[], settings: OpenClawdSettings): string {
  const title = draft.title.trim() || `${draft.subject} ${draft.memoryType}`;
  return [
    "---",
    "openclawd:",
    `  agent: ${settings.defaultAgent}`,
    `  memory_type: ${draft.memoryType}`,
    `  sensitivity: ${settings.defaultSensitivity}`,
    `  subject: ${draft.subject || "OpenClawd"}`,
    "  source: obsidian",
    `tags: [${tags.map((tag) => `"${tag}"`).join(", ")}]`,
    "---",
    `# ${title}`,
    "",
    draft.body.trim() || "Record the observation, decision, outcome, or reusable procedure here.",
    "",
    "## Membrain Mapping",
    "",
    `- type: ${draft.memoryType}`,
    `- subject: ${draft.subject || "OpenClawd"}`,
    `- sensitivity: ${settings.defaultSensitivity}`,
    "",
    "## Honcho Mapping",
    "",
    `- peer: ${settings.defaultAgent}`,
    "- session: obsidian-vault",
  ].join("\n");
}

function buildMemoryRecord(file: TFile, body: string, settings: OpenClawdSettings) {
  const metadata = extractOpenClawdMetadata(body);
  const tags = extractTags(body);
  return {
    source: "obsidian",
    ref: `obsidian:${file.path}:${file.stat.mtime}`,
    title: file.basename,
    path: file.path,
    memory_type: metadata.memory_type ?? "semantic",
    sensitivity: metadata.sensitivity ?? settings.defaultSensitivity,
    subject: metadata.subject ?? file.basename,
    agent: metadata.agent ?? settings.defaultAgent,
    summary: summarizeBody(body),
    content: body,
    tags,
    links: extractLinks(body),
    updated_at: new Date(file.stat.mtime).toISOString(),
  };
}

function buildOpenClawdMemoryNote(file: TFile, body: string, settings: OpenClawdSettings) {
  const metadata = extractOpenClawdMetadata(body);
  return {
    title: file.basename,
    body,
    tags: extractTags(body),
    source: metadata.source ?? inferMemorySource(file.path),
    metadata: {
      path: file.path,
      source: "obsidian",
      agent: metadata.agent ?? settings.defaultAgent,
      subject: metadata.subject ?? file.basename,
      memory_type: metadata.memory_type ?? "semantic",
      sensitivity: metadata.sensitivity ?? settings.defaultSensitivity,
      links: extractLinks(body),
      updated_at: new Date(file.stat.mtime).toISOString(),
    },
  };
}

function buildHonchoMessage(file: TFile, body: string, settings: OpenClawdSettings) {
  const metadata = extractOpenClawdMetadata(body);
  return {
    workspace_id: "openclawd-obsidian",
    session_id: "obsidian-vault",
    peer_id: metadata.agent ?? settings.defaultAgent,
    role: "user",
    source: "obsidian",
    path: file.path,
    content: body,
    metadata: {
      title: file.basename,
      subject: metadata.subject ?? file.basename,
      memory_type: metadata.memory_type ?? "semantic",
      sensitivity: metadata.sensitivity ?? settings.defaultSensitivity,
      links: extractLinks(body),
      tags: extractTags(body),
    },
    created_at: new Date().toISOString(),
  };
}

function extractOpenClawdMetadata(body: string): Partial<Record<"agent" | "memory_type" | "sensitivity" | "subject" | "source", string>> {
  const metadata: Partial<Record<"agent" | "memory_type" | "sensitivity" | "subject" | "source", string>> = {};
  const frontmatter = body.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatter) return metadata;
  for (const line of frontmatter[1].split("\n")) {
    const match = line.match(/^\s*(agent|memory_type|sensitivity|subject|source):\s*(.+?)\s*$/);
    if (match) metadata[match[1] as keyof typeof metadata] = match[2].replace(/^["']|["']$/g, "");
  }
  return metadata;
}

function extractTags(body: string): string[] {
  const markdownTags = Array.from(body.matchAll(/(?:^|\s)#([A-Za-z0-9_/-]+)/g), (match) => match[1]);
  const frontmatterTags = Array.from(body.matchAll(/tags:\s*\[([^\]]+)\]/g)).flatMap((match) =>
    match[1].split(",").map((tag) => tag.trim().replace(/^["']|["']$/g, "")),
  );
  return unique([...markdownTags, ...frontmatterTags].filter(Boolean));
}

function extractLinks(body: string): string[] {
  return unique(Array.from(body.matchAll(/\[\[([^\]\n]+)\]\]/g), (match) => match[1].trim()).filter(Boolean));
}

function summarizeBody(body: string): string {
  return body
    .replace(/^---\n[\s\S]*?\n---/, "")
    .replace(/^# .+$/gm, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
}

function normalizeTags(value: string): string[] {
  return unique(
    value
      .split(",")
      .map((tag) => tag.trim().replace(/^#/, ""))
      .filter(Boolean),
  );
}

function sanitizeFileName(value: string): string {
  return value.replace(/[\\/:*?"<>|#^[\]]/g, " ").replace(/\s+/g, " ").trim() || "OpenClawd Memory";
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function inferMemorySource(path: string): "manual" | "llm_wiki" | "dark_ralph" | "clawd_tui" | "system" {
  const normalized = path.toLowerCase();
  if (normalized.includes("llm") || normalized.includes("wiki") || normalized.includes("research")) return "llm_wiki";
  if (normalized.includes("dark-ralph") || normalized.includes("dark ralph")) return "dark_ralph";
  if (normalized.includes("tui")) return "clawd_tui";
  if (normalized.includes("system")) return "system";
  return "manual";
}

function settingsWithRoot(settings: OpenClawdSettings, root: string): OpenClawdSettings {
  return { ...settings, rootFolder: root };
}

function officialSubmission(settings: OpenClawdSettings): string {
  return [
    "---",
    "openclawd:",
    "  type: official_submission",
    "  source: obsidian",
    "  memory_type: semantic",
    `  sensitivity: ${settings.defaultSensitivity}`,
    "---",
    "# Official OpenClawd Obsidian Submission",
    "",
    "OpenClawd for Obsidian turns a vault into a local-first command journal for Solana-native financial AI agents.",
    "",
    "The design follows the file-first Obsidian philosophy: markdown files stay local and operator-owned, while plugin commands produce optional derived indexes for OpenClawd Memory, Membrain, and Honcho.",
    "",
    "## Integrated Stack",
    "",
    "- Obsidian plugin lifecycle: `onload` registers commands, ribbon actions, settings, and export paths; `onunload` releases plugin resources.",
    "- OpenClawd Memory wiki: notes export as markdown-native note records with tags, metadata, wikilinks, and backlinks.",
    "- Membrain: notes export as typed memory records for episodic, working, semantic, competence, and plan_graph ingestion.",
    "- Honcho: notes export as peer/session JSONL messages for stateful agent replay.",
    "- OpenClawd: vault notes use `openclawd.*` metadata and avoid private keys, populated env files, and wallet material.",
    "",
    "## Default Queues",
    "",
    `- OpenClawd Memory wiki: \`${settings.wikiQueuePath}\``,
    `- Membrain: \`${settings.membrainQueuePath}\``,
    `- Honcho: \`${settings.honchoQueuePath}\``,
    "",
    "## Commands",
    "",
    "- Initialize OpenClawd vault",
    "- Create trading memory note",
    "- Export active note to OpenClawd memory queues",
    "- Sync active note to local OpenClawd bridge",
  ].join("\n");
}

function fileOverAgentMemory(settings: OpenClawdSettings): string {
  return [
    "---",
    "openclawd:",
    "  type: design_manifesto",
    "  source: manual",
    "  memory_type: competence",
    `  sensitivity: ${settings.defaultSensitivity}`,
    "  subject: file-first agent memory",
    "---",
    "# File Over Agent Memory",
    "",
    "OpenClawd's Obsidian integration is built around a simple rule: files are the durable artifact, apps and agents are replaceable views over those files.",
    "",
    "The operator's notes remain plain markdown in a local vault. Obsidian supplies the editing experience and plugin surface. OpenClawd Memory, Membrain, and Honcho receive derived records that can be rebuilt from the vault.",
    "",
    "## Principles",
    "",
    "- Plain-text markdown is the source of truth.",
    "- Local-first storage comes before network sync.",
    "- Plugins should compose with the filesystem instead of trapping data behind an app boundary.",
    "- Sync, publish, Git, and local JSONL queues are optional transport layers.",
    "- No private keys, API secrets, or wallet material belong in public notes.",
    "- Memory systems should be auditable and regenerable from operator-owned files.",
    "",
    "## OpenClawd Mapping",
    "",
    `- Wiki queue: \`${settings.wikiQueuePath}\``,
    `- Membrain queue: \`${settings.membrainQueuePath}\``,
    `- Honcho queue: \`${settings.honchoQueuePath}\``,
    "",
    "The vault is the canonical wiki. Membrain provides typed, revisable agent memory. Honcho provides peer/session continuity. Each layer is useful, but none owns the operator's data.",
  ].join("\n");
}
