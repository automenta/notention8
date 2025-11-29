import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Note } from '../types';
import { TiptapEditor } from './TiptapEditor';
import { areNotesEqual } from '../utils/notes';
import { usePublish } from '../hooks/usePublish';
import { SendIcon, LoadingSpinner } from './icons';
import { TagInput } from './TagInput';
import { suggestTags, isApiKeyAvailable } from '../services/geminiService';
import { getTextFromHtml } from '../utils/nostr';

const SAVE_DEBOUNCE_MS = 1000;

interface EditorManagerProps {
  note: Note;
  onSave: (note: Note) => void;
}

export const EditorManager: React.FC<EditorManagerProps> = ({ note, onSave }) => {
  const [dirtyNote, setDirtyNote] = useState<Note>(note);
  const { publishNote, isPublishing } = usePublish();
  const [isAutoTagging, setIsAutoTagging] = useState(false);

  // Refs for unmount safety
  const dirtyNoteRef = useRef(dirtyNote);
  const noteRef = useRef(note);
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    dirtyNoteRef.current = dirtyNote;
  }, [dirtyNote]);

  useEffect(() => {
    noteRef.current = note;
  }, [note]);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Sync state when note prop changes
  useEffect(() => {
    setDirtyNote((prev) => {
      // If ID changed, switch to new note
      if (note.id !== prev.id) return note;
      // If content matches upstream, sync reference to avoid unnecessary diffs
      return areNotesEqual(note, prev) ? note : prev;
    });
  }, [note]);

  // Debounced save effect
  useEffect(() => {
    // Only save if dirtyNote differs from the current upstream note
    if (areNotesEqual(dirtyNote, note)) return;

    const handler = setTimeout(() => onSave(dirtyNote), SAVE_DEBOUNCE_MS);
    return () => clearTimeout(handler);
  }, [dirtyNote, onSave, note]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (!areNotesEqual(dirtyNoteRef.current, noteRef.current)) {
        onSaveRef.current(dirtyNoteRef.current);
      }
    };
  }, []);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setDirtyNote((prev) => ({ ...prev, title: e.target.value })),
    []
  );

  const handleTagsChange = useCallback((newTags: string[]) => {
    setDirtyNote((prev) => ({ ...prev, tags: newTags }));
  }, []);

  const handleContentSave = useCallback(
    (content: string) => setDirtyNote((prev) => ({ ...prev, content })),
    []
  );

  const handlePublish = async () => {
    if (!dirtyNote.content) return;
    if (confirm('Are you sure you want to publish this note to the public Nostr network?')) {
      try {
        const eventId = await publishNote(dirtyNote);
        const now = new Date().toISOString();
        const updatedNote = {
          ...dirtyNote,
          nostrEventId: eventId,
          publishedAt: now,
        };
        setDirtyNote(updatedNote);
        onSave(updatedNote);
        alert('Note published successfully!');
      } catch (e) {
        alert(
          'Failed to publish note: ' +
            (e instanceof Error ? e.message : String(e))
        );
      }
    }
  };

  const handleAutoTag = async () => {
    if (!dirtyNote.content) return;
    setIsAutoTagging(true);
    try {
      const text = getTextFromHtml(dirtyNote.content);
      const suggestions = await suggestTags(text);
      const uniqueTags = Array.from(new Set([...dirtyNote.tags, ...suggestions]));
      handleTagsChange(uniqueTags);
    } catch (e) {
      alert(
        'Failed to auto-tag: ' +
          (e instanceof Error ? e.message : String(e))
      );
    } finally {
      setIsAutoTagging(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 bg-gray-900/30">
        <div className="p-2 flex items-center gap-2">
          <input
            type="text"
            value={dirtyNote.title || ''}
            onChange={handleTitleChange}
            placeholder="Note Title"
            className="flex-grow bg-transparent text-white text-lg font-bold focus:outline-none placeholder-gray-500"
          />
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            title={dirtyNote.nostrEventId ? 'Publish update' : 'Publish to Nostr'}
            className="p-2 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
          >
            {isPublishing ? (
              <LoadingSpinner className="h-5 w-5" />
            ) : (
              <SendIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        <div className="px-2 pb-2">
          <TagInput
            tags={dirtyNote.tags}
            onChange={handleTagsChange}
            onAutoTag={isApiKeyAvailable ? handleAutoTag : undefined}
            isAutoTagging={isAutoTagging}
          />
        </div>
        <div className="border-b border-gray-700/50" />
      </div>
      <TiptapEditor
        key={note.id}
        note={dirtyNote}
        onSave={handleContentSave}
      />
    </div>
  );
};
