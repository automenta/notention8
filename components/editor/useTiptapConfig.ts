import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import { sanitizeHTML } from '../../utils/sanitize';
import { useOntologyIndex } from '../../hooks/useOntologyIndex';
import { configureSuggestions } from './configureSuggestions';
import type { OntologyNode } from '../../types';

interface UseTiptapConfigProps {
    content: string;
    onUpdate: (content: string) => void;
    ontology: OntologyNode[];
    minimal?: boolean;
}

export const useTiptapConfig = ({ content, onUpdate, ontology, minimal }: UseTiptapConfigProps) => {
  const { allTags, allProperties } = useOntologyIndex(ontology);

  return useEditor({
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
      }).extend({ name: 'propertySuggestion' }),

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
    content: sanitizeHTML(content),
    editorProps: {
      attributes: {
        class: `prose prose-invert prose-sm focus:outline-none h-full ${minimal ? 'p-2 text-xs' : 'sm:prose-base lg:prose-lg xl:prose-2xl m-5'}`,
      },
    },
    onUpdate: ({ editor }) => onUpdate(editor.getHTML()),
  }, [ontology, minimal]);
};
