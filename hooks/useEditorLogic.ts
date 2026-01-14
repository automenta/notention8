import { useCallback } from 'react';
import type { Note, Property } from '../types';
import { usePublish } from './usePublish';
import { getTextFromHtml } from '../utils/nostr';
import { parseProperties, replacePropertyInString } from '../utils/parsing';
import { useDebouncedSave } from './useDebouncedSave';
import { useView } from './useViewContext';
import { useSettings } from './useSettingsContext';
import { useAutoTagging } from './useAutoTagging';
import { useGardener } from './useGardener';

interface UseEditorLogicProps {
  note: Note;
  onSave: (note: Note) => void;
}

export const useEditorLogic = ({ note, onSave }: UseEditorLogicProps) => {
  const { publishNote, isPublishing } = usePublish();
  const { setActiveView, setMatchingNoteId, showToast } = useView();
  const { settings } = useSettings();
  const { evolveOntology, alignToOntology } = useGardener();

  const handlePersist = useCallback((n: Note) => {
    onSave(n);
    if (settings.developerMode) {
      evolveOntology([n]).then(attrs => {
        if (attrs.length > 0) {
          const keys = attrs.map(a => a.key).join(', ');
          showToast(`Ontology evolved! You introduced: ${keys}`);
        }
      });
    }
  }, [onSave, settings.developerMode, evolveOntology, showToast]);

  const { dirtyNote, setDirtyNote } = useDebouncedSave(note, handlePersist);

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
          return updated;
      });
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
      const newContent = replacePropertyInString(dirtyNote.content, oldProp, newProp);

      if (newContent !== dirtyNote.content) {
          handleContentSave(newContent);
      }
  }, [dirtyNote.content, handleContentSave]);

  const handleMagic = useCallback(async () => {
      const cleanText = getTextFromHtml(dirtyNote.content);
      const suggestions = await alignToOntology(cleanText, settings.ontology);

      if (suggestions.length > 0) {
          const newContent = dirtyNote.content + '\n\n' + suggestions.map(t => `<p>${t}</p>`).join('');
          handleContentSave(newContent);
          alert(`Magic Align: Added ${suggestions.length} semantic properties.`);
      } else {
          alert('Magic Align: No semantic properties found.');
      }
  }, [dirtyNote.content, alignToOntology, settings.ontology, handleContentSave]);

  return {
    dirtyNote,
    isPublishing,
    handleTitleChange,
    handleTagsChange,
    handlePublish,
    handleFindMatches,
    handleContentSave,
    handleUpdateTextFromInspector,
    handleAutoTag,
    handleMagic,
    isAutoTagging,
    isApiKeyAvailable,
    settings, // needed for ontology
    isPublished: !!dirtyNote.nostrEventId
  };
};
