import React, { useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { agentService } from './services/AgentService';

function App() {
  useEffect(() => {
    agentService.connect();
  }, []);

  return <AppShell />;
}

export default App;
