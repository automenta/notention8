import { AgentServer } from '@notention/agent';
import { ClawdBotPlugin } from './src/ClawdBotPlugin';
import { Gateway } from './src/Gateway';

async function bootstrap() {
    const server = new AgentServer(3000);
    const gateway = new Gateway();
    await gateway.initialize();

    const clawdBotPlugin = new ClawdBotPlugin(gateway);
    server.registerPlugin(clawdBotPlugin);

    await server.start();
    console.log('MoltBot Agent Server started');

    process.on('SIGINT', async () => {
        await server.stop();
        await gateway.shutdown();
        process.exit(0);
    });
}

bootstrap().catch(console.error);
