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
    'notention-settings-v2',
    {
      aiEnabled: false,
      developerMode: false,
      theme: 'dark',
      aiProvider: 'gemini',
      aiConfig: {
          provider: 'gemini',
          gemini: { apiKey: '' },
          openai: { apiKey: '', modelName: 'gpt-3.5-turbo' },
          ollama: { baseUrl: 'http://localhost:11434', modelName: 'llama3' },
          webllm: { modelId: 'Llama-3.2-3B-Instruct-q4f16_1-MLC' }
      },
      nostr: {
        privkey: null,
        relays: DEFAULT_RELAYS,
      },
      ontology: [],
      customTemplates: [],
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

  // Migration: Move old googleGeminiApiKey to aiConfig.gemini.apiKey
  useEffect(() => {
      if (!settingsLoading && settings.googleGeminiApiKey && !settings.aiConfig?.gemini?.apiKey) {
          setSettings(s => ({
              ...s,
              aiConfig: {
                  ...s.aiConfig,
                  gemini: {
                      apiKey: s.googleGeminiApiKey || ''
                  }
              },
              googleGeminiApiKey: undefined // Clear old key
          }));
      }
  }, [settings.googleGeminiApiKey, settings.aiConfig, settingsLoading, setSettings]);


  return (
    <SettingsContext.Provider
      value={{ settings, setSettings, settingsLoading }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContext };
