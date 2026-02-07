import { ChatOpenAI } from '@langchain/openai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { BaseLangChainProvider } from './BaseLangChainProvider';

export class OpenAIProvider extends BaseLangChainProvider {
  name = 'OpenAI Compatible';
  isAvailable = true;
  private model: ChatOpenAI | null = null;

  constructor(apiKey: string, baseUrl?: string, modelName: string = 'gpt-3.5-turbo') {
    super();
    // For local OpenAI compatible endpoints (like vLLM, text-generation-webui), apiKey can be dummy
    const key = apiKey || 'dummy-key';

    // Config object for ChatOpenAI
    const config: any = {
        openAIApiKey: key,
        modelName: modelName,
        temperature: 0.1
    };

    if (baseUrl) {
        config.configuration = {
            baseURL: baseUrl
        };
    }

    try {
        this.model = new ChatOpenAI(config);
    } catch (e) {
        console.error("Failed to initialize OpenAI provider", e);
        this.isAvailable = false;
    }
  }

  protected async getModel(): Promise<BaseChatModel | null> {
      return this.model;
  }
}
