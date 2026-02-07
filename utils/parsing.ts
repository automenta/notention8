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

  // Iterate all [...] blocks and parse content.
  const bracketRegex = /\[([^\]]+)\]/g;
  let match;

  while ((match = bracketRegex.exec(text)) !== null) {
    const content = match[1];
    const parsed = parsePropertyBlock(content);
    if (parsed) {
      properties.push(parsed);
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

  // Format new tag
  let newTag = '';
  if (newProp) {
    const vals = newProp.values.join(',');
    // Prefer standard format
    newTag = `[${newProp.key}:${newProp.operator}:${vals}]`;
  }

  if (!oldProp) {
    // Append
    return text + (text.trim().endsWith('</p>') ? `<p>${newTag}</p>` : ` ${newTag}`);
  }

  // Find and replace
  const bracketRegex = /\[([^\]]+)\]/g;
  let match;

  // We need to find the specific instance of oldProp.
  // We iterate matches. If a match parses to match oldProp, we replace it.
  // To handle multiple matches, we might need to be careful.
  // For now, replace the FIRST match that corresponds to oldProp.

  // We need to re-run regex because replacing invalidates indices if we did it in loop?
  // Actually, we can just find the match index first.

  let matchIndex = -1;
  let matchLength = 0;

  while ((match = bracketRegex.exec(text)) !== null) {
      const content = match[1];
      const parsed = parsePropertyBlock(content);

      if (parsed && arePropertiesEqual(parsed, oldProp)) {
          matchIndex = match.index;
          matchLength = match[0].length;
          break;
      }
  }

  if (matchIndex !== -1) {
      const prefix = text.substring(0, matchIndex);
      const suffix = text.substring(matchIndex + matchLength);

      // If deleting (newProp is null), we might want to clean up surrounding whitespace/tags?
      // E.g. <p>[prop]</p> -> <p></p> or remove <p>?
      // For now, simple replacement.
      return prefix + newTag + suffix;
  }

  // If not found, append if newProp exists?
  // Or do nothing?
  // Let's append if it was a "replace" attempt but we couldn't find the old one (maybe it was modified textually).
  if (newProp) {
      return text + (text.trim().endsWith('</p>') ? `<p>${newTag}</p>` : ` ${newTag}`);
  }

  return text;
};

