import React, { useEffect, useState, useCallback } from 'react';
import { EditorContent } from '@tiptap/react';
import type { Note, OntologyNode, Template } from '../types';
import { TiptapToolbar } from './TiptapToolbar';
import { sanitizeHTML } from '../utils/sanitize';
import { formatHtmlForDisplay } from '../utils/editor';
import { useTiptapConfig } from './editor/useTiptapConfig';
import { useView } from '../hooks/useViewContext';
import { useToast } from './contexts/ToastContext';
import { EditorStatusBar } from './editor/EditorStatusBar';
import { EditorBubbleMenu } from './editor/EditorBubbleMenu';

interface TiptapEditorProps {
  note: Note;
  onSave: (updatedContent: string) => void;
  ontology: OntologyNode[];
  templates?: Template[];
  minimal?: boolean;
  onMagic?: () => void;
  onTemplates?: () => void;
  notes?: Note[];
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({ note, onSave, ontology, templates, minimal = false, onMagic, onTemplates, notes = [] }) => {
  const [viewMode, setViewMode] = useState<'rich' | 'code'>('rich');
  const { setSearchTerm, setActiveView, setSelectedNoteId } = useView();
  const { addToast } = useToast();

  const editor = useTiptapConfig({
      content: note.content,
      onUpdate: onSave,
      ontology,
      templates,
      minimal,
      notes
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

  const handleEditorClick = useCallback((e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      // Handle both tags and properties (which are also searchable)
      if (target.classList.contains('suggestion-tag') || target.classList.contains('suggestion-item')) {
          e.preventDefault();
          const text = target.innerText;

          // For tags, ensure '#' prefix. For properties, use as is.
          const searchTerm = target.classList.contains('suggestion-tag') && !text.startsWith('#')
            ? `#${text}`
            : text;

          setSearchTerm(searchTerm);
          setActiveView('notes');
          addToast(`Filtered by ${searchTerm}`, 'info');
      }

      // Handle Note Links
      if (target.classList.contains('suggestion-note')) {
          e.preventDefault();
          const noteId = target.getAttribute('data-id');
          if (noteId) {
              setSelectedNoteId(noteId);
              setActiveView('notes');
          }
      }
  }, [setSearchTerm, setActiveView, addToast, setSelectedNoteId]);

  return (
    <div className="flex flex-col h-full">
      {!minimal && (
        <TiptapToolbar
          editor={editor}
          viewMode={viewMode}
          toggleViewMode={toggleViewMode}
          onMagic={onMagic}
          onTemplates={onTemplates}
        />
      )}
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
};
