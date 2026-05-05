# openclawd-go

Hardware-friendly OpenClawd robot gateway client.

This binary is intentionally stdlib-only so it can be cross-compiled for a
Raspberry Pi 5, Radxa CM5, or a small Linux controller without installing the
Node workspace on the robot.

## Build

```bash
cd cmd/openclawd-go
go build -o openclawd-go .
mkdir -p dist
GOOS=linux GOARCH=arm64 go build -o dist/openclawd-go-linux-arm64 .
```

## Hardware Install

```bash
sudo ./openclawd-go install \
  --target /opt/openclawd \
  --gateway http://192.168.1.10:8788 \
  --robot-id OPENCLAWDASV1 \
  --robot-url http://ocasv1.local:8080
```

The installer copies the binary and writes `/opt/openclawd/etc/openclawd-robot.env`.
It does not write private keys.

## Gateway Calls

```bash
openclawd-go gateway connect \
  --gateway http://127.0.0.1:8788 \
  --robot-id OPENCLAWDASV1 \
  --robot-url http://ocasv1.local:8080

openclawd-go robot task \
  --gateway http://127.0.0.1:8788 \
  --robot-id OPENCLAWDASV1 \
  --objective "inspect aisle B hazard" \
  --amount-usd 0.005 \
  --pay-gateway https://pay.sh
```

## GR00T Plan

```bash
openclawd-go gr00t plan \
  --robot-id OPENCLAWDASV1 \
  --model-server tcp://127.0.0.1:5555 \
  --dataset-path Robotics/Isaac-GR00T-main/demo_data/openclawd_asv1
```

The plan command prints the OCASV1 GR00T `NEW_EMBODIMENT` paths, 32-step
action horizon, payment rails, and DePIN physical-AI data receipt schema
expected by the robot gateway.

The gateway defaults to dry-run task envelopes. Live movement remains blocked
unless the gateway is started with `OPENCLAWD_ROBOT_LIVE=1` and the task request
sets `--execute`.
