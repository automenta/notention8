import { WebSocket } from 'ws';
import { PluginManager } from '../plugins/PluginInterface';
import { ComprehensiveStateManager } from '../state-management/ComprehensiveStateManager';
import { TransparentErrorHandler } from '../error-handling/ErrorHandler';

export class WSMessageHandler {
    constructor(
        private pluginManager: PluginManager,
        private stateManager: ComprehensiveStateManager,
        private errorHandler: TransparentErrorHandler
    ) {}

    async handleMessage(message: any, ws: WebSocket) {
        try {
            switch(message.type) {
                case 'agent_request':
                case 'clawdbot_request': // Backwards compatibility
                    await this.handleAgentRequest(message, ws);
                    break;

                case 'note_created':
                    await this.handleNoteCreated(message, ws);
                    break;

                case 'note_updated':
                    await this.handleNoteUpdated(message);
                    break;

                case 'note_deleted':
                    await this.handleNoteDeleted(message);
                    break;

                default:
                    await this.handlePluginOrInternalMessage(message, ws);
            }
        } catch (error) {
            console.error('Error handling message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Internal server error processing message'
            }));
        }
    }

    private async handleAgentRequest(message: any, ws: WebSocket) {
        console.log('Processing Agent request:', message.payload);
        // Delegate this to plugins or handle generically
        this.pluginManager.broadcastMessage(message).catch(error => {
             console.error('Error broadcasting agent request:', error);
        });

        // Use clawdbot_response for legacy compatibility if request was clawdbot_request
        const responseType = message.type === 'clawdbot_request' ? 'clawdbot_response' : 'agent_response';

        ws.send(JSON.stringify({
            type: responseType,
            requestId: message.id,
            success: true,
            result: { message: 'Request received' }
        }));
    }

    private async handleNoteCreated(message: any, ws: WebSocket) {
        this.pluginManager.broadcastNoteCreated(message.payload).catch(error => {
            console.error('Error broadcasting note creation:', error);
        });
        console.log('Note created event received:', message.payload);
    }

    private async handleNoteUpdated(message: any) {
        this.pluginManager.broadcastNoteUpdated(message.payload).catch(error => {
            console.error('Error broadcasting note update:', error);
        });
        console.log('Note updated event received:', message.payload);
    }

    private async handleNoteDeleted(message: any) {
        const noteId = message.payload.noteId || message.payload.id || message.id;
        this.pluginManager.broadcastNoteDeleted(noteId).catch(error => {
            console.error('Error broadcasting note deletion:', error);
        });
        console.log('Note deleted event received:', message.payload);
    }

    private async handlePluginOrInternalMessage(message: any, ws: WebSocket) {
        // Let plugins handle custom message types
        await this.pluginManager.broadcastMessage(message);

        // Handle internal messages
        switch(message.type) {
            case 'show_agent_creation_ui':
                ws.send(JSON.stringify({
                    type: 'show_agent_creation_ui_response',
                    payload: { success: true, message: 'Showing agent creation UI' }
                }));
                break;

            case 'get_ui_replacements':
                ws.send(JSON.stringify({
                    type: 'ui_replacements',
                    payload: { components: [], context: message.payload }
                }));
                break;

            case 'apply_automation_suggestion':
                console.log('Applying automation suggestion:', message.payload);
                ws.send(JSON.stringify({
                    type: 'automation_suggestion_applied',
                    payload: {
                        success: true,
                        noteId: message.payload.noteId,
                        suggestionIndex: message.payload.suggestionIndex
                    }
                }));
                break;

            case 'refresh_agents':
                try {
                    const state = await this.stateManager.getState();
                    ws.send(JSON.stringify({
                        type: 'agents_refreshed',
                        payload: { agents: state.activeAgents, timestamp: new Date().toISOString() }
                    }));
                } catch (error) {
                    console.error('Error refreshing agents:', error);
                    this.sendError(ws, 'Error refreshing agents');
                }
                break;

            case 'show_agent_editor':
                try {
                    const agentId = message.payload.agentId;
                    const agentState = await this.stateManager.getAgentState(agentId);
                    ws.send(JSON.stringify({
                        type: 'show_agent_editor_response',
                        payload: { agent: agentState, success: !!agentState }
                    }));
                } catch (error) {
                    console.error('Error showing agent editor:', error);
                    this.sendError(ws, 'Error showing agent editor');
                }
                break;

            case 'resolve_error':
                try {
                    const errorId = message.payload.errorId;
                    this.errorHandler.resolveError(errorId, 'Resolved via UI');
                    ws.send(JSON.stringify({
                        type: 'error_resolved',
                        payload: { errorId, success: true }
                    }));
                } catch (error) {
                    console.error('Error resolving error:', error);
                    this.sendError(ws, 'Error resolving error');
                }
                break;

            case 'refresh_error_report':
                try {
                    const stats = this.errorHandler.getErrorStats();
                    const unresolved = this.errorHandler.getUnresolvedErrors();
                    ws.send(JSON.stringify({
                        type: 'error_report_refreshed',
                        payload: {
                            stats,
                            unresolved: unresolved.slice(0, 10),
                            timestamp: new Date().toISOString()
                        }
                    }));
                } catch (error) {
                    console.error('Error refreshing error report:', error);
                    this.sendError(ws, 'Error refreshing error report');
                }
                break;

            case 'generate_error_report':
                try {
                    const report = this.errorHandler.generateErrorReport();
                    ws.send(JSON.stringify({
                        type: 'full_error_report',
                        payload: report
                    }));
                } catch (error) {
                    console.error('Error generating error report:', error);
                    this.sendError(ws, 'Error generating error report');
                }
                break;

            default:
                console.log('Unknown message type from UI:', message.type);
        }
    }

    private sendError(ws: WebSocket, message: string) {
        ws.send(JSON.stringify({ type: 'error', message }));
    }
}
