export interface Feedback {
  id: string;
  entityId: string;
  entityType: 'note' | 'skill' | 'match' | 'suggestion' | 'property';
  value: number;  // -1 to +1
  context?: {
    reason?: string;
    details?: string;
  };
  timestamp: number;
}
