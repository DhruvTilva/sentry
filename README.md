![Version](https://img.shields.io/badge/version-v1.0.0-6C5CE7?style=flat-square) ![License](https://img.shields.io/badge/license-MIT-00B894?style=flat-square) ![Node](https://img.shields.io/badge/node-18%2B-2D3436?style=flat-square) ![Platform](https://img.shields.io/badge/platform-Claude%20Code-6C5CE7?style=flat-square) ![Status](https://img.shields.io/badge/status-Active-00B894?style=flat-square)

> Fix live Sentry production errors directly inside Claude Code — no browser, no copy-paste, no context switching.

## Demo

```
> /sentry:triage

Fetching top Sentry issues...

#1  [fatal]  ISSUE-8821  TypeError: Cannot read properties of null
    File: src/checkout/payment.js line 142
    Events: 847 times · Last seen: 2 minutes ago

#2  [error]  ISSUE-8819  UnhandledPromiseRejection in order.service.ts
    File: src/orders/order.service.ts line 89
    Events: 203 times · Last seen: 14 minutes ago

Which issue should I fix?
```

## Features

- 🔴 Real-time error detection via background monitor
- 🧠 AI root cause analysis with your actual source code
- ⚡ One-command triage, search, and fix workflow
- 🔒 Auth token stored in system keychain
- 🌐 Works with any language Sentry supports
- 🔁 Auto-resolves issues after fix (optional)

## Installation

**Prerequisites**
- Node.js 18+
- A Sentry account with API access
- A Sentry API token

**Install**
1. Install Claude Code:
   ```
   npm install -g @anthropic-ai/claude-code
   ```
2. Install the plugin:
   ```
   /plugin install sentry@claude-plugins-official
   ```
3. Enable and configure when prompted.

## Configuration

When you first enable the plugin, Claude Code will automatically
ask for these 3 values:

### 1. Sentry Auth Token

This is your API key to access Sentry.

Steps to get it:
1. Go to https://sentry.io and login
2. Click your profile icon (bottom left)
3. Go to Settings → Account → API → Auth Tokens
4. Click "Create New Token"
5. Give it a name like "claude-plugin"
6. Under permissions select: project:read, issue:read, issue:write
7. Click "Create Token"
8. Copy the token shown (you only see it once)

### 2. Organization Slug

This is your Sentry organization identifier.

Steps to get it:
1. Go to https://sentry.io and login
2. Look at your browser URL — it will look like:
    https://sentry.io/organizations/YOUR-ORG-SLUG/
3. Copy the part that says YOUR-ORG-SLUG
    Example: if URL is sentry.io/organizations/acme-corp/
    then your slug is: acme-corp

### 3. Project Slug

This is your specific Sentry project identifier.

Steps to get it:
1. Go to https://sentry.io and login
2. Click "Projects" in the left sidebar
3. Click on your project
4. Look at your browser URL — it will look like:
    https://sentry.io/organizations/YOUR-ORG/issues/?project=YOUR-PROJECT-SLUG
5. Or go to Settings → Projects → click your project
    The URL will be:
    https://sentry.io/settings/YOUR-ORG/projects/YOUR-PROJECT-SLUG/
6. Copy YOUR-PROJECT-SLUG

### Quick Reference Table

| Field | Where to find it | Example value |
|---|---|---|
| Auth Token | Settings → API → Auth Tokens → Create New Token | sntrys_abc123... |
| Organization Slug | Your Sentry URL after /organizations/ | acme-corp |
| Project Slug | Your Sentry URL after /projects/ | my-website |

### Required Token Permissions

When creating your Auth Token make sure to enable:
- project:read — to list projects
- issue:read — to fetch errors and stack traces
- issue:write — to mark issues resolved (optional)

## Usage

**/sentry:triage**
```
> /sentry:triage
#1  [error]  ISSUE-1021  Null pointer in checkout flow
    File: src/checkout/payment.js line 142
    Events: 312 times · Last seen: 4 minutes ago
```

**/sentry:fix ISSUE-123**
```
> /sentry:fix ISSUE-123
Reading stack trace...
Root cause: cart object is null when user has no active session
Fix: add optional chaining + fallback default
```

**/sentry:search "keyword"**
```
> /sentry:search "checkout"
#1  [fatal]  ISSUE-8821  TypeError: Cannot read properties of null
#2  [error]  ISSUE-8819  UnhandledPromiseRejection in order.service.ts
```

**Background Monitor**
```
[SENTRY ALERT] 2 critical/fatal issue(s) detected. Run /sentry:triage to investigate.
```

## How It Works

The plugin runs as an MCP server inside Claude Code, pulls live issue data from the Sentry REST API, and pairs it with your local source files so Claude can pinpoint the exact root cause and propose a fix.

```
[Your Terminal] -> [Claude Code] -> [Sentry Plugin]
                              -> [MCP Server (Node.js)]
                              -> [Sentry REST API]
                              -> [Your Sentry Project]
```

## Plugin Structure

```
sentry/
├── .claude-plugin/
│   └── plugin.json        # Plugin manifest
├── agents/
│   └── sentry-debugger.md # Deep analysis agent
├── bin/
│   └── poll-sentry.sh     # Background monitor
├── hooks/
│   └── hooks.json         # SessionStart installer
├── monitors/
│   └── monitors.json      # Background monitors
├── skills/
│   ├── fix/SKILL.md       # Fetch issue + propose fix
│   ├── search/SKILL.md    # Search issues
│   └── triage/SKILL.md    # List top unresolved issues
├── .mcp.json              # MCP server config
├── server.js              # MCP server implementation
├── package.json           # Node dependencies
├── README.md
├── CHANGELOG.md
└── LICENSE
```

## Contributing

1. Fork the repo
2. Make your changes
3. Open a pull request

## License

MIT — see [LICENSE](LICENSE)

## Acknowledgements

- Built for the Claude Code Plugin Marketplace
- Powered by the Sentry REST API
