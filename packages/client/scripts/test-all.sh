#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 OpenClawd Complete Test Suite${NC}"
echo "=================================="

# Track if any test fails
FAILED=0
SERVER_PID=""
CLIENT_PID=""

# Function to cleanup processes
cleanup() {
    if [ ! -z "$SERVER_PID" ]; then
        echo -e "\n${YELLOW}Stopping backend server...${NC}"
        kill $SERVER_PID 2>/dev/null || true
    fi
    if [ ! -z "$CLIENT_PID" ]; then
        echo -e "${YELLOW}Stopping client dev server...${NC}"
        kill $CLIENT_PID 2>/dev/null || true
    fi
    # Kill any remaining processes on ports
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
}

# Set up trap to cleanup on exit
trap cleanup EXIT INT TERM

# 1. Type Checking
echo -e "\n${YELLOW}📝 Running TypeScript Type Checking...${NC}"
cd cypress && npx tsc --noEmit --project tsconfig.json
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Type checking failed${NC}"
  FAILED=1
else
  echo -e "${GREEN}✅ Type checking passed${NC}"
fi
cd ..

# 2. Bun Unit Tests
echo -e "\n${YELLOW}🧪 Running Bun Unit Tests...${NC}"
./scripts/run-bun-tests.sh --coverage
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Bun tests failed${NC}"
  FAILED=1
else
  echo -e "${GREEN}✅ Bun tests passed${NC}"
fi

# 3. OpenClawd Core Tests - Skip in CI as they're run separately
if [ "$CI" = "true" ]; then
  echo -e "\n${YELLOW}🤖 Skipping OpenClawd Core Tests (run separately in CI)...${NC}"
else
  echo -e "\n${YELLOW}🤖 Running OpenClawd Core Tests...${NC}"
  cd ../.. && bun test
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ OpenClawd core tests failed${NC}"
    FAILED=1
  else
    echo -e "${GREEN}✅ OpenClawd core tests passed${NC}"
  fi
  cd packages/client
fi

# 4. Cypress Component Tests
echo -e "\n${YELLOW}🧩 Running Cypress Component Tests...${NC}"
npx cypress run --component
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Cypress component tests failed${NC}"
  FAILED=1
else
  echo -e "${GREEN}✅ Cypress component tests passed${NC}"
fi

# 5. Start Backend Server for E2E Tests
echo -e "\n${YELLOW}🚀 Starting Backend Server for E2E Tests...${NC}"
cd ../..
bun run start > /tmp/openclawd-server.log 2>&1 &
SERVER_PID=$!
cd packages/client

# Wait for backend server
echo -e "${YELLOW}Waiting for backend server...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend server is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend server failed to start${NC}"
        cat /tmp/openclawd-server.log
        FAILED=1
    fi
    sleep 1
done

# 6. Start Client Dev Server
echo -e "\n${YELLOW}🌐 Starting Client Dev Server...${NC}"
npx vite --port 5173 > /tmp/openclawd-client.log 2>&1 &
CLIENT_PID=$!

# Wait for client server
echo -e "${YELLOW}Waiting for client server...${NC}"
npx wait-on http://localhost:5173 -t 30000
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Client server failed to start${NC}"
  cat /tmp/openclawd-client.log
  FAILED=1
else
  echo -e "${GREEN}✅ Client server is ready${NC}"
fi

# 7. Cypress E2E Tests
if [ $FAILED -eq 0 ]; then
  echo -e "\n${YELLOW}🌐 Running Cypress E2E Tests...${NC}"
  npx cypress run --e2e
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Cypress E2E tests failed${NC}"
    FAILED=1
  else
    echo -e "${GREEN}✅ Cypress E2E tests passed${NC}"
  fi
else
  echo -e "\n${YELLOW}⚠️  Skipping E2E tests due to previous failures${NC}"
fi

# Summary
echo -e "\n=================================="
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  echo -e "${GREEN}   ✓ TypeScript checks${NC}"
  echo -e "${GREEN}   ✓ Unit tests${NC}"
  echo -e "${GREEN}   ✓ OpenClawd core tests${NC}"
  echo -e "${GREEN}   ✓ Component tests${NC}"
  echo -e "${GREEN}   ✓ E2E tests${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed!${NC}"
  exit 1
fi