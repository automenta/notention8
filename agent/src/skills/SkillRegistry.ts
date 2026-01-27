import type { Skill, Note, PropertyPattern } from '@notention/core';

export class SkillRegistry {
  private skills = new Map<string, Skill>();

  register(skill: Skill): void {
    this.skills.set(skill.id, skill);
    console.log(`✅ Registered skill: ${skill.name} (${skill.id})`);
  }

  unregister(skillId: string): void {
    this.skills.delete(skillId);
  }

  findMatching(note: Note): Skill[] {
    const matching: Skill[] = [];

    for (const skill of this.skills.values()) {
      if (this.doesPatternMatch(note, skill.semanticPattern)) {
        matching.push(skill);
      }
    }

    return matching;
  }

  private doesPatternMatch(note: Note, patterns: PropertyPattern[]): boolean {
    // If no patterns defined, it doesn't match anything implicitly (or matches everything? assume nothing)
    if (!patterns || patterns.length === 0) return false;

    // Must match AT LEAST ONE pattern fully? Or all patterns?
    // Usually a skill has a set of requirements. Let's assume ANY pattern match is sufficient (OR logic)
    // or if patterns is a list of requirements (AND logic).
    // Based on IndeedSkill example:
    // [ { keys: ['role'], required: true }, ... ]
    // This looks like a list of constraints. Let's assume ALL required patterns must be met.

    for (const pattern of patterns) {
      if (pattern.required) {
          const hasAnyKey = note.properties.some(prop =>
            pattern.keys.includes(prop.key)
          );

          if (!hasAnyKey) {
            return false;
          }
      }
    }
    return true;
  }

  getAll(): Skill[] {
    return Array.from(this.skills.values());
  }

  get(id: string): Skill | undefined {
    return this.skills.get(id);
  }
}
