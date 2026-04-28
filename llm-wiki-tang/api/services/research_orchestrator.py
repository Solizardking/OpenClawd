"""
Research orchestrator — turns a research request into real Birdeye + Helius
calls, normalizes the output, persists a row to research_runs, and returns a
shape compatible with the public ResearchResponse.

Used by:
- routes/research.py for synchronous /api/v1/research/* endpoints
- services/research_autoloop.py for the background scheduler

Designed so each helper is independently testable and the orchestrator decides
which to run based on the request focus.
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any, Optional

from config import settings
from services.birdeye import BirdeyeClient, BirdeyeError, is_solana_address
from services.helius import HeliusClient, HeliusError

if TYPE_CHECKING:
    import asyncpg  # noqa: F401

logger = logging.getLogger(__name__)


# Curated list of well-known Solana mints that we use as defaults / oracles
SOL_MINT = "So11111111111111111111111111111111111111112"
USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
CLAWD_MINT = "8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _safe_get(d: Any, *keys, default=None):
    cur = d
    for k in keys:
        if isinstance(cur, dict):
            cur = cur.get(k)
        else:
            return default
    return cur if cur is not None else default


class ResearchOrchestrator:
    """Wraps Birdeye + Helius with research-friendly composite operations."""

    def __init__(
        self,
        birdeye: Optional[BirdeyeClient] = None,
        helius: Optional[HeliusClient] = None,
        pool: Optional["asyncpg.Pool"] = None,
    ) -> None:
        self.birdeye = birdeye
        self.helius = helius
        self.pool = pool

    @classmethod
    def from_settings(cls, pool: Optional["asyncpg.Pool"] = None) -> "ResearchOrchestrator":
        birdeye = BirdeyeClient(settings.BIRDEYE_API_KEY) if settings.BIRDEYE_API_KEY else None
        helius = (
            HeliusClient(settings.HELIUS_API_KEY, rpc_url=settings.HELIUS_RPC_URL or None)
            if settings.HELIUS_API_KEY
            else None
        )
        return cls(birdeye=birdeye, helius=helius, pool=pool)

    async def aclose(self) -> None:
        if self.birdeye:
            await self.birdeye.aclose()
        if self.helius:
            await self.helius.aclose()

    # ── Persistence ──────────────────────────────────────────────────────────
    async def persist_run(
        self,
        *,
        research_id: str,
        kind: str,
        agent: str,
        query: str,
        results: dict,
        sources: list[str],
        confidence: float,
        metadata: dict,
    ) -> None:
        if not self.pool:
            return
        try:
            async with self.pool.acquire() as con:
                await con.execute(
                    """
                    INSERT INTO research_runs (
                      id, kind, agent, query, results, sources, confidence, metadata, created_at
                    ) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8::jsonb, NOW())
                    ON CONFLICT (id) DO NOTHING
                    """,
                    research_id, kind, agent, query,
                    json.dumps(results), sources, confidence, json.dumps(metadata),
                )
        except Exception as exc:  # noqa: BLE001 — research persistence is best-effort
            logger.warning("research persist failed (id=%s): %s", research_id, exc)

    # ── Token-level research ─────────────────────────────────────────────────
    async def research_token(self, mint: str) -> dict:
        """One-shot deep dive on a single token.

        Combines Birdeye overview + market data + trade data + holder count and
        Helius DAS getAsset / getTokenLargestAccounts."""
        if not is_solana_address(mint):
            return {"error": "invalid_mint", "mint": mint}

        async def _be_overview():
            return await self.birdeye.token_overview(mint) if self.birdeye else None

        async def _be_market():
            return await self.birdeye.token_market_data(mint) if self.birdeye else None

        async def _be_trade():
            return await self.birdeye.token_trade_data(mint, frames="1h,24h") if self.birdeye else None

        async def _be_security():
            try:
                return await self.birdeye.token_security(mint) if self.birdeye else None
            except BirdeyeError:
                return None

        async def _das_asset():
            try:
                return await self.helius.get_asset(mint) if self.helius else None
            except HeliusError:
                return None

        async def _holders():
            try:
                return await self.helius.get_token_largest_accounts(mint) if self.helius else None
            except HeliusError:
                return None

        results = await asyncio.gather(
            _be_overview(), _be_market(), _be_trade(), _be_security(), _das_asset(), _holders(),
            return_exceptions=True,
        )
        overview, market, trade, security, asset, holders = [r if not isinstance(r, Exception) else None for r in results]

        return {
            "mint": mint,
            "overview": overview,
            "market": market,
            "trade": trade,
            "security": security,
            "das_asset": asset,
            "largest_holders": holders,
            "fetched_at": _now_iso(),
        }

    # ── pump.fun / meme research ─────────────────────────────────────────────
    async def research_pump_fun(self, limit: int = 20) -> dict:
        """Fetch trending + new listings via Birdeye and tag candidates likely
        on pump.fun (i.e., mint suffix `pump`)."""
        out: dict[str, Any] = {"recent_launches": [], "trending": [], "fetched_at": _now_iso()}
        if not self.birdeye:
            out["error"] = "BIRDEYE_API_KEY not configured"
            return out

        async def _trend():
            try:
                return await self.birdeye.trending(limit=limit)
            except BirdeyeError as exc:
                logger.warning("birdeye trending failed: %s", exc)
                return None

        async def _new():
            try:
                return await self.birdeye.new_listings(limit=limit)
            except BirdeyeError as exc:
                logger.warning("birdeye new_listings failed: %s", exc)
                return None

        trend, new = await asyncio.gather(_trend(), _new())
        if isinstance(trend, dict):
            tokens = trend.get("tokens") or trend.get("items") or []
            out["trending"] = [
                {
                    "mint": t.get("address"),
                    "symbol": t.get("symbol"),
                    "name": t.get("name"),
                    "rank": t.get("rank"),
                    "price": t.get("price"),
                    "price_change_24h_percent": t.get("price24hChangePercent")
                    or t.get("priceChange24hPercent"),
                    "volume_24h_usd": t.get("volume24hUSD") or t.get("v24hUSD"),
                    "liquidity": t.get("liquidity"),
                    "market_cap": t.get("marketcap") or t.get("marketCap"),
                    "is_pump_fun": (t.get("address") or "").endswith("pump"),
                }
                for t in tokens
            ]
        if isinstance(new, dict):
            items = new.get("items") or new.get("tokens") or []
            out["recent_launches"] = [
                {
                    "mint": t.get("address"),
                    "symbol": t.get("symbol"),
                    "name": t.get("name"),
                    "liquidity": t.get("liquidity"),
                    "created_at": t.get("liquidityAddedAt") or t.get("createdAt"),
                    "platform": t.get("source") or t.get("platform"),
                    "is_pump_fun": (t.get("address") or "").endswith("pump"),
                }
                for t in items
            ]
        return out

    async def check_graduation(self, mint: str) -> dict:
        """Use Birdeye liquidity + market cap as a proxy for graduation status.

        pump.fun graduation generally happens around 85 SOL ($24K-ish at $280/SOL)
        in bonding-curve liquidity, so we report progress vs that threshold."""
        if not is_solana_address(mint):
            return {"status": "invalid_mint"}

        if not self.birdeye:
            return {"status": "unconfigured"}

        try:
            market = await self.birdeye.token_market_data(mint)
        except BirdeyeError as exc:
            return {"status": "error", "error": str(exc)}

        liquidity = float(_safe_get(market, "liquidity") or 0)
        mcap = float(_safe_get(market, "market_cap") or 0)
        # pump.fun graduates at ~$69K mcap historically
        threshold = 69_000.0
        progress = min(100.0, (mcap / threshold) * 100.0) if mcap > 0 else 0.0
        return {
            "mint": mint,
            "liquidity_usd": liquidity,
            "market_cap_usd": mcap,
            "graduation_threshold_usd": threshold,
            "progress_percent": round(progress, 2),
            "status": (
                "graduated" if progress >= 100
                else "graduating" if progress >= 80
                else "early" if progress > 0
                else "unknown"
            ),
        }

    # ── DeFi research ────────────────────────────────────────────────────────
    async def scan_yields(self, assets: list[str]) -> dict:
        """Pull liquidity + 24h fee data for top pools of each requested asset."""
        if not self.birdeye:
            return {"yields": [], "error": "BIRDEYE_API_KEY not configured"}

        symbol_map = {"SOL": SOL_MINT, "USDC": USDC_MINT, "CLAWD": CLAWD_MINT}
        mints: list[str] = []
        for a in assets:
            if a in symbol_map:
                mints.append(symbol_map[a])
            elif is_solana_address(a):
                mints.append(a)

        async def _pairs(mint: str):
            try:
                return mint, await self.birdeye.token_pairs(mint, limit=5)
            except BirdeyeError:
                return mint, None

        results = await asyncio.gather(*(_pairs(m) for m in mints))
        yields: list[dict] = []
        for mint, data in results:
            if not isinstance(data, dict):
                continue
            for pair in data.get("items") or []:
                liq = float(pair.get("liquidity") or 0)
                vol = float(pair.get("volume_24h") or pair.get("volume24h") or 0)
                fee_pct = float(pair.get("fee_rate") or pair.get("feeRate") or 0.003)
                fees_24h = vol * fee_pct
                apr = (fees_24h * 365 / liq) * 100 if liq > 0 else 0
                yields.append({
                    "mint": mint,
                    "pair_address": pair.get("address"),
                    "dex": pair.get("source") or pair.get("dex"),
                    "name": pair.get("name"),
                    "liquidity_usd": liq,
                    "volume_24h_usd": vol,
                    "fees_24h_usd": round(fees_24h, 2),
                    "apr_percent": round(apr, 2),
                })
        yields.sort(key=lambda y: y["apr_percent"], reverse=True)
        return {"yields": yields[:15], "fetched_at": _now_iso()}

    async def find_arbitrage(self, mint: str) -> dict:
        """Compare a token's price across DEX pools to surface spread."""
        if not is_solana_address(mint):
            return {"error": "invalid_mint"}
        if not self.birdeye:
            return {"error": "BIRDEYE_API_KEY not configured"}
        try:
            data = await self.birdeye.token_pairs(mint, limit=10)
        except BirdeyeError as exc:
            return {"error": str(exc)}
        prices = []
        for pair in data.get("items") or []:
            p = pair.get("price") or _safe_get(pair, "base", "price")
            if p:
                prices.append({
                    "dex": pair.get("source") or pair.get("dex"),
                    "pair_address": pair.get("address"),
                    "price": float(p),
                    "liquidity": float(pair.get("liquidity") or 0),
                })
        if len(prices) < 2:
            return {"opportunities": [], "note": "not_enough_pools"}
        prices.sort(key=lambda x: x["price"])
        low, high = prices[0], prices[-1]
        spread_pct = ((high["price"] - low["price"]) / low["price"]) * 100 if low["price"] else 0
        return {
            "opportunities": [{
                "mint": mint,
                "buy_dex": low["dex"],
                "buy_pair": low["pair_address"],
                "buy_price": low["price"],
                "sell_dex": high["dex"],
                "sell_pair": high["pair_address"],
                "sell_price": high["price"],
                "spread_percent": round(spread_pct, 4),
                "min_liquidity_usd": min(low["liquidity"], high["liquidity"]),
            }],
            "fetched_at": _now_iso(),
        }

    # ── Market research ──────────────────────────────────────────────────────
    async def get_trends(self, limit: int = 30) -> dict:
        if not self.birdeye:
            return {"trending": []}
        try:
            t = await self.birdeye.trending(limit=limit)
        except BirdeyeError as exc:
            return {"trending": [], "error": str(exc)}
        items = t.get("tokens") or t.get("items") or []
        return {
            "trending": [
                {
                    "rank": i.get("rank"),
                    "symbol": i.get("symbol"),
                    "name": i.get("name"),
                    "mint": i.get("address"),
                    "price": i.get("price"),
                    "price_change_24h_percent": (
                        i.get("price24hChangePercent") or i.get("priceChange24hPercent")
                    ),
                    "volume_24h_usd": i.get("volume24hUSD") or i.get("v24hUSD"),
                    "liquidity": i.get("liquidity"),
                }
                for i in items
            ],
            "fetched_at": _now_iso(),
        }

    async def find_alpha(self) -> dict:
        """Cross-reference new listings with high-momentum trending names."""
        async def _new():
            try:
                return await self.birdeye.new_listings(limit=30) if self.birdeye else None
            except BirdeyeError:
                return None

        async def _trend():
            try:
                return await self.birdeye.trending(limit=30) if self.birdeye else None
            except BirdeyeError:
                return None

        new, trend = await asyncio.gather(_new(), _trend())
        new_mints = {t.get("address") for t in (new or {}).get("items") or []}
        alpha = []
        for t in (trend or {}).get("tokens") or (trend or {}).get("items") or []:
            if t.get("address") in new_mints:
                alpha.append({
                    "mint": t.get("address"),
                    "symbol": t.get("symbol"),
                    "name": t.get("name"),
                    "rank": t.get("rank"),
                    "price": t.get("price"),
                    "volume_24h_usd": t.get("volume24hUSD") or t.get("v24hUSD"),
                    "rationale": "new_listing_with_momentum",
                })
        return {"alpha": alpha[:10], "fetched_at": _now_iso()}

    async def track_whales(self, mint: Optional[str] = None) -> dict:
        target = mint or SOL_MINT
        if not self.helius:
            return {"whale_alerts": []}
        try:
            top = await self.helius.get_token_largest_accounts(target)
        except HeliusError as exc:
            return {"whale_alerts": [], "error": str(exc)}
        accounts = (_safe_get(top, "value") or [])[:10]
        alerts = [
            {
                "rank": i + 1,
                "account": a.get("address"),
                "ui_amount": a.get("uiAmount"),
                "amount": a.get("amount"),
                "decimals": a.get("decimals"),
                "mint": target,
            }
            for i, a in enumerate(accounts)
        ]
        return {"whale_alerts": alerts, "fetched_at": _now_iso()}

    # ── Wallet research ──────────────────────────────────────────────────────
    async def research_wallet(self, wallet: str) -> dict:
        if not is_solana_address(wallet):
            return {"error": "invalid_wallet"}

        async def _portfolio():
            try:
                return await self.birdeye.wallet_portfolio(wallet) if self.birdeye else None
            except BirdeyeError:
                return None

        async def _das():
            try:
                return await self.helius.get_assets_by_owner(wallet, limit=100) if self.helius else None
            except HeliusError:
                return None

        async def _balances():
            try:
                return await self.helius.parsed_balances(wallet) if self.helius else None
            except HeliusError:
                return None

        async def _txs():
            try:
                return await self.helius.parsed_transactions(wallet, limit=20) if self.helius else None
            except HeliusError:
                return None

        portfolio, das, balances, txs = await asyncio.gather(_portfolio(), _das(), _balances(), _txs())
        return {
            "wallet": wallet,
            "birdeye_portfolio": portfolio,
            "das_assets": das,
            "balances": balances,
            "recent_transactions": txs,
            "fetched_at": _now_iso(),
        }
