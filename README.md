# Notention + ClawdBot Monorepo

This is a monorepo containing three main packages:

- `ui/` - Notention front-end (offline-first PWA)
- `agent/` - ClawdBot wrapper that serves enhanced UI and connects to ClawdBot
- `core/` - Common code shared between ui and agent

## Project Structure

```
notention-monorepo/
├── ui/                 # Notention front-end
│   ├── components/     # React components
│   ├── hooks/          # React hooks
│   ├── services/       # Service implementations
│   ├── types/          # Shared types (moved to core/)
│   ├── utils/          # Utility functions (some moved to core/)
│   └── ...
├── agent/              # ClawdBot wrapper and server
│   ├── src/            # Server source code
│   └── ...
├── core/               # Shared code
│   ├── src/
│   │   ├── types/      # Shared TypeScript types
│   │   ├── nostr.ts    # Nostr utilities
│   │   ├── properties.ts # Property utilities
│   │   └── ...
│   └── ...
└── package.json        # Workspace configuration
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. To develop the UI:
```bash
cd ui
npm install
npm run dev
```

3. To build the UI for production:
```bash
cd ui
npm run build
```

4. To run the agent server (requires built UI):
```bash
cd agent
npm install
npm run start
```

5. To develop with both running:
```bash
# Terminal 1: Run the UI in development mode
cd ui && npm run dev

# Terminal 2: Run the agent server
cd agent && npm run start
```

## Configuration

The agent server will automatically create a `./config` directory for ClawdBot's configuration files. This directory is added to `.gitignore` to keep it local to each deployment.

## How It Works

1. The `core` package contains shared types and utilities used by both the UI and agent
2. The `ui` package is the Notention front-end that works as an offline-first PWA
3. The `agent` package wraps ClawdBot and provides:
   - A server that serves the UI
   - WebSocket communication between UI and ClawdBot
   - ClawdBot integration with a relative config directory