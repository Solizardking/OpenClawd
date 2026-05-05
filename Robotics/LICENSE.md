# OpenClawd Robotics — License Overview

This directory mixes three license families. The unmodified canonical license
texts live in [`HARDWARE-LICENSE.txt`](HARDWARE-LICENSE.txt) (CERN-OHL-S-2.0)
and [`SOFTWARE-LICENSE.txt`](SOFTWARE-LICENSE.txt) (GPL-2.0). The OpenClawd
integration code inherits the **MIT** license from the parent repository
([`/LICENSE`](../LICENSE)).

This document is a **map**, not a substitute for the actual license texts. If
the map and the texts disagree, the texts win.

## Per-component map

| Component | Path | License | Notes |
|---|---|---|---|
| Mechanical CAD | [`mechanical/`](mechanical/) | CERN-OHL-S-2.0 | Reciprocal: derived designs must ship CERN-OHL-S source. |
| Electrical CAD, schematics, PCB | [`electrical/`](electrical/) | CERN-OHL-S-2.0 | Same reciprocity. Includes harness drawings. |
| Sim model (XML / assets) | [`sim-model/`](sim-model/) | CERN-OHL-S-2.0 | The MuJoCo XML is treated as a hardware design representation. |
| Onboard firmware (when added) | (TBD — `firmware/` planned) | GPL-2.0 | Reciprocal: derived firmware must ship source under GPL-2.0. |
| Motion-control glue | (TBD) | GPL-2.0 | Same. |
| OpenClawd Solana integration | (in [`/payments/`](../payments/), [`/sdk/`](../sdk/), etc.) | MIT | Permissive, matches parent repo. |
| Pay.sh manifests / attestation memos | (in parent repo) | MIT | Permissive. |
| NVIDIA Isaac GR00T N1.7 (vendored) | [`Isaac-GR00T-main/`](Isaac-GR00T-main/) | See its own `LICENSE` | Apache-2.0 upstream at the time of vendoring. Do not assume inheritance. |
| GR00T N1 paper source | [`docs/arXiv-2503.14734v2/`](docs/arXiv-2503.14734v2/) | Upstream (research) | Reference only; do not redistribute outside fair-use research context without checking the paper's own license. |
| HERMES paper source | [`docs/arXiv-2508.20085v3/`](docs/arXiv-2508.20085v3/) | Upstream (research) | Same. |
| Brand assets / renders | [`assets/`](assets/) | CERN-OHL-S-2.0 (renders of the CAD) + MIT (OpenClawd brand overlays) | The lobster brand is OpenClawd's; the underlying robot render derives from CERN-OHL-S CAD. |

## Why three licenses

- **CERN-OHL-S-2.0 (hardware, strongly reciprocal):** chosen for the physical
  design files. If you fork the chassis and ship a product, the community
  gets your design files back. This protects the build-it-yourself promise.
- **GPL-2.0 (firmware, software-reciprocal):** chosen for onboard control code
  that runs on the robot. If you ship a derived robot, you ship derived
  firmware source. Same intent as the hardware license, applied to bits.
- **MIT (integration):** chosen for the OpenClawd-specific glue —
  Solana wallet binding, Pay.sh manifests, attestation memos, agent SDK
  bridges. This layer is meant to be embedded in commercial agent stacks
  without forcing reciprocity, because the *value* of the protocol comes from
  adoption, not from license capture.

## What the licenses do **not** cover

- **Trained model weights.** GR00T N1.7 weights are governed by NVIDIA's model
  release terms (typically a separate license on Hugging Face). Any policies
  you fine-tune on top inherit those terms unless you train from scratch.
- **Solana on-chain artifacts.** Tokens, accounts, and program IDs referenced
  by the integration layer are governed by Solana network rules and the
  OpenClawd token's own terms — they are not covered by this directory's
  licenses.
- **Trademarks.** "OpenClawd," "$CLAWD," and the lobster brand are not
  licensed under MIT, CERN-OHL-S, or GPL. Trademark use follows standard fair
  use; do not imply endorsement.
- **Patents.** CERN-OHL-S §7 and GPL-2 §7 each grant their own patent
  licenses for their respective scopes. The MIT license does not grant a
  patent license. If you ship hardware, the CERN-OHL-S patent grant attaches;
  if you ship firmware, the GPL grant attaches; if you only ship the
  integration glue, you get no patent grant from us.

## Adding new files

When you add a file to this directory, label it:

- Hardware design / CAD / PCB / sim model → CERN-OHL-S-2.0 (file header
  comment or directory-level NOTICE).
- On-robot software / firmware / motion control → GPL-2.0.
- OpenClawd-side integration / Solana / Pay.sh / SDK glue → MIT.
- Vendored upstream → preserve upstream license verbatim, do **not** relabel.

A short SPDX header is the cleanest way to mark intent:

```
// SPDX-License-Identifier: GPL-2.0-only
// SPDX-License-Identifier: CERN-OHL-S-2.0
// SPDX-License-Identifier: MIT
```

## If you're unsure

Default to the most reciprocal license that plausibly applies (CERN-OHL-S for
anything that resembles hardware, GPL-2.0 for anything that runs on the
robot), and ask in the OpenClawd channel. It is much easier to relax a
license later than to tighten one after distribution.
