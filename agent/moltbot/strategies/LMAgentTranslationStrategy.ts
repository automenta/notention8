import { DEFAULT_ONTOLOGY } from '@notention/core';
import {
  AgentAction,
  AgentConfiguration,
  NoteTranslationStrategy,
} from '@notention/agent';

export class LMAgentTranslationStrategy implements NoteTranslationStrategy {
  private readonly name = 'LM Agent Translation Strategy';
  private readonly priority = 110;

  canHandle(): boolean {
    return true;
  }

  async translate(note: any): Promise<AgentAction[] | AgentConfiguration> {
    const prompt = this.constructAgentPrompt(note);

    const action: AgentAction = {
      id: `agent-instruction-${note.id}-${Date.now()}`,
      type: 'agent_instruction',
      description: 'Send note context to ClawdBot Agent for processing',
      parameters: {
        message: prompt,
        noteId: note.id,
      },
      priority: 1,
    };

    return [action];
  }

  private constructAgentPrompt(note: any): string {
    let prompt = `User created a note:\n`;
    if (note.title) prompt += `Title: ${note.title}\n`;
    if (note.content) prompt += `Content: ${note.content}\n`;

    const matchingNode = this.findMatchingOntologyNode(note);
    if (matchingNode) {
      prompt += `\nContext: This note matches the ontology type '${matchingNode.label}'.\n`;
      prompt += `Description: ${matchingNode.description || ''}\n`;
      if (matchingNode.attributes) {
        prompt += `Expected Attributes: ${Object.keys(matchingNode.attributes).join(', ')}\n`;
      }
    }

    if (note.properties && note.properties.length > 0) {
      prompt += `Properties:\n`;
      note.properties.forEach((p: any) => {
        prompt += `- ${p.key} ${p.operator || 'is'} ${p.value}\n`;
      });
    }

    prompt += `\n
System Instructions:
You are an intelligent agent capable of managing this notebook.
If the user's note implies an action (like creating a new note or updating the ontology schema), you MUST reply with a JSON object.

Available Tools:
1. create_note: Create a new note.
   Format: { "tool": "create_note", "args": { "title": "...", "content": "...", "tags": [] } }

2. update_ontology: Add a new category or attribute to the system ontology.
   Format: { "tool": "update_ontology", "args": { "parentId": "entity", "id": "new_id", "label": "New Label", "description": "..." } }

3. execute_browser_action: Automate a web browser.
   Format: { "tool": "execute_browser_action", "args": { "url": "...", "steps": [{"type": "navigate|click|type|wait", "selector": "...", "value": "..."}], "extractors": [...] } }

If no action is needed, simply reply with a helpful text response.
`;
    return prompt;
  }

  private findMatchingOntologyNode(note: any): any {
    const flattenNodes = (nodes: any[]): any[] => {
      let flat: any[] = [];
      nodes.forEach((n) => {
        flat.push(n);
        if (n.children) flat = flat.concat(flattenNodes(n.children));
      });
      return flat;
    };

    const allNodes = flattenNodes(DEFAULT_ONTOLOGY);

    if (note.tags && note.tags.length > 0) {
      for (const tag of note.tags) {
        const found = allNodes.find(
          (n) => n.id === tag || n.label.toLowerCase() === tag.toLowerCase()
        );
        if (found) return found;
      }
    }

    if (note.properties && note.properties.length > 0) {
      const keys = note.properties.map((p: any) => p.key);
      for (const node of allNodes) {
        if (
          node.requiredAttributes &&
          node.requiredAttributes.every((k: string) => keys.includes(k))
        ) {
          return node;
        }
      }
    }

    return null;
  }

  getPriority(): number {
    return this.priority;
  }

  getName(): string {
    return this.name;
  }
}
