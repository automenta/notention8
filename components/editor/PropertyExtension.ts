import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { PropertyChip } from './PropertyChip';

export const PropertyExtension = Node.create({
  name: 'property',

  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      name: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-name'),
        renderHTML: (attributes) => {
          if (!attributes.name) return {};
          return { 'data-name': attributes.name };
        },
      },
      operator: {
        default: 'is',
        parseHTML: (element) => element.getAttribute('data-operator'),
        renderHTML: (attributes) => {
          return { 'data-operator': attributes.operator };
        },
      },
      value: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-value'),
        renderHTML: (attributes) => {
          if (!attributes.value) return {};
          return { 'data-value': attributes.value };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="property"]',
        getAttrs: (node) => {
          if (typeof node === 'string') return {};
          const element = node as HTMLElement;
          return {
            name: element.getAttribute('data-name'),
            operator: element.getAttribute('data-operator'),
            value: element.getAttribute('data-value'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'property' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PropertyChip);
  },
});
