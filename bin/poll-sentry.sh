#!/bin/bash
# Polls Sentry every 60 seconds for new critical/fatal issues
while true; do
  sleep 60
  RESULT=$(curl -sf \
    -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
    "https://sentry.io/api/0/projects/$SENTRY_ORG/$SENTRY_PROJECT/issues/?level=critical&status=unresolved&limit=3")
  if [ -n "$RESULT" ]; then
    COUNT=$(echo "$RESULT" | grep -o '"id"' | wc -l | tr -d ' ')
    if [ "$COUNT" -gt "0" ]; then
      echo "[SENTRY ALERT] $COUNT critical/fatal issue(s) detected. Run /sentry:triage to investigate."
    fi
  fi
done
