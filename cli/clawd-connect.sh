#!/bin/bash
# openclawd - Terminal Connection & Skills
# solanaclawd.com
# Usage: ./clawd-connect.sh <command>

# Load shared OpenClawd endpoint config (env > ~/.openclawdsolana/config.json > defaults)
__here="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
# shellcheck disable=SC1091
. "$__here/clawd-config.sh"

MARKETPLACE="$OPENCLAWD_MARKETPLACE"
GATEWAY="$OPENCLAWD_GATEWAY_BASE"
CLAWD_API="$OPENCLAWD_API_BASE"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🦞 openclawd terminal   solanaclawd.com       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

case "${1:-}" in
  # ═══ SKILLS (ClawdHub) ═══
  "skills")
    echo -e "${GREEN}→${NC} Skills Hub commands:"
    echo "  ./clawd-connect.sh skills:list"
    echo "  ./clawd-connect.sh skills:search <query>"
    echo "  ./clawd-connect.sh skills:install <slug>"
    echo ""
    echo "Or use: npx clawdhub <command>"
    ;;
  "skills:list")
    curl -s "$CLAWD_API/skills" | jq '.'
    ;;
  "skills:featured")
    curl -s "$CLAWD_API/skills/featured" | jq '.'
    ;;
  "skills:search")
    curl -s "$CLAWD_API/skills/search?q=$2" | jq '.'
    ;;
  "skills:install")
    curl -s "$CLAWD_API/skills/$2/download" -o "$2/SKILL.md"
    echo "Installed skill: $2"
    ;;

  # ═══ MARKETPLACE ═══
  "marketplace")
    echo -e "${GREEN}→${NC} Marketplace: $MARKETPLACE"
    curl -s "$CLAWD_API/marketplace/skills" | jq '.'
    ;;
  "marketplace:trending")
    curl -s "$CLAWD_API/marketplace/trending" | jq '.'
    ;;
  "marketplace:new")
    curl -s "$CLAWD_API/marketplace/new" | jq '.'
    ;;

  # ═══ AGENTS ═══
  "connect")
    echo -e "${GREEN}→${NC} Connecting to solanaclawd.com..."
    curl -s -X POST "$CLAWD_API/connect" \
      -H "Content-Type: application/json" \
      -d '{"agent":"openclawd","version":"1.0"}'
    echo ""
    ;;
  "status")
    echo -e "${GREEN}→${NC} Fetching agent status..."
    curl -s "$CLAWD_API/status" | jq '.'
    ;;
  "agents")
    echo -e "${GREEN}→${NC} Listing registered agents..."
    curl -s "$CLAWD_API/agents" | jq '.'
    ;;

  # ═══ WALLET ═══
  "wallet")
    echo -e "${GREEN}→${NC} Wallet info:"
    curl -s "$CLAWD_API/wallet" | jq '.'
    ;;
  "prices")
    echo -e "${GREEN}→${NC} Live prices:"
    curl -s "$CLAWD_API/prices" | jq '.'
    ;;

  # ═══ x402 PAYMENTS ═══
  "pay")
    echo -e "${GREEN}→${NC} x402 Payment gateway"
    echo "Usage: ./clawd-connect.sh pay <amount> <token> <recipient>"
    ;;
  "payment:supported")
    curl -s "$GATEWAY/facilitator/supported" | jq '.'
    ;;
  "payment:verify")
    curl -s -X POST "$GATEWAY/facilitator/verify" \
      -H "Content-Type: application/json" \
      -d '{"payment":"'$2'"}' | jq '.'
    ;;
  "payment:settle")
    curl -s -X POST "$GATEWAY/facilitator/settle" \
      -H "Content-Type: application/json" \
      -d '{"tx":"'$2'"}' | jq '.'
    ;;

  # ═══ HELP ═══
  "help"|"")
    echo "Commands:"
    echo ""
    echo -e "${YELLOW}SKILLS (ClawdHub):${NC}"
    echo "  skills              - Skills help"
    echo "  skills:list         - List all skills"
    echo "  skills:featured     - Featured skills"
    echo "  skills:search <q>   - Search skills"
    echo "  skills:install <s>  - Install a skill"
    echo ""
    echo -e "${YELLOW}MARKETPLACE:${NC}"
    echo "  marketplace         - Browse marketplace"
    echo "  marketplace:trending  - Trending skills"
    echo "  marketplace:new     - New skills"
    echo ""
    echo -e "${YELLOW}AGENTS:${NC}"
    echo "  connect    - Connect to solanaclawd.com"
    echo "  status     - Check agent status"
    echo "  agents     - List registered agents"
    echo ""
    echo -e "${YELLOW}WALLET:${NC}"
    echo "  wallet     - View wallet info"
    echo "  prices     - Get live token prices"
    echo ""
    echo -e "${YELLOW}x402 PAYMENTS:${NC}"
    echo "  payment:supported   - Supported tokens"
    echo "  payment:verify <id> - Verify payment"
    echo "  payment:settle <tx>  - Settle payment"
    echo ""
    echo "Examples:"
    echo "  ./clawd-connect.sh skills:search solana"
    echo "  ./clawd-connect.sh marketplace:trending"
    echo "  ./clawd-connect.sh payment:supported"
    ;;
esac
