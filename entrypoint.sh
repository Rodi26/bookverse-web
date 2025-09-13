#!/usr/bin/env sh
set -e

cat >/usr/share/nginx/html/config.js <<CFG
window.__BOOKVERSE_CONFIG__ = {
  env: "${BOOKVERSE_ENV:-DEV}",
  platformBaseUrl: "${PLATFORM_BASE_URL:-}",
  inventoryBaseUrl: "${INVENTORY_BASE_URL:-}",
  recommendationsBaseUrl: "${RECOMMENDATIONS_BASE_URL:-}",
  checkoutBaseUrl: "${CHECKOUT_BASE_URL:-}",
  oidc: ${OIDC_ENABLED:-null}
};
CFG

exec nginx -g 'daemon off;'


