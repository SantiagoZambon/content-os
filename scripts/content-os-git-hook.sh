#!/usr/bin/env bash
set -euo pipefail

# Git hook autoconsciente: se comporta según el nombre bajo el que se invocó.
# Instalar como .git/hooks/post-merge y .git/hooks/post-checkout (ambos iguales).

PROJECT_DIR="/srv/apps/content-os"
DOCKER_COMPOSE="$PROJECT_DIR/docker-compose.yaml"

HOOK_NAME="$(basename "$0")"
log() { echo "[content-os-$HOOK_NAME] $*"; }

refresh() {
    if [[ "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)" != "main" ]]; then
        return 0
    fi
    if [[ ! -f "$DOCKER_COMPOSE" ]]; then
        log "docker-compose.yaml ausente — nada que refrescar."
        return 0
    fi
    log "Reconstructing image and restarting container…"
    (cd "$PROJECT_DIR" && docker compose -f "$DOCKER_COMPOSE" up -d --build 2>&1) || {
        log "WARNING: docker compose rebuild failed — check logs."
        return 1
    }
    log "Container refreshed."
}

# post-checkout: $3 == 1 cuando cambia de rama (0 en file checkout normal)
if [[ "$HOOK_NAME" == "post-checkout" && "${3:-0}" -ne 1 ]]; then
    log "Not a branch switch — skipping."
    exit 0
fi

refresh
