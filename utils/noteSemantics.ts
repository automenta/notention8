import type { Property } from '../types';
import { formatPropertyForDisplay } from './properties';

export const getNoteSemantics = (htmlContent: string) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  const foundTags = Array.from(
    tempDiv.querySelectorAll<HTMLElement>('.widget.tag')
  )
    .map((el) => el.dataset.tag || '')
    .filter(Boolean);
  const tags = Array.from(new Set(foundTags)); // Ensure uniqueness

  const foundProperties: Property[] = Array.from(
    tempDiv.querySelectorAll<HTMLElement>('.widget.property')
  )
    .map((el) => {
      let values: string[] = [];
      try {
        // Safely parse the values array from the data attribute
        values = JSON.parse(el.dataset.values || '[]');
        if (!Array.isArray(values)) values = [];
      } catch {
        values = []; // Default to empty array on parsing error
      }

      return {
        key: el.dataset.key || '',
        operator: el.dataset.operator || 'is',
        values: values,
      };
    })
    .filter((p) => p.key);
  const properties = foundProperties;

  // An imaginary property is one whose operator is not 'is'.
  const isImaginary = foundProperties.some((p) => p.operator !== 'is');

  return { tags, properties, isImaginary };
};

export const htmlToPlain = (html: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Process widgets
  tempDiv.querySelectorAll<HTMLElement>('.widget').forEach((widget) => {
    let plainText = '';
    if (widget.classList.contains('tag')) {
      plainText = `#${widget.dataset.tag}`;
    } else if (widget.classList.contains('property')) {
      const key = widget.dataset.key || '';
      const operator = widget.dataset.operator || 'is';
      const values = JSON.parse(widget.dataset.values || '[]');
      plainText = `[${key}:${operator}:${values.join(',')}]`;
    }
    widget.replaceWith(document.createTextNode(plainText));
  });

  // Convert <br> to newlines and get text content
  tempDiv.innerHTML = tempDiv.innerHTML.replace(/<br\s*\/?>/gi, '\n');

  return tempDiv.textContent || '';
};

const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
};

export const plainToHtml = (plainText: string): string => {
  // 1. Escape the entire text to neutralize any existing HTML.
  let html = escapeHtml(plainText);

  // 2. Replace semantic patterns with HTML widgets.
  // Regex for properties: [key:operator:value]
  const propRegex = /\[([^:\]]+):([^:\]]+):([^\]]*)\]/g;
  html = html.replace(propRegex, (_, key, operator, valuesStr) => {
    const values = valuesStr.split(',').map(s => s.trim());
    const formatted = formatPropertyForDisplay(key, operator, values);
    return `<span class="widget property" contenteditable="false" data-key="${key}" data-operator="${operator}" data-values='${JSON.stringify(values)}'>${formatted}</span>`;
  });

  // Regex for tags: #tagname (must not be part of a URL or inside another word)
  const tagRegex = /(?<!\w)#([a-zA-Z0-9_-]+)/g;
  html = html.replace(tagRegex, (match, tagName) => {
    return `<span class="widget tag" contenteditable="false" data-tag="${tagName}">#${tagName}</span>`;
  });

  // 3. Convert newlines back to <br> tags for display in contentEditable.
  return html.replace(/\n/g, '<br>');
};
