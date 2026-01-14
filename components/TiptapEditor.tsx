import React, { useEffect, useState } from 'react';
import { EditorContent } from '@tiptap/react';
import type { Note, OntologyNode } from '../types';
import { TiptapToolbar } from './TiptapToolbar';
import { sanitizeHTML } from '../utils/sanitize';
import { formatHtmlForDisplay } from '../utils/editor';
import { useTiptapConfig } from './editor/useTiptapConfig';

interface TiptapEditorProps {
  note: Note;
  onSave: (updatedContent: string) => void;
  ontology: OntologyNode[];
  minimal?: boolean;
  onMagic?: () => void;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({ note, onSave, ontology, minimal = false, onMagic }) => {
  const [viewMode, setViewMode] = useState<'rich' | 'code'>('rich');

  const editor = useTiptapConfig({
      content: note.content,
      onUpdate: onSave,
      ontology,
      minimal
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

  return (
    <div className="flex flex-col h-full">
      {!minimal && (
        <TiptapToolbar
          editor={editor}
          viewMode={viewMode}
          toggleViewMode={toggleViewMode}
          onMagic={onMagic}
        />
      )}
      <div className="flex-grow overflow-y-auto">
        {viewMode === 'rich' ? (
          <EditorContent editor={editor} />
        ) : (
          <textarea
            className="w-full h-full p-4 bg-gray-900 text-gray-300 font-mono focus:outline-none resize-none"
            value={formatHtmlForDisplay(note.content)}
            onChange={handleCodeChange}
            placeholder="Enter HTML..."
          />
        )}
      </div>
    </div>
  );
};
