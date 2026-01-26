import React, { useState } from 'react';
import { useGardener } from '../../hooks/useGardener';
import { useSettings } from '../../hooks/useSettingsContext';
import { useNotes } from '../../hooks/useNotes';
import { useView } from '../../hooks/useViewContext';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';
import { SparklesIcon, SendIcon } from '../layout/icons';
import { parseProperties } from '../../utils/parsing';

export const SmartInputWidget: React.FC = () => {
    const [text, setText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const { alignToOntology } = useGardener();
    const { settings } = useSettings();
    const { addNote, updateNote } = useNotes();
    const { setActiveView, setSelectedNoteId } = useView();

    const handleSubmit = async () => {
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
            setText('');

        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSubmit();
        }
    }

    return (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700/50 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <SparklesIcon className="w-24 h-24 text-purple-500 transform rotate-12" />
            </div>

            <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-purple-400" />
                <span>What's on your mind?</span>
            </h2>

            <div className="relative z-10">
                <Textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe a project, an offer, or just take a note... (e.g. 'I need a React developer for $100')"
                    className="w-full bg-gray-900/80 border-gray-700 focus:border-purple-500/50 min-h-[100px] text-lg mb-4"
                />
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                        Pro tip: Press <kbd className="bg-gray-700 px-1 rounded">Ctrl+Enter</kbd> to save
                    </span>
                    <Button
                        onClick={handleSubmit}
                        disabled={!text.trim() || isProcessing}
                        isLoading={isProcessing}
                        variant="primary"
                        icon={SendIcon}
                        className="bg-purple-600 hover:bg-purple-500"
                    >
                        Create Note
                    </Button>
                </div>
            </div>
        </div>
    );
};
