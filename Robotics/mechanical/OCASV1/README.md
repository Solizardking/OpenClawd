# OCASV1 Mechanical Profile

This directory documents the OpenClawd mechanical interpretation of the Asimov
v1 body. The physical CAD remains in [`../ASV1`](../ASV1); OCASV1 adds naming,
robotics-policy, and GR00T embodiment assumptions for OpenClawd.

## Source Assembly

- Full assembly: [`../ASV1/ASIMOV_V1.STEP`](../ASV1/ASIMOV_V1.STEP)
- Naming reference: [`../ASV1/NamingConvention.png`](../ASV1/NamingConvention.png)

## OpenClawd Naming

| Mechanical Group | GR00T Modality Key | Electrical Chain |
| --- | --- | --- |
| Base / torso | `base` | media/network controller |
| Left arm | `left_arm` | `can3` |
| Right arm | `right_arm` | `can2` |
| Waist + neck | `waist_neck` | `can4` |
| Left leg | `left_leg` | `can0` |
| Right leg | `right_leg` | `can1` |
| Hands / grippers | `hands` | arm chains or auxiliary hand controller |
| Safety state | `safety` | MCB, BMS, E-stop, IMU |

## GR00T Deployment Assumptions

- Current frame only for visual observations.
- 32-step action horizon for asynchronous inference plus RTC.
- Relative joint actions for limbs and waist/neck.
- Absolute hand/gripper action for bounded open/close state.
- Robot-side safety limits must clip or reject actions before actuator writes.

## Solana Attestation Assumptions

Mechanical actions are represented in command receipts by hashes and summaries,
not by raw private sensor streams. A receipt should include:

- `robot_id=OPENCLAWDASV1`
- command hash
- policy hash
- payment hash
- risk level
- operator approval state
- issued timestamp
