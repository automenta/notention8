import { SimpleChatModel } from "@langchain/core/language_models/chat_models";
import { BaseMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import type { MLCEngine } from "@mlc-ai/web-llm";

/**
 * A LangChain-compatible wrapper for the WebLLM engine.
 * This allows us to use WebLLM with LangChain tools, chains, and parsers.
 */
export class WebLLMChatModel extends SimpleChatModel {
  private engine: MLCEngine;
  private modelId: string;

  constructor(engine: MLCEngine, modelId: string) {
    super({});
    this.engine = engine;
    this.modelId = modelId;
  }

  _llmType() {
    return "web-llm";
  }

  async _call(
    messages: BaseMessage[],
    options: this["ParsedCallOptions"]
  ): Promise<string> {
    const formattedMessages = messages.map((m) => {
        let role = "user";
        if (m instanceof AIMessage) role = "assistant";
        if (m instanceof SystemMessage) role = "system";
        return { role, content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) };
    });

    const response = await this.engine.chat.completions.create({
      messages: formattedMessages,
      temperature: options.temperature || 0.7,
      stream: false, // SimpleChatModel usually expects full response, though we could stream
    });

    return response.choices[0]?.message?.content || "";
  }
}
