import React from 'react';
import { SparklesIcon } from '../icons';
import { isGeminiApiKeyAvailable } from '@/services/ai/RemoteProvider';
import type { AppSettings } from '@/types';
import { Toggle } from '../common/Toggle';

interface AITabProps {
  settings: AppSettings;
  setSettings: (updater: (settings: AppSettings) => AppSettings) => void;
}

export const AITab: React.FC<AITabProps> = ({ settings, setSettings }) => {
  const apiKeyAvailable = isGeminiApiKeyAvailable();

  const handleToggleAI = () => {
    if (!apiKeyAvailable) return;
    setSettings((prev) => ({ ...prev, aiEnabled: !prev.aiEnabled }));
  };

  return (
    <div className="bg-gray-900/70 p-6 rounded-lg animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-3">
        <SparklesIcon className="h-6 w-6 text-blue-400" />
        AI Enhancements
      </h2>
      <div className="flex items-center justify-between">
        <div className="flex-grow">
          <label htmlFor="ai-toggle" className="font-medium text-gray-300">
            Enable AI Features
          </label>
          <p className="text-sm text-gray-400 mt-1">
            Enables features like note summarization using Google Gemini.
          </p>
        </div>
        <div
          className="relative"
          title={
            !apiKeyAvailable
              ? 'A valid Gemini API key must be configured to enable this feature.'
              : ''
          }
        >
          <Toggle
            id="ai-toggle"
            checked={settings.aiEnabled}
            onChange={handleToggleAI}
            disabled={!apiKeyAvailable}
            ariaLabel="Enable AI Features"
          />
        </div>
      </div>
      {!apiKeyAvailable && (
        <div className="mt-4 p-3 bg-yellow-900/50 border border-yellow-700 text-yellow-300 text-sm rounded-md">
          <strong>Action Required:</strong> A Google Gemini API key is not
          configured. AI features are disabled. Please set the{' '}
          <code>API_KEY</code> to proceed.
        </div>
      )}
    </div>
  );
};
