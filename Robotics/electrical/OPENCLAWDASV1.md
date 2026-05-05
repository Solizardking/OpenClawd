# OPENCLAWDASV1 Electrical Profile

This profile binds the Asimov v1 electrical design to the OpenClawd Solana robot
runtime. The source wiring harness remains [`wiring/wiring.yaml`](wiring/wiring.yaml);
the OpenClawd-specific bus and controller map lives in:

- [`motion_control/openclawd-asv1-mcb.map.yaml`](motion_control/openclawd-asv1-mcb.map.yaml)
- [`wiring/openclawd-asv1-wiring.map.yaml`](wiring/openclawd-asv1-wiring.map.yaml)

## Controller Roles

| Controller | Role | Notes |
| --- | --- | --- |
| Radxa CM5 on MCB | Low-level motion control | Owns CAN buses, IMU, actuator health, and E-stop state |
| Raspberry Pi 5 | Media/network bridge | Owns cameras, microphone array, speaker, gateway connection, and optional teleop |
| GR00T model server | VLA inference | Usually remote GPU or Jetson AGX Thor |
| OpenClawd gateway | Policy/payment/receipt layer | Creates dry-run task envelopes by default |

## Bus Map

| Bus | Source Port | OCASV1 Purpose |
| --- | --- | --- |
| `can0` / `C0` | Native CAN | Left leg actuator chain |
| `can1` / `C1` | Native CAN | Right leg actuator chain |
| `can2` / `C2` | Native CAN | Right arm actuator chain |
| `can3` / `C3` | SPI-CAN | Left arm actuator chain |
| `can4` / `C4` | SPI-CAN | Waist, neck yaw, neck pitch |
| `can5` / `C5` | SPI-CAN | BMS and power telemetry |

## Safety Signals

OCASV1 treats these as hard gates before any GR00T action is executed:

- E-stop asserted.
- BMS fault or undervoltage.
- CAN bus offline or actuator timeout.
- IMU fault or excessive tilt.
- Gateway policy decision other than `allow_after_operator_approval`.
- Missing operator approval when `OPENCLAWD_ROBOT_LIVE=1`.

## Payment/Identity Signals

Payment credentials never ride on actuator CAN. They stay on the network side:

- `x402`: paid task/service request.
- `mpp`: proxy/facilitator route.
- `pay-sh`: payment proof credential.
- Solana wallet pubkey: robot identity.
- Private key: never committed and never placed in this hardware tree.
