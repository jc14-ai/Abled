#!/usr/bin/env bash
# Deploy the abled contract to Stellar testnet, then write the contract
# ID into web/.env.local so the frontend can call it.
#
# Usage:  ./scripts/deploy-abled.sh [identityName]   (default identity: workshop)
set -euo pipefail

IDENTITY="${1:-workshop}"
NETWORK="testnet"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WASM="target/wasm32v1-none/release/abled.wasm"
ENV_FILE="$ROOT/web/.env.local"

cd "$ROOT"

# 1. Ensure a funded testnet identity exists
if ! stellar keys ls | grep -qx "$IDENTITY"; then
  echo "Creating + funding testnet identity '$IDENTITY'..."
  stellar keys generate "$IDENTITY" --network "$NETWORK" --fund
fi

# Get the public key of the identity
ADMIN_ADDRESS=$(stellar keys address "$IDENTITY")
echo "Admin Address: $ADMIN_ADDRESS"

# 2. Build the contract to wasm
echo "Building contract..."
stellar contract build

# 3. Deploy to testnet (returns the contract ID, starting with C...)
echo "Deploying to $NETWORK..."
# For Protocol 22+ contracts with a __constructor, we pass arguments to deploy
# The abled contract __constructor takes 'admin: Address'
CONTRACT_ID=$(stellar contract deploy \
  --wasm "$WASM" \
  --source-account "$IDENTITY" \
  --network "$NETWORK" \
  -- \
  --admin "$ADMIN_ADDRESS")
echo "Deployed contract ID: $CONTRACT_ID"

# 4. Write NEXT_PUBLIC_ABLED_CONTRACT_ID into web/.env.local
if [ -f "$ENV_FILE" ]; then
  # Remove existing entry if it exists
  grep -v '^NEXT_PUBLIC_ABLED_CONTRACT_ID=' "$ENV_FILE" > "$ENV_FILE.tmp" || true
  mv "$ENV_FILE.tmp" "$ENV_FILE"
else
  touch "$ENV_FILE"
fi
echo "NEXT_PUBLIC_ABLED_CONTRACT_ID=$CONTRACT_ID" >> "$ENV_FILE"
echo ""
echo "Wrote NEXT_PUBLIC_ABLED_CONTRACT_ID=$CONTRACT_ID to web/.env.local"
echo "Restart 'npm run dev' to pick up the new contract ID."
