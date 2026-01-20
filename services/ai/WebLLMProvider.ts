import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";
import { WebLLMChatModel } from './LangChainAdapters';
import { BaseLangChainProvider } from './BaseLangChainProvider';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

export const AVAILABLE_MODELS = [
    { id: "Llama-3.2-3B-Instruct-q4f16_1-MLC", label: "Llama 3.2 3B (Balanced)" },
    { id: "Llama-3.2-1B-Instruct-q4f16_1-MLC", label: "Llama 3.2 1B (Fast, Lower Quality)" },
    { id: "RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC", label: "RedPajama 3B" }
];

export class WebLLMProvider extends BaseLangChainProvider {
  name = 'WebLLM (In-Browser)';
  isAvailable = true;
  private engine: MLCEngine | null = null;
  private chatModel: WebLLMChatModel | null = null;
  private modelId: string;
  private initPromise: Promise<void> | null = null;

  private onProgress?: (report: { text: string; progress: number }) => void;

  constructor(modelId: string = "Llama-3.2-3B-Instruct-q4f16_1-MLC", onProgress?: (report: { text: string; progress: number }) => void) {
    super();
    this.modelId = modelId;
    this.onProgress = onProgress;
  }

  protected async getModel(): Promise<BaseChatModel | null> {
      if (this.chatModel) return this.chatModel;

      if (!this.initPromise) {
          this.initPromise = (async () => {
             try {
                 if (!navigator.gpu) throw new Error("WebGPU not supported");
                 this.engine = await CreateMLCEngine(
                     this.modelId,
                     {
                         initProgressCallback: (report) => {
                             if (this.onProgress) this.onProgress({ text: report.text, progress: report.progress });
                             console.log(`WebLLM: ${report.text}`);
                         }
                     }
                 );
                 this.chatModel = new WebLLMChatModel(this.engine, this.modelId);
             } catch (e) {
                 console.warn("Failed to load WebLLM:", e);
                 throw e;
             }
          })();
      }

      try {
          await this.initPromise;
          return this.chatModel;
      } catch {
          return null;
      }
  }
}
