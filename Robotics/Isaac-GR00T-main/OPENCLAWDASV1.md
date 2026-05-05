# OPENCLAWDASV1 GR00T Integration

This file maps the vendored NVIDIA Isaac GR00T tree to the OpenClawd
`OPENCLAWDASV1` robot profile.

GR00T is treated as a vision-language-action policy proposal engine. OpenClawd
wraps those proposals in a Solana-native command envelope, policy check, payment
intent, and receipt path.

## Source Tree

| Path | OpenClawd role |
| --- | --- |
| [`gr00t/`](gr00t/) | Policy, data, model, evaluation, and server/client modules. |
| [`getting_started/policy.md`](getting_started/policy.md) | Policy API reference for connecting model output to robot control. |
| [`getting_started/real_world_deployment.md`](getting_started/real_world_deployment.md) | Real-world deployment guidance. |
| [`getting_started/finetune_new_embodiment.md`](getting_started/finetune_new_embodiment.md) | New-embodiment adaptation path for OCASV1. |
| [`getting_started/openclawd_asv1.md`](getting_started/openclawd_asv1.md) | OpenClawd-specific GR00T hardware, data, and deployment notes. |
| [`scripts/deployment/`](scripts/deployment/) | TensorRT, ONNX, and deployment scripts. |
| [`examples/`](examples/) | Reference examples for dataset and inference workflows. |
| [`examples/OpenClawdASV1/`](examples/OpenClawdASV1/) | OCASV1 `NEW_EMBODIMENT` modality config and dataset schema. |
| [`demo_data/`](demo_data/) | Demo data placeholder; large or private data should stay out of public commits. |
| [`docker/`](docker/) | Container build path for GPU systems. |
| [`tests/`](tests/) | Upstream validation tests. |

## OpenClawd Runtime Placement

```text
Camera / state / language prompt
  -> GR00T policy server or local inference
  -> action proposal
  -> OCASV1 local controller limits
  -> OpenClawd gateway task envelope
  -> operator policy and payment gate
  -> robot command receipt
```

The GR00T output is never treated as direct motor authority by OpenClawd. It is
input to the robot policy layer and can be blocked, down-scoped, or converted
into a paid task intent.

## Suggested OCASV1 Integration Steps

1. Start with simulation using `Robotics/sim-model/xmls/asimov.xml`.
2. Define the OCASV1 modality mapping from camera, IMU, joint state, and task
   language into the GR00T data format using `examples/OpenClawdASV1`.
3. Run open-loop evaluation before any hardware connection.
4. Connect GR00T through a local robot controller that enforces limits.
5. Register the robot with `openclawd-go gateway connect`.
6. Use `openclawd-go robot task` to turn proposed work into an OpenClawd command
   envelope with x402, MPP, and Pay.sh metadata.
7. Keep physical execution behind operator approval.

## Payment and Capability Mapping

| GR00T / robot capability | OpenClawd payment use |
| --- | --- |
| Vision-language manipulation policy | Paid specialist policy call over x402. |
| Remote GPU inference | MPP proxy or Pay.sh-compatible gateway. |
| Teleoperation review | Paid human/operator session intent. |
| Dataset conversion or labeling | Paid robotic task service. |
| Attested task completion | Solana receipt tied to robot wallet. |

## Public-Safe Rules

- Do not commit model access tokens.
- Do not commit private demonstration data.
- Do not commit robot endpoint credentials.
- Keep generated checkpoints and large training outputs out of the public
  hackathon bundle unless explicitly licensed and intended for release.
