import React, { useCallback } from 'react';
import type { Note } from '../types';
import { TiptapEditor } from './TiptapEditor';
import { usePublish } from '../hooks/usePublish';
import { getTextFromHtml } from '../utils/nostr';
import { parseProperties } from '../utils/parsing';
import { useDebouncedSave } from '../hooks/useDebouncedSave';
import { EditorHeader } from './EditorHeader';
import { useView } from '../hooks/useViewContext';
import { useSettings } from '../hooks/useSettingsContext';
import { useAutoTagging } from '../hooks/useAutoTagging';

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
  const { setActiveView, setMatchingNoteId } = useView();
  const { settings } = useSettings();

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

  const { isAutoTagging, handleAutoTag, isApiKeyAvailable } = useAutoTagging({
      content: dirtyNote.content,
      tags: dirtyNote.tags,
      onTagsChange: handleTagsChange
  });

  const handleContentSave = useCallback(
    (content: string) => {
      // Parse properties from content and update note
      // We use getTextFromHtml to get clean text for regex parsing
      const text = getTextFromHtml(content);
      const properties = parseProperties(text);

      setDirtyNote((prev) => ({ ...prev, content, properties }));
    },
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

  const handleFindMatches = () => {
      setMatchingNoteId(dirtyNote.id);
      setActiveView('network');
  };

  return (
    <div className="flex flex-col h-full">
      <EditorHeader
        title={dirtyNote.title}
        onTitleChange={handleTitleChange}
        onPublish={handlePublish}
        onFindMatches={handleFindMatches}
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
        ontology={settings.ontology}
      />
    </div>
  );
};
