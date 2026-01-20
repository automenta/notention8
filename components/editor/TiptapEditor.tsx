import React, { useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { EditorContent } from '@tiptap/react';
import type { Note, OntologyNode, Template } from '../../types';
import { TiptapToolbar } from './TiptapToolbar';
import { sanitizeHTML } from '../../utils/sanitize';
import { formatHtmlForDisplay } from '../../utils/editor';
import { useTiptapConfig } from './useTiptapConfig';
import { useView } from '../../hooks/useViewContext';
import { useToast } from '../contexts/ToastContext';
import { useEditorClick } from './useEditorClick';
import { EditorStatusBar } from './EditorStatusBar';
import { EditorBubbleMenu } from './EditorBubbleMenu';
import { InsertPropertyModal } from './InsertPropertyModal';

interface TiptapEditorProps {
  note: Note;
  onSave: (updatedContent: string) => void;
  ontology: OntologyNode[];
  templates?: Template[];
  minimal?: boolean;
  showToolbar?: boolean;
  onMagic?: () => void;
  onTemplates?: () => void;
  notes?: Note[];
  onPickLocation?: () => Promise<string>;
}

export interface TiptapEditorRef {
    openPropertyModal: (key?: string) => void;
}

export const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(({
  note,
  onSave,
  ontology,
  templates,
  minimal = false,
  showToolbar = true,
  onMagic,
  onTemplates,
  notes = [],
  onPickLocation
}, ref) => {
  const [viewMode, setViewMode] = useState<'rich' | 'code'>('rich');
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingPropertyPos, setEditingPropertyPos] = useState<number | null>(null);
  const [initialModalData, setInitialModalData] = useState<{
    key: string;
    operator: string;
    value: string;
    icon?: string;
  } | undefined>(undefined);

  const { setSearchTerm, setActiveView, setSelectedNoteId } = useView();
  const { addToast } = useToast();

  const handleOpenPropertyModal = useCallback((key?: string) => {
      setInitialModalData(key ? { key, operator: 'is', value: '' } : undefined);
      setIsPropertyModalOpen(true);
  }, []);

  useImperativeHandle(ref, () => ({
      openPropertyModal: handleOpenPropertyModal
  }));

  const editor = useTiptapConfig({
      content: note.content,
      onUpdate: onSave,
      ontology,
      templates,
      minimal,
      notes,
      onOpenPropertyModal: handleOpenPropertyModal
  });

  // Sync content from parent
  useEffect(() => {
    if (editor && !editor.isFocused && editor.getHTML() !== note.content) {
      editor.commands.setContent(sanitizeHTML(note.content), false);
    }
  }, [note.content, editor]);

  const toggleViewMode = () => {
    if (viewMode === 'code' && editor && editor.getHTML() !== note.content) {
      editor.commands.setContent(sanitizeHTML(note.content), false);
    }
    setViewMode((prev) => (prev === 'rich' ? 'code' : 'rich'));
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onSave(e.target.value.replace(/\n/g, ''));
  };

  const handleInsertProperty = (key: string, operator: string, value: string, icon?: string) => {
    if (editor) {
      if (editingPropertyPos !== null) {
          // Replace existing node
          editor.chain().focus().setNodeSelection(editingPropertyPos).deleteSelection().insertContent({
              type: 'property',
              attrs: {
                  name: key,
                  operator: operator,
                  value: value,
                  icon: icon,
              },
          }).run();
      } else {
          // Insert new
          editor
            .chain()
            .focus()
            .insertContent({
              type: 'property',
              attrs: {
                name: key,
                operator: operator,
                value: value,
                icon: icon,
              },
            })
            .insertContent(' ')
            .run();
      }
    }
    setIsPropertyModalOpen(false);
    setEditingPropertyPos(null);
    setInitialModalData(undefined);
  };

  const findAttributeDef = (key: string, nodes: OntologyNode[]): any => {
      for (const node of nodes) {
        if (node.attributes && node.attributes[key]) {
          return node.attributes[key];
        }
        if (node.children) {
          const found = findAttributeDef(key, node.children);
          if (found) return found;
        }
      }
      return undefined;
  };

  const handleEditorClick = useEditorClick({
    editor,
    setEditingPropertyPos,
    setInitialModalData,
    setIsPropertyModalOpen,
    setSearchTerm,
    setActiveView,
    addToast,
    setSelectedNoteId
  });

  return (
    <div className="flex flex-col h-full">
      {!minimal && showToolbar && (
        <TiptapToolbar
          editor={editor}
          viewMode={viewMode}
          toggleViewMode={toggleViewMode}
          onMagic={onMagic}
          onTemplates={onTemplates}
          onInsertProperty={() => {
              setEditingPropertyPos(null);
              setInitialModalData(undefined);
              setIsPropertyModalOpen(true);
          }}
        />
      )}
      <InsertPropertyModal
        isOpen={isPropertyModalOpen}
        onClose={() => {
            setIsPropertyModalOpen(false);
            setEditingPropertyPos(null);
            setInitialModalData(undefined);
        }}
        onInsert={handleInsertProperty}
        initialKey={initialModalData?.key}
        initialOperator={initialModalData?.operator}
        initialValue={initialModalData?.value}
        attributeDef={initialModalData?.key ? findAttributeDef(initialModalData.key, ontology) : undefined}
        ontology={ontology}
        isEditing={editingPropertyPos !== null}
        onPickLocation={onPickLocation}
      />
      <div className="flex-grow overflow-y-auto" onClick={handleEditorClick}>
        {viewMode === 'rich' ? (
          <>
            <EditorBubbleMenu editor={editor} />
            <EditorContent editor={editor} />
          </>
        ) : (
          <textarea
            className="w-full h-full p-4 bg-gray-900 text-gray-300 font-mono focus:outline-none resize-none"
            value={formatHtmlForDisplay(note.content)}
            onChange={handleCodeChange}
            placeholder="Enter HTML..."
          />
        )}
      </div>
      {!minimal && <EditorStatusBar editor={editor} />}
    </div>
  );
});
