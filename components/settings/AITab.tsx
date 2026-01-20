import React from 'react';
import { SparklesIcon, CpuChipIcon } from '../layout/icons';
import { AVAILABLE_MODELS } from '@/services/ai/WebLLMProvider';
import type { AppSettings, AIConfig } from '@/types';
import { useToast } from '../contexts/ToastContext';
import { Toggle } from '../common/Toggle';
import { Input } from '../common/Input';

interface AITabProps {
  settings: AppSettings;
  setSettings: (updater: (settings: AppSettings) => AppSettings) => void;
}

export const AITab: React.FC<AITabProps> = ({ settings, setSettings }) => {
  const { addToast } = useToast();

  const aiConfig: AIConfig = settings.aiConfig || {
      provider: 'gemini',
      gemini: { apiKey: '' },
      openai: { apiKey: '', modelName: 'gpt-3.5-turbo' },
      ollama: { baseUrl: 'http://localhost:11434', modelName: 'llama3' },
      webllm: { modelId: 'Llama-3.2-3B-Instruct-q4f16_1-MLC' }
  };

  const handleToggleAI = () => {
    setSettings((prev) => ({ ...prev, aiEnabled: !prev.aiEnabled }));
  };

  const updateConfig = (updater: (prev: AIConfig) => AIConfig) => {
      setSettings(prev => ({
          ...prev,
          aiConfig: updater(prev.aiConfig || aiConfig)
      }));
  };

  const currentProvider = settings.aiProvider || 'gemini';

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const provider = e.target.value as any;
      setSettings(prev => ({
           ...prev,
           aiProvider: provider,
           aiConfig: { ...prev.aiConfig, provider } // Sync logic
      }));
  };

  return (
    <div className="bg-gray-900/70 p-6 rounded-lg animate-fade-in space-y-6">
      <div className="flex flex-col gap-2">
           <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-3">
            <SparklesIcon className="h-6 w-6 text-blue-400" />
            AI Enhancements
          </h2>
          <p className="text-sm text-gray-400">
            Configure how the Gardener AI works.
          </p>
      </div>

      <div className="p-4 bg-gray-800 rounded border border-gray-700">
          <label className="block text-sm font-medium text-gray-300 mb-2">AI Provider</label>
          <select
             value={currentProvider}
             onChange={handleProviderChange}
             className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none mb-4"
          >
              <option value="gemini">Google Gemini (Remote)</option>
              <option value="openai">OpenAI Compatible (Remote/Local)</option>
              <option value="ollama">Ollama (Local)</option>
              <option value="webllm">WebLLM (In-Browser)</option>
          </select>

          {/* WebLLM Config */}
          {currentProvider === 'webllm' && (
              <>
                <label className="block text-sm font-medium text-gray-300 mb-2">Local Model</label>
                <select
                    value={aiConfig.webllm?.modelId || AVAILABLE_MODELS[0].id}
                    onChange={(e) => updateConfig(prev => ({ ...prev, webllm: { ...prev.webllm, modelId: e.target.value } }))}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none mb-4"
                >
                    {AVAILABLE_MODELS.map(m => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                </select>
                <div className="p-3 bg-blue-900/20 border border-blue-800 rounded text-sm text-blue-200 flex gap-2">
                    <CpuChipIcon className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <p className="font-bold mb-1">Local Processing</p>
                        <p>Uses WebGPU to run the selected model directly in your browser.</p>
                    </div>
                </div>
              </>
          )}

          {/* Gemini Config */}
          {currentProvider === 'gemini' && (
              <Input
                  label="Google Gemini API Key"
                  type="password"
                  value={aiConfig.gemini?.apiKey || ''}
                  onChange={(e) => updateConfig(prev => ({ ...prev, gemini: { ...prev.gemini, apiKey: e.target.value } }))}
                  placeholder="Enter API Key"
              />
          )}

          {/* OpenAI Config */}
          {currentProvider === 'openai' && (
              <div className="space-y-4">
                  <Input
                      label="API Key"
                      type="password"
                      value={aiConfig.openai?.apiKey || ''}
                      onChange={(e) => updateConfig(prev => ({ ...prev, openai: { ...prev.openai!, apiKey: e.target.value } }))}
                      placeholder="sk-..."
                  />
                  <Input
                      label="Base URL (Optional)"
                      type="text"
                      value={aiConfig.openai?.baseUrl || ''}
                      onChange={(e) => updateConfig(prev => ({ ...prev, openai: { ...prev.openai!, baseUrl: e.target.value } }))}
                      placeholder="https://api.openai.com/v1"
                  />
                  <Input
                      label="Model Name"
                      type="text"
                      value={aiConfig.openai?.modelName || 'gpt-3.5-turbo'}
                      onChange={(e) => updateConfig(prev => ({ ...prev, openai: { ...prev.openai!, modelName: e.target.value } }))}
                      placeholder="gpt-3.5-turbo"
                  />
              </div>
          )}

          {/* Ollama Config */}
          {currentProvider === 'ollama' && (
              <div className="space-y-4">
                  <Input
                      label="Base URL"
                      type="text"
                      value={aiConfig.ollama?.baseUrl || 'http://localhost:11434'}
                      onChange={(e) => updateConfig(prev => ({ ...prev, ollama: { ...prev.ollama!, baseUrl: e.target.value } }))}
                      placeholder="http://localhost:11434"
                  />
                  <Input
                      label="Model Name"
                      type="text"
                      value={aiConfig.ollama?.modelName || 'llama3'}
                      onChange={(e) => updateConfig(prev => ({ ...prev, ollama: { ...prev.ollama!, modelName: e.target.value } }))}
                      placeholder="llama3"
                  />
                  <p className="text-xs text-gray-500">
                      Ensure your Ollama server is running and accessible (enable CORS if needed).
                  </p>
              </div>
          )}

          {/* Test Connection Button (for local/custom providers) */}
          {(currentProvider === 'openai' || currentProvider === 'ollama') && (
              <div className="mt-4">
                  <button
                      onClick={() => {
                          addToast('Use the "Magic" button in the editor to test.', 'info');
                      }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
                  >
                      Test Connection (Save first)
                  </button>
              </div>
          )}

      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <div className="flex-grow">
          <label htmlFor="ai-toggle" className={`font-medium text-gray-300`}>
            Enable AI Features
          </label>
          <p className="text-sm text-gray-500 mt-1">
            Enables features like note summarization, auto-tagging, and ontology gardening.
          </p>
        </div>
        <div className="relative">
          <Toggle
            id="ai-toggle"
            checked={settings.aiEnabled}
            onChange={handleToggleAI}
            ariaLabel="Enable AI Features"
          />
        </div>
      </div>
    </div>
  );
};
