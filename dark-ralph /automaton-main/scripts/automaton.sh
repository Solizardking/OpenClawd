#!/bin/sh
# OpenClawd Automaton Installer — thin wrapper
# curl -fsSL https://install.solanaclawd.com/automaton.sh | sh
set -e
git clone https://github.com/clawdsolana/OpenClawd.git /opt/openclawd
cd /opt/openclawd/dark-ralph/automaton-main
npm install && npm run build
exec node dist/index.js --run
