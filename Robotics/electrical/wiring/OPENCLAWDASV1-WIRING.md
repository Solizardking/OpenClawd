# OPENCLAWDASV1 Wiring Profile

The OCASV1 wiring profile uses the inherited Asimov v1 WireViz source as the
reference harness.

## Source Files

| File | Role |
| --- | --- |
| [`wiring.yaml`](wiring.yaml) | Canonical harness source. |
| [`wiring.svg`](wiring.svg) | Rendered harness diagram. |

## Naming

OCASV1 keeps the inherited cable naming convention:

```text
W-<ID>-<TYPE>
TYPE = PWR or SIG
```

OpenClawd capability labels are attached at the bus and task layer, not by
renaming harness files. This keeps fabrication references stable.

## OpenClawd Harness Groups

| Harness group | Source category | Gateway capability |
| --- | --- | --- |
| Left leg | Hip / knee / ankle power and CAN | `motion-control:left-leg` |
| Right leg | Hip / knee / ankle power and CAN | `motion-control:right-leg` |
| Left arm | Shoulder / elbow / wrist power and CAN | `motion-control:left-arm` |
| Right arm | Shoulder / elbow / wrist power and CAN | `motion-control:right-arm` |
| Neck-waist | Waist, neck yaw, neck pitch | `motion-control:torso-head` |
| BMS | Battery management wiring | `power:bms-telemetry` |

## Public-Safe Rules

Do not add site-specific cable labels, wireless credentials, operator phone
numbers, access codes, or deployment location names to the public harness files.

