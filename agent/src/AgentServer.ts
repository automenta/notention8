import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import path, { join } from 'path';
import fs from 'fs';
import { PluginManager, Plugin } from './plugins/PluginInterface';
import { ExtensionManager } from './extensions/ExtensionSystem';
import { SemanticPropertyExtension } from './extensions/SemanticPropertyExtension';
import { MonitoringExtension } from './extensions/MonitoringExtension';
import { ComprehensiveUIReplacementSystem } from './ui-replacement/ComprehensiveUIReplacementSystem';
import { ComprehensiveStateManager } from './state-management/ComprehensiveStateManager';
import { TransparentErrorHandler } from './error-handling/ErrorHandler';
import { ComprehensiveConfigurationManager } from './error-handling/ConfigurationManager';
import { WSMessageHandler } from './communication/WSMessageHandler';

export interface AgentServerConfig {
    port?: number;
    uiDistPath?: string;
    wsPath?: string;
}

export class AgentServer {
    public app: express.Express;
    public server: any;
    public wss: WebSocketServer | null = null;
    public pluginManager: PluginManager;
    public extensionManager: ExtensionManager;
    public uiReplacementSystem: ComprehensiveUIReplacementSystem;
    public stateManager: ComprehensiveStateManager;
    public errorHandler: TransparentErrorHandler;
    public configManager: ComprehensiveConfigurationManager;
    private wsMessageHandler: WSMessageHandler;
    private uiClients: Set<WebSocket> = new Set();
    private port: number;
    private wsPath: string;

    constructor(config: AgentServerConfig = {}) {
        this.port = config.port || parseInt(process.env.PORT || '3000');
        this.wsPath = config.wsPath || '/ws/clawdbot';
        this.app = express();

        // Initialize Managers
        this.pluginManager = new PluginManager();
        this.extensionManager = new ExtensionManager();
        this.uiReplacementSystem = new ComprehensiveUIReplacementSystem();
        this.stateManager = new ComprehensiveStateManager(null);
        this.errorHandler = new TransparentErrorHandler();
        this.configManager = new ComprehensiveConfigurationManager();

        this.wsMessageHandler = new WSMessageHandler(
            this.pluginManager,
            this.stateManager,
            this.errorHandler
        );

        this.setupExpress(config.uiDistPath);
    }

    public registerPlugin(plugin: Plugin) {
        this.pluginManager.register(plugin);
    }

    private setupExpress(uiDistPath?: string) {
        this.app.use(express.json());

        // Determine UI path
        let distPath = uiDistPath;
        if (!distPath) {
             // Try common locations relative to cwd
             const possiblePaths = [
                 join(process.cwd(), '../ui/dist'),
                 join(process.cwd(), 'ui/dist')
             ];

             for (const p of possiblePaths) {
                 if (fs.existsSync(p)) {
                     distPath = p;
                     break;
                 }
             }
        }

        if (distPath && fs.existsSync(distPath)) {
             console.log(`Serving UI from: ${distPath}`);

             const injectPlugins = (req: express.Request, res: express.Response, next: express.NextFunction) => {
                 const indexPath = join(distPath!, 'index.html');
                 if (fs.existsSync(indexPath)) {
                     fs.readFile(indexPath, 'utf8', (err, data) => {
                         if (err) { next(); return; }
                         const pluginScripts = this.pluginManager.getAllUIInjection().join('\n');
                         let modifiedData = data;
                         if (pluginScripts) {
                             modifiedData = data.replace('</body>', `\n${pluginScripts}\n</body>`);
                         }
                         res.setHeader('Content-Type', 'text/html');
                         res.send(modifiedData);
                     });
                 } else { next(); }
             };

             // Custom middleware to inject plugin functionality into index.html
             this.app.get('/', injectPlugins);
             this.app.use(express.static(distPath));
             // Fallback for SPA
             this.app.get('*', injectPlugins);
        } else {
             console.warn('UI build not found. Creating API endpoint only.');
             // API Fallback
             this.app.get('*', (req, res) => {
                 res.json({
                     message: 'Notention Agent Server',
                     status: 'running',
                     info: 'UI build not found at expected locations.'
                 });
             });
        }
    }

    public async initializeExtensions() {
         try {
            await this.extensionManager.registerExtension(new SemanticPropertyExtension());
            await this.extensionManager.registerExtension(new MonitoringExtension());
            console.log('Extensions initialized');
         } catch (e) {
             console.error('Error initializing extensions', e);
         }
    }

    public broadcastToUIClients(message: any) {
        this.uiClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                try { client.send(JSON.stringify(message)); } catch (e) { console.error(e); }
            }
        });
    }

    public async start() {
        await this.initializeExtensions();
        await this.stateManager.initialize();
        await this.configManager.initialize();

        return new Promise<void>((resolve) => {
            this.server = this.app.listen(this.port, () => {
                console.log(`Agent Server running on http://localhost:${this.port}`);

                this.wss = new WebSocketServer({
                    server: this.server,
                    path: this.wsPath
                });

                this.wss.on('connection', (ws) => {
                    console.log('UI client connected');
                    this.uiClients.add(ws);
                    ws.send(JSON.stringify({ type: 'connection_established', message: 'Connected' }));

                    ws.on('message', async (data) => {
                        try {
                            const message = JSON.parse(data.toString());
                            await this.wsMessageHandler.handleMessage(message, ws);
                        } catch (e) {
                            console.error('Error parsing message:', e);
                            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
                        }
                    });

                    ws.on('close', () => {
                        console.log('UI client disconnected');
                        this.uiClients.delete(ws);
                    });

                    ws.on('error', (error) => {
                        console.error('WebSocket error:', error);
                        this.uiClients.delete(ws);
                    });
                });

                // Heartbeat
                setInterval(() => {
                    if (this.uiClients.size > 0) {
                        this.broadcastToUIClients({ type: 'heartbeat', timestamp: new Date().toISOString() });
                    }
                }, 30000);

                resolve();
            });
        });
    }

    public async stop() {
        if (this.wss) {
            this.wss.close();
        }
        if (this.server) {
            this.server.close();
        }
        this.uiClients.forEach(client => client.terminate());
        this.uiClients.clear();
    }
}
