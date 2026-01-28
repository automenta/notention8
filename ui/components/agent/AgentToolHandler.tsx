import React, { useEffect } from 'react';
import { useAgent } from '../contexts/AgentContext';
import { useNotes } from '../../hooks/useNotes';
import { useToast } from '../../hooks/useToast';

export function AgentToolHandler() {
    const { lastMessage, sendMessage } = useAgent();
    const { addNote } = useNotes();
    const { addToast } = useToast();

    useEffect(() => {
        if (!lastMessage) return;

        if (lastMessage.type === 'agent_tool_call') {
            const { tool, args } = lastMessage.payload;
            handleToolExecution(tool, args);
        } else if (lastMessage.type === 'notes_imported') {
            const { notes, source } = lastMessage.payload;
            handleNotesImport(notes, source);
        }
    }, [lastMessage]);

    const handleNotesImport = (notes: any[], source: string) => {
        if (!notes || !Array.isArray(notes)) return;

        let count = 0;
        notes.forEach(note => {
            // We pass the note directly as overrides.
            // Since addNote spreads overrides, it should preserve ID if provided in the note object.
            addNote(note);
            count++;
        });

        if (count > 0) {
            addToast(`Imported ${count} notes from ${source || 'Skill'}`, 'success');
        }
    };

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
