import React from 'react';
import { SparklesIcon } from '../icons';
import { isApiKeyAvailable } from '@/services/geminiService.ts';
import type { AppSettings } from '@/types';

interface AITabProps {
  settings: AppSettings;
  setSettings: (updater: (settings: AppSettings) => AppSettings) => void;
}

export const AITab: React.FC<AITabProps> = ({ settings, setSettings }) => {
  const handleToggleAI = () => {
    if (!isApiKeyAvailable) return;
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
            !isApiKeyAvailable
              ? 'A valid Gemini API key must be configured to enable this feature.'
              : ''
          }
        >
          <button
            id="ai-toggle"
            onClick={handleToggleAI}
            disabled={!isApiKeyAvailable}
            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 ${
              isApiKeyAvailable
                ? settings.aiEnabled
                  ? 'bg-blue-600'
                  : 'bg-gray-600'
                : 'bg-gray-700 cursor-not-allowed'
            }`}
          >
            <span
              aria-hidden="true"
              className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200 ${
                settings.aiEnabled && isApiKeyAvailable
                  ? 'translate-x-5'
                  : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
      {!isApiKeyAvailable && (
        <div className="mt-4 p-3 bg-yellow-900/50 border border-yellow-700 text-yellow-300 text-sm rounded-md">
          <strong>Action Required:</strong> A Google Gemini API key is not
          configured. AI features are disabled. Please set the{' '}
          <code>API_KEY</code> to proceed.
        </div>
      )}
    </div>
  );
};
