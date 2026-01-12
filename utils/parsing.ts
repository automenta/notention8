import type { Property } from '../types';

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

  // 1. Standard Format: [key:op:value]
  // Captures: key, op, value
  // Example: [client:is:Acme] -> key=client, op=is, value=Acme
  // We need to be careful not to match symbolic ones incorrectly if they look similar.
  // Standard format strictly uses colons as separators.
  // Regex: \[([^:\]]+):([^:\]]+):([^\]]*)\]
  const standardRegex = /\[([^:\]]+):([^:\]]+):([^\]]*)\]/g;

  let match;
  while ((match = standardRegex.exec(text)) !== null) {
    const key = match[1].trim();
    const operator = match[2].trim();
    const valueStr = match[3].trim();

    // Split values by comma if list (simple convention)
    // For now, we assume simple string, but type definition allows string[]
    // Let's support comma separation for consistency with existing code
    const values = valueStr ? valueStr.split(',').map(v => v.trim()) : [];

    properties.push({
      key,
      operator,
      values
    });
  }

  // 2. Symbolic Format: [key op value]
  // Example: [budget < 500]
  // Operators: <, >, =, !=, <=, >=
  // We need a regex that looks for specific symbols between key and value.
  // Allowed symbols: <, >, =, !=, :, ≈, ∋
  // Regex: \[([^:\]\s]+)\s*([<>=!≈∋]+)\s*([^\]]*)\]
  // Note: We exclude colon from key to avoid overlap with standard format,
  // but standard format has *two* colons. Symbolic usually has one operator.
  // Let's refine.

  // We want to catch [budget < 500] but NOT [client:is:Acme] (already caught).
  // Strategy: Replace already found standard properties with whitespace or placeholders to avoid double counting?
  // Or just use a smarter regex.

  // Actually, simpler approach: Iterate all [...] blocks and parse content.
  const bracketRegex = /\[([^\]]+)\]/g;

  const properties2: Property[] = [];
  while ((match = bracketRegex.exec(text)) !== null) {
    const content = match[1];

    // Check if it matches standard format (two colons)
    // heuristic: count colons
    const colons = content.split(':');
    if (colons.length >= 3) {
      // It's likely standard [key:op:value] or [key:op:val1,val2]
      // We already handled this above?
      // Actually, doing it in one pass is cleaner.
      const key = colons[0].trim();
      const op = colons[1].trim();
      const val = colons.slice(2).join(':').trim(); // Re-join rest in case value has colons?

      properties2.push({
        key,
        operator: op,
        values: val.split(',').map(v => v.trim())
      });
      continue;
    }

    // Check for symbolic operators
    // Sort symbols by length desc to match <= before <
    const symbols = Object.keys(SYMBOL_TO_OP).sort((a, b) => b.length - a.length);

    let foundSymbol = false;
    for (const sym of symbols) {
      // Look for symbol surrounded by optional spaces, but ensure it's not part of a word?
      // Simple split might be enough for now.
      // Need to escape regex special chars
      const escapedSym = sym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const symRegex = new RegExp(`^(.+?)\\s*(${escapedSym})\\s*(.*)$`);

      const symMatch = content.match(symRegex);
      if (symMatch) {
        const key = symMatch[1].trim();
        const opSymbol = symMatch[2];
        const val = symMatch[3].trim();

        properties2.push({
          key,
          operator: SYMBOL_TO_OP[opSymbol], // Map to canonical 'less than', etc.
          values: val.split(',').map(v => v.trim())
        });
        foundSymbol = true;
        break;
      }
    }

    if (!foundSymbol) {
      // Fallback: If no operator found, is it a tag? Tag is #tag.
      // If it is [word], maybe it's a property with implicit 'is'?
      // [Active] -> key=Active, value=true?
      // For now, ignore if no clear operator structure.
    }
  }

  return properties2;
};
