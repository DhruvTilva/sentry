---
description: >
  Fetch a specific Sentry issue by ID and propose a targeted code fix.
  Use when the developer provides an issue ID, or after triage when they select an issue.
  Also use when they say "fix this sentry error", "debug issue ISSUE-123",
  "what caused this crash".
---

Step 1: Use sentry_get_issue with issue_id = "$ARGUMENTS" to fetch full issue details
        including the latest stack trace.

Step 2: Read the stack trace carefully. Identify the exact file and line number of the error.

Step 3: Use the Read tool to read the actual source file from the local codebase.

Step 4: Analyze the root cause combining the stack trace + actual code.

Step 5: Propose a specific, minimal code fix. Show before/after diff format.

Step 6: Ask the developer if they want you to apply the fix directly.

If $ARGUMENTS is empty, ask the developer for the issue ID first.
