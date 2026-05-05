# OpenClawd Robotics: Humanoid Hardware × Solana Settlement

[![Hardware: CERN-OHL-S-2.0](https://img.shields.io/badge/Hardware-CERN--OHL--S--2.0-blue)](HARDWARE-LICENSE.txt)
[![Firmware: GPL-2.0](https://img.shields.io/badge/Firmware-GPL--2.0-blue)](SOFTWARE-LICENSE.txt)
[![Integration: MIT](https://img.shields.io/badge/Integration-MIT-blue)](../LICENSE)
[![Solana: $CLAWD](https://img.shields.io/badge/Solana-%24CLAWD-9945FF?logo=solana)](https://solanaclawd.com)

OpenClawd Robotics is the physical embodiment layer of the OpenClawd stack: an
open humanoid you can build, train, and deploy, with on-chain payment rails and
attestation baked in. It is **not** a fork of any single project — it is a
deliberate fusion of three open lineages, with a Solana settlement layer
threaded through them:

1. **Hardware base** — Asimov v1 (CERN-OHL-S-2.0) as the reference biped: 1.2 m,
   35 kg, 25 actuated DoF, mechanical CAD in [`mechanical/`](mechanical/),
   electrical CAD and harness in [`electrical/`](electrical/), MuJoCo sim model
   in [`sim-model/`](sim-model/).
2. **Cognition** — NVIDIA Isaac GR00T N1.7 (Apache-2.0, vendored under
   [`Isaac-GR00T-main/`](Isaac-GR00T-main/)), a dual-system Vision-Language-Action
   foundation model. See [arXiv:2503.14734](docs/arXiv-2503.14734v2/main.tex).
3. **Mobile dexterous manipulation** — HERMES, a human-to-robot RL framework for
   mobile bimanual dexterous manipulation, with depth-based sim2real and PnP
   navigation. See [arXiv:2508.20085](docs/arXiv-2508.20085v3/New_IEEEtran_how-to.tex).
4. **Settlement & identity** — `$CLAWD` on Solana for action attestation,
   Pay.sh / x402 / MPP for agent-to-robot and robot-to-API payments. The
   integration glue lives in the parent repo at [`/payments/`](../payments/).

> The robot is the body. GR00T is the mind. HERMES is the hands.
> $CLAWD is the wallet, the receipt, and the credential.

---

## Specifications (reference platform)

These are the Asimov v1 inherited specs — the CAD, harness, and sim assets in
this repo are dimensioned for this body. You can deviate, but the URDF/MuJoCo
and BOM assume this geometry.

| Spec | Value |
|---|---|
| Height | 1.2 m |
| Weight | 35 kg |
| Degrees of Freedom | 25 actuated + 2 passive |
| Legs | 6 DoF × 2 + toe × 2 |
| Arms | 5 DoF × 2 (shoulder pitch/roll/yaw, elbow, wrist yaw) |
| Torso | 1 DoF waist yaw, 10 W 4 Ω speaker, 6 DoF IMU |
| Head | 2 DoF neck (yaw, pitch), quad-mic array, 2 MP monocular camera |
| CAN Bus | 5 × 1 Mbps + 1 × 500 kbps |
| Onboard Compute | Raspberry Pi 5 (media + network) + Radxa CM5 (motion control) |
| Cognition Compute | external (GR00T N1.7 inference; see [`Isaac-GR00T-main/`](Isaac-GR00T-main/)) |
| Structural Materials | 7075 aluminium, MJF PA12 nylon |

| Activity | Load |
|---|---|
| Squat | 5 kg |
| Bicep curl | 15 kg each arm |
| Lateral raise | 18 kg each arm |

---

## The Solana layer: payment is the credential

OpenClawd inherits the Pay.sh-compatible payment surface from the parent repo,
so a robot — or an agent driving a robot — can:

- **Discover priced APIs** (vision endpoints, map services, charging stations,
  manipulation hints) over x402 / MPP and pay in stablecoins or `$CLAWD`.
- **Sell its own services** by publishing a Pay.sh manifest: a delivery,
  a teleop session, a depth scan, a manipulation demo.
- **Attest actions on-chain** — every safety-relevant action (e-stop trigger,
  geofence breach, payload acceptance, charging session) can be signed and
  posted as a memo against the agent's `$CLAWD` wallet, producing a
  cryptographic receipt that survives the robot.
- **Hold a wallet as identity** — the robot's Solana keypair is its identity;
  policy attachments (insurance, operator, geofence) reference that pubkey.

See [`/payments/pay-main/`](../payments/pay-main/) for the Pay.sh integration
and [`/payments/pay-main/typescript/packages/solana-pay/`](../payments/pay-main/typescript/packages/solana-pay/)
for the Solana Pay packages.

---

## Build options

> **DIY build:** This repo ships with mechanical CAD, electrical schematics,
> harness drawings, BOM scaffolding, and a MuJoCo simulation model. You bring
> the fab, the actuators, and the compute. License terms apply per directory —
> see [LICENSE.md](LICENSE.md).

> **Sim-only:** You can use everything under [`sim-model/`](sim-model/) plus
> [`Isaac-GR00T-main/`](Isaac-GR00T-main/) without ever touching hardware.
> This is the recommended starting point for software contributors and policy
> training researchers.

### What's in this directory

| Path | Contents | License |
|---|---|---|
| [`mechanical/`](mechanical/) | CAD, subassemblies, naming conventions | CERN-OHL-S-2.0 |
| [`electrical/`](electrical/) | Schematics, PCB files, wiring harness | CERN-OHL-S-2.0 |
| [`sim-model/`](sim-model/) | MuJoCo XMLs, sim assets | CERN-OHL-S-2.0 (model files) + GPL-2.0 (any sim glue) |
| [`Isaac-GR00T-main/`](Isaac-GR00T-main/) | NVIDIA Isaac GR00T N1.7 (vendored) | Apache-2.0 (upstream) — see directory's own LICENSE |
| [`docs/arXiv-2503.14734v2/`](docs/arXiv-2503.14734v2/) | GR00T N1 paper source | Upstream license — research reference only |
| [`docs/arXiv-2508.20085v3/`](docs/arXiv-2508.20085v3/) | HERMES paper source | Upstream license — research reference only |
| `assets/` | Renders, photos, brand | CERN-OHL-S-2.0 (renders), MIT (brand glue) |

---

## Roadmap

| Status | Item |
|---|---|
| Done | Mechanical CAD — 7 subassemblies (inherited) |
| Done | MuJoCo simulation model |
| Done | Electrical wiring harness + schematics |
| Done | GR00T N1.7 vendored for cognition |
| In progress | HERMES policy port to OpenClawd embodiment |
| In progress | Solana action-attestation memo schema |
| In progress | Pay.sh manifest for robot-as-service |
| Planned | Locomotion policy fine-tuned on Asimov body |
| Planned | x402 priced-vision endpoint reference impl |
| Planned | Mobile app + teleop with Solana wallet auth |

---

## Citing the foundations

If you publish work built on this stack, cite the upstream papers — they did
the science, we did the integration. BibTeX entries are in
[`docs/arXiv-2503.14734v2/main.bib`](docs/arXiv-2503.14734v2/main.bib) and
[`docs/arXiv-2508.20085v3/references.bib`](docs/arXiv-2508.20085v3/references.bib).

- **GR00T N1** — *An Open Foundation Model for Generalist Humanoid Robots*,
  NVIDIA, 2025. [arXiv:2503.14734](https://arxiv.org/abs/2503.14734).
  Dual-system VLA (System 2 vision-language + System 1 diffusion-transformer
  motor) trained on real-robot trajectories, human video, and synthetic data.
- **HERMES** — *Human-to-Robot Embodied Learning from Multi-Source Motion Data
  for Mobile Dexterous Manipulation*, Tsinghua / Shanghai Qi Zhi / Peking,
  2025. [arXiv:2508.20085](https://arxiv.org/abs/2508.20085).
  Unified RL for translating heterogeneous human hand motion to dexterous robot
  policy + depth-based sim2real + PnP-augmented navigation.

---

## Working with us

- **Build questions / sim issues:** open a GitHub issue on the OpenClawd repo.
- **Solana / Pay.sh integration:** see [`/payments/`](../payments/) and ping
  [@clawddevs](https://x.com/clawddevs).
- **Hardware supply chain partners:** if you fab actuators, structural parts,
  or boards and want to be listed in the OpenClawd Robotics BOM, reach out via
  the OpenClawd channels in the parent README.

---

## Licensing in one paragraph

Hardware design files (mechanical CAD, electrical schematics, PCB files,
harness drawings) are licensed under **CERN-OHL-S-2.0** — strongly reciprocal:
if you ship a derived design, ship the source under CERN-OHL-S too. Onboard
firmware and motion-control software in this directory are licensed under
**GPL-2.0**. The OpenClawd integration glue (Solana wallet binding, Pay.sh
manifests, attestation memos) is **MIT** to match the parent repo. Vendored
upstreams (Isaac-GR00T, the arXiv paper sources) keep their own licenses; do
not assume they inherit ours. See [LICENSE.md](LICENSE.md) for the per-file
breakdown.
