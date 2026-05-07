# OpenClawd Bitaxe Hardware Connector

OpenClawd can read and control a Bitaxe running ESP-Miner / AxeOS over the
local AxeOS HTTP API.

By default the connector tries `http://bitaxe`, which works on networks where
mDNS is enabled. To use an explicit LAN IP, set the device URL:

```bash
export BITAXE_URL=http://bitaxe
# or
export BITAXE_URL=http://192.168.1.42
```

Read status:

```bash
node scripts/bitaxe.mjs info
node scripts/bitaxe.mjs asic
node scripts/bitaxe.mjs dashboard
node scripts/bitaxe.mjs snapshot --remember
```

Mutating controls require `--yes`:

```bash
node scripts/bitaxe.mjs identify --yes
node scripts/bitaxe.mjs pause --yes
node scripts/bitaxe.mjs resume --yes
node scripts/bitaxe.mjs restart --yes
node scripts/bitaxe.mjs settings --yes --json '{"fanspeed":"80"}'
```

Memory integration:

```bash
export OPENCLAWD_MEMORY_URL=http://localhost:8000
node scripts/bitaxe.mjs snapshot
```

If `OPENCLAWD_MEMORY_URL` is not set or cannot be reached, `--remember` writes
to `.openclawd-memory/notes.jsonl` as an Obsidian-style OpenClawd memory note.

Firmware and flashing notes:

- Use ESP-Miner factory images that match the Bitaxe hardware model.
- `bitaxetool==0.6.1` is pinned to `esptool==4.9.0`; `esptool` v5 is known to
  be incompatible with bitaxetool.
- Firmware OTA is intentionally not exposed through the OpenClawd connector.
  Use the official ESP-Miner release assets and `bitaxetool` manually for
  firmware updates.

Safety:

- Status reads are safe by default.
- Restart, pause, resume, identify, and settings changes require `--yes`.
- Overclock settings can overheat or damage hardware without additional
  cooling. Keep ASIC frequency and core-voltage changes as manual operator
  actions.
