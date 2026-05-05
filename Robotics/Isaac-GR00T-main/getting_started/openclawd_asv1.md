# OpenClawd ASV1: GR00T Hardware and Deployment Notes

This guide maps the GR00T hardware, data, fine-tuning, and deployment guidance
to the OpenClawd ASV1 Solana robot profile.

## Hardware Recommendation

OpenClawd ASV1 has two compute profiles:

| Phase | Minimum | Recommended |
| --- | --- | --- |
| Fine-tuning | 1 GPU with 40 GB+ VRAM | H100, H20, L40, A100, RTX Pro 5000/6000, or DGX |
| Inference/deployment | 1 GPU with 16 GB+ VRAM, CUDA 12.6+ | Jetson AGX Thor for edge, H100/H20/L40/RTX Pro for server inference |

Use TensorRT where supported. For real-time control, target 10 Hz or higher for
typical manipulation and reserve 30 Hz+ for high-frequency closed-loop work.

## Real-World Pipeline

1. Verify robot hardware, cameras, CAN buses, BMS, IMU, and E-stop.
2. Collect teleoperation data with synchronized camera and joint-state streams.
3. Convert data to GR00T LeRobot v2.
4. Add `meta/modality.json` from `examples/OpenClawdASV1/modality.json`.
5. Fine-tune with `examples/OpenClawdASV1/openclawd_asv1_config.py`.
6. Evaluate open-loop before touching hardware.
7. Deploy GR00T as a ZMQ model server.
8. Keep robot-side control lightweight with OpenClawd Go and a CAN/SDK bridge.
9. Route task approval and paid service access through the OpenClawd gateway.

## Data Requirements

- At least 100 valid episodes for a first task.
- 200+ episodes for more stable behavior.
- 30 FPS RGB cameras for `front`, `wrist`, and optional `head`.
- Joint state sampling at or above camera FPS.
- Full timestamps for alignment.
- Script filtering plus manual replay review.

## Modality Profile

The OpenClawd ASV1 GR00T example uses:

- `video`: `front`, `wrist`, `head`.
- `state`: `base`, `left_arm`, `right_arm`, `waist_neck`, `left_leg`,
  `right_leg`, `hands`, `safety`.
- `action`: `left_arm`, `right_arm`, `waist_neck`, `left_leg`, `right_leg`,
  `hands`.
- `language`: `annotation.human.task_description`.

Action horizon is set to 32 to support asynchronous inference plus RTC-style
chunk fusion.

## Deployment Safety

Physical execution must be blocked when:

- E-stop is asserted.
- BMS or IMU reports a fault.
- Any CAN chain is unhealthy.
- Predicted joint targets exceed limits.
- The OpenClawd gateway returns a dry-run or deny policy.
- Payment proof is required but missing.
- Operator approval is missing for live mode.

## Relevant Files

- `Robotics/OCASV1/README.md`
- `Robotics/OCASV1/openclawd-asv1.hardware.json`
- `Robotics/electrical/OPENCLAWDASV1.md`
- `Robotics/electrical/motion_control/openclawd-asv1-mcb.map.yaml`
- `Robotics/electrical/wiring/openclawd-asv1-wiring.map.yaml`
- `Robotics/mechanical/OCASV1/README.md`
- `Robotics/Isaac-GR00T-main/examples/OpenClawdASV1/`
