import type { Note, Property } from './types';
import { parseProperties } from './parsing';

export interface Pattern {
  id: string;
  name: string;
  description: string;
  conditions: Property[];
  predictedActions: string[]; // Actions the system predicts the user will take
  confidence: number; // 0.0 to 1.0
  lastUsed: number;
  usageCount: number;
  accuracyRate: number; // Track how often predictions are accurate
}

export interface UserBehaviorPattern {
  userId: string;
  patterns: Pattern[];
  lastUpdated: number;
}

export interface Prediction {
  pattern: Pattern;
  noteContext: Note;
  predictedAction: string;
  confidence: number;
  timestamp: number;
}

export interface PredictionResult {
  prediction: Prediction;
  wasAccurate: boolean; // Whether the prediction matched user's actual behavior
  feedback?: string; // Optional user feedback
}

export class PatternRecognitionService {
  private patterns: Map<string, UserBehaviorPattern> = new Map();
  private predictions: Prediction[] = [];
  
  /**
   * Analyzes user's semantic patterns from their notes
   */
  analyzeUserPatterns(userId: string, notes: Note[]): UserBehaviorPattern {
    const existingPattern = this.patterns.get(userId);
    
    // Extract common property patterns from notes
    const propertyFrequency: Record<string, { count: number; values: Record<string, number> }> = {};
    const temporalPatterns: Record<string, number[]> = {}; // Track patterns over time
    
    for (const note of notes) {
      for (const prop of note.properties) {
        const key = `${prop.key}_${prop.operator}`;
        
        if (!propertyFrequency[key]) {
          propertyFrequency[key] = { count: 0, values: {} };
        }
        
        propertyFrequency[key].count++;
        
        for (const value of prop.values) {
          if (!propertyFrequency[key].values[value]) {
            propertyFrequency[key].values[value] = 0;
          }
          propertyFrequency[key].values[value]++;
        }
        
        // Track temporal patterns (when certain properties appear)
        if (!temporalPatterns[key]) {
          temporalPatterns[key] = [];
        }
        temporalPatterns[key].push(new Date(note.updatedAt).getTime());
      }
    }
    
    // Generate potential patterns based on frequency and co-occurrence
    const newPatterns: Pattern[] = this.discoverPatterns(propertyFrequency, temporalPatterns, notes);
    
    const userBehavior: UserBehaviorPattern = {
      userId,
      patterns: existingPattern ? [...existingPattern.patterns, ...newPatterns] : newPatterns,
      lastUpdated: Date.now()
    };
    
    this.patterns.set(userId, userBehavior);
    return userBehavior;
  }
  
  /**
   * Discovers patterns from property frequencies and temporal data
   */
  private discoverPatterns(
    propertyFrequency: Record<string, { count: number; values: Record<string, number> }>,
    temporalPatterns: Record<string, number[]>,
    notes: Note[]
  ): Pattern[] {
    const patterns: Pattern[] = [];
    
    // Look for frequently co-occurring properties
    const frequentProps = Object.entries(propertyFrequency)
      .filter(([_, stats]) => stats.count >= 2) // At least 2 occurrences
      .map(([key, stats]) => ({ key, stats }));
    
    // Create patterns based on co-occurrences
    for (let i = 0; i < frequentProps.length; i++) {
      for (let j = i + 1; j < frequentProps.length; j++) {
        const propA = frequentProps[i];
        const propB = frequentProps[j];
        
        // Check if these properties often appear in close temporal proximity
        const timesA = temporalPatterns[propA.key] || [];
        const timesB = temporalPatterns[propB.key] || [];
        
        if (timesA.length > 0 && timesB.length > 0) {
          // Calculate temporal proximity (within 1 hour)
          let closeOccurrences = 0;
          for (const timeA of timesA) {
            for (const timeB of timesB) {
              if (Math.abs(timeA - timeB) < 60 * 60 * 1000) { // Within 1 hour
                closeOccurrences++;
                break;
              }
            }
          }
          
          if (closeOccurrences > 0) {
            // Create a pattern based on this co-occurrence
            const pattern: Pattern = {
              id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: `Co-occurrence: ${propA.key} & ${propB.key}`,
              description: `Pattern detected: ${propA.key} often appears with ${propB.key}`,
              conditions: [
                { key: propA.key.split('_')[0], operator: propA.key.split('_')[1], values: Object.keys(propA.stats.values) },
                { key: propB.key.split('_')[0], operator: propB.key.split('_')[1], values: Object.keys(propB.stats.values) }
              ],
              predictedActions: [`Create note with ${propB.key}`, `Update note with ${propB.key}`],
              confidence: Math.min(0.9, closeOccurrences / Math.max(timesA.length, timesB.length)),
              lastUsed: Date.now(),
              usageCount: 0,
              accuracyRate: 0.3 // Default starting accuracy
            };
            
            patterns.push(pattern);
          }
        }
      }
    }
    
    // Look for sequential patterns (A often followed by B)
    const sequentialPatterns = this.discoverSequentialPatterns(notes);
    patterns.push(...sequentialPatterns);
    
    return patterns;
  }
  
  /**
   * Discovers sequential patterns in note creation/update
   */
  private discoverSequentialPatterns(notes: Note[]): Pattern[] {
    const patterns: Pattern[] = [];
    const sortedNotes = [...notes].sort((a, b) => 
      new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );
    
    // Look for sequences where certain properties tend to follow others
    for (let i = 0; i < sortedNotes.length - 1; i++) {
      const currentNote = sortedNotes[i];
      const nextNote = sortedNotes[i + 1];
      
      // Calculate time difference (within 24 hours for it to be considered sequential)
      const timeDiff = new Date(nextNote.updatedAt).getTime() - new Date(currentNote.updatedAt).getTime();
      
      if (timeDiff <= 24 * 60 * 60 * 1000) { // Within 24 hours
        // Look for property sequences
        for (const currProp of currentNote.properties) {
          for (const nextProp of nextNote.properties) {
            // Create a pattern: when currProp appears, nextProp often follows
            const pattern: Pattern = {
              id: `seq_pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: `Sequence: ${currProp.key} → ${nextProp.key}`,
              description: `Pattern detected: ${currProp.key} often followed by ${nextProp.key}`,
              conditions: [currProp],
              predictedActions: [`Add property [${nextProp.key}:${nextProp.operator}:${nextProp.values.join(',')}]`, `Create note with ${nextProp.key}`],
              confidence: 0.6, // Default confidence for sequence
              lastUsed: Date.now(),
              usageCount: 0,
              accuracyRate: 0.3 // Default starting accuracy
            };
            
            patterns.push(pattern);
          }
        }
      }
    }
    
    return patterns;
  }
  
  /**
   * Makes predictions based on user patterns
   */
  predictUserNeeds(userId: string, currentNote: Note): Prediction[] {
    const userPatterns = this.patterns.get(userId);
    if (!userPatterns) {
      return []; // No patterns for this user yet
    }
    
    const predictions: Prediction[] = [];
    
    // For each pattern, check if current note matches conditions
    for (const pattern of userPatterns.patterns) {
      if (this.matchesPatternConditions(currentNote, pattern.conditions)) {
        // Generate predictions based on this pattern
        for (const predictedAction of pattern.predictedActions) {
          const prediction: Prediction = {
            pattern,
            noteContext: currentNote,
            predictedAction,
            confidence: pattern.confidence,
            timestamp: Date.now()
          };
          
          predictions.push(prediction);
        }
      }
    }
    
    // Sort predictions by confidence
    predictions.sort((a, b) => b.confidence - a.confidence);
    
    // Store predictions for tracking accuracy later
    this.predictions.push(...predictions);
    
    return predictions;
  }
  
  /**
   * Checks if a note matches the conditions of a pattern
   */
  private matchesPatternConditions(note: Note, conditions: Property[]): boolean {
    // For now, simple matching - all conditions must be met
    for (const condition of conditions) {
      const matchingProp = note.properties.find(prop => 
        prop.key === condition.key && 
        prop.operator === condition.operator
      );
      
      if (!matchingProp) {
        return false;
      }
      
      // Check if values match (at least one value should match)
      const hasMatchingValue = condition.values.some(conditionValue =>
        matchingProp.values.some(propValue => 
          propValue.toLowerCase().includes(conditionValue.toLowerCase()) ||
          conditionValue.toLowerCase().includes(propValue.toLowerCase())
        )
      );
      
      if (!hasMatchingValue) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Records user feedback on a prediction to improve accuracy
   */
  recordPredictionOutcome(predictionId: string, wasAccurate: boolean, feedback?: string): void {
    // Find the prediction in our records
    const predictionIndex = this.predictions.findIndex(p => p.pattern.id === predictionId);
    
    if (predictionIndex !== -1) {
      const prediction = this.predictions[predictionIndex];
      
      // Update the pattern's accuracy rate
      const pattern = prediction.pattern;
      pattern.usageCount++;
      
      // Adjust accuracy rate based on outcome
      const totalPredictions = pattern.usageCount;
      const accuratePredictions = pattern.accuracyRate * (totalPredictions - 1) + (wasAccurate ? 1 : 0);
      pattern.accuracyRate = accuratePredictions / totalPredictions;
      pattern.lastUsed = Date.now();
      
      // Store the result for analytics
      const result: PredictionResult = {
        prediction,
        wasAccurate,
        feedback
      };
      
      // In a real implementation, we'd store this in a database for analytics
      console.log(`Prediction result recorded: ${wasAccurate ? 'Accurate' : 'Inaccurate'}`, result);
    }
  }
  
  /**
   * Gets prediction accuracy statistics for a user
   */
  getUserPredictionStats(userId: string) {
    const userPatterns = this.patterns.get(userId);
    if (!userPatterns) {
      return {
        totalPredictions: 0,
        accuracyRate: 0,
        patternsCount: 0
      };
    }
    
    const patterns = userPatterns.patterns;
    const totalPredictions = patterns.reduce((sum, pattern) => sum + pattern.usageCount, 0);
    const totalAccuracy = patterns.reduce((sum, pattern) => sum + (pattern.accuracyRate * pattern.usageCount), 0);
    
    return {
      totalPredictions,
      accuracyRate: totalPredictions > 0 ? totalAccuracy / totalPredictions : 0,
      patternsCount: patterns.length
    };
  }
  
  /**
   * Gets all patterns for a user
   */
  getUserPatterns(userId: string): Pattern[] {
    const userPatterns = this.patterns.get(userId);
    return userPatterns ? userPatterns.patterns : [];
  }
}

// Export a singleton instance for default usage
export const patternRecognitionService = new PatternRecognitionService();