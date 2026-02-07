import React, { useState, useRef } from 'react';

import { useEditorLogic } from '../../hooks/useEditorLogic';
import { useView } from '../../hooks/useViewContext';
import { useToast } from '../contexts/ToastContext';
import { useNotes } from '../../hooks/useNotes';
import { useEditorActions } from '../../hooks/useEditorActions';
import { useEditorShortcuts } from '../../hooks/useEditorShortcuts';
import type { Note, OntologyAttribute, OntologyNode } from '../../types';
import { EditorHeader } from './EditorHeader';
import { TiptapEditor, TiptapEditorRef } from './TiptapEditor';
import { PropertyInspector } from './PropertyInspector';
import { TemplateSelector } from './TemplateSelector';
import { SaveTemplateModal } from './SaveTemplateModal';
import { MapPickerModal } from '../map/MapPickerModal';
import { TimePickerModal } from '../common/TimePickerModal';

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
    handleUpdateProperty,
    isAutoTagging,
    isApiKeyAvailable,
    settings,
    isPublished,
    saveImmediately,
    actionLabel,
    missingProperties,
  } = useEditorLogic({ note, onSave });

  const { setSelectedNoteId } = useView();
  const { addToast } = useToast();
  const editorRef = useRef<TiptapEditorRef>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);

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

  const { handleExport, handleCopyContent } = useEditorActions(dirtyNote);

  useEditorShortcuts({
      dirtyNote,
      onSave: saveImmediately,
      addToast,
      handlePrevious,
      handleNext,
      setSelectedNoteId
  });

  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [locationPickerCallback, setLocationPickerCallback] = useState<((loc: string) => void) | null>(null);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [pickingTimeKey, setPickingTimeKey] = useState<string>('');

  const allTemplates = [
      ...settings.customTemplates,
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

  const handlePickTime = (key: string) => {
      setPickingTimeKey(key);
      setIsTimePickerOpen(true);
  };

  const handleTimeSelected = (timeVal: string) => {
      if (pickingTimeKey) {
          handleUpdateProperty(pickingTimeKey, timeVal);
      }
      setIsTimePickerOpen(false);
  };

  const handleAddPropertyHint = (key: string) => {
      if (editorRef.current) {
          editorRef.current.openPropertyModal(key);
      }
  };

  // Modified handleUpdateLocation to support generic picking
  const handleLocationSelect = React.useCallback((latlng: string) => {
      if (locationPickerCallback) {
          locationPickerCallback(latlng);
          setLocationPickerCallback(null);
          setIsMapPickerOpen(false);
          return;
      }
      handleUpdateLocation(latlng);
  }, [handleUpdateLocation, locationPickerCallback]);

  const handleRequestLocationPick = React.useCallback((): Promise<string> => {
      return new Promise((resolve) => {
          setLocationPickerCallback(() => (loc: string) => resolve(loc));
          setIsMapPickerOpen(true);
      });
  }, []);

  return (
    <div className="flex flex-col h-full relative">
      <EditorHeader
        key={note.id}
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
        onCopyContent={handleCopyContent}
        isToolbarVisible={isToolbarVisible}
        onToggleToolbar={() => setIsToolbarVisible(!isToolbarVisible)}
        actionLabel={actionLabel}
        missingProperties={missingProperties}
        onAddProperty={handleAddPropertyHint}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col relative">
          <TiptapEditor
            ref={editorRef}
            key={note.id}
            note={dirtyNote}
            onSave={handleContentSave}
            ontology={settings.ontology}
            templates={allTemplates}
            showToolbar={isToolbarVisible}
            onMagic={() => {
                if (settings.aiProvider === 'webllm' && settings.aiEnabled) {
                    addToast('Loading local model... this may take a while.', 'info');
                }
                handleMagic();
            }}
            onTemplates={() => setIsTemplateSelectorOpen(!isTemplateSelectorOpen)}
            notes={notes}
            onPickLocation={handleRequestLocationPick}
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
            onPickTime={handlePickTime}
            ontology={settings.ontology}
            onClose={() => setIsInspectorOpen(false)}
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
        onLocationSelect={handleLocationSelect}
      />
      <TimePickerModal
        isOpen={isTimePickerOpen}
        onClose={() => setIsTimePickerOpen(false)}
        onTimeSelect={handleTimeSelected}
        title={`Pick Time for ${pickingTimeKey}`}
      />
    </div>
  );
}
