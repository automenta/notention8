import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

// Define message types
interface AgentMessage {
  type: string;
  payload?: any;
  timestamp?: string;
  [key: string]: any;
}

interface AgentState {
  connected: boolean;
  status: string;
  activeAgents: any[];
  lastMessage: AgentMessage | null;
}

interface AgentContextType {
  isConnected: boolean;
  agentState: AgentState;
  lastMessage: AgentMessage | null;
  sendMessage: (type: string, payload?: any) => void;
  connect: () => void;
  disconnect: () => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};

interface AgentProviderProps {
  children: ReactNode;
  url?: string;
}

export const AgentProvider: React.FC<AgentProviderProps> = ({
  children,
  url = 'ws://localhost:3000/ws/clawdbot'
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [agentState, setAgentState] = useState<AgentState>({
    connected: false,
    status: 'disconnected',
    activeAgents: [],
    lastMessage: null
  });

  const connect = useCallback(() => {
    if (socket?.readyState === WebSocket.OPEN) return;

    if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) return;

    const ws = new WebSocket(url);

    ws.onopen = () => {
      setAgentState(prev => ({ ...prev, connected: true, status: 'connected' }));
      ws.send(JSON.stringify({ type: 'clawdbot_status' }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        setAgentState(prev => {
           if (message.type === 'clawdbot_status_update') {
               return { ...prev, lastMessage: message, ...message.payload };
           }
           return { ...prev, lastMessage: message };
        });

      } catch (error) {
        console.error('Error parsing agent message:', error);
      }
    };

    ws.onclose = () => {
      setAgentState(prev => ({ ...prev, connected: false, status: 'disconnected' }));
      setSocket(null);
      setTimeout(() => connect(), 5000);
    };

    ws.onerror = (error) => {
      console.error('Agent WebSocket error:', error);
    };

    setSocket(ws);

  }, [url, socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
  }, [socket]);

  const sendMessage = useCallback((type: string, payload?: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('Cannot send message: Agent WebSocket not connected');
    }
  }, [socket]);

  useEffect(() => {
    connect();
    return () => {
        if(socket) socket.close();
    };
  }, []);

  const value = {
    isConnected: agentState.connected,
    agentState,
    lastMessage: agentState.lastMessage,
    sendMessage,
    connect,
    disconnect
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};
