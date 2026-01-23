import type { Property } from '../types';
import { arePropertiesEqual } from './properties';

// Map symbolic operators to canonical operator names
const SYMBOL_TO_OP: Record<string, string> = {
  '<': 'less than',
  '>': 'greater than',
  '=': 'is',
  ':': 'is',
  '!=': 'is not',
  '≈': 'is near',
  '∋': 'contains',
};

// Inverse map for canonical to preferred symbol (for display/canonicalization if needed)
// But for parsing, we just need to know what < means.

/**
 * Parses a raw text string and extracts semantic properties.
 * Supports standard format [key:op:value] and symbolic format [key < value].
 */
export const parseProperties = (text: string): Property[] => {
  const properties: Property[] = [];

  // 1. Parse standard [...] bracket syntax
  const bracketRegex = /\[([^\]]+)\]/g;
  let match;

  while ((match = bracketRegex.exec(text)) !== null) {
    const content = match[1];
    const parsed = parsePropertyBlock(content);
    if (parsed) {
      properties.push(parsed);
    }
  }

  // 2. Parse HTML Chip syntax: <span data-type="property" ...>
  // We use a regex that is robust enough for simple attributes
  const spanRegex = /<span\s+[^>]*data-type=["']property["'][^>]*>/g;
  let spanMatch;

  while ((spanMatch = spanRegex.exec(text)) !== null) {
      const tag = spanMatch[0];

      // Extract attributes
      const nameMatch = tag.match(/data-name=["']([^"']+)["']/);
      const opMatch = tag.match(/data-operator=["']([^"']+)["']/);
      const valMatch = tag.match(/data-value=["']([^"']+)["']/);

      if (nameMatch && valMatch) {
          properties.push({
              key: nameMatch[1],
              operator: opMatch ? opMatch[1] : 'is',
              values: valMatch[1].split(',').map(v => v.trim())
          });
      }
  }

  return properties;
};

/**
 * Helper to parse the content inside brackets [content]
 */
const parsePropertyBlock = (content: string): Property | null => {
   // Check if it matches standard format (two colons)
    // heuristic: count colons
    const colons = content.split(':');
    if (colons.length >= 3) {
      const key = colons[0].trim();
      const op = colons[1].trim();
      const val = colons.slice(2).join(':').trim();

      return {
        key,
        operator: op,
        values: val.split(',').map(v => v.trim())
      };
    }

    // Check for symbolic operators
    const symbols = Object.keys(SYMBOL_TO_OP).sort((a, b) => b.length - a.length);

    for (const sym of symbols) {
      const escapedSym = sym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const symRegex = new RegExp(`^(.+?)\\s*(${escapedSym})\\s*(.*)$`);

      const symMatch = content.match(symRegex);
      if (symMatch) {
        const key = symMatch[1].trim();
        const opSymbol = symMatch[2];
        const val = symMatch[3].trim();

        return {
          key,
          operator: SYMBOL_TO_OP[opSymbol],
          values: val.split(',').map(v => v.trim())
        };
      }
    }
    return null;
}

/**
 * Formats a property into its standard string representation.
 */
const formatPropertyTag = (prop: Property): string => {
  const vals = prop.values.join(',');
  return `[${prop.key}:${prop.operator}:${vals}]`;
};

/**
 * Finds the index and length of a property in the text.
 */
const findPropertyInText = (text: string, prop: Property): { index: number; length: number } | null => {
  const bracketRegex = /\[([^\]]+)\]/g;
  let match;

  while ((match = bracketRegex.exec(text)) !== null) {
    const content = match[1];
    const parsed = parsePropertyBlock(content);

    if (parsed && arePropertiesEqual(parsed, prop)) {
      return { index: match.index, length: match[0].length };
    }
  }
  return null;
};

/**
 * Replaces a property in a text string (or HTML string) with a new one.
 * If oldProp is provided, it attempts to find and replace it.
 * If newProp is null, it removes the found property.
 * If oldProp is null, it appends newProp to the end.
 */
export const replacePropertyInString = (
  text: string,
  oldProp: Property | null,
  newProp: Property | null
): string => {
  if (!oldProp && !newProp) return text;

  const newTag = newProp ? formatPropertyTag(newProp) : '';

  // Case 1: Append (no old property to replace)
  if (!oldProp) {
    return text + (text.trim().endsWith('</p>') ? `<p>${newTag}</p>` : ` ${newTag}`);
  }

  // Case 2: Find and Replace/Delete
  const match = findPropertyInText(text, oldProp);

  if (match) {
    const prefix = text.substring(0, match.index);
    const suffix = text.substring(match.index + match.length);
    return prefix + newTag + suffix;
  }

  // Case 3: Old property not found, but we have a new one (Fallback: Append)
  if (newTag) {
     return text + (text.trim().endsWith('</p>') ? `<p>${newTag}</p>` : ` ${newTag}`);
  }

  return text;
};

