import type { Feedback } from '@notention/core/src/feedback/types';

export class FeedbackCollector {
  private feedbackStore: Map<string, Feedback[]> = new Map();

  async recordFeedback(feedback: Feedback): Promise<void> {
    const entity = this.feedbackStore.get(feedback.entityId) || [];
    entity.push(feedback);
    this.feedbackStore.set(feedback.entityId, entity);

    console.log(`[Feedback] Recorded ${feedback.value} for ${feedback.entityType}:${feedback.entityId}`);

    // Trigger learning
    await this.updateSkillPriority(feedback);
  }

  private async updateSkillPriority(feedback: Feedback): Promise<void> {
    if (feedback.entityType !== 'skill') return;

    const allFeedback = this.feedbackStore.get(feedback.entityId) || [];
    const avgScore = allFeedback.reduce((sum, f) => sum + f.value, 0) / allFeedback.length;

    // Adjust skill activation threshold based on feedback
    console.log(`Skill ${feedback.entityId} avg score: ${avgScore}`);
  }
}
