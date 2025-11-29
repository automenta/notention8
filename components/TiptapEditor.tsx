import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { Note } from '../types';
import { TiptapToolbar } from './TiptapToolbar';
import { sanitizeHTML } from '../utils/sanitize';
import { formatHtmlForDisplay } from '../utils/editor';

interface TiptapEditorProps {
  note: Note;
  onSave: (updatedContent: string) => void;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({ note, onSave }) => {
  const [viewMode, setViewMode] = useState<'rich' | 'code'>('rich');

  const editor = useEditor({
    extensions: [StarterKit],
    content: sanitizeHTML(note.content),
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none h-full',
      },
    },
    onUpdate: ({ editor }) => onSave(editor.getHTML()),
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
      <TiptapToolbar editor={editor} viewMode={viewMode} toggleViewMode={toggleViewMode} />
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
