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

        const properties = parseProperties(content);

        const updated = {
            ...newNote,
            content,
            properties
        };
        updateNote(updated);
        setSelectedNoteId(newNote.id);
    };

    return (
        <div className="p-2 border-b border-gray-700/50 flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Templates:</span>
            <div className="flex flex-wrap gap-1">
                {TEMPLATES.map(tmpl => (
                    <button
                        key={tmpl.label}
                        onClick={() => handleTemplateClick(tmpl.content)}
                        className="p-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                        title={tmpl.label}
                    >
                        <span>{tmpl.icon}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
