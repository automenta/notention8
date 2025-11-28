import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { Note } from '../types';
import { TiptapToolbar } from './TiptapToolbar';
import { sanitizeHTML } from '../utils/sanitize';

const formatHtmlForDisplay = (html: string) => {
  if (!html) return '';
  const blockTags = ['p', 'h1', 'h2', 'h3', 'hr', 'ul', 'ol', 'li', 'blockquote', 'pre'];
  const regex = new RegExp(`(<(?:${blockTags.join('|')})[^>]*>)`, 'g');
  return html.replace(regex, '\n$1').trim();
};

interface TiptapEditorProps {
  note: Note;
  onSave: (updatedContent: string) => void;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({ note, onSave }) => {
  const [viewMode, setViewMode] = useState<'rich' | 'code'>('rich');
  const [localContent, setLocalContent] = useState(note.content);

  const editor = useEditor({
    extensions: [StarterKit],
    content: sanitizeHTML(note.content),
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none h-full',
      },
    },
    onUpdate: ({ editor }) => {
      setLocalContent(editor.getHTML());
    },
  });

  // Debounced save effect
  useEffect(() => {
    if (localContent === note.content) return;
    const handler = setTimeout(() => {
      onSave(localContent);
    }, 1000);
    return () => clearTimeout(handler);
  }, [localContent, note.content, onSave]);

  // Sync content from parent, but only if the editor is not focused.
  // This prevents the cursor from jumping during typing.
  useEffect(() => {
    if (editor && !editor.isFocused) {
      const isDifferent = editor.getHTML() !== note.content;
      if (isDifferent) {
        editor.commands.setContent(sanitizeHTML(note.content), false);
      }
    }
  }, [note.content, editor]);

  // Also sync when the note ID changes to load a new note
  useEffect(() => {
    if(editor) {
      setLocalContent(note.content);
      editor.commands.setContent(sanitizeHTML(note.content), false);
    }
  }, [note.id, editor]);


  const toggleViewMode = () => {
    if (viewMode === 'code') {
      if (editor && editor.getHTML() !== localContent) {
        editor.commands.setContent(sanitizeHTML(localContent), false);
      }
    }
    setViewMode(viewMode === 'rich' ? 'code' : 'rich');
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawHtml = e.target.value.replace(/\n/g, '');
    setLocalContent(rawHtml);
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
            value={formatHtmlForDisplay(localContent)}
            onChange={handleCodeChange}
            placeholder="Enter HTML..."
          />
        )}
      </div>
    </div>
  );
};
