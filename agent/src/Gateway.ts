import { spawn, ChildProcess } from 'child_process';
import path from 'path';

export class Gateway {
  private process: ChildProcess | null = null;
  private configDir: string;
  public version: string = '2026.1.24-3'; // Hardcoded matches installed version

  constructor(config: { configDir: string }) {
    this.configDir = config.configDir;
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Spawning ClawdBot gateway...');
      // Assuming 'clawdbot' is in PATH or node_modules/.bin
      // We use 'npx' or direct path if needed. 'clawdbot' command works via npx.
      // But spawn needs command.

      const cmd = 'npx';
      const args = ['clawdbot', 'gateway', '--port', '18789', '--no-color'];

      this.process = spawn(cmd, args, {
        cwd: process.cwd(),
        env: { ...process.env, CLAWDBOT_HOME: this.configDir },
        stdio: ['ignore', 'pipe', 'pipe'] // Pipe stdout/stderr to log
      });

      if (this.process.stdout) {
        this.process.stdout.on('data', (data) => {
          const msg = data.toString();
          console.log('[ClawdBot]', msg.trim());
          if (msg.includes('Gateway listening') || msg.includes('ready')) {
            // resolve(); // In real life we'd wait for ready signal
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
          // If it exits immediately, we reject
          // reject(new Error(`ClawdBot exited with code ${code}`));
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
  }

  async sendAction(action: any): Promise<any> {
    // Placeholder: Implement actual communication with the gateway via WS or HTTP if needed
    // The CLI might have a command to send actions too.
    console.log('Sending action to ClawdBot:', action);
    return { success: true };
  }

  async getStatus(): Promise<any> {
    return {
      connected: !!this.process,
      status: this.process ? 'running' : 'stopped',
      version: this.version
    };
  }
}
