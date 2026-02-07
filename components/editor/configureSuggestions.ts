import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { SuggestionList, SuggestionItem } from './SuggestionList';

export const configureSuggestions = (
  getItems: (query: string) => SuggestionItem[],
  char: string
) => {
  return {
    char,
    items: ({ query }: { query: string }) => {
      console.log(`[Suggestion] Querying for char '${char}' with:`, query);
      const items = getItems(query);
      console.log(`[Suggestion] Found ${items.length} items.`);
      return items;
    },
    render: () => {
      let component: ReactRenderer;
      let popup: TippyInstance[];

      return {
        onStart: (props: any) => {
          console.log(`[Suggestion] onStart`, props);
          component = new ReactRenderer(SuggestionList, {
            props,
            editor: props.editor,
          });

          if (!props.clientRect) {
            console.log('[Suggestion] No clientRect');
            return;
          }

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          });
        },

        onUpdate: (props: any) => {
          console.log(`[Suggestion] onUpdate`);
          component.updateProps(props);

          if (!props.clientRect) {
            return;
          }

          popup[0].setProps({
            getReferenceClientRect: props.clientRect,
          });
        },

        onKeyDown: (props: any) => {
          if (props.event.key === 'Escape') {
            popup[0].hide();
            return true;
          }

          return (component.ref as any)?.onKeyDown(props);
        },

        onExit: () => {
          console.log(`[Suggestion] onExit`);
          popup[0].destroy();
          component.destroy();
        },
      };
    },
  };
};
