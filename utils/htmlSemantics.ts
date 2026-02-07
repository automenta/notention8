import type { Property } from '../types';
import { isIndefiniteProperty } from './semantics';
import { extractProperties, SYMBOL_TO_OP } from './parsing';

/**
 * A map from operator keys to their display symbols.
 * This ensures consistent visual representation of semantic operators across the app.
 */
export const OPERATOR_MAP: Record<string, string> = {
  is: ':',
  'is not': '≠',
  contains: '∋',
  'is near': '≈',
  'is after': '>',
  'is before': '<',
  'less than': '<',
  'greater than': '>',
  between: '↔',
};

const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
};

/**
 * Formats a property's data into a rich HTML string for display inside a widget.
 * This function handles different operators and value structures to create a
 * readable and consistently styled representation.
 * @param key - The property key.
 * @param operator - The property operator (e.g., 'is', 'less than').
 * @param values - An array of property values.
 * @returns An HTML string to be used as the innerHTML of the property widget.
 */
export const formatPropertyForDisplay = (
  key: string,
  operator: string,
  values: string[]
): string => {
  // Sanitize values to prevent accidental HTML injection
  const escape = (unsafe: string) =>
    unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const operatorSymbol = OPERATOR_MAP[operator] || operator;
  const keyHtml = `<span class="property-key">${escape(key)}</span>`;
  const operatorHtml = `<span class="property-operator">${operatorSymbol}</span>`;

  let valueHtml = '';

  // Handle the special 'between' operator which uses two values
  if (operator === 'between' && values.length >= 2) {
    const val1 = `<span class="property-value">${escape(values[0] || '')}</span>`;
    const val2 = `<span class="property-value">${escape(values[1] || '')}</span>`;
    valueHtml = `${val1}<span class="property-operator">&amp;</span>${val2}`;
  } else {
    // Handle all other operators (which use a single value)
    valueHtml = `<span class="property-value">${escape(values[0] || '')}</span>`;
  }

  return `${keyHtml}${operatorHtml}${valueHtml}`;
};

const replaceTags = (html: string): string => {
    // Regex for tags: #tagname (must not be part of a URL or inside another word)
    // Note: This regex might match inside HTML tags if we are not careful.
    // Since we call this on *escaped* text chunks (not full HTML), it should be safe.
    const tagRegex = /(?<!\w)#([a-zA-Z0-9_-]+)/g;
    return html.replace(tagRegex, (match, tagName) => {
        return `<span class="widget tag" contenteditable="false" data-tag="${tagName}">#${tagName}</span>`;
    });
};

/**
 * Extracts plain text from an HTML string.
 * @param content - An HTML string.
 * @returns A single string containing all the text from the document.
 */
export function getTextFromHtml(content: string): string {
  if (!content) return '';

  const div = document.createElement('div');
  div.innerHTML = content;

  // Add newlines after block elements for better preview readability
  div
    .querySelectorAll('p, h1, h2, h3, li, blockquote, pre, div')
    .forEach((el) => {
      el.appendChild(document.createTextNode('\n'));
    });

  return div.textContent || '';
}

/**
 * Prepares HTML for display in code view (pretty printing).
 * Adds newlines before block tags to make it more readable.
 */
export const prettyPrintHtml = (html: string) => {
  if (!html) return '';
  const blockTags = [
    'p',
    'h1',
    'h2',
    'h3',
    'hr',
    'ul',
    'ol',
    'li',
    'blockquote',
    'pre',
  ];
  const regex = new RegExp(`(<(?:${blockTags.join('|')})[^>]*>)`, 'g');
  return html.replace(regex, '\n$1').trim();
};

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

      // Normalize operator if it's a symbol (e.g. from [key < val] usage in plainToHtml)
      // The widget stores the operator in data-operator.
      // If plainToHtml put '<' there, we want to normalize it if possible?
      // Actually, standardizing on the canonical name is better for the app logic.
      // But `parsing.ts` uses SYMBOL_TO_OP mapping for brackets.
      // Let's assume the widget creation uses the operator provided by parsing.
      // parsing.ts `extractProperties` uses `SYMBOL_TO_OP` to convert symbols to canonical names.
      // So the widget should already have the canonical name!
      // But if existing data has symbols, we can try to normalize.

      let operator = el.dataset.operator || 'is';
      if (SYMBOL_TO_OP[operator]) {
          operator = SYMBOL_TO_OP[operator];
      }

      return {
        key: el.dataset.key || '',
        operator,
        values: values,
      };
    })
    .filter((p) => p.key);
  const properties = foundProperties;

  // An imaginary property is one that implies a constraint/request
  const isImaginary = foundProperties.some(isIndefiniteProperty);

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

export const plainToHtml = (plainText: string): string => {
  // 1. Extract properties from the raw text (supports [key:op:val] and [key < val])
  const extracted = extractProperties(plainText);
  let result = '';
  let lastIndex = 0;

  for (const item of extracted) {
      // Process text before the property
      const beforeText = plainText.substring(lastIndex, item.index);
      const escapedBefore = escapeHtml(beforeText);
      // Replace tags in the text portion
      result += replaceTags(escapedBefore);

      // Create property widget
      const { key, operator, values } = item.property;
      const formatted = formatPropertyForDisplay(key, operator, values);
      // Note: We store the canonical operator (from extractProperties) in data-operator
      result += `<span class="widget property" contenteditable="false" data-key="${key}" data-operator="${operator}" data-values='${JSON.stringify(values)}'>${formatted}</span>`;

      lastIndex = item.index + item.length;
  }

  // Process remaining text
  const remainingText = plainText.substring(lastIndex);
  const escapedRemaining = escapeHtml(remainingText);
  result += replaceTags(escapedRemaining);

  // 3. Convert newlines back to <br> tags for display in contentEditable.
  return result.replace(/\n/g, '<br>');
};
