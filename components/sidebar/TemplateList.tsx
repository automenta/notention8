import React from 'react';
import { useNotes } from '../../hooks/useNotes';
import { useView } from '../../hooks/useViewContext';
import { useSettings } from '../../hooks/useSettingsContext';
import { parseProperties } from '../../utils/parsing';
import { XIcon } from '../icons';
import { DEFAULT_TEMPLATES } from '../../utils/templates';

export const TemplateList: React.FC = () => {
    const { addNote, updateNote } = useNotes();
    const { setSelectedNoteId } = useView();
    const { settings, setSettings } = useSettings();

    const allTemplates = [...DEFAULT_TEMPLATES, ...settings.customTemplates];

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

    const handleDeleteTemplate = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Delete this template?')) {
            setSettings(prev => ({
                ...prev,
                customTemplates: prev.customTemplates.filter(t => t.id !== id)
            }));
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Templates:</span>
            <div className="flex flex-wrap gap-1">
                {allTemplates.map(tmpl => (
                    <div key={tmpl.id} className="relative group">
                        <button
                            onClick={() => handleTemplateClick(tmpl.content)}
                            className="p-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                            title={tmpl.label}
                        >
                            <span>{tmpl.icon || '📄'}</span>
                        </button>
                        {!DEFAULT_TEMPLATES.some(dt => dt.id === tmpl.id) && (
                            <button
                                onClick={(e) => handleDeleteTemplate(e, tmpl.id)}
                                className="absolute -top-1 -right-1 bg-red-600 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Template"
                            >
                                <XIcon className="w-2 h-2 text-white" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
