import React, { createContext, ReactNode, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useLocalForage } from '../../hooks/useLocalForage';
import type { AppSettings } from '../../types';
import { DEFAULT_ONTOLOGY } from '../../utils/ontology.default';
import { DEFAULT_RELAYS } from '../../utils/nostr';

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
        relays: DEFAULT_RELAYS,
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

  // Ensure relays are populated if missing (migration for existing users)
  useEffect(() => {
      if (!settingsLoading && !settings.nostr.relays) {
          setSettings(s => ({
              ...s,
              nostr: {
                  ...s.nostr,
                  relays: DEFAULT_RELAYS
              }
          }));
      }
  }, [settings.nostr.relays, settingsLoading, setSettings]);


  return (
    <SettingsContext.Provider
      value={{ settings, setSettings, settingsLoading }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContext };
