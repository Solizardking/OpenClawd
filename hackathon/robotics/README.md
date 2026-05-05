# Real Hardware Integration

This submission now includes a real hardware track built around the public
Asimov v1 humanoid robot assets checked into [`../../Robotics`](../../Robotics).

## Included Hardware Artifacts

| Artifact | Path |
| --- | --- |
| Hardware README | [`../../Robotics/README.md`](../../Robotics/README.md) |
| Hardware license | [`../../Robotics/HARDWARE-LICENSE.txt`](../../Robotics/HARDWARE-LICENSE.txt) |
| Software license | [`../../Robotics/SOFTWARE-LICENSE.txt`](../../Robotics/SOFTWARE-LICENSE.txt) |
| Robot image | [`../../Robotics/assets/asimov-v1.jpg`](../../Robotics/assets/asimov-v1.jpg) |
| Wiring manifest | [`../../Robotics/electrical/wiring/wiring.yaml`](../../Robotics/electrical/wiring/wiring.yaml) |
| Wiring diagram | [`../../Robotics/electrical/wiring/wiring.svg`](../../Robotics/electrical/wiring/wiring.svg) |
| Motion-control device tree | [`../../Robotics/electrical/motion_control/mcb-io.dts`](../../Robotics/electrical/motion_control/mcb-io.dts) |
| Mechanical CAD | [`../../Robotics/mechanical/ASV1/ASIMOV_V1.STEP`](../../Robotics/mechanical/ASV1/ASIMOV_V1.STEP) |
| MuJoCo model | [`../../Robotics/sim-model/xmls/asimov.xml`](../../Robotics/sim-model/xmls/asimov.xml) |

The hardware tree is public-facing. Keep it free of populated env files,
private robot tokens, operator logs, wallet keypairs, and production sensor
captures.

## OpenClawd Go Binary

The hardware path uses [`../../cmd/openclawd-go`](../../cmd/openclawd-go), a
small Go binary that can be copied directly onto a Raspberry Pi 5, Radxa CM5, or
other Linux controller.

```bash
cd cmd/openclawd-go
go build -o openclawd-go .
mkdir -p dist
GOOS=linux GOARCH=arm64 go build -o dist/openclawd-go-linux-arm64 .
```

Install on hardware:

```bash
sudo ./openclawd-go install \
  --target /opt/openclawd \
  --gateway http://192.168.1.10:8788 \
  --robot-id asimov-v1 \
  --robot-url http://asimov.local:8080
```

Connect the robot to the gateway:

```bash
openclawd-go gateway connect \
  --gateway http://127.0.0.1:8788 \
  --robot-id asimov-v1 \
  --robot-url http://asimov.local:8080
```

Create a paid robotic task intent:

```bash
openclawd-go robot task \
  --gateway http://127.0.0.1:8788 \
  --robot-id asimov-v1 \
  --objective "inspect aisle B hazard" \
  --amount-usd 0.005 \
  --pay-gateway https://pay.sh
```

## Gateway Routes

The OpenClawd gateway exposes:

| Route | Purpose |
| --- | --- |
| `GET /api/robotics/hardware` | Returns the Asimov v1 hardware manifest and file map. |
| `POST /api/robot/connect` | Registers a robot target, wallet pubkey, model, and capability set. |
| `POST /api/robot/task` | Creates a deny-first robot command envelope with x402, MPP, and Pay.sh payment intent metadata. |

The gateway defaults to dry-run mode. Physical movement, wallet signing, and
funds transfer stay blocked unless the operator starts the gateway with
`OPENCLAWD_ROBOT_LIVE=1` and sends an execution request that downstream robot
software still approves.

## Payment Rails

Robot task envelopes declare:

- `x402` for pay-per-request paid robotic services.
- `mpp` for proxy/facilitator routing.
- `pay-sh` for Pay.sh-compatible payment proof as the task credential.

The relevant gateway env vars are:

```bash
PAY_SH_GATEWAY_URL=https://pay.sh
MPP_PROXY_URL=https://pay.sh/mpp
OPENCLAWD_ROBOT_LIVE=0
```

No private key is required for the public demo path.
