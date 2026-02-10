# Guck (Browser SDK)

Browser SDK for emitting Guck telemetry to a local MCP HTTP ingest endpoint.

## Usage

Start the MCP server with HTTP ingest enabled:

```sh
guck mcp --http-port 7331
```

Create a client and emit events:

```ts
import { createBrowserClient } from "@guckdev/browser";

const client = createBrowserClient({
  endpoint: "http://localhost:7331/guck/emit",
  service: "web-ui",
  sessionId: "dev-1",
});

await client.emit({ message: "hello from the browser" });
```

## Auto-capture console + errors

```ts
const { stop } = client.installAutoCapture();

console.error("boom");

// call stop() to restore console and listeners
stop();
```

Notes:
- The HTTP ingest endpoint is CORS-enabled by default.
- If your page is served over HTTPS, posting to an HTTP localhost endpoint may be blocked by mixed-content rules.
