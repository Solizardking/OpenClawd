"""
Background autoloop scheduler for autonomous research mandates.

Runs in the FastAPI process as an asyncio task. On every tick (default 30min)
it executes each enabled mandate concurrently and persists findings to
research_runs (via ResearchOrchestrator).

Mandates are kept in-memory by default; persistent mandate storage is a
follow-up. The default mandate set is seeded at startup so users get useful
loops immediately:
    - chain.pump_fun_pulse  : new launches + trending every 30m
    - market.trends         : top 30 trending tokens every 30m
    - market.alpha          : new-listing ∩ trending every 30m

For a production cron-driven worker (Cloudflare Workers cron), see
services/pump-scanner-cron in the OpenClawd monorepo — same pattern.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import FastAPI

from config import settings
from services.research_orchestrator import ResearchOrchestrator

logger = logging.getLogger(__name__)


DEFAULT_MANDATES: list[dict[str, Any]] = [
    {
        "name": "pump_fun_pulse",
        "kind": "chain",
        "payload": {"focus": ["pump_fun"], "limit": 30},
        "enabled": True,
    },
    {
        "name": "market_trends",
        "kind": "market",
        "payload": {"focus": "trends"},
        "enabled": True,
    },
    {
        "name": "market_alpha",
        "kind": "market",
        "payload": {"focus": "alpha"},
        "enabled": True,
    },
]


class AutoloopState:
    def __init__(self) -> None:
        self.task: Optional[asyncio.Task] = None
        self.mandates: list[dict[str, Any]] = list(DEFAULT_MANDATES)
        self.last_tick: Optional[str] = None
        self.tick_count: int = 0
        self.errors: list[str] = []


def _state(app: FastAPI) -> AutoloopState:
    s: Optional[AutoloopState] = getattr(app.state, "autoloop", None)
    if s is None:
        s = AutoloopState()
        app.state.autoloop = s
    return s


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def _execute_mandate(orch: ResearchOrchestrator, mandate: dict[str, Any]) -> None:
    """Execute one mandate. Each kind maps to an orchestrator method.

    For now this is a small dispatch table — extend as new kinds are added."""
    kind = mandate.get("kind")
    payload = mandate.get("payload") or {}
    name = mandate.get("name") or kind or "unnamed"

    research_id = f"auto_{name}_{int(datetime.now(timezone.utc).timestamp())}"
    try:
        if kind == "chain":
            focus = payload.get("focus") or ["pump_fun"]
            results: dict[str, Any] = {}
            sources: list[str] = []
            if "pump_fun" in focus:
                results["pump_fun"] = await orch.research_pump_fun(limit=payload.get("limit", 30))
                sources += ["birdeye", "helius"]
            if "tokens" in focus and payload.get("mint"):
                results["token"] = await orch.research_token(payload["mint"])
                sources += ["birdeye", "helius-das"]
            if "wallets" in focus and payload.get("wallet"):
                results["wallet"] = await orch.research_wallet(payload["wallet"])
                sources += ["birdeye", "helius"]

        elif kind == "defi":
            assets = payload.get("assets") or ["SOL", "USDC"]
            results = {"yields": await orch.scan_yields(assets)}
            sources = ["birdeye"]

        elif kind == "market":
            focus = payload.get("focus") or "trends"
            if focus == "trends":
                results = {"trends": await orch.get_trends(limit=30)}
                sources = ["birdeye"]
            elif focus == "alpha":
                results = {"alpha": await orch.find_alpha()}
                sources = ["birdeye"]
            elif focus == "whale_moves":
                target = payload.get("mint")
                results = {"whale_moves": await orch.track_whales(target)}
                sources = ["helius"]
            else:
                results = {"composite": {
                    "trends": await orch.get_trends(limit=20),
                    "alpha": await orch.find_alpha(),
                }}
                sources = ["birdeye"]
        else:
            logger.warning("autoloop: unknown mandate kind %s", kind)
            return

        await orch.persist_run(
            research_id=research_id,
            kind=kind,
            agent="autoloop",
            query=f"autoloop:{name}",
            results=results,
            sources=sources,
            confidence=0.7,
            metadata={"mandate": name, "scheduled": True, "ran_at": _now_iso()},
        )
        logger.info("autoloop: %s ok (id=%s)", name, research_id)
    except Exception as exc:  # noqa: BLE001
        logger.exception("autoloop mandate %s failed: %s", name, exc)


async def _autoloop_runner(app: FastAPI) -> None:
    state = _state(app)
    interval = max(60, int(settings.RESEARCH_AUTOLOOP_INTERVAL_SECONDS))
    sem = asyncio.Semaphore(max(1, int(settings.RESEARCH_AUTOLOOP_MAX_CONCURRENT)))

    logger.info("autoloop: starting, interval=%ss, mandates=%s", interval, len(state.mandates))

    while True:
        try:
            orch: Optional[ResearchOrchestrator] = getattr(app.state, "research_orch", None)
            if orch is None:
                pool = getattr(app.state, "pool", None)
                orch = ResearchOrchestrator.from_settings(pool=pool)
                app.state.research_orch = orch

            async def _bounded(m: dict[str, Any]) -> None:
                async with sem:
                    await _execute_mandate(orch, m)

            enabled = [m for m in state.mandates if m.get("enabled", True)]
            await asyncio.gather(*(_bounded(m) for m in enabled), return_exceptions=True)
            state.last_tick = _now_iso()
            state.tick_count += 1
        except asyncio.CancelledError:
            logger.info("autoloop: stopped")
            raise
        except Exception as exc:  # noqa: BLE001
            state.errors.append(f"{_now_iso()}: {exc}")
            state.errors[:] = state.errors[-10:]
            logger.exception("autoloop tick failed")

        await asyncio.sleep(interval)


async def ensure_autoloop_running(app: FastAPI) -> bool:
    state = _state(app)
    if state.task and not state.task.done():
        return False
    state.task = asyncio.create_task(_autoloop_runner(app), name="research-autoloop")
    return True


async def stop_autoloop(app: FastAPI) -> None:
    state = _state(app)
    if state.task and not state.task.done():
        state.task.cancel()
        try:
            await state.task
        except (asyncio.CancelledError, Exception):  # noqa: BLE001
            pass
    state.task = None


def autoloop_status(app: FastAPI) -> dict[str, Any]:
    state = _state(app)
    return {
        "running": bool(state.task and not state.task.done()),
        "last_tick": state.last_tick,
        "tick_count": state.tick_count,
        "mandates": state.mandates,
        "interval_seconds": settings.RESEARCH_AUTOLOOP_INTERVAL_SECONDS,
        "max_concurrent": settings.RESEARCH_AUTOLOOP_MAX_CONCURRENT,
        "recent_errors": state.errors[-5:],
    }


def add_mandate(app: FastAPI, mandate: dict[str, Any]) -> dict[str, Any]:
    state = _state(app)
    state.mandates = [m for m in state.mandates if m.get("name") != mandate.get("name")]
    state.mandates.append(mandate)
    return mandate


def list_mandates(app: FastAPI) -> list[dict[str, Any]]:
    return list(_state(app).mandates)


def remove_mandate(app: FastAPI, name: str) -> bool:
    state = _state(app)
    before = len(state.mandates)
    state.mandates = [m for m in state.mandates if m.get("name") != name]
    return len(state.mandates) != before
