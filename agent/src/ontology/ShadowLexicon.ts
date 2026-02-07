import { Note } from '@notention/core';

export class ShadowLexicon {
  /**
   * Learns ontology patterns from user notes without modifying the global ontology immediately.
   * This is the "Shadow Mode" from Phase 3.3.
   */
  async observe(note: Note): Promise<void> {
    if (!note.content) return;

    // Detect patterns that look like properties but aren't in ontology yet
    // e.g. "Meeting with [Sarah]" -> suggest "Contact" entity
    // This is a stub for the LLM/heuristic logic.

    // Log potential learning opportunity
    // console.log(`[ShadowLexicon] Observing note ${note.id} for new patterns...`);

    // 1. Tokenize content
    // 2. Identify named entities
    // 3. Check against known ontology
    // 4. Store candidates in local DB (e.g. SQLite/JSON) with frequency count
  }

  /**
   * Returns suggestions for ontology updates based on accumulated observations.
   */
  getSuggestions(): string[] {
      return [];
  }
}
