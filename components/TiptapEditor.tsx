import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import type { Note, OntologyNode } from '../types';
import { TiptapToolbar } from './TiptapToolbar';
import { sanitizeHTML } from '../utils/sanitize';
import { formatHtmlForDisplay } from '../utils/editor';
import { useOntologyIndex } from '../hooks/useOntologyIndex';
import { configureSuggestions } from './editor/configureSuggestions';

interface TiptapEditorProps {
  note: Note;
  onSave: (updatedContent: string) => void;
  ontology: OntologyNode[];
  minimal?: boolean;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({ note, onSave, ontology, minimal = false }) => {
  const [viewMode, setViewMode] = useState<'rich' | 'code'>('rich');

  // Index suggestions
  const { allTags, allProperties } = useOntologyIndex(ontology);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: {
          class: 'suggestion-item',
        },
        suggestion: configureSuggestions((query) => {
            const lower = query.toLowerCase();
            return allProperties
                .filter(p => p.label.toLowerCase().includes(lower))
                .slice(0, 5)
                .map(p => ({ id: p.id, label: p.label, description: p.description }));
        }, '['),
      }).extend({ name: 'propertySuggestion' }), // Rename to allow multiple instances if needed, though here we use char

      // Tag suggestion
      Mention.configure({
          HTMLAttributes: {
            class: 'suggestion-tag',
          },
          suggestion: configureSuggestions((query) => {
              const lower = query.toLowerCase();
              return allTags
                  .filter(t => t.label.toLowerCase().includes(lower))
                  .slice(0, 5)
                  .map(t => ({ id: t.id, label: t.label, description: t.description }));
          }, '#'),
      }).extend({ name: 'tagSuggestion' }),
    ],
    content: sanitizeHTML(note.content),
    editorProps: {
      attributes: {
        class: `prose prose-invert prose-sm focus:outline-none h-full ${minimal ? 'p-2 text-xs' : 'sm:prose-base lg:prose-lg xl:prose-2xl m-5'}`,
      },
    },
    onUpdate: ({ editor }) => onSave(editor.getHTML()),
  }, [ontology, minimal]); // Re-create editor when ontology changes to update suggestions closure

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
      {!minimal && <TiptapToolbar editor={editor} viewMode={viewMode} toggleViewMode={toggleViewMode} />}
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
