import { useState } from 'react';
import { useGardener } from './useGardener';
import { useSettings } from './useSettingsContext';
import { useNotes } from './useNotes';
import { useView } from './useViewContext';
import { parseProperties } from '../utils/parsing';

export const useSmartInput = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const { alignToOntology } = useGardener();
    const { settings } = useSettings();
    const { addNote, updateNote } = useNotes();
    const { setActiveView, setSelectedNoteId } = useView();

    const processInput = async (text: string) => {
        if (!text.trim()) return;
        setIsProcessing(true);

        try {
            // 1. Create initial note
            const title = text.length < 50
                ? text
                : text.slice(0, 40) + '...';

            const note = addNote({
                title: title,
                content: text
            });

            // 2. Try to align
            const results = await alignToOntology(text, settings.ontology);

            let finalContent = text;
            if (results && results.length > 0) {
                 finalContent += '\n\n' + results.join('\n');
            }

            // 3. Update note
            updateNote({
                ...note,
                content: finalContent,
                properties: parseProperties(finalContent)
            });

            // 4. Navigate
            setSelectedNoteId(note.id);
            setActiveView('notes');
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        processInput,
        isProcessing
    };
};
