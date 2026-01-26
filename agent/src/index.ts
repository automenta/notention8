import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get the current directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set ClawdBot config directory to relative ./config
process.env.CLAWDBOT_HOME = join(process.cwd(), 'config');

// Import ClawdBot and plugins
import { Gateway } from 'clawdbot';
import { PluginManager } from './plugins/PluginInterface';
import { ClawdBotPlugin } from './plugins/ClawdBotPlugin';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Determine UI path - try multiple possible locations
let uiDistPath = join(__dirname, '../../ui/dist');
if (!fs.existsSync(uiDistPath)) {
  uiDistPath = join(process.cwd(), 'ui/dist');
}
if (!fs.existsSync(uiDistPath)) {
  uiDistPath = join(process.cwd(), '../ui/dist');
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

  ws.on('message', (data) => {
    console.log('Message received from UI:', data.toString());

    try {
      const message = JSON.parse(data.toString());

      // Handle different types of messages from UI
      switch(message.type) {
        case 'clawdbot_request':
          // Process request intended for ClawdBot
          console.log('Processing ClawdBot request:', message.payload);

          // In a real implementation, this would forward to ClawdBot
          // For now, send a mock response
          ws.send(JSON.stringify({
            type: 'clawdbot_response',
            requestId: message.id,
            success: true,
            result: { message: 'Request processed (mock)' }
          }));
          break;

        case 'note_created':
          // Broadcast to plugins
          pluginManager.broadcastNoteCreated(message.payload);
          // These might be events that should trigger ClawdBot actions
          console.log('Note created event received:', message.payload);
          break;

        case 'note_updated':
          // Broadcast to plugins
          pluginManager.broadcastNoteUpdated(message.payload);
          console.log('Note updated event received:', message.payload);
          break;

        case 'note_deleted':
          // Broadcast to plugins
          pluginManager.broadcastNoteDeleted(message.payload.noteId || message.id);
          console.log('Note deleted event received:', message.payload);
          break;

        default:
          // Let plugins handle custom message types
          pluginManager.broadcastMessage(message);

          console.log('Unknown message type from UI:', message.type);
          ws.send(JSON.stringify({
            type: 'error',
            message: `Unknown message type: ${message.type}`
          }));
      }
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

// Initialize plugin manager
const pluginManager = new PluginManager();

// Initialize ClawdBot Gateway
let gateway: any;
try {
  console.log('Initializing ClawdBot gateway...');
  gateway = new Gateway({
    configDir: join(process.cwd(), 'config'),
    // Add any other ClawdBot configuration here
  });

  // Create and register the ClawdBot plugin
  const clawdBotPlugin = new ClawdBotPlugin(gateway);
  pluginManager.register(clawdBotPlugin);

  // Start ClawdBot
  gateway.start()
    .then(() => {
      console.log('ClawdBot gateway started successfully');

      // Set up event listeners for ClawdBot events
      // and forward them to connected UI clients

      // Example: Listen for ClawdBot events and broadcast to UI
      // This would be specific to ClawdBot's API
    })
    .catch(err => {
      console.error('Failed to start ClawdBot gateway:', err);
    });
} catch (error) {
  console.error('Failed to initialize ClawdBot gateway:', error);
}

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