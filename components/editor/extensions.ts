import StarterKit from '@tiptap/starter-kit';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import Mention from '@tiptap/extension-mention';
import { PropertyExtension } from './PropertyExtension';
import { configureSuggestions } from './configureSuggestions';
import type { Template, Note } from '../../types';

interface GetExtensionsProps {
    allProperties: { id: string; label: string; description?: string }[];
    allTags: { id: string; label: string; description?: string }[];
    getNotes: () => Note[];
    templates: Template[];
    onOpenPropertyModal?: (key: string) => void;
}

export const getExtensions = ({ allProperties, allTags, getNotes, templates, onOpenPropertyModal }: GetExtensionsProps) => {
    return [
      StarterKit,
      BubbleMenu,
      PropertyExtension,
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

      Mention.configure({
          HTMLAttributes: {
            class: 'suggestion-note',
          },
          suggestion: configureSuggestions((query) => {
              const lower = query.toLowerCase();
              return getNotes()
                  .filter(n => (n.title || 'Untitled').toLowerCase().includes(lower))
                  .slice(0, 5)
                  .map(n => ({
                      id: n.id,
                      label: n.title || 'Untitled',
                      description: 'Note'
                  }));
          }, '@'),
      }).extend({ name: 'noteSuggestion' }),

      Mention.configure({
          HTMLAttributes: {
            class: 'suggestion-note',
          },
          suggestion: {
              ...configureSuggestions((query) => {
                  const lower = query.toLowerCase();
                  return getNotes()
                      .filter(n => (n.title || 'Untitled').toLowerCase().includes(lower))
                      .slice(0, 5)
                      .map(n => ({
                          id: n.id,
                          label: n.title || 'Untitled',
                          description: 'Note'
                      }));
              }, '[['), // Wiki-link style trigger
              command: ({ editor, range, props }) => {
                  // Delete the trigger and query
                  editor.chain().focus().deleteRange(range).run();
                  // Insert the standard mention node
                  editor.chain().focus().insertContent({
                      type: 'noteSuggestion', // Use the existing note suggestion type
                      attrs: {
                          id: props.id,
                          label: props.label
                      }
                  }).insertContent(' ').run();
              }
          }
      }).extend({ name: 'wikiLinkSuggestion' }),

      Mention.configure({
          HTMLAttributes: {
            class: 'suggestion-slash',
          },
          suggestion: {
            ...configureSuggestions((query) => {
                const lower = query.toLowerCase();

                const templateItems = templates
                    .filter(t => t.label.toLowerCase().includes(lower))
                    .map(t => ({
                        id: t.content, // Insert content
                        label: t.label,
                        description: 'Template',
                        type: 'template'
                    }));

                 const propertyItems = allProperties
                    .filter(p => p.label.toLowerCase().includes(lower))
                    .map(p => ({
                        id: `[${p.label}:is:?]`, // Insert semantic property syntax
                        label: p.label,
                        description: 'Property',
                        type: 'property'
                    }));

                 return [...templateItems, ...propertyItems].slice(0, 10);
            }, '/'),
            command: ({ editor, range, props }) => {
                // Delete the slash command text
                editor.chain().focus().deleteRange(range).run();

                if (props.type === 'property' && onOpenPropertyModal) {
                    onOpenPropertyModal(props.label);
                    return;
                }

                // Insert the content
                const content = props.id;
                editor.chain().focus().insertContent(content).run();
            },
          }
      }).extend({ name: 'slashCommand' }),
    ];
};
