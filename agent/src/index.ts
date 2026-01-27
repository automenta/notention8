import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Set ClawdBot config directory to relative ./config
process.env.CLAWDBOT_HOME = join(process.cwd(), 'config');

// Import ClawdBot and systems
import { Gateway } from './Gateway.js';
import { PluginManager } from './plugins/PluginInterface';
import { ClawdBotPlugin } from './plugins/ClawdBotPlugin';
import { ExtensionManager } from './extensions/ExtensionSystem';
import { SemanticPropertyExtension } from './extensions/SemanticPropertyExtension';
import { MonitoringExtension } from './extensions/MonitoringExtension';
import { ComprehensiveUIReplacementSystem } from './ui-replacement/ComprehensiveUIReplacementSystem';
import { ComprehensiveStateManager } from './state-management/ComprehensiveStateManager';
import { TransparentErrorHandler } from './error-handling/ErrorHandler';
import { ComprehensiveConfigurationManager } from './error-handling/ConfigurationManager';
import { ClawdBotCoordinator } from './ClawdBotCoordinator';
import { WSMessageHandler } from './communication/WSMessageHandler';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Determine UI path - try multiple possible locations
let uiDistPath = join(process.cwd(), '../ui/dist');
if (!fs.existsSync(uiDistPath)) {
  uiDistPath = join(process.cwd(), 'ui/dist');
}

// Serve static files from the UI build
if (fs.existsSync(uiDistPath)) {
  // Custom middleware to inject plugin functionality into index.html
  app.get('/', (req, res, next) => {
    const indexPath = join(uiDistPath, 'index.html');

    if (fs.existsSync(indexPath)) {
      fs.readFile(indexPath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading index.html:', err);
          next();
          return;
        }

        // Get plugin UI injections
        const pluginInjections = pluginManager.getAllUIInjection();
        const pluginScripts = pluginInjections.join('\n');

        // Inject plugin scripts into the HTML before closing body tag
        let modifiedData = data;
        if (pluginScripts) {
          modifiedData = data.replace('</body>', `\n${pluginScripts}\n</body>`);
        }

        res.setHeader('Content-Type', 'text/html');
        res.send(modifiedData);
      });
    } else {
      next();
    }
  });

  // Serve other static assets normally
  app.use(express.static(uiDistPath));
  console.log(`Serving UI from: ${uiDistPath}`);
} else {
  console.warn('UI build not found at expected locations. Creating API endpoint for UI to connect to ClawdBot.');

  // Create a simple API endpoint that UI can use to communicate with ClawdBot
  app.get('/api/clawdbot/status', (req, res) => {
    res.json({
      status: 'disconnected',
      message: 'UI build not found. Please build the UI first.'
    });
  });
}

// API routes for UI to communicate with ClawdBot
app.post('/api/clawdbot/action', async (req, res) => {
  const { action, params } = req.body;

  try {
    // In a real implementation, this would communicate with the ClawdBot gateway
    console.log(`Received action from UI: ${action}`, params);

    // Placeholder response - in real implementation this would call ClawdBot
    res.json({
      success: true,
      message: `Action ${action} received`,
      result: null
    });
  } catch (error) {
    console.error('Error processing ClawdBot action:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Fallback route for SPA - only if UI exists
if (fs.existsSync(uiDistPath)) {
  app.get('*', (req, res, next) => {
    const indexPath = join(uiDistPath, 'index.html');

    if (fs.existsSync(indexPath)) {
      fs.readFile(indexPath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading index.html:', err);
          next();
          return;
        }

        // Get plugin UI injections
        const pluginInjections = pluginManager.getAllUIInjection();
        const pluginScripts = pluginInjections.join('\n');

        // Inject plugin scripts into the HTML before closing body tag
        let modifiedData = data;
        if (pluginScripts) {
          modifiedData = data.replace('</body>', `\n${pluginScripts}\n</body>`);
        }

        res.setHeader('Content-Type', 'text/html');
        res.send(modifiedData);
      });
    } else {
      next();
    }
  });
} else {
  // If no UI build exists, provide a simple API endpoint
  app.get('*', (req, res) => {
    res.json({
      message: 'Notention + ClawdBot Server',
      api: {
        clawdbot_status: '/api/clawdbot/status',
        clawdbot_action: '/api/clawdbot/action'
      }
    });
  });
}

// Create HTTP server
const server = app.listen(PORT, () => {
  console.log(`Notention + ClawdBot server running on http://localhost:${PORT}`);
});

// Create WebSocket server for real-time communication between UI and ClawdBot
const wss = new WebSocketServer({
  server,  // Attach to the same HTTP server instead of separate port
  path: '/ws/clawdbot'  // Specify a path for the websocket
});

// Store connected UI clients
const uiClients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  console.log('UI client connected to ClawdBot gateway');
  uiClients.add(ws);

  // Send welcome message to new client
  ws.send(JSON.stringify({
    type: 'connection_established',
    message: 'Connected to ClawdBot gateway'
  }));

  ws.on('message', async (data) => {
    console.log('Message received from UI:', data.toString());

    try {
      const message = JSON.parse(data.toString());
      await wsMessageHandler.handleMessage(message, ws);
    } catch (e) {
      console.error('Error parsing message from UI:', e);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  ws.on('close', () => {
    console.log('UI client disconnected from ClawdBot gateway');
    uiClients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    uiClients.delete(ws);
  });
});

// Initialize managers
const pluginManager = new PluginManager();
const extensionManager = new ExtensionManager();
const uiReplacementSystem = new ComprehensiveUIReplacementSystem();
const stateManager = new ComprehensiveStateManager(null); // Will be initialized with gateway
const errorHandler = new TransparentErrorHandler();
const configManager = new ComprehensiveConfigurationManager();
let coordinator: ClawdBotCoordinator | null = null;

// Initialize Message Handler
const wsMessageHandler = new WSMessageHandler(
    pluginManager,
    stateManager,
    errorHandler,
    coordinator
);

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
let gateway: any;

(async () => {
  try {
    console.log('Initializing ClawdBot gateway...');
    gateway = new Gateway({
      configDir: join(process.cwd(), 'config'),
      // Add any other ClawdBot configuration here
    });

    // Initialize extensions
    await initializeExtensions();

    // Create and register the ClawdBot plugin
    const clawdBotPlugin = new ClawdBotPlugin(
      gateway,
      extensionManager,
      uiReplacementSystem,
      stateManager,
      errorHandler,
      configManager
    );
    pluginManager.register(clawdBotPlugin);

    // Initialize Coordinator
    coordinator = new ClawdBotCoordinator(gateway);
    wsMessageHandler.setCoordinator(coordinator);

    // Initialize the state manager with the gateway
    stateManager.initialize().catch((err: any) => {
      console.error('Error initializing state manager:', err);
    });

    // Initialize the configuration manager
    configManager.initialize().catch((err: any) => {
      console.error('Error initializing configuration manager:', err);
    });

    // Start ClawdBot
    gateway.start()
      .then(() => {
        console.log('ClawdBot gateway started successfully');

        // Update state manager with initial state
        stateManager.updateState({
          status: 'running',
          version: gateway.version || 'unknown'
        }).catch((err: any) => {
          console.error('Error updating state:', err);
        });

        // Set up event listeners for ClawdBot events
        // and forward them to connected UI clients

        // Example: Listen for ClawdBot events and broadcast to UI
        // This would be specific to ClawdBot's API
      })
      .catch((err: any) => {
        console.error('Failed to start ClawdBot gateway:', err);
        // Log the error using the error handler
        errorHandler.handleError(err, { source: 'ClawdBotGateway', action: 'start' });
      });
  } catch (error) {
    console.error('Failed to initialize ClawdBot gateway:', error);
  }
})();

// Function to broadcast messages to all connected UI clients
function broadcastToUIClients(message: any) {
  uiClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
      } catch (e) {
        console.error('Error sending message to UI client:', e);
      }
    }
  });
}

// Periodically broadcast status to UI clients
setInterval(() => {
  if (uiClients.size > 0) {
    broadcastToUIClients({
      type: 'heartbeat',
      timestamp: new Date().toISOString()
    });
  }
}, 30000); // Every 30 seconds

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');

  // Stop ClawdBot gateway
  if (gateway && typeof gateway.stop === 'function') {
    try {
      await gateway.stop();
      console.log('ClawdBot gateway stopped');
    } catch (error) {
      console.error('Error stopping ClawdBot gateway:', error);
    }
  }

  // Close all WebSocket connections
  uiClients.forEach(client => {
    client.terminate(); // Force close
  });

  // Close HTTP server
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('\nTermination signal received...');
  if (server) {
    server.close();
  }
  process.exit(0);
});