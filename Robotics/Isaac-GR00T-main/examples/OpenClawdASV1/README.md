# OpenClawd ASV1 GR00T Example

This example adapts GR00T N1.7 to the OpenClawd ASV1 Solana robot profile.

It follows GR00T's custom embodiment path:

- Embodiment tag: `NEW_EMBODIMENT`
- Modality config: [`openclawd_asv1_config.py`](openclawd_asv1_config.py)
- Dataset modality schema: [`modality.json`](modality.json)
- Action horizon: 32 steps, intended for asynchronous inference plus RTC.

## Expected Dataset Shape

Use GR00T LeRobot v2 with `meta/modality.json` matching this example.

State vector dimensions:

| Key | Slice | Meaning |
| --- | --- | --- |
| `base` | `0:6` | base pose/velocity summary |
| `left_arm` | `6:11` | five left arm joints |
| `right_arm` | `11:16` | five right arm joints |
| `waist_neck` | `16:19` | waist yaw, neck yaw, neck pitch |
| `left_leg` | `19:25` | six left leg joints |
| `right_leg` | `25:31` | six right leg joints |
| `hands` | `31:33` | left/right hand or gripper state |
| `safety` | `33:37` | E-stop, BMS, IMU, bus health summary |

Action vector dimensions:

| Key | Slice | Meaning |
| --- | --- | --- |
| `left_arm` | `0:5` | relative left arm joint targets |
| `right_arm` | `5:10` | relative right arm joint targets |
| `waist_neck` | `10:13` | relative waist/neck targets |
| `left_leg` | `13:19` | relative left leg joint targets |
| `right_leg` | `19:25` | relative right leg joint targets |
| `hands` | `25:27` | absolute hand/gripper targets |

## Fine-Tuning

```bash
cd Robotics/Isaac-GR00T-main
export NUM_GPUS=1
CUDA_VISIBLE_DEVICES=0 uv run python \
  gr00t/experiment/launch_finetune.py \
  --base-model-path nvidia/GR00T-N1.7-3B \
  --dataset-path ./demo_data/openclawd_asv1 \
  --embodiment-tag NEW_EMBODIMENT \
  --modality-config-path examples/OpenClawdASV1/openclawd_asv1_config.py \
  --num-gpus "$NUM_GPUS" \
  --output-dir /tmp/openclawd-asv1 \
  --global-batch-size 32 \
  --max-steps 2000
```

## Deployment Boundary

GR00T should produce action chunks. The OpenClawd gateway and robot-side bridge
must still enforce:

- E-stop.
- Joint limits.
- Workspace limits.
- Bus health.
- Solana/payment policy state.
- Operator approval before live motion.
