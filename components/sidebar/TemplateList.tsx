import React from 'react';
import { useNotes } from '../../hooks/useNotes';
import { useView } from '../../hooks/useViewContext';
import { parseProperties } from '../../utils/parsing';

const TEMPLATES = [
    { label: 'Job Request', icon: '💼', content: '#job #request \n\n[role:is:Software Engineer]\n[budget > 5000]\n[deadline:is:2024-12-31]\n' },
    { label: 'Freelance Offer', icon: '👨‍💻', content: '#freelance #offer \n\n[role:is:Software Engineer]\n[rate:is:100]\n[skill contains React]\n' },
    { label: 'Marketplace Listing', icon: '🏷️', content: '#forsale \n\n[item:is:Laptop]\n[price:is:1000]\n[condition:is:Used]\n' },
];

export const TemplateList: React.FC = () => {
    const { addNote, updateNote } = useNotes();
    const { setSelectedNoteId } = useView();

    const handleTemplateClick = (content: string) => {
        const newNote = addNote();

        // Update content and parse properties immediately
        const properties = parseProperties(content); // This needs to be robust. Our parser utility is pure.
        // Wait, property extraction usually happens on save in EditorManager.
        // But here we want to pre-fill.
        // If we just set content, EditorManager will parse it on load/save?
        // EditorManager uses useDebouncedSave. It initializes from props.
        // So updating the note in store is correct.

        // Wait, we need to convert Property[] to what updateNote expects if it does anything special?
        // updateNote in useNotes simply replaces the note.

        const updated = {
            ...newNote,
            content,
            properties
        };
        updateNote(updated);
        setSelectedNoteId(newNote.id);
    };

    return (
        <div className="p-2 border-b border-gray-700/50">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">Start with Template</h3>
            <div className="grid grid-cols-1 gap-2">
                {TEMPLATES.map(tmpl => (
                    <button
                        key={tmpl.label}
                        onClick={() => handleTemplateClick(tmpl.content)}
                        className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-800 rounded text-left transition-colors"
                    >
                        <span>{tmpl.icon}</span>
                        <span>{tmpl.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
