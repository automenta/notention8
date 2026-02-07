import { Plugin } from './PluginInterface';
import { StrategyManager } from '../strategies/StrategyManager';
import { LMAgentTranslationStrategy } from '../strategies/LMAgentTranslationStrategy';
import { HeuristicTranslationStrategy } from '../strategies/HeuristicTranslationStrategy';
import { PatternMatchingStrategy } from '../strategies/PatternMatchingStrategy';
import { TranslationContext } from '../strategies/NoteTranslationStrategy';
import { UIIntegrationSystem } from '../ui-representation/UIIntegrationSystem';
import { ClawdBotClient } from '../communication/ClawdBotClient';

interface ClawdBotGateway {
  process?: any;
  port?: number;
  configDir?: string;
  client?: ClawdBotClient;
}

export class ClawdBotPlugin implements Plugin {
  id = 'clawdbot-integration';
  name = 'ClawdBot Integration';
  description = 'Integrates ClawdBot execution capabilities with Notention';
  version = '1.0.0';

  private gateway: any = null;
  private wsClients: Set<any> = new Set();
  private strategyManager: StrategyManager;
  private extensionManager: any;
  private uiIntegrationSystem: UIIntegrationSystem;
  private uiReplacementSystem: any;
  private stateManager: any;
  private errorHandler: any;
  private configManager: any;
  private broadcaster: ((message: any) => void) | null = null;

  constructor(
    gateway: any,
    extensionManager?: any,
    uiReplacementSystem?: any,
    stateManager?: any,
    errorHandler?: any,
    configManager?: any
  ) {
    this.gateway = gateway;
    this.extensionManager = extensionManager || null;
    this.uiReplacementSystem = uiReplacementSystem || null;
    this.stateManager = stateManager || null;
    this.errorHandler = errorHandler || null;
    this.configManager = configManager || null;
    this.strategyManager = new StrategyManager();
    this.uiIntegrationSystem = new UIIntegrationSystem();

    // Register default strategies
    this.strategyManager.registerStrategy(new LMAgentTranslationStrategy());
    this.strategyManager.registerStrategy(new HeuristicTranslationStrategy());
    this.strategyManager.registerStrategy(new PatternMatchingStrategy());
  }
  
  initialize(): void {
    console.log('ClawdBot plugin initialized');
  }
  
  destroy(): void {
    console.log('ClawdBot plugin destroyed');
  }

  setBroadcaster(broadcaster: (message: any) => void) {
    this.broadcaster = broadcaster;
  }
  
  async onNoteCreated(note: any): Promise<void> {
    await this.processNoteForExecution(note);
  }

  async onNoteUpdated(note: any): Promise<void> {
    await this.processNoteForExecution(note);
  }
  
  onNoteDeleted(noteId: string): void {
    // No-op for now
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

          // Get available automation metaphors
          getAvailableMetaphors: function() {
            if (window.uiWebSocket && window.uiWebSocket.readyState === WebSocket.OPEN) {
              window.uiWebSocket.send(JSON.stringify({
                type: 'get_available_metaphors'
              }));
            }
          },

          // Create an agent from a note
          createAgentFromNote: function(noteId) {
            if (window.uiWebSocket && window.uiWebSocket.readyState === WebSocket.OPEN) {
              window.uiWebSocket.send(JSON.stringify({
                type: 'create_agent_from_note',
                payload: { noteId }
              }));
            }
          },

          // Control an existing agent
          controlAgent: function(agentId, action) {
            if (window.uiWebSocket && window.uiWebSocket.readyState === WebSocket.OPEN) {
              window.uiWebSocket.send(JSON.stringify({
                type: 'agent_control',
                payload: { agentId, action }
              }));
            }
          },

          // Get active agents overview
          getActiveAgents: function() {
            if (window.uiWebSocket && window.uiWebSocket.readyState === WebSocket.OPEN) {
              window.uiWebSocket.send(JSON.stringify({
                type: 'get_active_agents'
              }));
            }
          },

          // Listen for ClawdBot events
          onClawdBotEvent: function(callback) {
            // Implementation would depend on how UI receives messages
          }
        };

        // Add UI enhancement functions
        window.ClawdBotUI = {
          showAutomationSuggestions: function(noteId) {
            // Show automation suggestions for a note
            if (document.getElementById('automation-suggestions-' + noteId)) {
              document.getElementById('automation-suggestions-' + noteId).style.display = 'block';
            }
          },

          hideAutomationSuggestions: function(noteId) {
            // Hide automation suggestions for a note
            if (document.getElementById('automation-suggestions-' + noteId)) {
              document.getElementById('automation-suggestions-' + noteId).style.display = 'none';
            }
          },

          // Function to update UI with replacement components
          updateWithReplacements: function(context) {
            if (window.uiWebSocket && window.uiWebSocket.readyState === WebSocket.OPEN) {
              window.uiWebSocket.send(JSON.stringify({
                type: 'get_ui_replacements',
                payload: context
              }));
            }
          }
        };

        // Initialize UI replacement system when DOM is ready
        document.addEventListener('DOMContentLoaded', function() {
          // Request UI replacements for current context
          setTimeout(function() {
            window.ClawdBotUI.updateWithReplacements({
              currentPage: window.location.pathname,
              selectedNote: null, // Would be populated by Notention
              clawdBotStatus: 'active'
            });
          }, 1000); // Small delay to let Notention load
        });

        console.log('ClawdBot integration loaded in UI');
      </script>
    `;
  }
  
  async handleMessage(message: any): Promise<void> {
    switch(message.type) {
      case 'clawdbot_execute':
        await this.executeClawdBotAction(message.payload);
        break;
      case 'clawdbot_status':
        await this.getClawdBotStatus();
        break;
      case 'get_available_metaphors':
        await this.handleGetMetaphors();
        break;
      case 'create_agent_from_note':
        await this.handleCreateAgentFromNote(message.payload);
        break;
      case 'agent_control':
        await this.handleAgentControl(message.payload);
        break;
      case 'get_active_agents':
        await this.handleGetActiveAgents();
        break;
      default:
        console.log('Unknown message type for ClawdBot plugin:', message.type);
    }
  }

  getAPI(): any {
    return {
      executeAction: this.executeClawdBotAction.bind(this),
      getStatus: this.getClawdBotStatus.bind(this),
      analyzeNote: this.analyzeNoteForAutomation.bind(this)
    };
  }

  private async handleGetMetaphors(): Promise<void> {
    const metaphors = this.uiIntegrationSystem.getAvailableMetaphors();
    this.broadcastToUI({
      type: 'available_metaphors',
      payload: metaphors
    });
  }

  private async handleCreateAgentFromNote(payload: any): Promise<void> {
    // Simulate process
    this.broadcastToUI({
      type: 'agent_creation_initiated',
      payload: {
        noteId: payload.noteId,
        status: 'success',
        message: 'Agent creation initiated'
      }
    });
  }

  private async handleAgentControl(payload: any): Promise<void> {
    // Simulate process
    this.broadcastToUI({
      type: 'agent_control_response',
      payload: {
        agentId: payload.agentId,
        action: payload.action,
        status: 'executed'
      }
    });
  }

  private async handleGetActiveAgents(): Promise<void> {
    // Return empty list
    this.broadcastToUI({
      type: 'active_agents_overview',
      payload: {
        agents: [],
        count: 0,
        message: 'No active agents'
      }
    });
  }
  
  private async executeClawdBotAction(payload: any): Promise<void> {
    if (!this.gateway || !this.gateway.client) {
      console.error('No ClawdBot client available');
      this.broadcastToUI({
        type: 'clawdbot_error',
        payload: { error: 'ClawdBot client not available' }
      });
      return;
    }

    try {
      // Use the client to execute the action
      const result = await this.gateway.client.executeAction(payload);

      // Broadcast result to UI clients
      this.broadcastToUI({
        type: 'clawdbot_result',
        payload: {
          success: true,
          message: 'Action executed successfully',
          data: result,
          gatewayPort: this.gateway.port
        }
      });
    } catch (error) {
      console.error('Error executing ClawdBot action:', error);

      this.broadcastToUI({
        type: 'clawdbot_error',
        payload: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  }
  
  public async analyzeNoteForAutomation(note: any): Promise<void> {
    return this.processNoteForExecution(note);
  }

  private async getClawdBotStatus(): Promise<void> {
    if (!this.gateway || !this.gateway.client) {
      console.error('No ClawdBot client available');
      this.broadcastToUI({
        type: 'clawdbot_status_update',
        payload: {
          connected: false,
          status: 'disconnected',
          error: 'ClawdBot client not available',
          lastAttempt: new Date().toISOString()
        }
      });
      return;
    }

    try {
      // Use the client to get actual status from ClawdBot
      const status = await this.gateway.client.getStatus();

      this.broadcastToUI({
        type: 'clawdbot_status_update',
        payload: {
          ...status,
          connected: true,
          lastAttempt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error getting ClawdBot status:', error);
      this.broadcastToUI({
        type: 'clawdbot_status_update',
        payload: {
          connected: false,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          lastAttempt: new Date().toISOString()
        }
      });
    }
  }
  
  private async processNoteForExecution(note: any): Promise<void> {
    const context: TranslationContext = {
      note,
      gateway: this.gateway,
      pluginManager: this,
      logger: console
    };

    try {
      if (this.extensionManager) {
        const extensionContext = {
          request: { note },
          gateway: this.gateway,
          strategyManager: this.strategyManager,
          pluginManager: this,
          logger: console
        };

        await this.extensionManager.executeExtensions(extensionContext);
      }

      const result = await this.strategyManager.translateNote(context);

      if (result) {
        // Execute the translated actions/configurations
        await this.executeTranslatedResult(result, note);

        // Notify UI about the created agents/actions
        this.broadcastToUI({
          type: 'execution_agents_created',
          payload: {
            noteId: note.id,
            result: result,
            message: `Created execution agents from note: ${note.title || 'Untitled'}`
          }
        });
      } else {
        // Fallback
        this.setupMonitoringForNote(note);
      }
    } catch (error) {
      console.error(`Error processing note with strategies:`, error);
      this.setupMonitoringForNote(note);
      this.broadcastToUI({
        type: 'execution_error',
        payload: {
          noteId: note.id,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Error processing note, set up basic monitoring'
        }
      });
    }
  }

  private async executeTranslatedResult(result: any, note: any): Promise<void> {
    if (Array.isArray(result)) {
      for (const item of result) {
        await this.executeSingleResult(item, note);
      }
    } else {
      await this.executeSingleResult(result, note);
    }
  }

  private async executeSingleResult(item: any, note: any): Promise<void> {
    if (item.type === 'agent_instruction') {
        const message = item.parameters.message;
        if (this.gateway && this.gateway.client) {
             try {
                 const response = await this.gateway.client.sendAgentMessage(message);

                 // Check if response is a tool call (JSON)
                 const responseText = response.data?.message || response.message || '';
                 try {
                     const parsed = JSON.parse(responseText);
                     if (parsed.tool && parsed.args) {
                         this.broadcastToUI({
                             type: 'agent_tool_call',
                             payload: {
                                 tool: parsed.tool,
                                 args: parsed.args,
                                 agentId: 'clawdbot',
                                 timestamp: new Date().toISOString()
                             }
                         });
                         return; // Don't broadcast as simple text response
                     }
                 } catch (e) {
                     // Not JSON, continue as text
                 }

                 // Broadcast response to UI as text
                 this.broadcastToUI({
                     type: 'agent_response',
                     payload: {
                         message: responseText,
                         agentId: 'clawdbot',
                         timestamp: new Date().toISOString()
                     }
                 });

             } catch (e) {
                 console.error('Error sending agent message:', e);
                 this.broadcastToUI({
                     type: 'agent_response_error',
                     payload: {
                         error: e instanceof Error ? e.message : 'Unknown error sending message to agent'
                     }
                 });
             }
        } else {
            console.error('Cannot send agent message: Gateway client not available');
        }
    } else if (item.type === 'lm_generated_workflow' || item.type === 'pattern_based_workflow') {
      // Execute the workflow configuration
      // Placeholder for actual implementation
    } else {
      // Also try to execute other actions via gateway if possible
       if (this.gateway && this.gateway.client) {
            try {
                await this.gateway.client.executeAction(item);
            } catch (e) {
                console.error('Error executing action:', e);
            }
       }
    }
  }

  private setupMonitoringForNote(note: any): void {
    // In a real implementation, this would set up ClawdBot to monitor this note
    // for changes and re-process it if it changes
  }
  
  private broadcastToUI(message: any): void {
    if (this.broadcaster) {
        this.broadcaster(message);
    }
  }
}
