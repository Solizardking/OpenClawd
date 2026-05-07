export function buildDeviceAuthPayload(deviceId) {
    return {
        deviceId,
        ts: Date.now(),
        nonce: Math.random().toString(36).slice(2, 14),
    };
}
//# sourceMappingURL=device-auth.js.map