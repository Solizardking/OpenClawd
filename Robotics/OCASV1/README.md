# OCASV1: OpenClawd ASV1 Solana Robot

OCASV1 is the OpenClawd integration profile for the Asimov v1 body, NVIDIA
Isaac GR00T N1.7 cognition stack, and Solana-native identity/payment rails.

The profile name expands to **OpenClawd Asimov Solana V1**. It does not replace
the upstream hardware or GR00T sources; it binds them into a single deployable
robot target for OpenClawd.

## Source Assets

| Layer | Source |
| --- | --- |
| Mechanical body | [`../mechanical/ASV1/ASIMOV_V1.STEP`](../mechanical/ASV1/ASIMOV_V1.STEP) |
| Mechanical OpenClawd profile | [`../mechanical/OCASV1/README.md`](../mechanical/OCASV1/README.md) |
| Electrical overview | [`../electrical/OPENCLAWDASV1.md`](../electrical/OPENCLAWDASV1.md) |
| Motion-control map | [`../electrical/motion_control/openclawd-asv1-mcb.map.yaml`](../electrical/motion_control/openclawd-asv1-mcb.map.yaml) |
| Wiring map | [`../electrical/wiring/openclawd-asv1-wiring.map.yaml`](../electrical/wiring/openclawd-asv1-wiring.map.yaml) |
| Simulation model | [`../sim-model/xmls/asimov.xml`](../sim-model/xmls/asimov.xml) |
| GR00T example | [`../Isaac-GR00T-main/examples/OpenClawdASV1`](../Isaac-GR00T-main/examples/OpenClawdASV1) |
| Hardware manifest | [`openclawd-asv1.hardware.json`](openclawd-asv1.hardware.json) |
| GR00T deployment plan | [`gr00t-deployment.md`](gr00t-deployment.md) |
| Solana identity template | [`solana-identity.json`](solana-identity.json) |

## Control Boundary

OCASV1 uses a deny-first boundary:

1. Robot-side Go software registers the target with the OpenClawd gateway.
2. GR00T inference produces action chunks, not direct unreviewed authority.
3. The gateway wraps commands in a policy envelope.
4. x402, MPP, and Pay.sh payment proofs are task credentials, not private keys.
5. Solana wallet identity and future SAS receipts bind actions to the robot.
6. Physical motion remains disabled until an operator enables live mode and the
   robot-side controller accepts the action.

## Hardware Profile

- Body: Asimov v1 humanoid.
- OpenClawd robot id: `openclawd-asv1`.
- Solana identity alias: `OPENCLAWDASV1`.
- Motion controller: Radxa CM5 carrier MCB.
- Media/network controller: Raspberry Pi 5 or equivalent.
- Cognition: GR00T N1.7 remote model server or edge GPU server.
- Edge target: Jetson AGX Thor preferred, Orin only for slow non-reactive work.

## GR00T Profile

The GR00T example uses `EmbodimentTag.NEW_EMBODIMENT` and models the robot as:

- Video: `front`, `wrist`, and optional `head`.
- State: `base`, `left_arm`, `right_arm`, `waist_neck`, `left_leg`,
  `right_leg`, `hands`, and `safety`.
- Action: 32-step prediction horizon for RTC-style chunking.
- Language: `annotation.human.task_description`.

The action horizon is intentionally 32, matching the real-world deployment
recommendation for asynchronous inference plus Real-Time Chunking.

## Solana/Payment Rails

OCASV1 task envelopes declare:

- `x402`: paid robotic service access.
- `mpp`: proxy/facilitator routing.
- `pay-sh`: Pay.sh-compatible payment proof as the robot task credential.
- `$CLAWD`: token identity and future service settlement layer.

No private keys belong in this directory.
