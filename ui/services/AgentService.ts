import { ConnectionError } from '../utils/errors';

type Listener = (...args: any[]) => void;

class AgentService {
  private ws: WebSocket | null = null;
  private url: string | null = null;
  private listeners: Record<string, Listener[]> = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect(url?: string): Promise<void> {
    if (this.ws) return;

    const resolvedUrl = await this.resolveUrl(url);
    if (!resolvedUrl) {
      console.warn('Could not resolve agent URL');
      return;
    }

    this.url = resolvedUrl;

    try {
      this.ws = new WebSocket(resolvedUrl);
      this.setupWebSocketHandlers(resolvedUrl);
    } catch (error) {
      console.error('Failed to create WebSocket', error);
      throw new ConnectionError('WebSocket creation failed', error as Error);
    }
  }

  private async resolveUrl(url?: string): Promise<string | null> {
    if (url) return url;

    // Try to discover from config
    try {
      const res = await fetch('/agent-config.json');
      if (res.ok) {
        const config = await res.json();
        return config.wsUrl;
      }
    } catch (e) {
      // Config file not found, continue with fallback
    }

    // Fallback to global variable
    if (typeof window !== 'undefined' && (window as any).CLAWDBOT_WS_URL) {
      return (window as any).CLAWDBOT_WS_URL;
    }

    return null;
  }

  private setupWebSocketHandlers(url: string): void {
    this.ws!.onopen = () => {
      console.log('Connected to Agent');
      this.reconnectAttempts = 0; // Reset attempts on successful connection
      this.emit('connected');
    };

    this.ws!.onmessage = (msg) => {
      this.emit('message', msg.data);
    };

    this.ws!.onclose = () => {
      this.ws = null;
      this.emit('disconnected');

      // Reconnect with exponential backoff if attempts are below max
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Max 30 seconds
        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
        setTimeout(() => this.connect(url), delay);
      } else {
        console.error('Max reconnection attempts reached');
      }
    };

    this.ws!.onerror = (err) => {
      console.error('Agent connection error', err);
    };
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('Agent not connected, cannot send', data);
    }
  }

  on(event: string, fn: Listener): void {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  off(event: string, fn: Listener): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(listener => listener !== fn);
  }

  emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(fn => fn(...args));
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const agentService = new AgentService();
