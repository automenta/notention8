import { spawn, ChildProcess } from 'child_process';
import { ClawdBotClient } from './communication/ClawdBotClient';

export class Gateway {
  private process: ChildProcess | null = null;
  private configDir: string;
  public version: string = '2026.1.24-3';
  public client: ClawdBotClient | null = null;
  public port: number = 18789;
  private onLog: ((log: string) => void) | null = null;

  constructor(config: { configDir: string }) {
    this.configDir = config.configDir;
  }

  setOnLog(callback: (log: string) => void) {
      this.onLog = callback;
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Spawning ClawdBot gateway...');

      const cmd = 'npx';
      const args = ['clawdbot', 'gateway', '--port', this.port.toString(), '--no-color'];

      this.process = spawn(cmd, args, {
        cwd: process.cwd(),
        env: { ...process.env, CLAWDBOT_HOME: this.configDir },
        stdio: ['ignore', 'pipe', 'pipe']
      });

      this.client = new ClawdBotClient({ port: this.port });

      if (this.process.stdout) {
        this.process.stdout.on('data', (data) => {
          const msg = data.toString();
          console.log('[ClawdBot]', msg.trim());
          if (this.onLog) {
              this.onLog(msg.trim());
          }
        });
      }

      if (this.process.stderr) {
        this.process.stderr.on('data', (data) => {
          const msg = data.toString();
          console.error('[ClawdBot Error]', msg.trim());
          if (this.onLog) {
              this.onLog(`ERROR: ${msg.trim()}`);
          }
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
      });

      // Give it a moment to start
      setTimeout(() => resolve(), 2000);
    });
  }

  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
    this.client = null;
  }

  async sendAction(action: any): Promise<any> {
    if (this.client) {
      return this.client.executeAction(action);
    }
    console.warn('Gateway client not initialized, logging action:', action);
    return { success: false, message: 'Gateway not connected' };
  }

  async getStatus(): Promise<any> {
    const processStatus = {
      connected: !!this.process,
      status: this.process ? 'running' : 'stopped',
      version: this.version
    };

    if (this.client) {
      try {
        const clientStatus = await this.client.getStatus();
        return { ...processStatus, ...clientStatus };
      } catch (e) {
        // Client might fail if gateway isn't ready
      }
    }
    return processStatus;
  }
}
