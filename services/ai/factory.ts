import type { AppSettings } from '../../types';
import { LocalAIProvider } from './LocalProvider';
import { GeminiProvider } from './RemoteProvider';
import { WebLLMProvider } from './WebLLMProvider';
import { OllamaProvider } from './OllamaProvider';
import { OpenAIProvider } from './OpenAIProvider';
import type { AIProvider } from './types';

export const createAIProvider = (settings: AppSettings, onProgress?: (msg: string) => void): AIProvider => {
    if (!settings.aiEnabled) {
        return new LocalAIProvider();
    }

    const config = settings.aiConfig || { provider: 'gemini' };

    switch (settings.aiProvider) {
        case 'webllm':
            return new WebLLMProvider(config.webllm?.modelId, (report) => {
                if (onProgress) onProgress(`Loading Model: ${Math.round(report.progress * 100)}% - ${report.text}`);
            });
        case 'ollama':
            return new OllamaProvider(config.ollama?.baseUrl, config.ollama?.modelName);
        case 'openai':
            return new OpenAIProvider(
                config.openai?.apiKey || '',
                config.openai?.baseUrl,
                config.openai?.modelName
            );
        case 'gemini':
        default:
            return new GeminiProvider(config.gemini?.apiKey || settings.googleGeminiApiKey);
    }
};
