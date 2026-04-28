"""
Helius Solana RPC + DAS + Wallet API client.

Mirrors clawd-tui/src/helius.ts and adds Wallet API endpoints (Helius Enhanced
Transactions + Digital Asset Standard) for richer wallet/portfolio research.

Docs:
- https://www.helius.dev/docs/das-api
- https://www.helius.dev/docs/solana-apis (Enhanced TX, Wallet)
"""

from __future__ import annotations

import logging
from typing import Any, Optional

import httpx

logger = logging.getLogger(__name__)

DEFAULT_RPC_BASE = "https://mainnet.helius-rpc.com"
DEFAULT_API_BASE = "https://api.helius.xyz"
DEFAULT_TIMEOUT = 20.0


class HeliusError(RuntimeError):
    def __init__(self, message: str, code: Optional[int] = None) -> None:
        super().__init__(message)
        self.code = code


class HeliusClient:
    """Async Helius client covering RPC, DAS, and Wallet API."""

    def __init__(
        self,
        api_key: str,
        rpc_url: Optional[str] = None,
        timeout: float = DEFAULT_TIMEOUT,
    ) -> None:
        if not api_key:
            raise HeliusError("HELIUS_API_KEY is not set")
        self.api_key = api_key
        if rpc_url:
            self.rpc_url = rpc_url if "api-key=" in rpc_url else f"{rpc_url.rstrip('/')}/?api-key={api_key}"
        else:
            self.rpc_url = f"{DEFAULT_RPC_BASE}/?api-key={api_key}"
        self.api_base = DEFAULT_API_BASE
        self._client = httpx.AsyncClient(
            timeout=timeout,
            headers={"accept": "application/json", "Content-Type": "application/json"},
        )

    async def aclose(self) -> None:
        await self._client.aclose()

    async def __aenter__(self) -> "HeliusClient":
        return self

    async def __aexit__(self, *_exc: Any) -> None:
        await self.aclose()

    # ── JSON-RPC core ────────────────────────────────────────────────────────
    async def _rpc(self, method: str, params: Any) -> Any:
        try:
            res = await self._client.post(
                self.rpc_url,
                json={"jsonrpc": "2.0", "id": "wiki-tang", "method": method, "params": params},
            )
        except httpx.HTTPError as exc:
            raise HeliusError(f"helius rpc request failed: {exc}") from exc
        if res.status_code >= 400:
            raise HeliusError(f"{res.status_code} {res.reason_phrase} {res.text[:200]}", code=res.status_code)
        payload = res.json()
        if "error" in payload and payload["error"]:
            err = payload["error"]
            raise HeliusError(err.get("message") or "helius rpc error", code=err.get("code"))
        return payload.get("result")

    async def _api_get(self, path: str, params: Optional[dict] = None) -> Any:
        clean = {k: v for k, v in (params or {}).items() if v is not None}
        clean.setdefault("api-key", self.api_key)
        try:
            res = await self._client.get(f"{self.api_base}{path}", params=clean)
        except httpx.HTTPError as exc:
            raise HeliusError(f"helius api request failed: {exc}") from exc
        if res.status_code >= 400:
            raise HeliusError(f"{res.status_code} {res.reason_phrase} {res.text[:200]}", code=res.status_code)
        return res.json()

    # ── DAS ──────────────────────────────────────────────────────────────────
    async def get_asset(self, asset_id: str) -> dict:
        return await self._rpc("getAsset", {"id": asset_id})

    async def get_asset_batch(self, ids: list[str]) -> list[dict]:
        return await self._rpc("getAssetBatch", {"ids": ids})

    async def get_assets_by_owner(
        self,
        owner: str,
        page: int = 1,
        limit: int = 100,
        show_fungible: bool = True,
        show_native_balance: bool = True,
        show_inscription: bool = False,
    ) -> dict:
        return await self._rpc(
            "getAssetsByOwner",
            {
                "ownerAddress": owner,
                "page": page,
                "limit": limit,
                "displayOptions": {
                    "showFungible": show_fungible,
                    "showNativeBalance": show_native_balance,
                    "showInscription": show_inscription,
                },
            },
        )

    async def search_assets(self, params: dict) -> dict:
        return await self._rpc("searchAssets", params)

    async def get_assets_by_group(self, group_value: str, page: int = 1, limit: int = 100) -> dict:
        return await self._rpc(
            "getAssetsByGroup",
            {"groupKey": "collection", "groupValue": group_value, "page": page, "limit": limit},
        )

    async def get_assets_by_creator(
        self, creator: str, only_verified: bool = True, page: int = 1, limit: int = 100
    ) -> dict:
        return await self._rpc(
            "getAssetsByCreator",
            {"creatorAddress": creator, "onlyVerified": only_verified, "page": page, "limit": limit},
        )

    async def get_signatures_for_asset(self, asset_id: str, page: int = 1, limit: int = 50) -> dict:
        return await self._rpc("getSignaturesForAsset", {"id": asset_id, "page": page, "limit": limit})

    async def get_token_accounts(self, mint: Optional[str] = None, owner: Optional[str] = None,
                                  page: int = 1, limit: int = 100) -> dict:
        params: dict = {"page": page, "limit": limit}
        if mint:
            params["mint"] = mint
        if owner:
            params["owner"] = owner
        return await self._rpc("getTokenAccounts", params)

    # ── SPL token RPC ────────────────────────────────────────────────────────
    async def get_token_supply(self, mint: str) -> dict:
        return await self._rpc("getTokenSupply", [mint])

    async def get_token_largest_accounts(self, mint: str) -> dict:
        return await self._rpc("getTokenLargestAccounts", [mint])

    async def get_balance(self, address: str) -> dict:
        return await self._rpc("getBalance", [address])

    async def get_token_account_balance(self, account: str) -> dict:
        return await self._rpc("getTokenAccountBalance", [account])

    async def get_token_accounts_by_owner(self, owner: str, mint: Optional[str] = None) -> dict:
        if mint:
            filter_ = {"mint": mint}
        else:
            filter_ = {"programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"}
        return await self._rpc("getTokenAccountsByOwner", [owner, filter_, {"encoding": "jsonParsed"}])

    # ── Wallet API (Helius Enhanced) ─────────────────────────────────────────
    async def parsed_transactions(self, address: str, before: Optional[str] = None, limit: int = 100) -> list[dict]:
        params: dict[str, Any] = {"limit": limit}
        if before:
            params["before"] = before
        return await self._api_get(f"/v0/addresses/{address}/transactions", params)

    async def parsed_balances(self, address: str) -> dict:
        # Native + SPL balances in one shot, with metadata
        return await self._api_get(f"/v0/addresses/{address}/balances")

    async def names_for_address(self, address: str) -> dict:
        # SNS/Bonfida names owned by the wallet
        return await self._api_get(f"/v0/addresses/{address}/names")

    async def parsed_history(self, address: str, type_: Optional[str] = None,
                              source: Optional[str] = None, limit: int = 100) -> list[dict]:
        params: dict[str, Any] = {"limit": limit}
        if type_:
            params["type"] = type_
        if source:
            params["source"] = source
        return await self._api_get(f"/v0/addresses/{address}/transactions", params)


_BASE58 = (
    "0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
)


def is_solana_address(s: str) -> bool:
    if not s or len(s) < 32 or len(s) > 44:
        return False
    return all(c in _BASE58 for c in s)
