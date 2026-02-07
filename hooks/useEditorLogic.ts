import { useCallback } from 'react';
import type { Note, Property } from '../types';
import { usePublish } from './usePublish';
import { parseProperties, replacePropertyInString } from '../utils/parsing';
import { useDebouncedSave } from './useDebouncedSave';
import { useView } from './useViewContext';
import { useToast } from './useToast';
import { useSettings } from './useSettingsContext';
import { useGardener } from './useGardener';
import { useOntologyMatching } from './useOntologyMatching';
import { useEditorMagic } from './useEditorMagic';

interface UseEditorLogicProps {
  note: Note;
  onSave: (note: Note) => void;
}

export const useEditorLogic = ({ note, onSave }: UseEditorLogicProps) => {
  const { publishNote, isPublishing } = usePublish();
  const { setActiveView, setMatchingNoteId } = useView();
  const { addToast } = useToast();
  const { settings, setSettings } = useSettings();
  const { evolveOntology } = useGardener();

  const handlePersist = useCallback((n: Note) => {
    onSave(n);
    if (settings.developerMode) {
      evolveOntology([n]).then(attrs => {
        if (attrs.length > 0) {
          const keys = attrs.map(a => a.key).join(', ');
          addToast(`Ontology evolved! You introduced: ${keys}`, 'info');
        }
      });
    }
  }, [onSave, settings.developerMode, evolveOntology, addToast]);

  const { dirtyNote, setDirtyNote } = useDebouncedSave(note, handlePersist);

  // Expose immediate save for Ctrl+S
  const saveImmediately = useCallback(() => {
      handlePersist(dirtyNote);
  }, [handlePersist, dirtyNote]);

  const {
      matchingOntologyNode,
      actionLabel,
      validationErrors,
      missingProperties
  } = useOntologyMatching({
      tags: dirtyNote.tags,
      properties: dirtyNote.properties,
      ontology: settings.ontology
  });

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
    (content: string) => {
      // Parse properties from content and update note
      const properties = parseProperties(content);

      setDirtyNote((prev) => {
          const updated = { ...prev, content, properties };
          return updated;
      });
    },
    [setDirtyNote]
  );

  const { handleMagic, handleAutoTag, isAutoTagging, isApiKeyAvailable } = useEditorMagic({
      content: dirtyNote.content,
      tags: dirtyNote.tags,
      onTagsChange: handleTagsChange,
      onContentSave: handleContentSave,
      ontology: settings.ontology
  });

  const handlePublish = async () => {
    if (!dirtyNote.content) return;

    if (validationErrors.length > 0) {
        alert(`Cannot ${actionLabel}:\n- ${validationErrors.join('\n- ')}`);
        return;
    }

    if (
      confirm(
        `Are you sure you want to ${actionLabel.toLowerCase()} to the public Nostr network?`
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
        addToast(`${actionLabel} successful!`, 'success');
      } catch (e) {
        addToast(
          'Failed to publish: ' +
            (e instanceof Error ? e.message : String(e)),
          'error'
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

  const handleUpdateLocation = useCallback((latlng: string) => {
      // Find existing location property if any
      const existingProp = dirtyNote.properties.find(p => p.key === 'location');

      const newProp = {
          key: 'location',
          operator: 'is',
          values: [latlng]
      };

      const newContent = replacePropertyInString(dirtyNote.content, existingProp || null, newProp);

      if (newContent !== dirtyNote.content) {
          handleContentSave(newContent);
      }
  }, [dirtyNote, handleContentSave]);

  const handleUpdateProperty = useCallback((key: string, value: string) => {
    // Find existing property with this key
    const existingProp = dirtyNote.properties.find(p => p.key === key);

    const newProp = {
        key,
        operator: 'is',
        values: [value]
    };

    const newContent = replacePropertyInString(dirtyNote.content, existingProp || null, newProp);

    if (newContent !== dirtyNote.content) {
        handleContentSave(newContent);
    }
}, [dirtyNote, handleContentSave]);

  const handleSaveTemplate = useCallback((name: string) => {
      const template = {
          id: crypto.randomUUID(),
          label: name,
          content: dirtyNote.content,
          icon: '📄' // Default icon
      };

      setSettings(prev => ({
          ...prev,
          customTemplates: [...prev.customTemplates, template]
      }));

      addToast(`Saved as template: ${name}`, 'success');
  }, [dirtyNote.content, setSettings, addToast]);

  return {
    dirtyNote,
    isPublishing,
    handleTitleChange,
    handleTagsChange,
    handlePublish,
    handleFindMatches,
    handleContentSave,
    handleUpdateTextFromInspector,
    handleUpdateLocation,
    handleUpdateProperty,
    handleAutoTag,
    handleMagic,
    handleSaveTemplate,
    saveImmediately,
    isAutoTagging,
    isApiKeyAvailable,
    settings, // needed for ontology
    isPublished: !!dirtyNote.nostrEventId,
    actionLabel,
    validationErrors,
    missingProperties,
    matchingOntologyNode
  };
};
