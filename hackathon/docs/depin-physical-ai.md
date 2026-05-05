# DePIN Physical-AI Data Network

## Thesis

Robot AI is constrained by physical-world data. Text and image models had an
internet-scale corpus; robots need synchronized video, proprioception, force,
audio, geospatial context, operator intent, and task outcomes from real
hardware. OpenClawd adapts the Solana DePIN thesis into a practical loop for
robotics:

```text
robot or operator collects task data
  -> gateway validates schema and safety metadata
  -> contributors receive a payment intent or reward receipt
  -> accepted episodes become GR00T LeRobot datasets
  -> fine-tuned policies improve OCASV1 task execution
  -> better robots generate more useful data and paid tasks
```

The goal is not to claim that every byte should be on-chain. The chain records
identity, payment, consent, hashes, and validation outcomes. Large sensor files
stay off-chain in public datasets, private storage, IPFS/Arweave, or buyer
delivery buckets.

## OpenClawd Adaptation

| Source article idea | OpenClawd implementation |
| --- | --- |
| DePIN can mobilize distributed data collection | `OPENCLAWDASV1` registers as a Solana robot with a wallet and gateway route |
| Physical AI needs real-world data | OCASV1 emits GR00T-compatible video, state, action, safety, and task metadata |
| Validators should reward quality, uniqueness, and freshness | Receipts include quality fields, privacy level, episode hash, and validator decision |
| Revenue feedback loop should be short | Each task can carry x402 / MPP / Pay.sh payment intent and plugin/service quote |
| Generalizable data is more valuable | The Asimov v1 / OCASV1 embodiment fixes a repeatable open hardware target |
| Simulation is useful but insufficient | MuJoCo and GR00T sim data are treated as lower-cost supplements, not replacements |

## Contribution Classes

| Class | Example | Reward basis |
| --- | --- | --- |
| Teleoperation episode | Human guides OCASV1 through a manipulation task | Completion, smoothness, low safety violations, reusable camera/state alignment |
| Autonomous task trace | Robot executes a paid inspection in dry-run or approved live mode | Verified task outcome and command receipt |
| Environment update | Robot reports obstacle, aisle change, or workcell layout delta | Freshness, location confidence, duplicate suppression |
| Failure case | Robot records stop, collision-risk, jitter, or unreachable action | Diagnostic usefulness and replayability |
| Simulation augmentation | MuJoCo or generated GR00T-compatible episode | Diversity and sim-to-real validation score |

## Data Receipt

```json
{
  "schema": "openclawd.robot_data_contribution.v1",
  "robot_id": "OPENCLAWDASV1",
  "contributor": "solana_pubkey_or_operator_id",
  "episode_hash": "sha256:...",
  "dataset_format": "gr00t_lerobot_v2",
  "embodiment_tag": "NEW_EMBODIMENT",
  "task": "inspect aisle B hazard",
  "modalities": ["front_rgb", "wrist_rgb", "joint_state", "gripper", "safety"],
  "privacy": "hashed_private_payloads",
  "quality": {
    "timestamp_sync": "pass",
    "trajectory_smoothness": "pass",
    "operator_review": "pending",
    "duplicate_score": 0.08,
    "freshness_score": 0.91
  },
  "reward": {
    "rails": ["x402", "mpp", "pay-sh"],
    "asset": "USDC",
    "amount_usd": "0.005",
    "settlement": "dry_run"
  }
}
```

## Validator Checks

- Verify the dataset has `meta/modality.json`, episode metadata, video chunks,
  parquet action/state rows, and task annotations.
- Confirm timestamps align across cameras and robot state.
- Reject episodes with missing e-stop state, missing robot id, or impossible
  joint/action ranges.
- Score uniqueness against recent episode hashes and task labels.
- Hash private sensor payloads instead of publishing raw sensitive frames.
- Require operator approval before rewards above policy limits or before any
  live physical execution.

## GR00T Path

OpenClawd uses the vendored GR00T tree as the model interface:

- Modality config:
  `Robotics/Isaac-GR00T-main/examples/OpenClawdASV1/openclawd_asv1_config.py`
- Dataset schema:
  `Robotics/Isaac-GR00T-main/examples/OpenClawdASV1/modality.json`
- Embodiment:
  `EmbodimentTag.NEW_EMBODIMENT`
- Action horizon:
  `32`, so asynchronous inference and RTC-style chunking have enough overlap.

The first dataset path is reserved as:

```text
Robotics/Isaac-GR00T-main/demo_data/openclawd_asv1
```

## Cold-Water Constraints

OpenClawd does not assume a large immediate buyer market for robotics data.
The near-term buyer is the robot itself: better local policies, safer command
gates, and payable task execution. External dataset revenue is treated as
upside. The project also assumes simulation remains a major data source and
therefore focuses the chain layer on identity, receipts, incentives, and
quality scoring rather than pretending every real-world episode is equally
valuable.
