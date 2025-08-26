#!/usr/bin/env sh
set -e

cat >/usr/share/nginx/html/config.js <<'CFG'
window.__BOOKVERSE_CONFIG__ = {
  env: "${BOOKVERSE_ENV:-DEV}",
  inventoryBaseUrl: "${INVENTORY_BASE_URL:-}",
  recommendationsBaseUrl: "${RECOMMENDATIONS_BASE_URL:-}",
  checkoutBaseUrl: "${CHECKOUT_BASE_URL:-}"
};
CFG

exec nginx -g 'daemon off;'


