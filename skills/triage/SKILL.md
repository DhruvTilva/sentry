---
description: >
  List and summarize the top unresolved Sentry production errors for the current project.
  Use when the developer asks "what's breaking", "show production errors",
  "what are the top issues", or "triage sentry".
---

Use the sentry_list_issues MCP tool to fetch the top 10 unresolved issues.

Display a numbered list in this format:
#N  [LEVEL] ISSUE-ID  Title  (X events, last seen: DATE)
    File: culprit
    Link: permalink

After listing, ask: "Which issue would you like me to investigate and fix?"

If $ARGUMENTS is provided, treat it as a project slug override and pass it to the tool.
