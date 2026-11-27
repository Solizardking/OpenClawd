# Solizard Agents

Solizard Agents 是 [github.com/solizardking/agents](https://github.com/solizardking/agents) 的公开智能体目录。该目录保留 DeFi、交易、投资组合、收益、风险、安全和区块链自动化相关的智能体定义，并将公开项目身份更新为 Solizard。

## 目录

- 智能体数量：43
- 分类数量：8
- 静态目录：https://solizardking.github.io/agents/index.json
- Manifest：https://solizardking.github.io/agents/agents-manifest.json
- 仓库：https://github.com/solizardking/agents

## 快速开始

```bash
git clone https://github.com/solizardking/agents.git
cd agents
bun install
bun run build
```

获取目录：

```bash
curl https://solizardking.github.io/agents/index.json
curl https://solizardking.github.io/agents/defi-yield-farmer.json
curl https://solizardking.github.io/agents/wallet-security-advisor.json
```

## 结构

- `src/`：源智能体 JSON 定义
- `locales/`：本地化元数据
- `schema/`：校验 schema
- `scripts/`：构建、校验、格式化和提交工具
- `docs/`：API 与工作流说明

该项目继续使用 MIT 许可证。必要的上游版权说明保留在 [LICENSE](./LICENSE)。
