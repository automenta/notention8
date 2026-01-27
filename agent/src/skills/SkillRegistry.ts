import type { Skill, SkillMetadata } from '@notention/core';
import type { Note } from '@notention/core';

export class SkillRegistry {
    private skills = new Map<string, SkillMetadata>();

    register(skill: Skill, metadata?: Partial<Omit<SkillMetadata, 'skill'>>): void {
        this.skills.set(skill.id, {
            skill,
            tags: metadata?.tags ?? [],
            domains: metadata?.domains ?? [],
            requiresAuth: metadata?.requiresAuth ?? false,
            author: metadata?.author
        });
        console.log(`✅ Registered: ${skill.name} (${skill.id})`);
    }

    unregister(skillId: string): boolean {
        const deleted = this.skills.delete(skillId);
        if (deleted) console.log(`🗑️ Unregistered: ${skillId}`);
        return deleted;
    }

    findMatching(note: Note, minConfidence = 0.3): Array<{ skill: Skill; confidence: number }> {
        return Array.from(this.skills.values())
            .map(m => ({ skill: m.skill, confidence: m.skill.canHandle(note) }))
            .filter(({ confidence }) => confidence >= minConfidence)
            .sort((a, b) => b.confidence - a.confidence);
    }

    findBest(note: Note, minConfidence = 0.5): Skill | null {
        return this.findMatching(note, minConfidence)[0]?.skill ?? null;
    }

    getAll(): SkillMetadata[] {
        return Array.from(this.skills.values());
    }

    get(skillId: string): SkillMetadata | undefined {
        return this.skills.get(skillId);
    }

    findByTag(tag: string): SkillMetadata[] {
        return this.getAll().filter(m => m.tags.includes(tag));
    }

    findByDomain(domain: string): SkillMetadata[] {
        return this.getAll().filter(m => m.domains.includes(domain));
    }

    getStats() {
        const stats = {
            totalSkills: this.skills.size,
            byDomain: {} as Record<string, number>,
            byTag: {} as Record<string, number>
        };

        for (const { domains, tags } of this.skills.values()) {
            domains.forEach(d => stats.byDomain[d] = (stats.byDomain[d] ?? 0) + 1);
            tags.forEach(t => stats.byTag[t] = (stats.byTag[t] ?? 0) + 1);
        }

        return stats;
    }
}

export const skillRegistry = new SkillRegistry();

