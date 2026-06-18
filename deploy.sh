#!/usr/bin/env bash
# Server-side deploy for cwops-app (now a Flask app). Run from /var/www/cwops-app.
#   ./deploy.sh
set -euo pipefail
cd "$(dirname "$0")"

VENV="${CWOPS_VENV:-/home/kenny/venvs/cwops-app}"

git pull --ff-only
"$VENV/bin/pip" install -q -r requirements.txt
"$VENV/bin/python" -m scripts.init_db          # idempotent: create/upgrade schema
sudo systemctl restart cwops-app
echo "cwops-app deployed and restarted."
