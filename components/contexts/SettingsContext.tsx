import React, { createContext, ReactNode, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useLocalForage } from '../../hooks/useLocalForage';
import type { AppSettings } from '../../types';
import { DEFAULT_ONTOLOGY } from '../../utils/ontology.default';

interface SettingsContextType {
  settings: AppSettings;
  setSettings: Dispatch<SetStateAction<AppSettings>>;
  settingsLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings, settingsLoading] = useLocalForage<AppSettings>(
    'notention-settings',
    {
      aiEnabled: false,
      developerMode: false,
      theme: 'dark',
      nostr: {
        privkey: null,
      },
      ontology: [],
    }
  );

  // Populate with default ontology on first run
  useEffect(() => {
    if (
      !settingsLoading &&
      (!settings.ontology || settings.ontology.length === 0)
    ) {
      setSettings((s) => ({ ...s, ontology: DEFAULT_ONTOLOGY }));
    }
  }, [settings.ontology, settingsLoading, setSettings]);

  return (
    <SettingsContext.Provider
      value={{ settings, setSettings, settingsLoading }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContext };
