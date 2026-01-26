import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const GATEWAY_PORT = 18789;
const AGENT_ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.resolve(AGENT_ROOT, 'config');
const CLAWDBOT_CONFIG_DIR = path.join(CONFIG_PATH, 'clawdbot');
const CLAWDBOT_CONFIG_FILE = path.join(CLAWDBOT_CONFIG_DIR, 'clawdbot.json');

// Ensure config directory exists
if (!fs.existsSync(CLAWDBOT_CONFIG_DIR)) {
    fs.mkdirSync(CLAWDBOT_CONFIG_DIR, { recursive: true });
}

// Create minimal config if missing
if (!fs.existsSync(CLAWDBOT_CONFIG_FILE)) {
    const defaultConfig = {
        agent: {
            model: "anthropic/claude-3-haiku-20240307"
        },
        gateway: {
            port: GATEWAY_PORT,
            bind: "127.0.0.1"
        }
    };
    fs.writeFileSync(CLAWDBOT_CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
    console.log('Created default ClawdBot config at', CLAWDBOT_CONFIG_FILE);
}

const app = express();

// Serve UI
const UI_DIST = path.resolve(AGENT_ROOT, '../ui/dist');
if (fs.existsSync(UI_DIST)) {
    app.use(express.static(UI_DIST));
} else {
    console.warn(`UI dist not found at ${UI_DIST}. Make sure to build UI first.`);
}

// Config endpoint
app.get('/agent-config.json', (req, res) => {
    // If proxying, we expose the proxy path. If not, the direct port.
    // Here we use proxy.
    res.json({
        wsUrl: `ws://localhost:${PORT}/clawd-ws`
    });
});

// Proxy WS
app.use('/clawd-ws', createProxyMiddleware({
    target: `ws://127.0.0.1:${GATEWAY_PORT}`,
    ws: true,
    changeOrigin: true,
    pathRewrite: {
        '^/clawd-ws': '' // Remove /clawd-ws prefix when forwarding?
        // ClawdBot Gateway likely expects connection at root /.
        // So we strip /clawd-ws.
    },
    logLevel: 'info'
}));

// Start Server
const server = app.listen(PORT, () => {
    console.log(`Agent server running on port ${PORT}`);
    console.log(`Serving UI from ${UI_DIST}`);
});

// Resolve ClawdBot binary
// In a workspace, it might be in root node_modules or agent node_modules.
let clawdBotBin = path.resolve(AGENT_ROOT, 'node_modules', '.bin', 'clawdbot');
if (!fs.existsSync(clawdBotBin)) {
    clawdBotBin = path.resolve(AGENT_ROOT, '..', 'node_modules', '.bin', 'clawdbot');
}

if (!fs.existsSync(clawdBotBin)) {
    console.error('Could not find clawdbot binary!');
    // Fallback to npx?
    clawdBotBin = 'clawdbot'; // Assume in PATH
}

console.log('Starting ClawdBot Gateway...');
console.log(`Using config dir: ${CONFIG_PATH}`);

const clawdBot = spawn(clawdBotBin, ['gateway', '--port', GATEWAY_PORT.toString()], {
    stdio: 'inherit',
    env: {
        ...process.env,
        XDG_CONFIG_HOME: CONFIG_PATH
    }
});

const cleanup = () => {
    console.log('Shutting down...');
    if (clawdBot) clawdBot.kill();
    server.close();
    process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
