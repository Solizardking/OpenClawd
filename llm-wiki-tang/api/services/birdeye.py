"""
Birdeye Data Services client (Solana focus).

Mirrors the TS client in clawd-tui/src/birdeye.ts so research.py and the TUI
return shape-compatible data. All methods default to chain=solana and use the
scaled UI amount mode where applicable.

Docs: https://docs.birdeye.so
"""

from __future__ import annotations

import logging
from typing import Any, Optional

import httpx

logger = logging.getLogger(__name__)

BIRDEYE_BASE = "https://public-api.birdeye.so"
DEFAULT_CHAIN = "solana"
DEFAULT_TIMEOUT = 15.0


class BirdeyeError(RuntimeError):
    def __init__(self, message: str, status: Optional[int] = None) -> None:
        super().__init__(message)
        self.status = status


class BirdeyeClient:
    """Async Birdeye client. Reuses one httpx.AsyncClient per instance."""

    def __init__(
        self,
        api_key: str,
        chain: str = DEFAULT_CHAIN,
        timeout: float = DEFAULT_TIMEOUT,
    ) -> None:
        if not api_key:
            raise BirdeyeError("BIRDEYE_API_KEY is not set")
        self.api_key = api_key
        self.chain = chain
        self._client = httpx.AsyncClient(
            base_url=BIRDEYE_BASE,
            timeout=timeout,
            headers={
                "accept": "application/json",
                "X-API-KEY": api_key,
            },
        )

    async def aclose(self) -> None:
        await self._client.aclose()

    async def __aenter__(self) -> "BirdeyeClient":
        return self

    async def __aexit__(self, *_exc: Any) -> None:
        await self.aclose()

    async def _get(self, path: str, params: Optional[dict] = None, chain: Optional[str] = None) -> dict:
        clean = {k: v for k, v in (params or {}).items() if v is not None and v != ""}
        try:
            res = await self._client.get(
                path,
                params=clean,
                headers={"x-chain": chain or self.chain},
            )
        except httpx.HTTPError as exc:
            raise BirdeyeError(f"birdeye request failed: {exc}") from exc

        if res.status_code >= 400:
            body = res.text[:200]
            raise BirdeyeError(f"{res.status_code} {res.reason_phrase} {body}", status=res.status_code)
        try:
            payload = res.json()
        except ValueError as exc:
            raise BirdeyeError(f"birdeye returned non-JSON: {res.text[:200]}") from exc
        if isinstance(payload, dict) and payload.get("success") is False:
            raise BirdeyeError(payload.get("message") or "birdeye request failed")
        return payload.get("data") if isinstance(payload, dict) and "data" in payload else payload

    # ── Token-level ──────────────────────────────────────────────────────────
    async def token_overview(self, address: str, frames: Optional[str] = None) -> dict:
        return await self._get(
            "/defi/token_overview",
            {"address": address, "ui_amount_mode": "scaled", "frames": frames},
        )

    async def token_metadata(self, address: str) -> dict:
        return await self._get("/defi/v3/token/meta-data/single", {"address": address})

    async def token_metadata_multi(self, addresses: list[str]) -> dict:
        return await self._get(
            "/defi/v3/token/meta-data/multiple",
            {"list_address": ",".join(addresses)},
        )

    async def token_market_data(self, address: str) -> dict:
        return await self._get(
            "/defi/v3/token/market-data",
            {"address": address, "ui_amount_mode": "scaled"},
        )

    async def token_market_data_multi(self, addresses: list[str]) -> dict:
        return await self._get(
            "/defi/v3/token/market-data/multiple",
            {"list_address": ",".join(addresses), "ui_amount_mode": "scaled"},
        )

    async def token_trade_data(self, address: str, frames: Optional[str] = None) -> dict:
        return await self._get(
            "/defi/v3/token/trade-data/single",
            {"address": address, "ui_amount_mode": "scaled", "frames": frames},
        )

    async def token_security(self, address: str) -> dict:
        return await self._get("/defi/token_security", {"address": address})

    async def token_holders(self, address: str, offset: int = 0, limit: int = 50) -> dict:
        return await self._get(
            "/defi/v3/token/holder",
            {"address": address, "offset": offset, "limit": limit},
        )

    # ── Market-wide ──────────────────────────────────────────────────────────
    async def search(self, keyword: str, limit: int = 10) -> dict:
        return await self._get(
            "/defi/v3/search",
            {
                "keyword": keyword,
                "target": "token",
                "sort_by": "volume_24h_usd",
                "sort_type": "desc",
                "offset": 0,
                "limit": limit,
            },
        )

    async def trending(self, limit: int = 20) -> dict:
        return await self._get(
            "/defi/token_trending",
            {"sort_by": "rank", "sort_type": "asc", "offset": 0, "limit": limit},
        )

    async def new_listings(self, limit: int = 20) -> dict:
        # Recently listed — useful for meme-token research
        return await self._get(
            "/defi/v2/tokens/new_listing",
            {"limit": limit, "meme_platform_enabled": "true"},
        )

    async def top_gainers(self, timeframe: str = "24h", limit: int = 20) -> dict:
        return await self._get(
            "/defi/v3/token/list",
            {
                "sort_by": "price_change_percent",
                "sort_type": "desc",
                "limit": limit,
                "min_liquidity": 1000,
                "timeframe": timeframe,
            },
        )

    # ── Pair / pool ──────────────────────────────────────────────────────────
    async def pair_overview(self, pair_address: str) -> dict:
        return await self._get("/defi/v3/pair/overview/single", {"address": pair_address})

    async def token_pairs(self, address: str, limit: int = 10) -> dict:
        # Returns liquidity pools for a given mint — DEX/AMM aware
        return await self._get(
            "/defi/v3/token/pair-list",
            {"address": address, "sort_by": "liquidity", "sort_type": "desc", "limit": limit},
        )

    # ── Wallet ───────────────────────────────────────────────────────────────
    async def wallet_portfolio(self, wallet: str) -> dict:
        return await self._get("/v1/wallet/token_list", {"wallet": wallet})

    async def wallet_networth(self, wallet: str) -> dict:
        return await self._get("/wallet/v2/net-worth", {"wallet": wallet})

    async def wallet_pnl(self, wallet: str, timeframe: str = "24h") -> dict:
        return await self._get(
            "/trader/txs/seek_by_time",
            {"address": wallet, "tx_type": "swap", "timeframe": timeframe, "limit": 100},
        )


_BASE58 = (
    "0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
)


def is_solana_address(s: str) -> bool:
    if not s or len(s) < 32 or len(s) > 44:
        return False
    return all(c in _BASE58 for c in s)
