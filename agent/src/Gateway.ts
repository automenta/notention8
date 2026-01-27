import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { MoltBotBridge } from './bridge/MoltBotBridge';

export class Gateway {
  private process: ChildProcess | null = null;
  private configDir: string;
  private bridge: MoltBotBridge;
  public version: string = '2026.1.24-3'; // Hardcoded matches installed version

  constructor(config: { configDir: string }) {
    this.configDir = config.configDir;
    this.bridge = new MoltBotBridge({
      port: 18789,
      reconnectInterval: 2000,
      maxReconnectAttempts: 30
    });
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Spawning ClawdBot gateway...');

      const cmd = 'npx';
      const args = ['clawdbot', 'gateway', '--port', '18789', '--no-color'];

      this.process = spawn(cmd, args, {
        cwd: process.cwd(),
        env: { ...process.env, CLAWDBOT_HOME: this.configDir },
        stdio: ['ignore', 'pipe', 'pipe']
      });

      if (this.process.stdout) {
        this.process.stdout.on('data', (data) => {
          const msg = data.toString();
          console.log('[ClawdBot]', msg.trim());

          // Connect bridge when gateway indicates readiness
          if (msg.includes('Gateway listening') || msg.includes('ready')) {
            if (!this.bridge.isConnected) {
              this.bridge.connect().catch(err =>
                console.error('[Gateway] Bridge connection failed:', err)
              );
            }
          }
        });
      }

      if (this.process.stderr) {
        this.process.stderr.on('data', (data) => {
          console.error('[ClawdBot Error]', data.toString().trim());
        });
      }

      this.process.on('error', (err) => {
        console.error('ClawdBot failed to start:', err);
        reject(err);
      });

      this.process.on('exit', (code) => {
        if (code !== 0 && code !== null) {
          console.error(`ClawdBot exited with code ${code}`);
        }
        this.bridge.disconnect();
      });

      // Give it a moment to start
      setTimeout(() => resolve(), 2000);
    });
  }

  async stop(): Promise<void> {
    await this.bridge.disconnect();

    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }

  getBridge(): MoltBotBridge {
    return this.bridge;
  }

  async getStatus(): Promise<any> {
    return {
      connected: !!this.process,
      bridgeConnected: this.bridge.isConnected,
      status: this.process ? 'running' : 'stopped',
      version: this.version
    };
  }
}
