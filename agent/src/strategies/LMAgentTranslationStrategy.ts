import {
  NoteTranslationStrategy,
  ClawdBotAction,
  ClawdBotConfiguration,
  Condition,
  Trigger
} from './NoteTranslationStrategy';

export class LMAgentTranslationStrategy implements NoteTranslationStrategy {
  private readonly name = 'LM Agent Translation Strategy';
  private readonly priority = 110; // Highest priority - try this first

  canHandle(note: any): boolean {
    // This strategy is universal and can handle any note by delegating to the Agent
    return true;
  }

  async translate(note: any): Promise<ClawdBotAction[] | ClawdBotConfiguration> {
    console.log(`LM Agent processing note: ${note.title || 'Untitled'}`);

    // Construct a prompt for the agent based on the note content and properties
    const prompt = this.constructAgentPrompt(note);

    // Create a single action that sends this prompt to the Agent
    // This leverages the Agent's own intelligence to determine the next steps
    // (Generalization via delegation)
    const action: ClawdBotAction = {
      id: `agent-instruction-${note.id}-${Date.now()}`,
      type: 'agent_instruction',
      description: 'Send note context to ClawdBot Agent for processing',
      parameters: {
        message: prompt,
        noteId: note.id
      },
      priority: 1
    };

    return [action];
  }

  private constructAgentPrompt(note: any): string {
    let prompt = `User created a note:\n`;
    if (note.title) prompt += `Title: ${note.title}\n`;
    if (note.content) prompt += `Content: ${note.content}\n`;

    if (note.properties && note.properties.length > 0) {
      prompt += `Properties:\n`;
      note.properties.forEach((p: any) => {
        // Format: key operator value (e.g., "role is Developer")
        prompt += `- ${p.key} ${p.operator || 'is'} ${p.value}\n`;
      });
    }

    prompt += `\nPlease analyze this note and execute the appropriate action using your available tools (Browser, Message, etc.). If no action is needed, simply acknowledge.`;
    return prompt;
  }

  getPriority(): number {
    return this.priority;
  }

  getName(): string {
    return this.name;
  }
}
