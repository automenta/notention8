import React, { useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { agentService } from './services/AgentService';

import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { ConfigSync } from './components/config/ConfigSync';
import { AgentCursor } from './components/AgentCursor';

function App() {
  useEffect(() => {
    agentService.connect();
  }, []);

  return (
    <>
      <AgentCursor />
      <AppShell />
      <OnboardingModal />
      <ConfigSync />
    </>
  );
}

export default App;
