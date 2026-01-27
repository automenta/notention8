import React, { useEffect } from 'react';
import { useAgent } from '../contexts/AgentContext';
import { useNotes } from '../../hooks/useNotes';
import { useToast } from '../../hooks/useToast';

export function AgentToolHandler() {
    const { lastMessage, sendMessage } = useAgent();
    const { addNote } = useNotes();
    const { addToast } = useToast();

    useEffect(() => {
        if (lastMessage && lastMessage.type === 'agent_tool_call') {
            const { tool, args } = lastMessage.payload;
            handleToolExecution(tool, args);
        }
    }, [lastMessage]);

    const handleToolExecution = async (tool: string, args: any) => {
        try {
            switch (tool) {
                case 'create_note':
                    const newNote = addNote({
                        title: args.title || 'Untitled Agent Note',
                        content: args.content || '',
                        tags: args.tags || [],
                        properties: args.properties || []
                    });
                    addToast(`Agent created note: ${newNote.title}`, 'success');

                    sendMessage('clawdbot_execute', {
                        type: 'agent_instruction',
                        parameters: { message: `System: Note created successfully. ID: ${newNote.id}` }
                    });
                    break;

                case 'update_ontology':
                    addToast('Agent requested Ontology Update (Mock)', 'info');
                    // Future: Implement direct ontology manipulation via hook
                    sendMessage('clawdbot_execute', {
                        type: 'agent_instruction',
                        parameters: { message: `System: Ontology update request received. (Mock implementation)` }
                    });
                    break;

                default:
                    sendMessage('clawdbot_execute', {
                        type: 'agent_instruction',
                        parameters: { message: `System: Error - Unknown tool '${tool}'` }
                    });
            }
        } catch (error) {
            sendMessage('clawdbot_execute', {
                type: 'agent_instruction',
                parameters: { message: `System: Error executing tool - ${error instanceof Error ? error.message : String(error)}` }
            });
        }
    };

    return null;
}
