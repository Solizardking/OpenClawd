/**
 * @openclawdsolana/honcho-bridge
 *
 * Honcho is the conversational/peer reasoning layer for OpenClawd.
 * Membrain is the typed-record / trading-knowledge layer.
 *
 * This bridge:
 *   1. Wraps Honcho with OpenClawd-shaped peer/session keys
 *      (session_key = thread + platform; owner peer observed; agent peer not).
 *   2. Polls each owner peer's representation and forwards new conclusions
 *      into Membrain as semantic IngestObservation calls — so reasoning
 *      Honcho does in the background lands in Membrain's retrieval surface.
 */

export {
  HonchoBridge,
  type HonchoBridgeConfig,
  type ChannelKey,
  type OwnerMessage,
  type AgentMessage,
} from "./bridge.js";

export { HonchoFeeder, type FeederConfig } from "./feeder.js";

export { createHonchoEngine, type HonchoEngine } from "./engine.js";
