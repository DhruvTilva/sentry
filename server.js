import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";

const API_BASE = "https://sentry.io/api/0";
const AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;
const ORG = process.env.SENTRY_ORG;
const DEFAULT_PROJECT = process.env.SENTRY_PROJECT;

function assertConfig() {
  if (!AUTH_TOKEN) {
    throw new Error("Missing SENTRY_AUTH_TOKEN env var");
  }
  if (!ORG) {
    throw new Error("Missing SENTRY_ORG env var");
  }
}

function requireProject(project) {
  const resolved = project || DEFAULT_PROJECT;
  if (!resolved) {
    throw new Error("Project slug is required (set SENTRY_PROJECT or pass project)");
  }
  return resolved;
}

async function sentryRequest(path, options = {}) {
  assertConfig();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Sentry API error ${response.status}: ${text}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function mapIssue(issue) {
  return {
    id: issue.id,
    title: issue.title,
    culprit: issue.culprit || "",
    count: issue.count,
    lastSeen: issue.lastSeen,
    level: issue.level,
    permalink: issue.permalink
  };
}

function formatStacktrace(event) {
  const entries = event?.entries || [];
  const exceptionEntry = entries.find((entry) => entry.type === "exception");
  const stackEntry = entries.find((entry) => entry.type === "stacktrace");
  const frames =
    exceptionEntry?.data?.values?.[0]?.stacktrace?.frames ||
    stackEntry?.data?.frames ||
    [];

  if (!frames.length) {
    return "Stacktrace unavailable";
  }

  const lines = frames.map((frame) => {
    const file = frame.abs_path || frame.filename || "unknown";
    const line = frame.lineno || "?";
    const func = frame.function || "<anonymous>";
    return `at ${func} (${file}:${line})`;
  });

  return lines.join("\n");
}

const server = new Server(
  { name: "sentry", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "sentry_list_issues",
        description: "List Sentry issues for a project.",
        inputSchema: {
          type: "object",
          properties: {
            project: { type: "string" },
            limit: { type: "number", default: 10 },
            status: { type: "string", enum: ["unresolved", "resolved"] }
          }
        }
      },
      {
        name: "sentry_get_issue",
        description: "Fetch a Sentry issue and its latest event.",
        inputSchema: {
          type: "object",
          properties: {
            issue_id: { type: "string" }
          },
          required: ["issue_id"]
        }
      },
      {
        name: "sentry_search_issues",
        description: "Search Sentry issues using a query string.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
            project: { type: "string" },
            limit: { type: "number", default: 10 }
          },
          required: ["query"]
        }
      },
      {
        name: "sentry_resolve_issue",
        description: "Mark a Sentry issue as resolved.",
        inputSchema: {
          type: "object",
          properties: {
            issue_id: { type: "string" }
          },
          required: ["issue_id"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const input = args || {};

  try {
    if (name === "sentry_list_issues") {
      const project = requireProject(input.project);
      const limit = Number.isFinite(input.limit) ? input.limit : 10;
      const status = input.status || "unresolved";
      const params = new URLSearchParams({
        limit: String(limit),
        status
      });
      const issues = await sentryRequest(
        `/projects/${ORG}/${project}/issues/?${params.toString()}`
      );
      const result = Array.isArray(issues) ? issues.map(mapIssue) : [];
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }

    if (name === "sentry_get_issue") {
      if (!input.issue_id) {
        throw new Error("issue_id is required");
      }
      const issue = await sentryRequest(`/issues/${input.issue_id}/`);
      const latestEvent = await sentryRequest(
        `/issues/${input.issue_id}/events/latest/`
      );
      const result = {
        title: issue.title,
        culprit: issue.culprit || "",
        stacktrace: formatStacktrace(latestEvent),
        tags: issue.tags || [],
        level: issue.level,
        count: issue.count,
        firstSeen: issue.firstSeen,
        lastSeen: issue.lastSeen,
        permalink: issue.permalink
      };
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }

    if (name === "sentry_search_issues") {
      if (!input.query) {
        throw new Error("query is required");
      }
      const project = requireProject(input.project);
      const limit = Number.isFinite(input.limit) ? input.limit : 10;
      const params = new URLSearchParams({
        query: input.query,
        limit: String(limit)
      });
      const issues = await sentryRequest(
        `/projects/${ORG}/${project}/issues/?${params.toString()}`
      );
      const result = Array.isArray(issues) ? issues.map(mapIssue) : [];
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }

    if (name === "sentry_resolve_issue") {
      if (!input.issue_id) {
        throw new Error("issue_id is required");
      }
      await sentryRequest(`/issues/${input.issue_id}/`, {
        method: "PUT",
        body: JSON.stringify({ status: "resolved" })
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { issue_id: input.issue_id, status: "resolved" },
              null,
              2
            )
          }
        ]
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: error.message }]
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Sentry MCP server failed to start:", error);
  process.exit(1);
});
