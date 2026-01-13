import { useState, useCallback } from 'react';
import { RemoteAIProvider, isGeminiApiKeyAvailable } from '../services/ai/RemoteProvider';
import { getTextFromHtml } from '../utils/nostr';
import { useSettings } from './useSettingsContext';

interface UseAutoTaggingProps {
  content: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

export const useAutoTagging = ({ content, tags, onTagsChange }: UseAutoTaggingProps) => {
  const { settings } = useSettings();
  const [isAutoTagging, setIsAutoTagging] = useState(false);

  const handleAutoTag = useCallback(async () => {
    if (!content) return;
    if (!isGeminiApiKeyAvailable(settings.googleGeminiApiKey)) return;

    setIsAutoTagging(true);
    try {
      const text = getTextFromHtml(content);
      const provider = new RemoteAIProvider(settings.googleGeminiApiKey);
      const suggestions = await provider.suggestTags(text);
      const uniqueTags = Array.from(
        new Set([...tags, ...suggestions])
      );
      onTagsChange(uniqueTags);
    } catch (e) {
      alert(
        'Failed to auto-tag: ' + (e instanceof Error ? e.message : String(e))
      );
    } finally {
      setIsAutoTagging(false);
    }
  }, [content, tags, onTagsChange, settings.googleGeminiApiKey]);

  return {
    isAutoTagging,
    handleAutoTag,
    isApiKeyAvailable: isGeminiApiKeyAvailable(settings.googleGeminiApiKey)
  };
};
