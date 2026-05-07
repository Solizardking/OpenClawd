/** Stub for the demo build — full implementation lives in the OpenClawd Gateway repo. */
export interface DeviceAuthPayload {
    deviceId: string;
    ts: number;
    nonce: string;
}
export declare function buildDeviceAuthPayload(deviceId: string): DeviceAuthPayload;
//# sourceMappingURL=device-auth.d.ts.map