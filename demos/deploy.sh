#!/bin/bash
# ============================================================
#  RavyaWorks Demo Deploy Script
#  Deploys a demo site to ravyaworks.com/demos/<client>/
#
#  Usage:
#    ./deploy.sh <demo-name>              Deploy a single demo
#    ./deploy.sh all                      Deploy all demos
#    ./deploy.sh --list                   List available demos
#    ./deploy.sh --dry-run <demo>         Preview what would be uploaded
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEPLOY_CONFIG="$SCRIPT_DIR/deploy.conf"

# Default config (override in deploy.conf)
REMOTE_HOST="${RW_HOST:-ravyaworks.com}"
REMOTE_USER="${RW_USER:-deploy}"
REMOTE_BASE="${RW_BASE:-/var/www/ravyaworks.com/demos}"
SSH_KEY="${RW_SSH_KEY:-}"
LOCAL_BASE="$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Load config if exists
if [ -f "$DEPLOY_CONFIG" ]; then
  source "$DEPLOY_CONFIG"
fi

# Available demos (auto-detect)
list_demos() {
  for d in "$LOCAL_BASE"/*/; do
    name=$(basename "$d")
    [ "$name" = "_framework" ] && continue
    [ -f "$d/index.html" ] && echo "$name"
  done
}

# Deploy a single demo
deploy_demo() {
  local demo="$1"
  local dry_run="${2:-false}"
  local src="$LOCAL_BASE/$demo/"
  local dest="${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_BASE}/${demo}/"

  if [ ! -f "$src/index.html" ]; then
    echo -e "${RED}Error: $src/index.html not found${NC}"
    return 1
  fi

  echo -e "${CYAN}Deploying: ${demo}${NC}"
  echo -e "  Source:  $src"
  echo -e "  Dest:   $dest"

  RSYNC_OPTS="-avz --delete --exclude='.git' --exclude='node_modules' --exclude='.DS_Store'"
  [ -n "$SSH_KEY" ] && RSYNC_OPTS="$RSYNC_OPTS -e 'ssh -i $SSH_KEY'"

  if [ "$dry_run" = "true" ]; then
    RSYNC_OPTS="$RSYNC_OPTS --dry-run"
    echo -e "${YELLOW}[DRY RUN]${NC}"
  fi

  # Create remote directory
  if [ "$dry_run" = "false" ]; then
    SSH_CMD="ssh"
    [ -n "$SSH_KEY" ] && SSH_CMD="ssh -i $SSH_KEY"
    $SSH_CMD "${REMOTE_USER}@${REMOTE_HOST}" "mkdir -p ${REMOTE_BASE}/${demo}/assets" 2>/dev/null || true
  fi

  # Sync
  # shellcheck disable=SC2086
  rsync $RSYNC_OPTS "$src" "$dest"

  if [ "$dry_run" = "false" ]; then
    echo -e "${GREEN}  Deployed: ${demo}${NC}"
  else
    echo -e "${YELLOW}  Dry run complete for: ${demo}${NC}"
  fi
}

# Generate sitemap
generate_sitemap() {
  local demos=("$@")
  local xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  for demo in "${demos[@]}"; do
    xml+="  <url>\n    <loc>https://ravyaworks.com/demos/${demo}/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n"
  done

  xml+="</urlset>"

  echo -e "$xml" > "$LOCAL_BASE/sitemap.xml"
  echo -e "${GREEN}Generated sitemap.xml with ${#demos[@]} demos${NC}"
}

# Main
case "${1:-}" in
  --list|-l)
    echo -e "${CYAN}Available demos:${NC}"
    list_demos | while read -r d; do echo "  $d"; done
    ;;
  --dry-run|-n)
    [ -z "${2:-}" ] && { echo "Usage: $0 --dry-run <demo-name>"; exit 1; }
    deploy_demo "$2" true
    ;;
  --sitemap)
    mapfile -t demos < <(list_demos)
    generate_sitemap "${demos[@]}"
    ;;
  all)
    echo -e "${CYAN}Deploying ALL demos...${NC}"
    list_demos | while read -r d; do
      deploy_demo "$d"
    done
    echo -e "${GREEN}All demos deployed.${NC}"
    ;;
  "")
    echo "Usage: $0 <demo-name> | all | --list | --dry-run <demo> | --sitemap"
    echo ""
    echo "Options:"
    echo "  <demo-name>      Deploy a single demo (e.g. restaurant)"
    echo "  all              Deploy all demos"
    echo "  --list           List available demos"
    echo "  --dry-run <demo> Preview without uploading"
    echo "  --sitemap        Generate sitemap.xml"
    exit 1
    ;;
  *)
    deploy_demo "$1"
    ;;
esac
