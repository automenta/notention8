import React, { useState, useCallback } from 'react';
import type { Note } from '../types';
import { TiptapEditor } from './TiptapEditor';
import { usePublish } from '../hooks/usePublish';
import { suggestTags, isApiKeyAvailable } from '../services/geminiService';
import { getTextFromHtml } from '../utils/nostr';
import { useDebouncedSave } from '../hooks/useDebouncedSave';
import { EditorHeader } from './EditorHeader';

interface EditorManagerProps {
  note: Note;
  onSave: (note: Note) => void;
}

export const EditorManager: React.FC<EditorManagerProps> = ({
  note,
  onSave,
}) => {
  const { dirtyNote, setDirtyNote } = useDebouncedSave(note, onSave);
  const { publishNote, isPublishing } = usePublish();
  const [isAutoTagging, setIsAutoTagging] = useState(false);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setDirtyNote((prev) => ({ ...prev, title: e.target.value })),
    [setDirtyNote]
  );

  const handleTagsChange = useCallback(
    (newTags: string[]) => {
      setDirtyNote((prev) => ({ ...prev, tags: newTags }));
    },
    [setDirtyNote]
  );

  const handleContentSave = useCallback(
    (content: string) => setDirtyNote((prev) => ({ ...prev, content })),
    [setDirtyNote]
  );

  const handlePublish = async () => {
    if (!dirtyNote.content) return;
    if (
      confirm(
        'Are you sure you want to publish this note to the public Nostr network?'
      )
    ) {
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
      const uniqueTags = Array.from(
        new Set([...dirtyNote.tags, ...suggestions])
      );
      handleTagsChange(uniqueTags);
    } catch (e) {
      alert(
        'Failed to auto-tag: ' + (e instanceof Error ? e.message : String(e))
      );
    } finally {
      setIsAutoTagging(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <EditorHeader
        title={dirtyNote.title}
        onTitleChange={handleTitleChange}
        onPublish={handlePublish}
        isPublishing={isPublishing}
        isPublished={!!dirtyNote.nostrEventId}
        tags={dirtyNote.tags}
        onTagsChange={handleTagsChange}
        onAutoTag={handleAutoTag}
        isAutoTagging={isAutoTagging}
        isApiKeyAvailable={isApiKeyAvailable}
      />
      <TiptapEditor
        key={note.id}
        note={dirtyNote}
        onSave={handleContentSave}
      />
    </div>
  );
};
