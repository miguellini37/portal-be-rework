#!/usr/bin/env bash
set -euo pipefail

# Create a realm admin user in the portal-jobs realm.
# Usage: ./keycloak/create-realm-admin.sh
#
# Requires: KEYCLOAK_ADMIN, KEYCLOAK_ADMIN_PASSWORD in .env (or exported)
# The Keycloak container (portal-keycloak) must be running.

REALM="portal-jobs"
USER_EMAIL="mike.silver@portaljobs.net"
USER_FIRST="Mike"
USER_LAST="Silver"
TEMP_PASSWORD="ChangeMe123!"

# Load .env if present
if [ -f .env ]; then
  set -a; source .env; set +a
fi

KC_CONTAINER="portal-keycloak"
KCADM="/opt/keycloak/bin/kcadm.sh"

echo "=== Authenticating to Keycloak ==="
docker exec "$KC_CONTAINER" "$KCADM" config credentials \
  --server http://localhost:8080 \
  --realm master \
  --user "${KEYCLOAK_ADMIN}" \
  --password "${KEYCLOAK_ADMIN_PASSWORD}"

echo "=== Creating user: ${USER_EMAIL} ==="
USER_ID=$(docker exec "$KC_CONTAINER" "$KCADM" create users \
  -r "$REALM" \
  -s "username=${USER_EMAIL}" \
  -s "email=${USER_EMAIL}" \
  -s "firstName=${USER_FIRST}" \
  -s "lastName=${USER_LAST}" \
  -s "enabled=true" \
  -s "emailVerified=true" \
  -s 'attributes.permission=["admin"]' \
  -i 2>&1) || {
    # User might already exist — try to find them
    echo "User may already exist, looking up..."
    USER_ID=$(docker exec "$KC_CONTAINER" "$KCADM" get users \
      -r "$REALM" \
      -q "email=${USER_EMAIL}" \
      --fields id --format csv --noquotes | tail -1)
  }

echo "User ID: ${USER_ID}"

echo "=== Setting temporary password ==="
docker exec "$KC_CONTAINER" "$KCADM" set-password \
  -r "$REALM" \
  --userid "${USER_ID}" \
  --new-password "${TEMP_PASSWORD}" \
  --temporary

echo "=== Assigning realm-admin role ==="
# Get the realm-management client ID
REALM_MGMT_ID=$(docker exec "$KC_CONTAINER" "$KCADM" get clients \
  -r "$REALM" \
  -q "clientId=realm-management" \
  --fields id --format csv --noquotes | tail -1)

docker exec "$KC_CONTAINER" "$KCADM" add-roles \
  -r "$REALM" \
  --userid "${USER_ID}" \
  --cclientid "realm-management" \
  --rolename "realm-admin"

echo ""
echo "=== Done ==="
echo "Email:    ${USER_EMAIL}"
echo "Password: ${TEMP_PASSWORD} (temporary — you'll be prompted to change on first login)"
echo "Role:     realm-admin (full admin of ${REALM} realm)"
