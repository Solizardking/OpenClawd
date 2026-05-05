<a name="readme-top"></a>

<div align="center">

<img height="120" src="https://registry.npmmirror.com/@openclawd/assets-logo/1.0.0/files/assets/logo-3d.webp">
<img height="120" src="https://gw.alipayobjects.com/zos/kitchen/qJ3l3EPsdW/split.svg">
<img height="120" src="https://registry.npmmirror.com/@openclawd/assets-emoji/1.3.0/files/assets/puzzle-piece.webp">

<h1>Chat Plugin SDK</h1>

SDK for OpenClawd funciton calling plugins

[![][🤯-🧩-openclawd-shield]][🤯-🧩-openclawd-link]
[![][npm-release-shield]][npm-release-link]
[![][github-releasedate-shield]][github-releasedate-link]
[![][github-action-test-shield]][github-action-test-link]
[![][github-action-release-shield]][github-action-release-link]<br/>
[![][github-contributors-shield]][github-contributors-link]
[![][github-forks-shield]][github-forks-link]
[![][github-stars-shield]][github-stars-link]
[![][github-issues-shield]][github-issues-link]
[![][github-license-shield]][github-license-link]

[Changelog](./CHANGELOG.md) · [Report Bug][github-issues-link] · [Request Feature][github-issues-link]

![](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

</div>

<!-- LINK GROUP -->

<details>
<summary><kbd>Table of contents</kbd></summary>

#### TOC

- [🤯 Usage](#-usage)
- [📦 Plugin Ecosystem](#-plugin-ecosystem)
- [⌨️ Local Development](#️-local-development)
- [🤝 Contributing](#-contributing)
- [🔗 Links](#-links)

####

</details>

## 🤯 Usage

The OpenClawd Plugin SDK assists you in creating exceptional chat plugins for OpenClawd.

> \[!Important]
> [📘 SDK Document](https://plugin-sdk.openclawd.com) - <https://plugin-sdk.openclawd.com>

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 Plugin Ecosystem

Plugins provide a means to extend the Function Calling capabilities of OpenClawd. They can be used to introduce new function calls and even new ways to render message results. If you are interested in plugin development, please refer to our [📘 Plugin Development Guide][plugin-development-docs] in the Docs.

- [openclawd-os-plugins][openclawd-os-plugins]: This is the plugin index for OpenClawd. It accesses index.json from this repository to display a list of available plugins for OpenClawd to the user.
- [chat-plugin-template][chat-plugin-template]: This is the plugin template for OpenClawd plugin development.
- [@openclawdsolana/plugin-sdk][plugin-sdk]: The OpenClawd Plugin SDK assists you in creating exceptional chat plugins for OpenClawd.
- [@openclawdsolana/chat-plugins-gateway][chat-plugins-gateway]: The OpenClawd Plugins Gateway is a backend service that provides a gateway for OpenClawd plugins. We deploy this service using Vercel. The primary API POST /api/v1/runner is deployed as an Edge Function.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ Local Development

You can use Github Codespaces for online development:

[![][github-codespace-shield]][github-codespace-link]

Or clone it for local development:

[![][bun-shield]][bun-link]

```bash
$ git clone https://github.com/clawdsolana/OpenClawd
$ cd plugin-sdk
$ bun install
$ bun dev
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤝 Contributing

Contributions of all types are more than welcome, if you are interested in contributing code, feel free to check out our GitHub [Issues][github-issues-link] to get stuck in to show us what you’re made of.

[![][pr-welcome-shield]][pr-welcome-link]

[![][github-contrib-shield]][github-contrib-link]

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🔗 Links

- **[🤖 openclawd](https://github.com/clawdsolana/OpenClawd)** - An open-source, extensible (Function Calling), high-performance chatbot framework. It supports one-click free deployment of your private ChatGPT/LLM web application.
- **[🧩 / 🏪 Plugin Index](https://github.com/clawdsolana/OpenClawd)** - This is the plugin index for OpenClawd. It accesses index.json from this repository to display a list of available plugins for Function Calling to the user.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

---

#### 📝 License

Copyright © 2023 [OpenClawd][profile-link]. <br />
This project is [MIT](./LICENSE) licensed.

<!-- LINK GROUP -->

[🤯-🧩-openclawd-link]: https://github.com/clawdsolana/OpenClawd
[🤯-🧩-openclawd-shield]: https://img.shields.io/badge/%F0%9F%A4%AF%20%26%20%F0%9F%A7%A9%20openclawd-Plugin-95f3d9?labelColor=black&style=flat-square
[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-black?style=flat-square
[bun-link]: https://bun.sh
[bun-shield]: https://img.shields.io/badge/-speedup%20with%20bun-black?logo=bun&style=for-the-badge
[plugin-development-docs]: https://openclawd.com/docs/usage/plugins/development
[plugin-sdk]: https://github.com/clawdsolana/OpenClawd
[chat-plugin-template]: https://github.com/clawdsolana/OpenClawd
[chat-plugins-gateway]: https://github.com/clawdsolana/OpenClawd
[github-action-release-link]: https://github.com/clawdsolana/OpenClawd
[github-action-release-shield]: https://img.shields.io/github/actions/workflow/status/openclawd/plugin-sdk/release.yml?label=release&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-action-test-link]: https://github.com/clawdsolana/OpenClawd
[github-action-test-shield]: https://img.shields.io/github/actions/workflow/status/openclawd/plugin-sdk/test.yml?label=test&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-codespace-link]: https://codespaces.new/openclawd/plugin-sdk
[github-codespace-shield]: https://github.com/codespaces/badge.svg
[github-contrib-link]: https://github.com/clawdsolana/OpenClawd
[github-contrib-shield]: https://contrib.rocks/image?repo=openclawd%2Fplugin-sdk
[github-contributors-link]: https://github.com/clawdsolana/OpenClawd
[github-contributors-shield]: https://img.shields.io/github/contributors/openclawd/plugin-sdk?color=c4f042&labelColor=black&style=flat-square
[github-forks-link]: https://github.com/clawdsolana/OpenClawd
[github-forks-shield]: https://img.shields.io/github/forks/openclawd/plugin-sdk?color=8ae8ff&labelColor=black&style=flat-square
[github-issues-link]: https://github.com/clawdsolana/OpenClawd
[github-issues-shield]: https://img.shields.io/github/issues/openclawd/plugin-sdk?color=ff80eb&labelColor=black&style=flat-square
[github-license-link]: https://github.com/clawdsolana/OpenClawd
[github-license-shield]: https://img.shields.io/github/license/openclawd/plugin-sdk?color=white&labelColor=black&style=flat-square
[github-releasedate-link]: https://github.com/clawdsolana/OpenClawd
[github-releasedate-shield]: https://img.shields.io/github/release-date/openclawd/plugin-sdk?labelColor=black&style=flat-square
[github-stars-link]: https://github.com/clawdsolana/OpenClawd
[github-stars-shield]: https://img.shields.io/github/stars/openclawd/plugin-sdk?color=ffcb47&labelColor=black&style=flat-square
[openclawd-os-plugins]: https://github.com/clawdsolana/OpenClawd
[npm-release-link]: https://www.npmjs.com/package/@openclawdsolana/plugin-sdk
[npm-release-shield]: https://img.shields.io/npm/v/@openclawdsolana/plugin-sdk?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[pr-welcome-link]: https://github.com/clawdsolana/OpenClawd
[pr-welcome-shield]: https://img.shields.io/badge/%F0%9F%A4%AF%20PR%20WELCOME-%E2%86%92-ffcb47?labelColor=black&style=for-the-badge
[profile-link]: https://github.com/clawdsolana/OpenClawd

