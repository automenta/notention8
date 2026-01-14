import React, { useState } from 'react';

import { useEditorLogic } from '../hooks/useEditorLogic';
import { useView } from '../hooks/useViewContext';
import type { Note } from '../types';
import { EditorHeader } from './EditorHeader';
import { TiptapEditor } from './TiptapEditor';
import { PropertyInspector } from './editor/PropertyInspector';
import { TemplateSelector } from './editor/TemplateSelector';
import { SaveTemplateModal } from './editor/SaveTemplateModal';
import { OntologyNode } from '../types';

interface EditorManagerProps {
  note: Note;
  onSave: (note: Note) => void;
}

export function EditorManager({ note, onSave }: EditorManagerProps) {
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
    isAutoTagging,
    isApiKeyAvailable,
    settings,
    isPublished,
  } = useEditorLogic({ note, onSave });

  const { setSelectedNoteId } = useView();
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);

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
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col relative">
          <TiptapEditor
            key={note.id}
            note={dirtyNote}
            onSave={handleContentSave}
            ontology={settings.ontology}
            onMagic={handleMagic}
            onTemplates={() => setIsTemplateSelectorOpen(!isTemplateSelectorOpen)}
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
          />
        )}
      </div>
      <SaveTemplateModal
          isOpen={isSaveTemplateModalOpen}
          onClose={() => setIsSaveTemplateModalOpen(false)}
          onSave={handleSaveTemplate}
      />
    </div>
  );
}
