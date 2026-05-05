# OCASV1 GR00T Deployment Plan

This plan maps NVIDIA Isaac GR00T N1.7 to the OpenClawd ASV1 Solana robot.

## Hardware Targets

| Profile | Use | Recommendation |
| --- | --- | --- |
| Fine-tuning | Custom OCASV1 datasets | 1 GPU with 40 GB+ VRAM minimum; H100, H20, L40, A100, or RTX Pro workstation recommended |
| Inference server | Remote GR00T ZMQ server | H100/H20/L40/RTX Pro with TensorRT where available |
| Edge deployment | Robot-mounted inference | Jetson AGX Thor preferred; Orin only for slow non-reactive tasks |
| Robot-side control | Lightweight client | `cmd/openclawd-go` plus robot-specific CAN/SDK bridge |

## Real-World Workflow

1. Prepare hardware: verify cameras, joint feedback, CAN buses, E-stop, and
   robot controller health.
2. Collect at least 100 valid episodes for each first task, or 200+ episodes
   for more stable fine-tuning.
3. Convert data to GR00T LeRobot v2 format with `meta/modality.json`.
4. Use `examples/OpenClawdASV1/openclawd_asv1_config.py` as the modality config.
5. Fine-tune with `EmbodimentTag.NEW_EMBODIMENT`.
6. Run open-loop evaluation.
7. Deploy as a ZMQ server-client pair.
8. Use asynchronous inference plus RTC-style 32-step action chunks for smoother
   closed-loop control.
9. Gate physical execution through the OpenClawd gateway policy envelope.

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
  --save-total-limit 5 \
  --save-steps 2000 \
  --max-steps 2000 \
  --global-batch-size 32 \
  --dataloader-num-workers 4
```

## Open-Loop Evaluation

```bash
cd Robotics/Isaac-GR00T-main
uv run python gr00t/eval/open_loop_eval.py \
  --dataset-path ./demo_data/openclawd_asv1 \
  --embodiment-tag NEW_EMBODIMENT \
  --model-path /tmp/openclawd-asv1/checkpoint-2000 \
  --traj-ids 0 \
  --action-horizon 32 \
  --steps 400 \
  --modality-keys left_arm right_arm hands waist_neck
```

## Deployment

Use GR00T's ZMQ server-client flow for real hardware:

- Model server: GPU machine runs GR00T inference.
- Local client: robot controller captures observations, calls the model server,
  smooths action chunks, checks safety limits, and submits task status to the
  OpenClawd gateway.
- OpenClawd gateway: creates Solana/x402/MPP/Pay.sh task envelopes and blocks
  live execution by default.

## Safety Notes

- Use a physical E-stop and a software E-stop.
- Keep joint and workspace limits in the robot-side bridge, not only in GR00T.
- Save predicted action chunks for jitter diagnostics.
- Use relative action prediction for arms and legs; use absolute actions for
  binary or bounded gripper/hand state.
- Regenerate GR00T dataset statistics whenever the action horizon changes.
