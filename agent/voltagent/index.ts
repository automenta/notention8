import { AgentServer, loadAgentConfig } from '@notention/agent';
import { VoltAgentPlugin } from './src/VoltAgentPlugin';

async function bootstrap() {
    const config = await loadAgentConfig();
    const server = new AgentServer(3000);

    const voltPlugin = new VoltAgentPlugin(config.voltagent);
    server.registerPlugin(voltPlugin);

    await server.start();
    console.log('VoltAgent Server started');

    process.on('SIGINT', async () => {
        await server.stop();
        process.exit(0);
    });
}

bootstrap().catch(console.error);
