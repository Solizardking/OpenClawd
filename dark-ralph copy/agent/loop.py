#!/usr/bin/env python3
"""Dark Ralph OODA-loop driver.

Paper-trading only, devnet-only, stdlib only. v0.
"""

from __future__ import annotations

import argparse
import dataclasses
import json
import os
import random
import subprocess
import sys
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

from memory import remember_tick

ROOT = Path(__file__).resolve().parent
JOURNAL_DIR = ROOT / "journal"
JOURNAL_FILE = JOURNAL_DIR / "ticks.jsonl"
RALPH_MD = ROOT / "RALPH.md"

DISALLOWED_RPC_HOSTS = (
    "api.mainnet-beta.solana.com",
    "solana-mainnet",
    "mainnet.helius-rpc.com",
    "rpc.helius.xyz",
    "rpc.ankr.com/solana",
)


@dataclasses.dataclass
class Candle:
    t: float
    o: float
    h: float
    l: float
    c: float
    v: float

    def to_dict(self) -> dict:
        return dataclasses.asdict(self)


@dataclasses.dataclass
class Position:
    id: str
    side: str
    size_lamports: int
    entry: float
    opened_tick: int

    def to_dict(self) -> dict:
        return dataclasses.asdict(self)


@dataclasses.dataclass
class Book:
    positions: list[Position]
    cash_lamports: int
    realized_pnl_lamports: int = 0

    def to_dict(self) -> dict:
        return {
            "positions": [p.to_dict() for p in self.positions],
            "cash_lamports": self.cash_lamports,
            "realized_pnl_lamports": self.realized_pnl_lamports,
        }


@dataclasses.dataclass
class State:
    tick: int
    candles: list[Candle]
    book: Book
    consecutive_losses: int
    last_decisions: list[dict]


def parse_frontmatter(md_path: Path) -> dict:
    text = md_path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        raise SystemExit(f"{md_path} is missing frontmatter")
    end = text.find("\n---", 4)
    if end < 0:
        raise SystemExit(f"{md_path} frontmatter is unterminated")

    out: dict = {}
    for line in text[4:end].splitlines():
        line = line.strip()
        if not line or line.startswith("#") or ":" not in line:
            continue
        key, value = line.split(":", 1)
        value = value.strip()
        out[key.strip()] = int(value) if value.lstrip("-").isdigit() else value
    return out


def reject_mainnet(rpc_url: str | None) -> None:
    if not rpc_url:
        return
    lowered = rpc_url.lower()
    if any(host in lowered for host in DISALLOWED_RPC_HOSTS):
        sys.exit(
            f"refusing to start: RPC URL {rpc_url!r} looks like mainnet. "
            "v0 is paper-only, devnet-only, and has no signing path."
        )


def synth_candle(state: State, rng: random.Random) -> Candle:
    last_close = state.candles[-1].c if state.candles else 100.0
    drift = rng.uniform(-0.6, 0.6)
    open_price = last_close
    close_price = max(1.0, last_close + drift)
    high = max(open_price, close_price) + abs(rng.uniform(0.0, 0.25))
    low = max(0.5, min(open_price, close_price) - abs(rng.uniform(0.0, 0.25)))
    volume = rng.uniform(100.0, 1000.0)
    return Candle(t=time.time(), o=open_price, h=high, l=low, c=close_price, v=volume)


def observe(state: State, rng: random.Random) -> Candle:
    return synth_candle(state, rng)


def rule_based_decision(state: State, caps: dict) -> dict:
    if len(state.candles) < 3:
        return {"action": "hold", "reason": "warmup: fewer than 3 candles"}

    closes = [c.c for c in state.candles[-3:]]
    monotonic_up = closes[0] < closes[1] < closes[2]
    monotonic_down = closes[0] > closes[1] > closes[2]

    if state.book.positions:
        pos = state.book.positions[0]
        if pos.side == "long" and monotonic_down:
            return {"action": "close", "position_id": pos.id, "reason": "2-bar reversal against long"}
        if pos.side == "short" and monotonic_up:
            return {"action": "close", "position_id": pos.id, "reason": "2-bar reversal against short"}
        return {"action": "hold", "reason": "position open without reversal"}

    cap = int(caps.get("max_position_size_lamports", 1_000_000))
    size = min(cap, 500_000)
    if monotonic_up:
        return {"action": "open", "side": "long", "size_lamports": size, "reason": "3 closes monotonic up"}
    if monotonic_down:
        return {"action": "open", "side": "short", "size_lamports": size, "reason": "3 closes monotonic down"}
    return {"action": "hold", "reason": "no signal"}


def validate_decision(decision: dict, caps: dict) -> str | None:
    action = decision.get("action")
    if action not in {"hold", "open", "close"}:
        return f"unknown action {action!r}"
    if action == "open":
        side = decision.get("side")
        if side not in {"long", "short"}:
            return f"open requires side in long/short, got {side!r}"
        size = decision.get("size_lamports")
        if not isinstance(size, int) or size <= 0:
            return "open requires positive int size_lamports"
        cap = int(caps.get("max_position_size_lamports", 0))
        if size > cap:
            return f"size {size} > cap {cap}"
    if action == "close" and not decision.get("position_id"):
        return "close requires position_id"
    reason = decision.get("reason", "")
    if not isinstance(reason, str) or len(reason) > 140:
        return "reason must be a short string"
    return None


def act(decision: dict, state: State, last_close: float) -> dict:
    action = decision["action"]
    if action == "hold":
        return {"applied": True, "kind": "hold"}

    if action == "open":
        if state.book.positions:
            return {"applied": False, "kind": "open", "reason": "position already open"}
        pos = Position(
            id=f"p-{uuid.uuid4().hex[:8]}",
            side=decision["side"],
            size_lamports=int(decision["size_lamports"]),
            entry=last_close,
            opened_tick=state.tick,
        )
        state.book.positions.append(pos)
        return {"applied": True, "kind": "open", "position": pos.to_dict()}

    if action == "close":
        target_id = decision["position_id"]
        for index, pos in enumerate(state.book.positions):
            if pos.id == target_id:
                state.book.positions.pop(index)
                price_delta = last_close - pos.entry
                if pos.side == "short":
                    price_delta = -price_delta
                pnl = int(price_delta * pos.size_lamports / max(pos.entry, 1.0))
                state.book.realized_pnl_lamports += pnl
                state.consecutive_losses = state.consecutive_losses + 1 if pnl < 0 else 0
                return {
                    "applied": True,
                    "kind": "close",
                    "position_id": target_id,
                    "exit": last_close,
                    "pnl_lamports": pnl,
                    "consecutive_losses": state.consecutive_losses,
                }
        return {"applied": False, "kind": "close", "reason": f"position {target_id!r} not found"}

    return {"applied": False, "kind": action, "reason": "unhandled action"}


def journal_append(entry: dict) -> None:
    JOURNAL_DIR.mkdir(parents=True, exist_ok=True)
    with JOURNAL_FILE.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(entry, separators=(",", ":")) + "\n")


def git_commit_journal(tick: int) -> None:
    journal_rel = str(JOURNAL_FILE.relative_to(ROOT.parent))
    try:
        subprocess.run(["git", "add", "--", journal_rel], cwd=ROOT.parent, check=False, capture_output=True)
        subprocess.run(
            ["git", "commit", "--only", "--allow-empty", "-m", f"agent: tick {tick}", "--", journal_rel],
            cwd=ROOT.parent,
            check=False,
            capture_output=True,
        )
    except FileNotFoundError:
        pass


def emit(payload: dict, tui: bool) -> None:
    sys.stdout.write(json.dumps(payload, separators=(",", ":")) + "\n")
    sys.stdout.flush()


def run_loop(
    *,
    ticks: int,
    sleep_s: float,
    seed: int,
    commit_every: int,
    tui: bool,
    memory_url: str | None = None,
    decision_fn: Callable[[State, dict], dict] = rule_based_decision,
) -> int:
    frontmatter = parse_frontmatter(RALPH_MD)
    if frontmatter.get("mode") != "paper":
        sys.exit("v0 only supports mode: paper in RALPH.md frontmatter")
    if frontmatter.get("network") != "devnet":
        sys.exit("v0 only supports network: devnet in RALPH.md frontmatter")

    reject_mainnet(os.environ.get("SOLANA_RPC_URL"))

    rng = random.Random(seed)
    state = State(
        tick=0,
        candles=[],
        book=Book(positions=[], cash_lamports=10_000_000),
        consecutive_losses=0,
        last_decisions=[],
    )
    kill_threshold = int(frontmatter.get("loss_killswitch_consecutive", 3))

    emit({"event": "start", "frontmatter": frontmatter, "seed": seed, "ticks": ticks}, tui)
    for tick in range(1, ticks + 1):
        state.tick = tick
        candle = observe(state, rng)
        state.candles.append(candle)
        state.candles = state.candles[-64:]

        decision = decision_fn(state, frontmatter)
        error = validate_decision(decision, frontmatter)
        if error:
            decision = {"action": "hold", "reason": f"rejected by harness: {error}"}

        outcome = act(decision, state, last_close=candle.c)
        entry = {
            "tick": tick,
            "now": datetime.now(timezone.utc).isoformat(),
            "mode": "paper",
            "network": "devnet",
            "candle": candle.to_dict(),
            "decision": decision,
            "outcome": outcome,
            "book": state.book.to_dict(),
            "consecutive_losses": state.consecutive_losses,
        }
        journal_append(entry)
        remember_tick(entry, memory_url=memory_url)
        state.last_decisions = (state.last_decisions + [entry])[-3:]
        emit({"event": "tick", **entry}, tui)

        if state.consecutive_losses >= kill_threshold:
            emit(
                {
                    "event": "killswitch",
                    "tick": tick,
                    "reason": f"{state.consecutive_losses} consecutive losses >= threshold {kill_threshold}",
                },
                tui,
            )
            return 2

        if commit_every > 0 and tick % commit_every == 0:
            git_commit_journal(tick)
        if sleep_s > 0:
            time.sleep(sleep_s)

    if commit_every > 0:
        git_commit_journal(state.tick)
    emit({"event": "done", "tick": state.tick, "book": state.book.to_dict()}, tui)
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Dark Ralph OODA loop (paper, devnet)")
    parser.add_argument("--ticks", type=int, default=50)
    parser.add_argument("--sleep", type=float, default=0.25, help="seconds between ticks")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--commit-every", type=int, default=10, help="git-commit journal every N ticks; 0 disables")
    parser.add_argument("--tui", action="store_true", help="emit TUI-consumable JSONL")
    parser.add_argument("--memory-url", default=None, help="OpenClawd memory service URL")
    parser.add_argument("--mode", default="paper", choices=["paper"], help="v0 only supports paper")
    args = parser.parse_args(argv)

    return run_loop(
        ticks=args.ticks,
        sleep_s=args.sleep,
        seed=args.seed,
        commit_every=args.commit_every,
        tui=args.tui,
        memory_url=args.memory_url,
    )


if __name__ == "__main__":
    raise SystemExit(main())
