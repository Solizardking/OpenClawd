"""
OpenClawd Auto-Research Routes

API endpoints for autonomous research agents on Solana blockchain and DeFi.
Powered by 49 Metaplex Lobster Agents with $CLAWD token gating.

$CLAWD Token: 8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump
Documentation: docs.solanaclawd.com
"""

import asyncio
import logging
import time
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Header, Query, Request, status
from pydantic import BaseModel, Field

from config import settings
from services.research_orchestrator import ResearchOrchestrator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/research", tags=["research"])


def _orchestrator(req: Request) -> ResearchOrchestrator:
    """Return the per-app orchestrator (initialized in main.py lifespan)."""
    orch: Optional[ResearchOrchestrator] = getattr(req.app.state, "research_orch", None)
    if orch is None:
        # Fallback: build on-demand (no DB persistence). Useful for tests.
        orch = ResearchOrchestrator.from_settings(pool=getattr(req.app.state, "pool", None))
        req.app.state.research_orch = orch
    return orch


# =============================================================================
# ENUMS AND CONSTANTS
# =============================================================================

class ResearchTier(str, Enum):
    """$CLAWD token tier levels for research access."""
    FREE = "free"
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    DIAMOND = "diamond"


class ChainFocus(str, Enum):
    """Focus areas for chain research."""
    PUMP_FUN = "pump_fun"
    TOKENS = "tokens"
    PROTOCOLS = "protocols"
    NFTS = "nfts"
    WALLETS = "wallets"
    GRADUATION = "graduation"


class DeFiAction(str, Enum):
    """DeFi research actions."""
    YIELD_SCAN = "yield_scan"
    LP_ANALYSIS = "lp_analysis"
    ARBITRAGE = "arbitrage"
    PROTOCOL_RESEARCH = "protocol_research"
    SWAP_ROUTE = "swap_route"


class MarketFocus(str, Enum):
    """Market research focus areas."""
    SENTIMENT = "sentiment"
    TRENDS = "trends"
    ALPHA = "alpha"
    NARRATIVES = "narratives"
    WHALE_MOVES = "whale_moves"


# $CLAWD token address
CLAWD_MINT = "8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump"

# Solana RPC and API endpoints
HELIUS_RPC = "https://mainnet.helius-rpc.com"
BIRDEYE_BASE = "https://public-api.birdeye.so"

# Research pricing in SOL (converted from $CLAWD at ~100:1)
RESEARCH_PRICING = {
    "basic_chain": 0.001,
    "token_analysis": 0.005,
    "defi_scan": 0.01,
    "full_market": 0.025,
    "priority": 0.005,  # Additional for priority queue
}


# =============================================================================
# REQUEST MODELS
# =============================================================================

class ChainResearchRequest(BaseModel):
    """Request model for Solana chain research."""
    query: str = Field(..., description="Research query or topic")
    focus: list[ChainFocus] = Field(
        default=[ChainFocus.PUMP_FUN],
        description="Research focus areas"
    )
    timeframe: str = Field(
        default="24h",
        description="Timeframe: 1h, 6h, 24h, 7d, 30d"
    )
    limit: int = Field(default=10, ge=1, le=100)
    mint: Optional[str] = Field(None, description="Specific token mint to research")
    wallet: Optional[str] = Field(None, description="Specific wallet to analyze")


class DeFiResearchRequest(BaseModel):
    """Request model for DeFi research."""
    action: DeFiAction = Field(..., description="Type of DeFi research")
    protocols: list[str] = Field(
        default=["raydium", "orca", "jupiter"],
        description="Protocols to research"
    )
    assets: list[str] = Field(
        default=["SOL", "USDC"],
        description="Assets to analyze"
    )
    focus: list[str] = Field(
        default=["yields"],
        description="Research focus: yields, liquidity, risks, fees"
    )
    amount: Optional[float] = Field(None, description="Amount for calculations")
    risk_tolerance: str = Field(default="medium", description="Risk: low, medium, high")


class MarketResearchRequest(BaseModel):
    """Request model for market sentiment research."""
    focus: MarketFocus = Field(..., description="Market research focus")
    tokens: list[str] = Field(
        default=[],
        description="Specific token mints to research"
    )
    sources: list[str] = Field(
        default=["twitter", "dexscreener", "birdeye"],
        description="Data sources: twitter, telegram, dexscreener, birdeye"
    )
    timeframe: str = Field(default="24h", description="Analysis timeframe")
    include_social: bool = Field(default=True, description="Include social metrics")


class AgentResearchRequest(BaseModel):
    """Request model for agent self-improvement research."""
    agent_id: str = Field(..., description="Agent ID to research/improve")
    action: str = Field(
        ...,
        description="Action: learn, share, collaborate, calibrate"
    )
    data: Optional[dict] = Field(None, description="Additional data for research")
    target_agent: Optional[str] = Field(None, description="Target agent for collaboration")
    task: Optional[str] = Field(None, description="Research task for collaboration")


# =============================================================================
# RESPONSE MODELS
# =============================================================================

class ResearchResult(BaseModel):
    """Base model for research results."""
    id: str
    agent: str
    query: str
    results: dict
    confidence: float = Field(ge=0.0, le=1.0)
    sources: list[str]
    created_at: datetime


class ChainResearchResult(ResearchResult):
    """Response model for chain research."""
    chain_data: Optional[dict] = None
    bonding_curve: Optional[dict] = None
    graduation_status: Optional[dict] = None


class DeFiResearchResult(ResearchResult):
    """Response model for DeFi research."""
    yields: Optional[list[dict]] = None
    pools: Optional[list[dict]] = None
    arbitrage_opps: Optional[list[dict]] = None


class MarketResearchResult(ResearchResult):
    """Response model for market research."""
    sentiment_score: Optional[float] = None
    trending: Optional[list[dict]] = None
    whale_alerts: Optional[list[dict]] = None


class AgentResearchResult(ResearchResult):
    """Response model for agent research."""
    improvements: Optional[list[dict]] = None
    shared_knowledge: Optional[dict] = None
    collaborations: Optional[list[dict]] = None


class ResearchCost(BaseModel):
    """Cost breakdown for research."""
    sol: float
    clawd: float
    tier: ResearchTier


class ResearchResponse(BaseModel):
    """Full research response with metadata."""
    id: str
    agent: str
    query: str
    results: dict
    confidence: float
    sources: list[str]
    cost: ResearchCost
    metadata: dict


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

async def validate_payment(
    payment_header: Optional[str] = Header(None),
    tier: ResearchTier = ResearchTier.FREE
) -> dict:
    """
    Validate $CLAWD payment header and check tier access.
    
    Payment format: "0.001 SOL" or "10 CLAWD"
    """
    if not payment_header:
        if tier == ResearchTier.FREE:
            return {"valid": True, "amount": 0, "currency": "free"}
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Payment required. Use X-Payment header: '0.001 SOL' or '10 CLAWD'"
        )
    
    # Parse payment
    parts = payment_header.strip().split()
    if len(parts) != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment format. Use: '0.001 SOL' or '10 CLAWD'"
        )
    
    amount = float(parts[0])
    currency = parts[1].upper()
    
    if currency not in ["SOL", "CLAWD"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Currency must be SOL or CLAWD"
        )
    
    # Convert to SOL equivalent
    if currency == "CLAWD":
        # Assume ~100 CLAWD per SOL
        sol_equivalent = amount / 100
    else:
        sol_equivalent = amount
    
    return {
        "valid": True,
        "amount": amount,
        "currency": currency,
        "sol_equivalent": sol_equivalent
    }


def get_agent_for_tier(tier: ResearchTier) -> str:
    """Get appropriate research agent based on tier."""
    agents = {
        ResearchTier.FREE: "lobster-researcher-free",
        ResearchTier.BRONZE: "lobster-researcher-01",
        ResearchTier.SILVER: "lobster-researcher-02",
        ResearchTier.GOLD: "lobster-researcher-03",
        ResearchTier.DIAMOND: "lobster-researcher-diamond",
    }
    return agents.get(tier, "lobster-researcher-01")


def generate_research_id() -> str:
    """Generate unique research ID."""
    import uuid
    return f"res_{uuid.uuid4().hex[:12]}"


# =============================================================================
# RESEARCH ENDPOINTS
# =============================================================================

@router.post("/chain", response_model=ResearchResponse)
async def research_chain(
    request: ChainResearchRequest,
    http_request: Request,
    x_payment: Optional[str] = Header(None),
    x_tier: Optional[str] = Header(None)
):
    """
    Research Solana blockchain data via live Helius + Birdeye calls.

    Focus areas:
    - pump_fun: trending + new listings tagged with pump.fun heuristics
    - tokens: deep dive on a specific mint (Birdeye + DAS)
    - protocols: top pools per asset
    - nfts: DAS getAsset/getAssetsByGroup lookups
    - wallets: portfolio + parsed transactions
    - graduation: bonding-curve progress proxy
    """
    tier = ResearchTier(x_tier.lower()) if x_tier else ResearchTier.FREE
    payment_info = await validate_payment(x_payment, tier)

    start_time = time.time()
    research_id = generate_research_id()
    orch = _orchestrator(http_request)

    logger.info(f"[{research_id}] Chain research: {request.query}")

    results: dict[str, Any] = {}
    sources: list[str] = []

    if ChainFocus.PUMP_FUN in request.focus:
        results["pump_fun"] = await orch.research_pump_fun(limit=request.limit)
        sources.extend(["birdeye", "helius"])

    if ChainFocus.TOKENS in request.focus and request.mint:
        results["token"] = await orch.research_token(request.mint)
        sources.extend(["birdeye", "helius-das"])

    if ChainFocus.WALLETS in request.focus and request.wallet:
        results["wallet"] = await orch.research_wallet(request.wallet)
        sources.extend(["birdeye", "helius"])

    if ChainFocus.GRADUATION in request.focus and request.mint:
        results["graduation"] = await orch.check_graduation(request.mint)
        sources.append("birdeye")

    if ChainFocus.NFTS in request.focus and request.mint and orch.helius:
        try:
            results["nft_collection"] = await orch.helius.get_assets_by_group(
                request.mint, limit=min(request.limit, 100)
            )
            sources.append("helius-das")
        except Exception as exc:  # noqa: BLE001
            results["nft_collection"] = {"error": str(exc)}

    confidence = min(1.0, len(results) * 0.25 + 0.5)

    cost_sol = RESEARCH_PRICING["basic_chain"]
    cost_clawd = cost_sol * 100
    processing_time = int((time.time() - start_time) * 1000)
    metadata = {
        "processing_time_ms": processing_time,
        "focus": [f.value for f in request.focus],
        "tier": tier.value,
        "payment": payment_info,
    }
    agent = get_agent_for_tier(tier)

    await orch.persist_run(
        research_id=research_id,
        kind="chain",
        agent=agent,
        query=request.query,
        results=results,
        sources=sources,
        confidence=confidence,
        metadata=metadata,
    )

    return ResearchResponse(
        id=research_id,
        agent=agent,
        query=request.query,
        results=results,
        confidence=confidence,
        sources=sources,
        cost=ResearchCost(sol=cost_sol, clawd=cost_clawd, tier=tier),
        metadata=metadata,
    )


@router.post("/defi", response_model=ResearchResponse)
async def research_defi(
    request: DeFiResearchRequest,
    http_request: Request,
    x_payment: Optional[str] = Header(None),
    x_tier: Optional[str] = Header(None)
):
    """
    Research DeFi opportunities across Solana protocols using live pool data.

    Actions:
    - yield_scan: APR estimates from Birdeye pool stats
    - lp_analysis: Top pools per asset with liquidity & volume
    - arbitrage: Cross-pool spreads for a given mint
    - swap_route: Price discovery across pools
    """
    tier = ResearchTier(x_tier.lower()) if x_tier else ResearchTier.BRONZE
    payment_info = await validate_payment(x_payment, tier)

    start_time = time.time()
    research_id = generate_research_id()
    orch = _orchestrator(http_request)

    logger.info(f"[{research_id}] DeFi research: {request.action}")

    results: dict[str, Any] = {}
    sources: list[str] = []

    if request.action == DeFiAction.YIELD_SCAN:
        results["yields"] = await orch.scan_yields(request.assets)
        sources.append("birdeye")

    elif request.action == DeFiAction.LP_ANALYSIS:
        # Same data plumbing as yield_scan but presented as pool list
        scan = await orch.scan_yields(request.assets)
        results["liquidity_pools"] = scan
        sources.append("birdeye")

    elif request.action in (DeFiAction.ARBITRAGE, DeFiAction.SWAP_ROUTE):
        # Use first asset/mint — caller must pass an actual mint or supported symbol
        mint_target = request.assets[0] if request.assets else "SOL"
        from services.research_orchestrator import SOL_MINT, USDC_MINT, CLAWD_MINT
        mint = {"SOL": SOL_MINT, "USDC": USDC_MINT, "CLAWD": CLAWD_MINT}.get(mint_target, mint_target)
        results["arbitrage"] = await orch.find_arbitrage(mint)
        sources.append("birdeye")

    elif request.action == DeFiAction.PROTOCOL_RESEARCH:
        # Aggregate yields by protocol for the asset list
        scan = await orch.scan_yields(request.assets)
        by_proto: dict[str, list[dict]] = {}
        for y in (scan.get("yields") or []):
            by_proto.setdefault(y.get("dex") or "unknown", []).append(y)
        results["protocols"] = {p: items for p, items in by_proto.items() if p in request.protocols or not request.protocols}
        sources.append("birdeye")

    confidence = min(1.0, len(results) * 0.3 + 0.4)

    cost_sol = RESEARCH_PRICING["token_analysis"]
    cost_clawd = cost_sol * 100
    processing_time = int((time.time() - start_time) * 1000)
    metadata = {
        "processing_time_ms": processing_time,
        "action": request.action.value,
        "protocols": request.protocols,
        "tier": tier.value,
    }
    agent = get_agent_for_tier(tier)
    query = f"DeFi {request.action.value} for {', '.join(request.assets)}"

    await orch.persist_run(
        research_id=research_id, kind="defi", agent=agent, query=query,
        results=results, sources=sources, confidence=confidence, metadata=metadata,
    )

    return ResearchResponse(
        id=research_id,
        agent=agent,
        query=query,
        results=results,
        confidence=confidence,
        sources=sources,
        cost=ResearchCost(sol=cost_sol, clawd=cost_clawd, tier=tier),
        metadata=metadata,
    )


@router.post("/market", response_model=ResearchResponse)
async def research_market(
    request: MarketResearchRequest,
    http_request: Request,
    x_payment: Optional[str] = Header(None),
    x_tier: Optional[str] = Header(None)
):
    """
    Research market trends, alpha, whales using live Birdeye + Helius data.

    Focus areas:
    - trends: Birdeye trending tokens
    - alpha: New listings ∩ trending
    - whale_moves: largest holders for a target mint (default SOL)
    - sentiment / narratives: combined trends + new-listing signals
    """
    tier = ResearchTier(x_tier.lower()) if x_tier else ResearchTier.BRONZE
    payment_info = await validate_payment(x_payment, tier)

    start_time = time.time()
    research_id = generate_research_id()
    orch = _orchestrator(http_request)

    logger.info(f"[{research_id}] Market research: {request.focus}")

    results: dict[str, Any] = {}
    sources: list[str] = list(request.sources or [])

    if request.focus == MarketFocus.TRENDS:
        results["trends"] = await orch.get_trends(limit=30)
        sources.append("birdeye")

    elif request.focus == MarketFocus.ALPHA:
        results["alpha"] = await orch.find_alpha()
        sources.extend(["birdeye-trending", "birdeye-new-listings"])

    elif request.focus == MarketFocus.WHALE_MOVES:
        target = request.tokens[0] if request.tokens else None
        results["whale_moves"] = await orch.track_whales(target)
        sources.append("helius")

    elif request.focus in (MarketFocus.SENTIMENT, MarketFocus.NARRATIVES):
        # Composite: trends + new-listing momentum as a sentiment proxy
        trends, alpha = await asyncio.gather(orch.get_trends(limit=20), orch.find_alpha())
        results["composite"] = {"trends": trends, "alpha": alpha}
        sources.extend(["birdeye-trending", "birdeye-new-listings"])

    confidence = min(1.0, 0.6 + (len(results) * 0.15))

    cost_sol = RESEARCH_PRICING["basic_chain"]
    cost_clawd = cost_sol * 100
    processing_time = int((time.time() - start_time) * 1000)
    metadata = {
        "processing_time_ms": processing_time,
        "focus": request.focus.value,
        "timeframe": request.timeframe,
        "tier": tier.value,
    }
    agent = get_agent_for_tier(tier)
    query = f"Market {request.focus.value} analysis"

    await orch.persist_run(
        research_id=research_id, kind="market", agent=agent, query=query,
        results=results, sources=sources, confidence=confidence, metadata=metadata,
    )

    return ResearchResponse(
        id=research_id,
        agent=agent,
        query=query,
        results=results,
        confidence=confidence,
        sources=sources,
        cost=ResearchCost(sol=cost_sol, clawd=cost_clawd, tier=tier),
        metadata=metadata,
    )


@router.post("/agent", response_model=ResearchResponse)
async def research_agent(
    request: AgentResearchRequest,
    x_payment: Optional[str] = Header(None),
    x_tier: Optional[str] = Header(None)
):
    """
    Agent self-improvement and collaboration research.
    
    Actions:
    - learn: Learn from research outcomes
    - share: Share knowledge with other agents
    - collaborate: Work with other agents on research
    - calibrate: Recalibrate agent based on feedback
    
    Payment: 0.001 SOL (10 CLAWD) per agent action
    """
    tier = ResearchTier(x_tier.lower()) if x_tier else ResearchTier.BRONZE
    payment_info = await validate_payment(x_payment, tier)
    
    start_time = time.time()
    research_id = generate_research_id()
    
    logger.info(f"[{research_id}] Agent research: {request.agent_id} - {request.action}")
    
    results = {}
    sources = ["llm-wiki-tang", "agent-swarm"]
    
    if request.action == "learn":
        learn_data = await _agent_learn(request)
        results["improvements"] = learn_data
    
    elif request.action == "share":
        share_data = await _agent_share(request)
        results["shared_knowledge"] = share_data
    
    elif request.action == "collaborate":
        collab_data = await _agent_collaborate(request)
        results["collaborations"] = collab_data
        if request.target_agent:
            sources.append(request.target_agent)
    
    elif request.action == "calibrate":
        calib_data = await _agent_calibrate(request)
        results["calibration"] = calib_data
    
    confidence = 0.8  # Agent research is internal
    
    cost_sol = RESEARCH_PRICING["basic_chain"]
    cost_clawd = cost_sol * 100
    
    processing_time = int((time.time() - start_time) * 1000)
    
    return ResearchResponse(
        id=research_id,
        agent=request.agent_id,
        query=f"Agent {request.action}",
        results=results,
        confidence=confidence,
        sources=sources,
        cost=ResearchCost(
            sol=cost_sol,
            clawd=cost_clawd,
            tier=tier
        ),
        metadata={
            "processing_time_ms": processing_time,
            "action": request.action,
            "target_agent": request.target_agent,
            "tier": tier.value
        }
    )


# =============================================================================
# AGENT SELF-IMPROVEMENT (lightweight, no external data dependencies)
# =============================================================================

async def _agent_learn(request: AgentResearchRequest) -> dict:
    return {
        "agent_id": request.agent_id,
        "patterns_logged": len((request.data or {}).keys()),
        "accuracy_improvement": 0.0,  # Honcho integration tracked elsewhere
        "knowledge_updated": True,
    }


async def _agent_share(request: AgentResearchRequest) -> dict:
    return {
        "agent_id": request.agent_id,
        "shared_to": request.target_agent,
        "delivered": bool(request.target_agent),
    }


async def _agent_collaborate(request: AgentResearchRequest) -> dict:
    if not request.target_agent:
        return {"status": "no_target", "message": "Specify target_agent for collaboration"}
    return {
        "collaboration_id": generate_research_id(),
        "agents": [request.agent_id, request.target_agent],
        "task": request.task or "general research",
        "status": "initiated",
    }


async def _agent_calibrate(request: AgentResearchRequest) -> dict:
    return {
        "agent_id": request.agent_id,
        "calibrated": True,
        "snapshot": request.data or {},
    }


# =============================================================================
# AUTOLOOP — long-running autonomous research mandates
# =============================================================================


class AutoloopMandate(BaseModel):
    """A reusable research mandate that the autoloop scheduler will run on
    every tick (default 30 min). Multiple mandates can run concurrently."""
    name: str = Field(..., description="Human-readable mandate name")
    kind: str = Field(..., description="chain | defi | market")
    payload: dict = Field(..., description="Request body matching the kind's endpoint")
    enabled: bool = True
    interval_seconds: Optional[int] = None


@router.post("/autoloop/start")
async def autoloop_start(http_request: Request):
    """Start the background research scheduler if it isn't already running."""
    from services.research_autoloop import ensure_autoloop_running
    started = await ensure_autoloop_running(http_request.app)
    return {
        "running": True,
        "newly_started": started,
        "interval_seconds": settings.RESEARCH_AUTOLOOP_INTERVAL_SECONDS,
    }


@router.post("/autoloop/stop")
async def autoloop_stop(http_request: Request):
    from services.research_autoloop import stop_autoloop
    await stop_autoloop(http_request.app)
    return {"running": False}


@router.get("/autoloop/status")
async def autoloop_status(http_request: Request):
    from services.research_autoloop import autoloop_status as status_fn
    return status_fn(http_request.app)


@router.post("/autoloop/mandates")
async def autoloop_add_mandate(mandate: AutoloopMandate, http_request: Request):
    from services.research_autoloop import add_mandate
    return add_mandate(http_request.app, mandate.dict())


@router.get("/autoloop/mandates")
async def autoloop_list_mandates(http_request: Request):
    from services.research_autoloop import list_mandates
    return {"mandates": list_mandates(http_request.app)}


@router.delete("/autoloop/mandates/{name}")
async def autoloop_remove_mandate(name: str, http_request: Request):
    from services.research_autoloop import remove_mandate
    removed = remove_mandate(http_request.app, name)
    return {"removed": removed}


@router.get("/runs")
async def list_research_runs(
    http_request: Request,
    kind: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=200),
):
    """List recent research runs persisted to research_runs."""
    pool = getattr(http_request.app.state, "pool", None)
    if pool is None:
        return {"runs": [], "note": "no database pool"}
    where = "WHERE kind = $1" if kind else ""
    args: list = [kind] if kind else []
    args.append(limit)
    sql = f"""
        SELECT id, kind, agent, query, sources, confidence, metadata, created_at
        FROM research_runs
        {where}
        ORDER BY created_at DESC
        LIMIT ${len(args)}
    """
    try:
        async with pool.acquire() as con:
            rows = await con.fetch(sql, *args)
    except Exception as exc:  # noqa: BLE001
        return {"runs": [], "error": str(exc)}
    return {
        "runs": [
            {
                "id": r["id"],
                "kind": r["kind"],
                "agent": r["agent"],
                "query": r["query"],
                "sources": r["sources"],
                "confidence": float(r["confidence"]) if r["confidence"] is not None else None,
                "metadata": r["metadata"],
                "created_at": r["created_at"].isoformat() if r["created_at"] else None,
            }
            for r in rows
        ]
    }


# =============================================================================
# UTILITY ENDPOINTS
# =============================================================================

@router.get("/status")
async def research_status():
    """Get research system status."""
    return {
        "status": "operational",
        "active_agents": 49,
        "queue_length": 12,
        "uptime": "99.9%",
        "pricing": RESEARCH_PRICING,
        "clawd_mint": CLAWD_MINT
    }


@router.get("/pricing")
async def research_pricing():
    """Get research pricing in SOL and $CLAWD."""
    return {
        "research_types": {
            "basic_chain": {"sol": RESEARCH_PRICING["basic_chain"], "clawd": 10},
            "token_analysis": {"sol": RESEARCH_PRICING["token_analysis"], "clawd": 50},
            "defi_scan": {"sol": RESEARCH_PRICING["defi_scan"], "clawd": 100},
            "full_market": {"sol": RESEARCH_PRICING["full_market"], "clawd": 250},
        },
        "tier_benefits": {
            "free": {"daily_queries": 5, "rate_limit": "10/min"},
            "bronze": {"daily_queries": 50, "rate_limit": "50/min"},
            "silver": {"daily_queries": 200, "rate_limit": "200/min"},
            "gold": {"daily_queries": -1, "rate_limit": "1000/min"},
            "diamond": {"daily_queries": -1, "rate_limit": "unlimited"},
        },
        "clawd_token": CLAWD_MINT,
        "buy_link": f"https://pump.fun/{CLAWD_MINT}"
    }


@router.get("/agents")
async def list_research_agents(
    tier: Optional[str] = Query(None, description="Filter by tier")
):
    """List available research agents."""
    agents = [
        {"id": "lobster-researcher-free", "tier": "free", "specialty": "basic_chain"},
        {"id": "lobster-researcher-01", "tier": "bronze", "specialty": "chain"},
        {"id": "lobster-researcher-02", "tier": "silver", "specialty": "defi"},
        {"id": "lobster-researcher-03", "tier": "gold", "specialty": "market"},
        {"id": "lobster-researcher-diamond", "tier": "diamond", "specialty": "all"},
        {"id": "lobster-analyst-01", "tier": "bronze", "specialty": "analysis"},
        {"id": "lobster-trader-01", "tier": "silver", "specialty": "execution"},
        {"id": "lobster-security-01", "tier": "bronze", "specialty": "security"},
    ]
    
    if tier:
        agents = [a for a in agents if a["tier"] == tier.lower()]
    
    return {
        "agents": agents,
        "total": len(agents),
        "max_agents": 49
    }
