import React, { useState } from 'react';
import type { Note } from '../types';
import { TiptapEditor } from './TiptapEditor';
import { EditorHeader } from './EditorHeader';
import { PropertyInspector } from './editor/PropertyInspector';
import { useEditorLogic } from '../hooks/useEditorLogic';
import { useView } from '../hooks/useViewContext';

interface EditorManagerProps {
  note: Note;
  onSave: (note: Note) => void;
}

export const EditorManager: React.FC<EditorManagerProps> = ({
  note,
  onSave,
}) => {
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
    isAutoTagging,
    isApiKeyAvailable,
    settings,
    isPublished
  } = useEditorLogic({ note, onSave });

  const { setSelectedNoteId } = useView();
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
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
        {isInspectorOpen && (
            <PropertyInspector
                properties={dirtyNote.properties ? Object.values(dirtyNote.properties).flat() : []}
                onUpdateText={handleUpdateTextFromInspector}
                onPropertyChange={() => {}} // Read only for now (updates text)
            />
        )}
      </div>
    </div>
  );
};
