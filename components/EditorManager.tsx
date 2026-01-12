import React, { useCallback } from 'react';
import type { Note } from '../types';
import { TiptapEditor } from './TiptapEditor';
import { usePublish } from '../hooks/usePublish';
import { getTextFromHtml } from '../utils/nostr';
import { parseProperties, replacePropertyInString } from '../utils/parsing';
import { useDebouncedSave } from '../hooks/useDebouncedSave';
import { EditorHeader } from './EditorHeader';
import { PropertyInspector } from './editor/PropertyInspector';
import { useView } from '../hooks/useViewContext';
import { useSettings } from '../hooks/useSettingsContext';
import { useAutoTagging } from '../hooks/useAutoTagging';
import { useGardener } from '../hooks/useGardener';
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
  const { evolveOntology } = useGardener();

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

      setDirtyNote((prev) => {
          const updated = { ...prev, content, properties };
          // Evolve ontology occasionally?
          // Doing it on every keystroke/save might be too much if it calls AI.
          // But useGardener uses LocalAIProvider by default which is fast heuristic.
          // If Remote, it's costly.
          // Let's rely on explicit save or periodic check?
          // For now, let's trigger it on save (which is debounced).
          if (settings.developerMode) {
              // Only in dev mode or if explicitly enabled?
              // The Gardener service checks settings inside.
              evolveOntology([updated]);
          }
          return updated;
      });
    },
    [setDirtyNote, evolveOntology, settings.developerMode]
  );

  const handlePublish = async () => {
    if (!dirtyNote.content) return;
    if (
      confirm(
        'Are you sure you want to publish this note to the public Nostr network?'
      )
    ) {
      try {
        // Evolve ontology before publishing to ensure we capture semantics
        await evolveOntology([dirtyNote]);

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

  const handleUpdateTextFromInspector = useCallback((oldProp: Property | null, newProp: Property | null) => {
      // We assume dirtyNote.content contains HTML.
      // We use replacePropertyInString which works on the string level.
      // Since our property tags are usually text nodes or wrapped in <p>,
      // simple string replacement usually works IF the user didn't format the tag weirdly (e.g. bolding half of it).

      const newContent = replacePropertyInString(dirtyNote.content, oldProp, newProp);

      if (newContent !== dirtyNote.content) {
          handleContentSave(newContent);
      }
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
