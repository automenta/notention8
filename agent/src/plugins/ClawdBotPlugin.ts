import { Plugin } from './PluginInterface';

interface ClawdBotGateway {
  sendAction(action: any): Promise<any>;
  getStatus(): Promise<any>;
}

export class ClawdBotPlugin implements Plugin {
  id = 'clawdbot-integration';
  name = 'ClawdBot Integration';
  description = 'Integrates ClawdBot execution capabilities with Notention';
  version = '1.0.0';
  
  private gateway: ClawdBotGateway | null = null;
  private wsClients: Set<any> = new Set();
  
  constructor(gateway: any) {
    this.gateway = gateway;
  }
  
  initialize(): void {
    console.log('ClawdBot plugin initialized');
  }
  
  destroy(): void {
    console.log('ClawdBot plugin destroyed');
  }
  
  onNoteCreated(note: any): void {
    console.log('Note created:', note.id);
    // Trigger ClawdBot workflows based on note content
    this.processNoteForExecution(note);
  }

  onNoteUpdated(note: any): void {
    console.log('Note updated:', note.id);
    // Trigger ClawdBot workflows based on note changes
    this.processNoteForExecution(note);
  }
  
  onNoteDeleted(noteId: string): void {
    console.log('Note deleted:', noteId);
  }
  
  handleMessage(message: any): void {
    console.log('ClawdBot plugin received message:', message.type);
    
    switch(message.type) {
      case 'clawdbot_execute':
        this.executeClawdBotAction(message.payload);
        break;
      case 'clawdbot_status':
        this.getClawdBotStatus();
        break;
      default:
        console.log('Unknown message type for ClawdBot plugin:', message.type);
    }
  }
  
  injectUI(): string {
    // Return JavaScript code that will be injected into the UI
    // This allows the UI to have ClawdBot functionality without knowing about it
    return `
      <script>
        // Injected ClawdBot functionality
        window.ClawdBotIntegration = {
          executeAction: function(action) {
            if (window.uiWebSocket && window.uiWebSocket.readyState === WebSocket.OPEN) {
              window.uiWebSocket.send(JSON.stringify({
                type: 'clawdbot_execute',
                payload: action
              }));
            } else {
              console.warn('No connection to ClawdBot gateway');
            }
          },
          
          getStatus: function() {
            if (window.uiWebSocket && window.uiWebSocket.readyState === WebSocket.OPEN) {
              window.uiWebSocket.send(JSON.stringify({
                type: 'clawdbot_status'
              }));
            }
          },
          
          // Listen for ClawdBot events
          onClawdBotEvent: function(callback) {
            // Implementation would depend on how UI receives messages
          }
        };
        
        console.log('ClawdBot integration loaded in UI');
      </script>
    `;
  }
  
  getAPI(): any {
    return {
      executeAction: this.executeClawdBotAction.bind(this),
      getStatus: this.getClawdBotStatus.bind(this),
      analyzeNote: this.analyzeNoteForAutomation.bind(this)
    };
  }
  
  private async executeClawdBotAction(payload: any): Promise<void> {
    if (!this.gateway) {
      console.error('No ClawdBot gateway available');
      return;
    }
    
    try {
      console.log('Executing ClawdBot action:', payload);
      // In a real implementation, this would call the actual ClawdBot gateway
      // const result = await this.gateway.sendAction(payload);
      
      // For now, mock the response
      const result = { success: true, message: 'Action executed', data: {} };
      
      // Broadcast result to UI clients
      this.broadcastToUI({
        type: 'clawdbot_result',
        payload: result
      });
    } catch (error) {
      console.error('Error executing ClawdBot action:', error);
      
      this.broadcastToUI({
        type: 'clawdbot_error',
        payload: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  }
  
  private async getClawdBotStatus(): Promise<void> {
    if (!this.gateway) {
      console.error('No ClawdBot gateway available');
      return;
    }
    
    try {
      // In a real implementation, this would get actual status from ClawdBot
      // const status = await this.gateway.getStatus();
      
      // For now, mock the status
      const status = { 
        connected: true, 
        status: 'running', 
        agents: 1, 
        lastActivity: new Date().toISOString() 
      };
      
      this.broadcastToUI({
        type: 'clawdbot_status_update',
        payload: status
      });
    } catch (error) {
      console.error('Error getting ClawdBot status:', error);
    }
  }
  
  private processNoteForExecution(note: any): void {
    // Analyze the note content to see if it represents executable intent
    // This is where the "intent recognition" happens to turn notes into actions

    const content = note.content || '';
    const title = note.title || '';
    const fullText = (title + ' ' + content).toLowerCase();

    // Look for intent patterns that should trigger ClawdBot execution
    const intentPatterns = [
      { pattern: /want\s+(.+)/i, type: 'desire' },
      { pattern: /need\s+(.+)/i, type: 'need' },
      { pattern: /should\s+(.+)/i, type: 'obligation' },
      { pattern: /must\s+(.+)/i, type: 'requirement' },
      { pattern: /remind.*me.*to/i, type: 'reminder' },
      { pattern: /when.*then/i, type: 'conditional' },
      { pattern: /if.*then/i, type: 'conditional' },
      { pattern: /schedule.*for/i, type: 'scheduling' },
      { pattern: /contact.*about/i, type: 'communication' },
      { pattern: /buy|purchase|order/i, type: 'acquisition' }
    ];

    // Check for property-based intents (like [want:quiet evening], [after:18:00], etc.)
    const propertyPattern = /\[(.*?)\]/g;
    const properties = [];
    let match;
    while ((match = propertyPattern.exec(content)) !== null) {
      properties.push(match[1]);
    }

    if (properties.length > 0) {
      console.log('Semantic properties detected in note:', properties);

      // Create a ClawdBot agent based on the note's semantic properties
      this.createAgentFromNote(note, properties);
    }

    // Check for intent patterns
    for (const intent of intentPatterns) {
      if (intent.pattern.test(fullText)) {
        console.log(`Intent pattern matched: ${intent.type} in note:`, note.id);

        // Create appropriate ClawdBot agent based on intent
        this.createAgentFromIntent(note, intent.type);

        // Notify UI about the created agent
        this.broadcastToUI({
          type: 'execution_agent_created',
          payload: {
            noteId: note.id,
            intentType: intent.type,
            message: `Created execution agent for "${intent.type}" intent`
          }
        });

        break; // Only process first match to avoid duplicates
      }
    }
  }

  private createAgentFromNote(note: any, properties: string[]): void {
    // Create a ClawdBot agent based on the semantic properties of the note
    console.log(`Creating agent from note ${note.id} with properties:`, properties);

    // Example: if note has [when:after 18:00] [if:stress > 6] [action:dim lights]
    // Create an agent that monitors stress levels and dims lights after 6 PM when stressed

    // Parse properties to extract conditions and actions
    const conditions = properties.filter(prop =>
      prop.startsWith('if:') || prop.includes('when') || prop.includes('after') || prop.includes('before')
    );

    const actions = properties.filter(prop =>
      prop.startsWith('action:') || prop.startsWith('do:') || prop.includes('execute')
    );

    if (conditions.length > 0 && actions.length > 0) {
      // In a real implementation, this would create an actual ClawdBot agent
      console.log(`Setting up conditional agent: if ${conditions.join(', ')} then ${actions.join(', ')}`);

      // This is where the note becomes executable
      this.setupConditionalExecution(note.id, conditions, actions);
    }
  }

  private createAgentFromIntent(note: any, intentType: string): void {
    // Create a ClawdBot agent based on the intent type
    console.log(`Creating ${intentType} agent for note:`, note.id);

    // Based on the intent type, create appropriate ClawdBot behavior
    switch (intentType) {
      case 'reminder':
        this.setupReminderAgent(note);
        break;
      case 'conditional':
        this.setupConditionalAgent(note);
        break;
      case 'communication':
        this.setupCommunicationAgent(note);
        break;
      case 'scheduling':
        this.setupSchedulingAgent(note);
        break;
      default:
        console.log(`Setting up generic ${intentType} agent for note:`, note.id);
        // Generic agent setup
        break;
    }
  }

  private setupConditionalExecution(noteId: string, conditions: string[], actions: string[]): void {
    // This is where a note becomes executable code
    console.log(`Setting up conditional execution for note ${noteId}`);

    // In a real implementation, this would register with ClawdBot to monitor conditions
    // and execute actions when conditions are met

    // For demo purposes, we'll just log what would happen
    console.log(`Agent monitoring: ${conditions.join(' AND ')}`);
    console.log(`Agent will execute: ${actions.join(' THEN ')}`);

    // Broadcast to UI that execution is set up
    this.broadcastToUI({
      type: 'execution_setup_complete',
      payload: {
        noteId,
        conditions,
        actions,
        status: 'monitoring'
      }
    });
  }

  private setupReminderAgent(note: any): void {
    console.log(`Setting up reminder agent for note:`, note.id);
    // Implementation would parse time expressions and set up reminders
  }

  private setupConditionalAgent(note: any): void {
    console.log(`Setting up conditional agent for note:`, note.id);
    // Implementation would set up if/then logic
  }

  private setupCommunicationAgent(note: any): void {
    console.log(`Setting up communication agent for note:`, note.id);
    // Implementation would set up contact/communication workflows
  }

  private setupSchedulingAgent(note: any): void {
    console.log(`Setting up scheduling agent for note:`, note.id);
    // Implementation would parse dates/times and set up calendar events
  }
  
  private broadcastToUI(message: any): void {
    // This would broadcast to connected UI clients
    // Implementation depends on how the server manages UI connections
    console.log('Broadcasting to UI:', message);
  }
}