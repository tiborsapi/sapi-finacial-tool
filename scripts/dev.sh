#!/usr/bin/env sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
compose_file="$script_dir/../compose.yaml"
action=${1:-up}

case "$action" in
  up)       set -- up --build ;;
  backend)  set -- up --build backend ;;
  frontend) set -- up --build frontend ;;
  down)     set -- down ;;
  logs)     set -- logs --follow ;;
  build)    set -- build ;;
  *)
    printf 'Usage: %s [up|backend|frontend|down|logs|build]\n' "$0" >&2
    exit 2
    ;;
esac

exec docker compose --file "$compose_file" "$@"
