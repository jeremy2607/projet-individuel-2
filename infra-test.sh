#!/usr/bin/env bash
# Tests d'infrastructure : vérifie que la stack Docker est opérationnelle.
set -euo pipefail

fail() { echo "❌ $1"; exit 1; }
ok()   { echo "✅ $1"; }

echo "== Tests d'infrastructure =="

# 1. La base est-elle "healthy" ?
status=$(docker inspect -f '{{.State.Health.Status}}' ynov-db 2>/dev/null || echo "absent")
[ "$status" = "healthy" ] || fail "db non healthy (status=$status)"
ok "db healthy"

# 2. L'API répond-elle ?
code=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/)
[ "$code" = "200" ] || fail "API / => HTTP $code"
ok "API / => 200"

code=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/users)
[ "$code" = "200" ] || fail "API /users => HTTP $code"
ok "API /users => 200"

# 3. Le front est-il servi ?
code=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8081/)
[ "$code" = "200" ] || fail "front / => HTTP $code"
ok "front / => 200"

# 4. Le reverse-proxy /api fonctionne-t-il ?
code=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8081/api/users)
[ "$code" = "200" ] || fail "proxy /api/users => HTTP $code"
ok "proxy /api/users => 200"

echo "== Infrastructure OK =="
