/** Stub for the demo build — full implementation lives in the OpenClawd Gateway repo. */
export interface DeviceAuthPayload {
  deviceId: string;
  ts: number;
  nonce: string;
}

export function buildDeviceAuthPayload(deviceId: string): DeviceAuthPayload {
  return {
    deviceId,
    ts: Date.now(),
    nonce: Math.random().toString(36).slice(2, 14),
  };
}
