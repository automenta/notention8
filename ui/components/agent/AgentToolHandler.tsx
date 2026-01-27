import React, { useEffect } from 'react';
import { useAgent } from '../contexts/AgentContext';
import { useNotes } from '../../hooks/useNotes';
import { useToast } from '../../hooks/useToast';
import { useGardener } from '../../hooks/useGardener';
import { useView } from '../../hooks/useViewContext';

export function AgentToolHandler() {
    const { lastMessage, sendMessage } = useAgent();
    const { addNote, updateNote } = useNotes();
    const { addToast } = useToast();
    const { setActiveView, setSelectedNoteId } = useView();
    // Assuming useGardener exposes ontology manipulation, but currently it exposes 'evolveOntology' and 'optimizeOntology'.
    // We might need to extend useGardener or just use 'evolveOntology' if it accepts arguments,
    // or assume the agent uses 'update_ontology' to trigger the existing evolve logic.
    // Let's implement basics first.

    useEffect(() => {
        if (lastMessage && lastMessage.type === 'agent_tool_call') {
            const { tool, args, timestamp } = lastMessage.payload;
            console.log(`Agent executing tool: ${tool}`, args);

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

                    // Optionally navigate to it?
                    // setSelectedNoteId(newNote.id);
                    // setActiveView('notes');

                    sendMessage('clawdbot_execute', {
                        type: 'agent_instruction',
                        parameters: { message: `System: Note created successfully. ID: ${newNote.id}` }
                    });
                    break;

                case 'update_ontology':
                    // In a real implementation, we would call a method to update the ontology structure.
                    // For now, we'll simulate it or trigger the gardener if it matched.
                    addToast('Agent requested Ontology Update', 'info');
                    // TODO: Implement direct ontology manipulation via hook
                    sendMessage('clawdbot_execute', {
                        type: 'agent_instruction',
                        parameters: { message: `System: Ontology update request received. (Mock implementation)` }
                    });
                    break;

                default:
                    console.warn(`Unknown tool: ${tool}`);
                    sendMessage('clawdbot_execute', {
                        type: 'agent_instruction',
                        parameters: { message: `System: Error - Unknown tool '${tool}'` }
                    });
            }
        } catch (error) {
            console.error('Error executing agent tool:', error);
            sendMessage('clawdbot_execute', {
                type: 'agent_instruction',
                parameters: { message: `System: Error executing tool - ${error instanceof Error ? error.message : String(error)}` }
            });
        }
    };

    return null; // Headless component
}
