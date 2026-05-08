---
description: >
  Search Sentry issues by keyword, error message, or function name.
  Use when developer says "find sentry errors about X", "search for null errors",
  "any issues with checkout?".
---

Use sentry_search_issues with query = "$ARGUMENTS".

Display results in the same numbered format as triage.
If no results, suggest alternative search terms.
If $ARGUMENTS is empty, ask what to search for.
