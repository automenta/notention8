import { ChatOllama } from '@langchain/ollama';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { BaseLangChainProvider } from './BaseLangChainProvider';

export class OllamaProvider extends BaseLangChainProvider {
  name = 'Ollama (Local)';
  isAvailable = true;
  private model: ChatOllama | null = null;

  constructor(baseUrl: string = "http://localhost:11434", modelName: string = "llama3") {
    super();
    try {
        this.model = new ChatOllama({
            baseUrl: baseUrl,
            model: modelName,
            temperature: 0.1
        });
    } catch (e) {
         console.error("Failed to initialize Ollama provider", e);
         this.isAvailable = false;
    }
  }

  protected async getModel(): Promise<BaseChatModel | null> {
      return this.model;
  }
}
