# sentry

Sentry is a Claude Code plugin that lets developers triage, search, and fix live production errors directly inside Claude Code. It connects to the Sentry REST API so you can inspect issues, fetch stack traces, and resolve incidents without leaving your editor.

## Prerequisites

- Node.js 18+
- A Sentry account with access to the target organization and project
- A Sentry API auth token (Settings > API Keys)

## Installation

```
/plugin install sentry@claude-plugins-official
```

## Configuration

The plugin prompts for these fields on install:

- Sentry Auth Token: API token created in Sentry (Settings > API Keys)
- Organization Slug: the org slug in your Sentry URL
- Default Project Slug: optional default project slug (override per command)

## Usage

```
/sentry:triage
/sentry:triage my-project
/sentry:fix ISSUE-123
/sentry:search "null pointer checkout"
```

## Background Monitor

A lightweight monitor polls Sentry every 60 seconds for new critical issues. When detected, it prints an alert message recommending /sentry:triage.

## Security

The auth token is stored in the system keychain via Claude Code userConfig and never written to plain text files.

## License

MIT
