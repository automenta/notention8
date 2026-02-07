import React, { createContext, useContext, ReactNode } from 'react';
import { useSimulator } from '../../hooks/simulator/useSimulator';

type UseSimulatorReturn = ReturnType<typeof useSimulator>;

const SimulatorContext = createContext<UseSimulatorReturn | null>(null);

export const SimulatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const simulator = useSimulator();

  return (
    <SimulatorContext.Provider value={simulator}>
      {children}
    </SimulatorContext.Provider>
  );
};

export const useSimulatorContext = () => {
  const context = useContext(SimulatorContext);
  if (!context) {
    throw new Error('useSimulatorContext must be used within a SimulatorProvider');
  }
  return context;
};
