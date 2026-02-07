import React, { useCallback } from 'react';
import type { Note } from '../types';
import { TiptapEditor } from './TiptapEditor';
import { usePublish } from '../hooks/usePublish';
import { getTextFromHtml } from '../utils/nostr';
import { parseProperties } from '../utils/parsing';
import { useDebouncedSave } from '../hooks/useDebouncedSave';
import { EditorHeader } from './EditorHeader';
import { PropertyInspector } from './editor/PropertyInspector';
import { useView } from '../hooks/useViewContext';
import { useSettings } from '../hooks/useSettingsContext';
import { useAutoTagging } from '../hooks/useAutoTagging';
import type { Property } from '../types';

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

  const handleUpdateTextFromInspector = useCallback((_oldProp: Property | null, newProp: Property) => {
      // Append new property to content
      // Format: [key:op:value]
      // We map op back to symbol or word? Standard parser prefers [key:op:value]
      // If op is 'is', we can use [key:value] or [key:is:value]

      let opStr = newProp.operator;
      // Simple mapping for display friendliness if needed, but parser handles words too.
      // Ideally we use standard format [key:op:value]

      const newTag = `<p>[${newProp.key}:${opStr}:${newProp.values.join(',')}]</p>`;

      // We need to update content.
      // Ideally we insert at cursor, but here we just append to end for MVP
      const newContent = dirtyNote.content + newTag;

      handleContentSave(newContent);
  }, [dirtyNote.content, handleContentSave]);

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
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
            <TiptapEditor
                key={note.id}
                note={dirtyNote}
                onSave={handleContentSave}
                ontology={settings.ontology}
            />
        </div>
        <PropertyInspector
            properties={dirtyNote.properties ? Object.values(dirtyNote.properties).flat() : []}
            onUpdateText={handleUpdateTextFromInspector}
            onPropertyChange={() => {}} // Read only for now (updates text)
        />
      </div>
    </div>
  );
};
