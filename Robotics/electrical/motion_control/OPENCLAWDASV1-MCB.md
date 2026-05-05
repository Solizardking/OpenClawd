# OPENCLAWDASV1 Motion-Control Board Profile

The OCASV1 robot uses the Asimov v1 Motion Control Board profile as its
reference controller. The board is a Radxa CM5 carrier with native CAN,
SPI-CAN, Ethernet, USB, RS485, and I2C connectivity.

## Device-Tree Overlay

Source: [`mcb-io.dts`](mcb-io.dts)

The overlay enables:

- Native Rockchip CAN controllers: `can0`, `can1`, `can2`.
- Three MCP2518FD SPI-CAN controllers: `can3`, `can4`, `can5`.
- I2C interfaces for onboard or external IMU paths.
- Disabled interfaces that conflict with the motion-control carrier layout.

## OCASV1 Capability Map

| Linux interface | OCASV1 role | Gateway capability |
| --- | --- | --- |
| `can0` | Left leg command/telemetry | `motion-control:left-leg` |
| `can1` | Right leg command/telemetry | `motion-control:right-leg` |
| `can2` | Right arm command/telemetry | `motion-control:right-arm` |
| `can3` | Left arm command/telemetry | `motion-control:left-arm` |
| `can4` | Waist and neck command/telemetry | `motion-control:torso-head` |
| `can5` | Battery management telemetry | `power:bms-telemetry` |
| `i2c7`, `i2c8` | IMU and auxiliary sensors | `telemetry:imu` |

## Activation Checklist

1. Install the board overlay on the Radxa CM5 image.
2. Confirm `ip link` shows all expected CAN interfaces.
3. Bring each CAN bus up at the hardware-specific bitrate.
4. Run read-only telemetry first.
5. Register the robot with `openclawd-go gateway connect`.
6. Keep `OPENCLAWD_ROBOT_LIVE=0` until bench testing and operator approval are complete.

## Safety Notes

GR00T and OpenClawd may propose task-level actions, but this file does not grant
raw motor authority. A local robot controller must still enforce joint limits,
current limits, E-stop state, geofence state, and operator policy.

