import { useCallback } from 'react';
import type { Note, Property } from '../types';
import { usePublish } from './usePublish';
import { getTextFromHtml } from '../utils/nostr';
import { parseProperties, replacePropertyInString } from '../utils/parsing';
import { useDebouncedSave } from './useDebouncedSave';
import { useView } from './useViewContext';
import { useToast } from '../components/contexts/ToastContext';
import { useSettings } from './useSettingsContext';
import { useAutoTagging } from './useAutoTagging';
import { useGardener } from './useGardener';
import { parseNaturalDate } from '../utils/dateParsing';
import type { OntologyNode } from '../types';

interface UseEditorLogicProps {
  note: Note;
  onSave: (note: Note) => void;
}

export const useEditorLogic = ({ note, onSave }: UseEditorLogicProps) => {
  const { publishNote, isPublishing } = usePublish();
  const { setActiveView, setMatchingNoteId } = useView();
  const { addToast } = useToast();
  const { settings, setSettings } = useSettings();
  const { evolveOntology, alignToOntology } = useGardener();

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

  // Find matching ontology node based on tags
  const matchingOntologyNode = (() => {
      const findNode = (nodes: OntologyNode[]): OntologyNode | null => {
          for (const node of nodes) {
              const label = node.label.toLowerCase();
              const noteTags = dirtyNote.tags.map(t => t.toLowerCase());

              // Check children first (more specific matches)
              if (node.children) {
                  const found = findNode(node.children);
                  if (found) return found;
              }

              // Hyperslicing check (Extends): if node extends other concepts, check if all extended concepts are present
              if (node.extends && node.extends.length > 0) {
                  const allExtendedPresent = node.extends.every(ext =>
                      noteTags.some(tag => tag.includes(ext.toLowerCase()))
                  );
                  if (allExtendedPresent) {
                      return node;
                  }
              }

              // Fallback: Check if tags contain the full label (normalized) or ID
              // This supports monolithic tags like "Job Request" if slices fail or aren't defined
              if (noteTags.some(t => t.includes(label) || t === node.id.toLowerCase())) {
                  return node;
              }
          }
          return null;
      };

      return findNode(settings.ontology);
  })();

  const actionLabel = matchingOntologyNode?.actionLabel || 'Publish';

  const validationErrors = (() => {
      const errors: string[] = [];
      if (!matchingOntologyNode || !matchingOntologyNode.requiredAttributes) return errors;

      matchingOntologyNode.requiredAttributes.forEach(req => {
          const hasProp = dirtyNote.properties.some(p => p.key.toLowerCase() === req.toLowerCase());
          if (!hasProp) {
              errors.push(`Missing required property: [${req}:...]`);
          }
      });

      return errors;
  })();

  const missingProperties = (() => {
      const missing: string[] = [];
      if (!matchingOntologyNode || !matchingOntologyNode.requiredAttributes) return missing;

      matchingOntologyNode.requiredAttributes.forEach(req => {
          const hasProp = dirtyNote.properties.some(p => p.key.toLowerCase() === req.toLowerCase());
          if (!hasProp) {
              missing.push(req);
          }
      });
      return missing;
  })();

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
      // We pass the raw content (HTML) to parseProperties because it handles both
      // text-based brackets and HTML-based property chips.
      const properties = parseProperties(content);

      // Auto-convert natural dates if present in properties
      // This logic could be more sophisticated (e.g., suggest changes instead of auto-replace)
      // But for "Magic" effect, let's keep it simple or do it only on specific triggers?
      // Actually, let's leave handleContentSave pure and add a specific effect or hook for transformations if needed.
      // For now, we will apply conversions during Magic or explicit actions to avoid annoying typing interference.

      setDirtyNote((prev) => {
          const updated = { ...prev, content, properties };
          return updated;
      });
    },
    [setDirtyNote]
  );

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

      // If no existing location prop was found and replaced (because it might not exist in text but exist in parsed props?
      // replacePropertyInString handles null oldProp by appending.

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

  const handleMagic = useCallback(async () => {
      const cleanText = getTextFromHtml(dirtyNote.content);
      const suggestions = await alignToOntology(cleanText, settings.ontology);

      // Also look for natural language date conversions in existing properties
      // We check raw content to find all properties including chips
      const existingProps = parseProperties(dirtyNote.content);
      let content = dirtyNote.content;
      let convertedCount = 0;

      existingProps.forEach(prop => {
          if (['date', 'deadline', 'start', 'end'].some(k => prop.key.includes(k))) {
             const val = prop.values[0];
             if (!val) return; // Skip if no value

             const parsed = parseNaturalDate(val);
             if (parsed && parsed !== val) {
                 const newProp = { ...prop, values: [parsed] };
                 content = replacePropertyInString(content, prop, newProp);
                 convertedCount++;
             }
          }
      });

      if (suggestions.length > 0 || convertedCount > 0) {
          if (suggestions.length > 0) {
               content = content + '\n\n' + suggestions.map(t => `<p>${t}</p>`).join('');
          }
          handleContentSave(content);

          // Also trigger auto-tagging
          handleAutoTag();

          addToast(`Magic: Added ${suggestions.length} properties, converted ${convertedCount} dates.`, 'success');
      } else {
          // Even if no properties, try auto-tagging
          handleAutoTag();
          addToast('Magic: Checked tags and properties.', 'info');
      }
  }, [dirtyNote.content, alignToOntology, settings.ontology, handleContentSave, addToast, handleAutoTag]);

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
