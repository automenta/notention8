import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import fs from 'fs';

// Get the current directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GATEWAY_PORT = process.env.GATEWAY_PORT ? parseInt(process.env.GATEWAY_PORT) : 18789;
const SERVER_PORT = process.env.PORT || 3000;

// Set ClawdBot config directory to relative ./config
const AGENT_ROOT = join(__dirname, '..');
const CONFIG_PATH = join(AGENT_ROOT, 'config');
const CLAWDBOT_CONFIG_DIR = join(CONFIG_PATH, 'clawdbot');
const CLAWDBOT_CONFIG_FILE = join(CLAWDBOT_CONFIG_DIR, 'clawdbot.json');

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

// Import systems
import { PluginManager } from './plugins/PluginInterface';
import { ClawdBotPlugin } from './plugins/ClawdBotPlugin';
import { ExtensionManager } from './extensions/ExtensionSystem';
import { SemanticPropertyExtension } from './extensions/SemanticPropertyExtension';
import { MonitoringExtension } from './extensions/MonitoringExtension';
import { ComprehensiveUIReplacementSystem } from './ui-replacement/ComprehensiveUIReplacementSystem';
import { ComprehensiveStateManager } from './state-management/ComprehensiveStateManager';
import { TransparentErrorHandler } from './error-handling/ErrorHandler';
import { ComprehensiveConfigurationManager } from './configuration/ConfigurationManager';

const app = express();

// Serve UI
const UI_DIST = join(AGENT_ROOT, '../ui/dist');
if (fs.existsSync(UI_DIST)) {
    app.use(express.static(UI_DIST));
    console.log(`Serving UI from ${UI_DIST}`);
} else {
    console.warn(`UI dist not found at ${UI_DIST}. Make sure to build UI first.`);
}

// Config endpoint - expose the proxy path
app.get('/agent-config.json', (req, res) => {
    res.json({
        wsUrl: `ws://localhost:${SERVER_PORT}/clawd-ws`
    });
});

// Proxy WebSocket connections to ClawdBot
app.use('/clawd-ws', createProxyMiddleware({
    target: `ws://127.0.0.1:${GATEWAY_PORT}`,
    ws: true,
    changeOrigin: true,
    pathRewrite: {
        '^/clawd-ws': '' // Remove /clawd-ws prefix when forwarding
    },
    logLevel: 'info'
}));

// Initialize managers
const pluginManager = new PluginManager();
const extensionManager = new ExtensionManager();
const uiReplacementSystem = new ComprehensiveUIReplacementSystem();
const stateManager = new ComprehensiveStateManager(null); // Will be initialized with gateway
const errorHandler = new TransparentErrorHandler();
const configManager = new ComprehensiveConfigurationManager();

// Initialize and register extensions
async function initializeExtensions() {
  try {
    const semanticPropertyExtension = new SemanticPropertyExtension();
    const monitoringExtension = new MonitoringExtension();

    await extensionManager.registerExtension(semanticPropertyExtension);
    await extensionManager.registerExtension(monitoringExtension);
    console.log('Extensions initialized successfully');
  } catch (error) {
    console.error('Error initializing extensions:', error);
  }
}

// Initialize ClawdBot Gateway
let clawdBot: any;
try {
  console.log('Starting ClawdBot Gateway...');
  console.log(`Using config dir: ${CONFIG_PATH}`);

  // Resolve ClawdBot binary
  let clawdBotBin = join(AGENT_ROOT, 'node_modules', '.bin', 'clawdbot');
  if (!fs.existsSync(clawdBotBin)) {
    clawdBotBin = join(AGENT_ROOT, '..', 'node_modules', '.bin', 'clawdbot');
  }

  if (!fs.existsSync(clawdBotBin)) {
    console.error('Could not find clawdbot binary!');
    clawdBotBin = 'clawdbot'; // Assume in PATH
  }

  // Spawn ClawdBot gateway process
  clawdBot = spawn(clawdBotBin, ['gateway', '--port', GATEWAY_PORT.toString()], {
    stdio: 'inherit',
    env: {
      ...process.env,
      CLAWDBOT_HOME: CONFIG_PATH
    }
  });

  // Initialize the state manager with the gateway
  // Note: We'll pass a mock gateway object since ClawdBot runs as a separate process
  const mockGateway = {
    version: 'proxy-mode',
    start: async () => Promise.resolve(),
    stop: async () => Promise.resolve()
  };
  
  stateManager.initialize().catch(err => {
    console.error('Error initializing state manager:', err);
  });

  // Initialize the configuration manager
  configManager.initialize().catch(err => {
    console.error('Error initializing configuration manager:', err);
  });

  // Initialize extensions
  initializeExtensions();

  // Create and register the ClawdBot plugin
  const clawdBotPlugin = new ClawdBotPlugin(
    mockGateway, // Using mock since real gateway runs in separate process
    extensionManager,
    uiReplacementSystem,
    stateManager,
    errorHandler,
    configManager
  );
  pluginManager.register(clawdBotPlugin);

  console.log(`ClawdBot gateway process started on port ${GATEWAY_PORT}`);

} catch (error) {
  console.error('Failed to start ClawdBot gateway:', error);
  // Log the error using the error handler
  errorHandler.handleError(error, { source: 'ClawdBotGateway', action: 'start' });
}

// Start the server
const server = app.listen(SERVER_PORT, () => {
  console.log(`Agent server running on port ${SERVER_PORT}`);
  console.log(`Serving UI from ${UI_DIST}`);
  console.log(`ClawdBot gateway on port ${GATEWAY_PORT}`);
});

// Cleanup on exit
const cleanup = () => {
  console.log('Shutting down...');
  if (clawdBot) {
    clawdBot.kill();
  }
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);