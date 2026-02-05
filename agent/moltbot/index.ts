import { join } from 'path';
import { AgentServer } from '../src/AgentServer';
import { Gateway } from './Gateway';
import { ClawdBotPlugin } from './ClawdBotPlugin';

// Set ClawdBot config directory
process.env.CLAWDBOT_HOME = join(process.cwd(), 'config');

(async () => {
    const server = new AgentServer({
        port: parseInt(process.env.PORT || '3000'),
        agentName: 'MoltBot (ClawdBot)'
    });

    try {
        console.log('Initializing ClawdBot gateway...');
        const gateway = new Gateway({
            configDir: join(process.cwd(), 'config'),
        });

        // Set up log broadcasting
        gateway.setOnLog((log: string) => {
            server.broadcastToUIClients({
                type: 'clawdbot_log',
                payload: {
                    message: log,
                    timestamp: new Date().toISOString()
                }
            });
        });

        // Create Plugin
        const clawdBotPlugin = new ClawdBotPlugin(
            gateway,
            server.extensionManager,
            server.uiReplacementSystem,
            server.stateManager,
            server.errorHandler,
            server.configManager
        );
        clawdBotPlugin.setBroadcaster((msg) => server.broadcastToUIClients(msg));

        server.registerPlugin(clawdBotPlugin);

        // Start Gateway
        await gateway.start();
        console.log('ClawdBot gateway started');

        // Update state
        server.stateManager.updateState({
            status: 'running',
            version: gateway.version || 'unknown'
        });

        // Start Server
        await server.start();

        // Graceful shutdown
        const shutdown = async () => {
            console.log('Shutting down...');
            await gateway.stop();
            await server.stop();
            process.exit(0);
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);

    } catch (error) {
        console.error('Failed to start MoltBot agent:', error);
        process.exit(1);
    }
})();
