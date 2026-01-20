import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { BaseLangChainProvider } from './BaseLangChainProvider';

export const isGeminiApiKeyAvailable = (userKey?: string): boolean => {
  const key = userKey || process.env.API_KEY;
  return !!(key && key !== 'YOUR_GEMINI_API_KEY');
};

export class GeminiProvider extends BaseLangChainProvider {
  name = 'Google Gemini (LangChain)';
  isAvailable: boolean;
  private model: ChatGoogleGenerativeAI | null = null;
  private modelName = 'gemini-1.5-flash';

  constructor(apiKey?: string) {
    super();
    const key = apiKey || process.env.API_KEY;
    this.isAvailable = !!(key && key !== 'YOUR_GEMINI_API_KEY');
    if (this.isAvailable) {
      this.model = new ChatGoogleGenerativeAI({
        apiKey: key || '',
        modelName: this.modelName,
        maxOutputTokens: 2048,
        temperature: 0.1
      });
    }
  }

  protected async getModel(): Promise<BaseChatModel | null> {
      return this.model;
  }
}
