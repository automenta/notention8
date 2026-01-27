import React, { useState, useEffect } from 'react';
import type { Property } from '@notention/core';
import { PropertyWidget } from './PropertyWidget';
import { extractPropertiesFromText } from '../../services/ai/propertyExtraction';
import { useSettings } from '../../hooks/useSettingsContext';
import { useNoteActions } from '../../hooks/useNoteActions';
import { createNote } from '@notention/core';
import { RemoteAIProvider } from '../../services/ai/RemoteProvider';
import { LocalAIProvider } from '../../services/ai/LocalProvider';

export function HybridInput() {
  const [text, setText] = useState('');
  const [suggestedProps, setSuggestedProps] = useState<Property[]>([]);
  const { settings } = useSettings();
  const { createNoteAndNavigate } = useNoteActions();

  // Initialize AI Provider
  const aiService = React.useMemo(() => {
      if (settings.aiProvider === 'remote') {
          return new RemoteAIProvider(settings.googleGeminiApiKey || '');
      }
      return new LocalAIProvider(settings.aiModel || 'Llama-3-8B-Instruct-q4f32_1');
  }, [settings.aiProvider, settings.googleGeminiApiKey, settings.aiModel]);

  // Debounced extraction
  useEffect(() => {
      if (!text || text.length < 10) return;

      const timer = setTimeout(async () => {
          if (settings.aiEnabled) {
              const props = await extractPropertiesFromText(text, aiService);
              setSuggestedProps(props);
          }
      }, 1000); // 1s debounce to avoid API spam

      return () => clearTimeout(timer);
  }, [text, settings.aiEnabled, aiService]);

  const handleCreate = () => {
      createNoteAndNavigate(
          undefined, // Untitled
          text,
          suggestedProps
      );
      setText('');
      setSuggestedProps([]);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe what you want... (e.g. 'Looking for React dev, >$80/hr')"
        className="w-full h-24 bg-gray-900 rounded p-3 text-white resize-none focus:ring-2 focus:ring-blue-500 outline-none"
      />

      {suggestedProps.length > 0 && (
        <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-2">
          <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Inferred Properties:</h4>
          {suggestedProps.map((prop, i) => (
            <PropertyWidget
              key={i}
              property={prop}
              onChange={(updated) => {
                const next = [...suggestedProps];
                next[i] = updated;
                setSuggestedProps(next);
              }}
              onRemove={() => {
                setSuggestedProps(prev =>
                  prev.filter((_, idx) => idx !== i)
                );
              }}
            />
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <button
            onClick={handleCreate}
            disabled={!text}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white font-medium transition-colors"
        >
            Create Note
        </button>
      </div>
    </div>
  );
}
