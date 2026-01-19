import React, { useState } from 'react';
import { SparklesIcon, CheckIcon } from '../icons';
import { isGeminiApiKeyAvailable } from '@/services/ai/RemoteProvider';
import type { AppSettings } from '@/types';
import { Toggle } from '../common/Toggle';

interface AITabProps {
  settings: AppSettings;
  setSettings: (updater: (settings: AppSettings) => AppSettings) => void;
}

export const AITab: React.FC<AITabProps> = ({ settings, setSettings }) => {
  const [keyInput, setKeyInput] = useState(settings.googleGeminiApiKey || '');

  const apiKeyAvailable = isGeminiApiKeyAvailable(settings.googleGeminiApiKey);

  const handleToggleAI = () => {
    if (!apiKeyAvailable) return;
    setSettings((prev) => ({ ...prev, aiEnabled: !prev.aiEnabled }));
  };

  const saveKey = () => {
      setSettings(prev => ({ ...prev, googleGeminiApiKey: keyInput }));
  };

  return (
    <div className="bg-gray-900/70 p-6 rounded-lg animate-fade-in space-y-6">
      <div className="flex flex-col gap-2">
           <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-3">
            <SparklesIcon className="h-6 w-6 text-blue-400" />
            AI Enhancements
          </h2>
          <p className="text-sm text-gray-400">
            Configure AI features using Google Gemini.
          </p>
      </div>

      <div className="p-4 bg-gray-800 rounded border border-gray-700">
           <label className="block text-sm font-medium text-gray-300 mb-2">Google Gemini API Key</label>
           <div className="flex gap-2">
               <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Enter API Key"
                  className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
               />
               <button
                  onClick={saveKey}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium flex items-center gap-2"
               >
                   <CheckIcon className="w-4 h-4"/> Save
               </button>
           </div>
           <p className="text-xs text-gray-500 mt-2">
               Your key is stored locally in your browser and sent directly to Google. It never touches our servers.
           </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <div className="flex-grow">
          <label htmlFor="ai-toggle" className={`font-medium ${apiKeyAvailable ? 'text-gray-300' : 'text-gray-500'}`}>
            Enable AI Features
          </label>
          <p className="text-sm text-gray-500 mt-1">
            Enables features like note summarization and auto-tagging.
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
          configured. AI features are disabled. Please enter a key above.
        </div>
      )}
    </div>
  );
};
