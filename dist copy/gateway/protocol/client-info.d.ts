/** Stub for the demo build — full implementation lives in the OpenClawd Gateway repo. */
export declare const GATEWAY_CLIENT_MODES: {
    readonly WEBCHAT: "webchat";
    readonly TUI: "tui";
    readonly MOBILE: "mobile";
    readonly DESKTOP: "desktop";
    readonly HEADLESS: "headless";
};
export declare const GATEWAY_CLIENT_NAMES: {
    readonly CONTROL_UI: "control-ui";
    readonly TUI: "clawd-code-cli";
    readonly OCEAN: "ocean-demo";
};
export type GatewayClientMode = (typeof GATEWAY_CLIENT_MODES)[keyof typeof GATEWAY_CLIENT_MODES];
export type GatewayClientName = (typeof GATEWAY_CLIENT_NAMES)[keyof typeof GATEWAY_CLIENT_NAMES];
//# sourceMappingURL=client-info.d.ts.map