import React, { useState, useEffect } from 'react';

import { useEditorLogic } from '../hooks/useEditorLogic';
import { useView } from '../hooks/useViewContext';
import { useNotes } from '../hooks/useNotes';
import type { Note } from '../types';
import { EditorHeader } from './EditorHeader';
import { TiptapEditor } from './TiptapEditor';
import { PropertyInspector } from './editor/PropertyInspector';
import { TemplateSelector } from './editor/TemplateSelector';
import { SaveTemplateModal } from './editor/SaveTemplateModal';
import { MapPickerModal } from './map/MapPickerModal';
import { OntologyNode } from '../types';

interface EditorManagerProps {
  note: Note;
  onSave: (note: Note) => void;
  sortedNotes?: Note[];
}

export function EditorManager({ note, onSave, sortedNotes }: EditorManagerProps) {
  const { notes } = useNotes();
  const {
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
    handleSaveTemplate,
    handleUpdateLocation,
    isAutoTagging,
    isApiKeyAvailable,
    settings,
    isPublished,
    saveImmediately,
  } = useEditorLogic({ note, onSave });

  const { setSelectedNoteId, showToast } = useView();
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);

  const currentIndex = (sortedNotes || []).findIndex((n) => n.id === note.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < (sortedNotes || []).length - 1;

  const handlePrevious = React.useCallback(() => {
    if (hasPrevious && sortedNotes) {
      setSelectedNoteId(sortedNotes[currentIndex - 1].id);
    }
  }, [hasPrevious, sortedNotes, currentIndex, setSelectedNoteId]);

  const handleNext = React.useCallback(() => {
    if (hasNext && sortedNotes) {
      setSelectedNoteId(sortedNotes[currentIndex + 1].id);
    }
  }, [hasNext, sortedNotes, currentIndex, setSelectedNoteId]);

  const handleExport = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dirtyNote, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `${dirtyNote.title || 'untitled'}.json`);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveImmediately();
        showToast('Saved');
      }

      if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevious();
      }

      if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dirtyNote, onSave, showToast, handlePrevious, handleNext]);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  const allTemplates = [
      ...settings.customTemplates,
      // We could add default templates here too if we want them in slash commands
  ];

  const handleInsertTemplate = (template: OntologyNode) => {
      // Create empty semantic tags for each attribute in the template
      const attributes = template.attributes || {};
      const tags = Object.keys(attributes).map(key => `[${key}:is:?]`);

      const newContent = dirtyNote.content + (dirtyNote.content ? '\n\n' : '') +
          `<h2>${template.label}</h2>\n` +
          tags.map(t => `<p>${t}</p>`).join('');

      handleContentSave(newContent);
      setIsTemplateSelectorOpen(false);
  };

  return (
    <div className="flex flex-col h-full relative">
      <EditorHeader
        title={dirtyNote.title}
        onTitleChange={handleTitleChange}
        onPublish={handlePublish}
        onFindMatches={handleFindMatches}
        onBack={() => setSelectedNoteId(null)}
        isPublishing={isPublishing}
        isPublished={isPublished}
        tags={dirtyNote.tags}
        onTagsChange={handleTagsChange}
        onAutoTag={handleAutoTag}
        isAutoTagging={isAutoTagging}
        isApiKeyAvailable={isApiKeyAvailable}
        isInspectorOpen={isInspectorOpen}
        onToggleInspector={() => setIsInspectorOpen(!isInspectorOpen)}
        onSaveTemplate={() => setIsSaveTemplateModalOpen(true)}
        onNext={handleNext}
        onPrevious={handlePrevious}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        onExport={handleExport}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col relative">
          <TiptapEditor
            key={note.id}
            note={dirtyNote}
            onSave={handleContentSave}
            ontology={settings.ontology}
            templates={allTemplates}
            onMagic={handleMagic}
            onTemplates={() => setIsTemplateSelectorOpen(!isTemplateSelectorOpen)}
            notes={notes}
          />
          {isTemplateSelectorOpen && (
              <TemplateSelector
                  ontology={settings.ontology}
                  onSelect={handleInsertTemplate}
                  onClose={() => setIsTemplateSelectorOpen(false)}
              />
          )}
        </div>
        {isInspectorOpen && (
          <PropertyInspector
            properties={
              dirtyNote.properties
                ? Object.values(dirtyNote.properties).flat()
                : []
            }
            onUpdateText={handleUpdateTextFromInspector}
            onPropertyChange={() => {}} // Read only for now (updates text)
            onPickLocation={() => setIsMapPickerOpen(true)}
          />
        )}
      </div>
      <SaveTemplateModal
          isOpen={isSaveTemplateModalOpen}
          onClose={() => setIsSaveTemplateModalOpen(false)}
          onSave={handleSaveTemplate}
      />
      <MapPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        onLocationSelect={handleUpdateLocation}
      />
    </div>
  );
}
