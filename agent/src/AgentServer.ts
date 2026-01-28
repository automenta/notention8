import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { join } from 'path';
import fs from 'fs';
import { Plugin, PluginManager } from './plugins/PluginInterface';
import { ComprehensiveStateManager } from './state-management/ComprehensiveStateManager';
import { TransparentErrorHandler } from './error-handling/ErrorHandler';
import { WSMessageHandler } from './communication/WSMessageHandler';

export class AgentServer {
    private app: express.Express;
    private server: any;
    private wss: WebSocketServer;
    public pluginManager: PluginManager;
    private stateManager: ComprehensiveStateManager;
    private errorHandler: TransparentErrorHandler;
    private messageHandler: WSMessageHandler;

    constructor(port: number = 3000) {
        this.app = express();
        this.pluginManager = new PluginManager();
        this.stateManager = new ComprehensiveStateManager(null);
        this.errorHandler = new TransparentErrorHandler();
        this.messageHandler = new WSMessageHandler(
            this.pluginManager,
            this.stateManager,
            this.errorHandler
        );

        this.setupExpress(port);
        this.setupWebSocket();
    }

    private setupExpress(port: number) {
        this.app.use(express.json());

        // UI Static Serving logic
        let uiDistPath = join(process.cwd(), '../ui/dist');
        if (!fs.existsSync(uiDistPath)) {
            uiDistPath = join(process.cwd(), 'ui/dist');
        }
        if (fs.existsSync(uiDistPath)) {
            this.app.use(express.static(uiDistPath));
        }

        this.server = this.app.listen(port, () => {
            console.log(`Agent Server running on port ${port}`);
        });
    }

    private setupWebSocket() {
        this.wss = new WebSocketServer({ server: this.server, path: '/ws/agent' });

        this.wss.on('connection', (ws) => {
            console.log('UI client connected');
            ws.send(JSON.stringify({
                type: 'connection_established',
                message: 'Connected to Agent Server'
            }));

            ws.on('message', async (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    await this.messageHandler.handleMessage(message, ws);
                } catch (e) {
                    console.error('Message handling error', e);
                    ws.send(JSON.stringify({ type: 'error', message: 'Invalid message' }));
                }
            });
        });
    }

    registerPlugin(plugin: Plugin) {
        this.pluginManager.register(plugin);
    }

    broadcastToUIClients(message: any) {
        if (!this.wss) return;
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }

    async start() {
       await this.stateManager.initialize();
       await this.errorHandler.initialize();
    }

    async stop() {
       if (this.server) {
           this.server.close();
       }
    }
}
