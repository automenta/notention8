import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { SparklesIcon, CheckIcon, LoadingSpinner } from '../layout/icons';

interface MagicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAutoTag: () => void;
  onRunPrompt: (prompt: string) => Promise<void>;
}

export function MagicModal({ isOpen, onClose, onAutoTag, onRunPrompt }: MagicModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  const handleRun = async (customPrompt?: string) => {
      setIsLoading(true);
      try {
          if (customPrompt) {
              await onRunPrompt(customPrompt);
          } else {
              // Auto Tag
              onAutoTag();
          }
          onClose();
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  const PRESETS = [
      {
          label: 'Fix Grammar & Spelling',
          prompt: 'Fix the grammar and spelling in the following text. Preserve all HTML tags and semantic properties [key:op:value]. Return only the corrected text.'
      },
      {
          label: 'Summarize',
          prompt: 'Summarize the following text into a concise paragraph. Preserve important semantic properties if possible.'
      },
      {
          label: 'Make Professional',
          prompt: 'Rewrite the text to sound more professional and concise. Preserve all HTML tags and semantic properties.'
      },
      {
          label: 'Expand',
          prompt: 'Expand on the ideas in the text, adding detail and context. Maintain the original tone.'
      }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Assistant" className="max-w-xl w-full">
        <div className="flex gap-4 border-b border-gray-700 mb-4">
            <button
                className={`pb-2 px-2 text-sm font-medium ${activeTab === 'presets' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                onClick={() => setActiveTab('presets')}
            >
                Quick Actions
            </button>
            <button
                className={`pb-2 px-2 text-sm font-medium ${activeTab === 'custom' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                onClick={() => setActiveTab('custom')}
            >
                Custom Prompt
            </button>
        </div>

        {activeTab === 'presets' ? (
            <div className="space-y-3">
                <button
                    onClick={() => handleRun()}
                    className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-750 border border-blue-900/50 rounded-lg group transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-900/30 text-blue-400 rounded-md group-hover:scale-110 transition-transform">
                            <SparklesIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-medium text-gray-200">Auto-Tag & Align</h3>
                            <p className="text-xs text-gray-400">Scan text for ontology concepts and date properties.</p>
                        </div>
                    </div>
                    {isLoading ? <LoadingSpinner className="w-5 h-5 text-gray-500" /> : <span className="text-blue-500 text-sm">Run</span>}
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.label}
                            onClick={() => handleRun(preset.prompt)}
                            disabled={isLoading}
                            className="p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-left transition-colors"
                        >
                            <div className="font-medium text-gray-200">{preset.label}</div>
                        </button>
                    ))}
                </div>
            </div>
        ) : (
            <div className="space-y-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., 'Translate this to Spanish' or 'Extract action items'..."
                    className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none resize-none"
                    autoFocus
                />
                <button
                    onClick={() => handleRun(prompt)}
                    disabled={!prompt.trim() || isLoading}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                    {isLoading ? <LoadingSpinner className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
                    Run Custom Prompt
                </button>
            </div>
        )}
    </Modal>
  );
}
