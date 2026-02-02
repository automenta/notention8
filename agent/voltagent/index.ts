import { join } from 'path';
import { AgentServer } from '@notention/agent';
import { VoltAgentPlugin } from './VoltAgentPlugin';

(async () => {
    const server = new AgentServer({
        port: parseInt(process.env.PORT || '3000'),
        agentName: 'VoltAgent'
    });

    try {
        console.log('Initializing VoltAgent integration...');

        // Create Plugin
        const voltAgentPlugin = new VoltAgentPlugin();
        voltAgentPlugin.setBroadcaster((msg) => server.broadcastToUIClients(msg));

        server.registerPlugin(voltAgentPlugin);

        // Start Server
        await server.start();

        console.log('VoltAgent server started successfully');

        // Graceful shutdown
        const shutdown = async () => {
            console.log('Shutting down...');
            await server.stop();
            process.exit(0);
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);

    } catch (error) {
        console.error('Failed to start VoltAgent server:', error);
        process.exit(1);
    }
})();
