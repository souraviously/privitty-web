#!/usr/bin/env bash
# =============================================================================
# Privitty Web — AWS Amplify Deployment Setup (macOS/Linux)
#
# Supports:
#   - Creating a new Amplify app OR updating an existing app
#   - Supabase/Neon PostgreSQL DATABASE_URL and optional DIRECT_URL
#   - Optional Supabase public variables (only if the application uses them)
#   - Private S3 bucket and narrowly scoped IAM permissions
#   - Optional database migration and seed steps (both opt-in)
#
# IMPORTANT:
#   1. Review the environment variable names against your application code.
#   2. Do not commit this script's output files or any credentials.
#   3. Run against production only after taking a database backup.
# =============================================================================

set -Eeuo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { printf "${CYAN}ℹ ${RESET}%s\n" "$*"; }
success() { printf "${GREEN}✔ ${RESET}%s\n" "$*"; }
warn()    { printf "${YELLOW}⚠ ${RESET}%s\n" "$*"; }
error()   { printf "${RED}✖ ${RESET}%s\n" "$*" >&2; exit 1; }
header()  { printf "\n${BOLD}${CYAN}══ %s ══${RESET}\n" "$*"; }

on_error() {
  local exit_code=$?
  printf "${RED}✖ Deployment setup failed at line %s (exit %s).\n" \
    "${BASH_LINENO[0]:-unknown}" "$exit_code" >&2
  exit "$exit_code"
}
trap on_error ERR

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || error "'$1' is required. $2"
}

# Safe prompt helpers: no eval, so values containing $, quotes, or spaces
# are not interpreted as shell code.
prompt() {
  local var_name="$1" label="$2" default="${3:-}" current=""
  current="${!var_name:-}"
  if [[ -n "$current" ]]; then
    info "$label is already set."
    return
  fi

  if [[ -n "$default" ]]; then
    read -r -p "  $label [$default]: " REPLY
    REPLY="${REPLY:-$default}"
  else
    read -r -p "  $label: " REPLY
  fi
  printf -v "$var_name" '%s' "$REPLY"
}

prompt_secret() {
  local var_name="$1" label="$2" current=""
  current="${!var_name:-}"
  if [[ -n "$current" ]]; then
    info "$label is already set."
    return
  fi
  read -r -s -p "  $label (hidden): " REPLY
  printf '\n'
  printf -v "$var_name" '%s' "$REPLY"
}

prompt_optional_secret() {
  local var_name="$1" label="$2" current=""
  current="${!var_name:-}"
  if [[ -n "$current" ]]; then
    info "$label is already set."
    return
  fi
  read -r -s -p "  $label (optional, press Enter to skip): " REPLY
  printf '\n'
  printf -v "$var_name" '%s' "$REPLY"
}

confirm_yes() {
  local label="$1" answer=""
  read -r -p "  $label [y/N] " answer
  [[ "$answer" =~ ^[Yy]$ ]]
}

# ─── 0. Prerequisites ────────────────────────────────────────────────────────
header "Checking prerequisites"

require_cmd aws "Install AWS CLI v2 and run aws configure."
require_cmd git "Install Xcode Command Line Tools or Git."
require_cmd node "Install Node.js 20 LTS."
require_cmd npm "Install Node.js (npm is included)."
