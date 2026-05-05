# Contributing

This hackathon package is intentionally public, inspectable, and easy to fork.

## Good First Contributions

- Add a new robotics demo scenario under `demos/`.
- Add a new MCP tool proposal to `docs/technical-spec.md`.
- Improve the static site copy or screenshots.
- Add a real simulator bridge, such as ROS2, Webots, Gazebo, or a browser-based robot simulator.
- Add devnet Solana Attestation Service examples once a schema is registered.

## Rules

- Do not commit private keys, wallet files, populated `.env` files, API keys, webhook secrets, or production RPC URLs with embedded credentials.
- Keep demo defaults offline and read-only.
- Use devnet for examples that write to Solana.
- Include clear safety notes for any physical robot integration.

## Local Review

```bash
node hackathon/demos/robot-command-demo.mjs
open hackathon/one-page-site/index.html
open hackathon/presentation/pitch-deck.html
```

