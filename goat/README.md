<div align="center">
  <h1>OpenClawd</h1>
  <p><strong>The Open-Source Framework for Multi-Agent AI Development</strong></p>
  <p>Build, deploy, and manage autonomous AI agents with a modern, extensible, and full-featured platform.</p>
</div>

<div align="center">
  <!-- Badges will go here -->
  <a href="https://github.com/openclawd/openclawd/blob/main/LICENSE"><img src="https://img.shields.io/github/license/openclawd/openclawd?style=for-the-badge" alt="License"></a>
  <a href="https://www.npmjs.com/package/@openclawdsolana/cli"><img src="https://img.shields.io/npm/v/@openclawdsolana/cli?style=for-the-badge" alt="NPM Version"></a>
  <a href="https://docs.openclawd.ai/"><img src="https://img.shields.io/badge/Documentation-Read%20Docs-blue?style=for-the-badge" alt="Documentation"></a>
  <a href="https://deepwiki.com/OpenClawd/openclawd"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki" height="28"></a>
  <a href="https://github.com/openclawd/openclawd/actions/workflows/image.yaml"><img src="https://img.shields.io/github/actions/workflow/status/openclawd/openclawd/ci.yaml?branch=main&style=for-the-badge" alt="CI Status"></a>
  <a href="https://discord.gg/ai16z"><img src="https://img.shields.io/discord/1253563208833433701?style=for-the-badge&logo=discord" alt="Discord"></a>
</div>

## ✨ What is OpenClawd?

OpenClawd is an all-in-one, extensible platform for building and deploying AI-powered applications. Whether you're creating sophisticated chatbots, autonomous agents for business process automation, or intelligent game NPCs, OpenClawd provides the tools you need to get started quickly and scale effectively.

It combines a modular architecture, a powerful CLI, and a rich web interface to give you full control over your agents' development, deployment, and management lifecycle.

For complete guides and API references, visit our official **[documentation](https://docs.openclawd.ai/)**.

## 🚀 Key Features

- 🔌 **Rich Connectivity**: Out-of-the-box connectors for Discord, Telegram, Farcaster, and more.
- 🧠 **Model Agnostic**: Supports all major models, including OpenAI, Gemini, Anthropic, Llama, and Grok.
- 🖥️ **Modern Web UI**: A professional dashboard for managing agents, groups, and conversations in real-time.
- 🤖 **Multi-Agent Architecture**: Designed from the ground up for creating and orchestrating groups of specialized agents.
- 📄 **Document Ingestion**: Easily ingest documents and allow agents to retrieve information and answer questions from your data (RAG).
- 🛠️ **Highly Extensible**: Build your own functionality with a powerful plugin system.
- 📦 **It Just Works**: A seamless setup and development experience from day one.

## 🏁 Getting Started (5-Minute Quick Start)

There are two recommended paths for using OpenClawd:

- **For Beginners & Standalone Projects (CLI):** If you want to create and deploy agents without modifying OpenClawd's core code, the CLI is the fastest and simplest method. The guide below is for you.

- **For Power Users & Contributors (Monorepo):** If you plan to contribute to OpenClawd, create complex custom plugins, or manage multiple projects in one place, we recommend cloning the full monorepo. See the [How to Contribute](#-how-to-contribute) section to get started.

---

Get your first AI agent running in just a few commands.

**Prerequisites:**

- [Node.js](https://nodejs.org/) (v23+)
- [bun](https://bun.sh/docs/installation)

> **Note for Windows Users:** [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install-manual) is required.

### 1. Install the CLI

```bash
# Install the OpenClawd CLI globally
bun install -g @openclawdsolana/cli

# Verify installation
openclawd --version
```

### 2. Create Your Project

```bash
# Create a new project with an interactive setup
openclawd create my-first-agent

# Follow the prompts. For beginners, we recommend:
# - Database: pglite (no setup required)
# - Model Provider: openai
# - Project Type: project
```

### 3. Configure Your API Key

```bash
cd my-first-agent

# Open the local environment file
openclawd env edit-local
```

Add your model provider's API key (e.g., for OpenAI):

```env
OPENAI_API_KEY=your_api_key_here
```

### 4. Start Your Agent

```bash
# Build and start the agent server
openclawd start
```

Your agent is now running!

- **Web Interface**: [http://localhost:3000](http://localhost:3000)
- **API Endpoint**: `http://localhost:3000/api`

---

<details>
<summary>📚 **Advanced CLI Commands & Usage**</summary>

OpenClawd's CLI is powerful. Here are some more commands for development and management.

#### Development Workflow

```bash
# Make changes to your agent code, then rebuild and restart
bun run build
openclawd start

# Or, start in development mode with auto-rebuild
openclawd dev

# Run tests to verify your changes
openclawd test
```

#### Agent & Environment Management

```bash
# List all available agents
openclawd agent list

# Start a specific agent by name
openclawd agent start --name "MyAgent"

# Show all environment variables
openclawd env list
```

#### Debugging

```bash
# Start with detailed debug logging
LOG_LEVEL=debug openclawd start
```

For a full command reference, run `openclawd --help` or `openclawd <command> --help`.

</details>

---

## 🔧 Running OpenClawd Core Standalone

Use OpenClawd agents directly in your applications without the CLI or web interface.

```bash
git clone https://github.com/openclawd/openclawd.git
cd openclawd/examples

# Interactive chat
OPENAI_API_KEY=your_key bun run standalone-cli-chat.ts

# Basic message processing
OPENAI_API_KEY=your_key bun run standalone.ts
```

## 🏛️ Architecture Overview

OpenClawd is a monorepo that contains all the packages needed to run the entire platform.

```
/
├── packages/
│   ├── server/         # Core backend server (Express.js)
│   ├── client/         # Frontend web interface (React)
│   ├── cli/            # Command-line tool for managing projects
│   ├── core/           # Shared utilities and functions
│   ├── app/            # Cross-platform desktop app (Tauri)
│   ├── plugin-bootstrap/ # Core communication and event handling plugin
│   ├── plugin-sql/     # Database integration (Postgres, PGLite)
│   └── ...             # Other plugins and project starters
└── ...
```

- **`@openclawdsolana/server`**: The Express.js backend that runs your agents and exposes the API.
- **`@openclawdsolana/client`**: The React-based web UI for managing and interacting with your agents.
- **`@openclawdsolana/cli`**: The central tool for scaffolding, running, and managing your projects.
- **`@openclawdsolana/plugin-bootstrap`**: The mandatory core plugin that handles message processing and basic agent actions.

## 🤝 How to Contribute

We welcome contributions from the community! Please read our `CONTRIBUTING.md` guide to get started.

- **Report a Bug**: Open an issue using the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) template.
- **Request a Feature**: Use the [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) template.
- **Submit a Pull Request**: Please open an issue first to discuss your proposed changes.

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## 🎓 Citation

If you use OpenClawd in your research, please cite our paper:

```bibtex
@article{walters2025openclawd,
  title={OpenClawd: A Web3 friendly AI Agent Operating System},
  author={Walters, Shaw and Gao, Sam and Nerd, Shakker and Da, Feng and Williams, Warren and Meng, Ting-Chien and Han, Hunter and He, Frank and Zhang, Allen and Wu, Ming and others},
  journal={arXiv preprint arXiv:2501.06781},
  year={2025}
}
```

## Contributors

<a href="https://github.com/openclawd/openclawd/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=openclawd/openclawd" alt="OpenClawd project contributors" />
</a>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=openclawd/openclawd&type=Date)](https://star-history.com/#openclawd/openclawd&Date)
