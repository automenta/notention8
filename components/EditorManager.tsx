import React, { useState, useEffect } from 'react';
import type { AppSettings, Note } from '../types';
import { TiptapEditor } from './TiptapEditor';

const SAVE_DEBOUNCE_MS = 1000;

interface EditorManagerProps {
  note: Note;
  onSave: (note: Note) => void;
  onDelete: (id: string) => void;
  settings: AppSettings;
}

export const EditorManager: React.FC<EditorManagerProps> = ({
  note,
  onSave,
  onDelete,
  settings,
}) => {
  const [dirtyNote, setDirtyNote] = useState<Note>(note);

  // When the selected note changes, reset the dirty state
  useEffect(() => {
    setDirtyNote(note);
  }, [note]);

  // Debounced save effect for the entire note
  useEffect(() => {
    // Don't save if the content is unchanged from the source prop
    if (dirtyNote === note) {
      return;
    }

    const handler = setTimeout(() => {
      onSave(dirtyNote);
    }, SAVE_DEBOUNCE_MS);

    return () => {
      clearTimeout(handler);
    };
  }, [dirtyNote, onSave, note]);

  const handleContentSave = (updatedContent: string) => {
    setDirtyNote((prevNote) => ({
      ...prevNote,
      content: updatedContent,
    }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDirtyNote((prevNote) => ({
      ...prevNote,
      title: e.target.value,
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-2 border-b border-gray-700/50">
        <input
          type="text"
          value={dirtyNote.title || ''}
          onChange={handleTitleChange}
          placeholder="Note Title"
          className="w-full bg-transparent text-white text-lg font-bold focus:outline-none placeholder-gray-500"
        />
      </div>
      <TiptapEditor
        key={note.id} // This is crucial to force a re-mount when the note changes
        note={dirtyNote}
        onSave={handleContentSave}
      />
    </div>
  );
};
