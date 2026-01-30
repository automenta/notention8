import type { Note } from './types';
import { patternRecognitionService, Prediction, PredictionResult } from './patternRecognition';

export interface AccuracyMetrics {
  predictionAccuracyRate: number; // Overall accuracy rate (0.0 to 1.0)
  totalPredictions: number;
  accuratePredictions: number;
  totalUsersTracked: number;
  predictionVolumePerDay: number[];
  feedbackReceived: number;
  userSatisfaction: number; // Average satisfaction rating (0.0 to 1.0)
}

export interface PredictionTrackingRecord {
  id: string;
  userId: string;
  prediction: Prediction;
  actualOutcome?: string; // What the user actually did
  wasAccurate: boolean;
  feedback?: string; // User feedback on the prediction
  satisfactionRating?: number; // 1-5 scale
  timestamp: number;
  reviewed: boolean; // Whether this has been analyzed
}

export class PredictionAccuracyTracker {
  private trackingRecords: PredictionTrackingRecord[] = [];
  private readonly MAX_RECORDS = 10000; // Limit to prevent memory issues
  
  /**
   * Records a prediction for tracking
   */
  recordPrediction(userId: string, prediction: Prediction): string {
    const record: PredictionTrackingRecord = {
      id: `pred_track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      prediction,
      wasAccurate: false,
      timestamp: Date.now(),
      reviewed: false
    };
    
    this.trackingRecords.push(record);
    
    // Maintain size limit
    if (this.trackingRecords.length > this.MAX_RECORDS) {
      this.trackingRecords = this.trackingRecords.slice(-this.MAX_RECORDS);
    }
    
    return record.id;
  }
  
  /**
   * Records the actual outcome of a prediction
   */
  recordOutcome(recordId: string, actualOutcome: string, wasAccurate: boolean, feedback?: string, satisfactionRating?: number): boolean {
    const record = this.trackingRecords.find(r => r.id === recordId);
    
    if (record) {
      record.actualOutcome = actualOutcome;
      record.wasAccurate = wasAccurate;
      record.feedback = feedback;
      record.satisfactionRating = satisfactionRating;
      record.reviewed = true;
      
      // Update the pattern's accuracy in the pattern recognition service
      patternRecognitionService.recordPredictionOutcome(record.prediction.pattern.id, wasAccurate, feedback);
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Gets accuracy metrics
   */
  getAccuracyMetrics(): AccuracyMetrics {
    const totalPredictions = this.trackingRecords.length;
    const reviewedRecords = this.trackingRecords.filter(r => r.reviewed);
    const accuratePredictions = reviewedRecords.filter(r => r.wasAccurate).length;
    
    const predictionAccuracyRate = reviewedRecords.length > 0 
      ? accuratePredictions / reviewedRecords.length 
      : 0;
    
    // Calculate unique users tracked
    const uniqueUsers = new Set(reviewedRecords.map(r => r.userId)).size;
    
    // Calculate prediction volume per day (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentPredictions = reviewedRecords.filter(r => r.timestamp >= sevenDaysAgo);
    const dailyVolumes: number[] = [];
    
    for (let i = 0; i < 7; i++) {
      const dayStart = sevenDaysAgo + (i * 24 * 60 * 60 * 1000);
      const dayEnd = dayStart + (24 * 60 * 60 * 1000);
      const dayPredictions = recentPredictions.filter(r => 
        r.timestamp >= dayStart && r.timestamp < dayEnd
      ).length;
      dailyVolumes.push(dayPredictions);
    }
    
    // Calculate feedback and satisfaction metrics
    const feedbackRecords = reviewedRecords.filter(r => r.feedback);
    const feedbackReceived = feedbackRecords.length;
    
    const satisfactionRecords = reviewedRecords.filter(r => r.satisfactionRating !== undefined);
    const userSatisfaction = satisfactionRecords.length > 0
      ? satisfactionRecords.reduce((sum, r) => sum + (r.satisfactionRating || 0), 0) / satisfactionRecords.length / 5 // Normalize to 0-1
      : 0;
    
    return {
      predictionAccuracyRate,
      totalPredictions,
      accuratePredictions,
      totalUsersTracked: uniqueUsers,
      predictionVolumePerDay: dailyVolumes,
      feedbackReceived,
      userSatisfaction
    };
  }
  
  /**
   * Gets prediction metrics for a specific user
   */
  getUserAccuracyMetrics(userId: string): AccuracyMetrics {
    const userRecords = this.trackingRecords.filter(r => r.userId === userId);
    const reviewedRecords = userRecords.filter(r => r.reviewed);
    const accuratePredictions = reviewedRecords.filter(r => r.wasAccurate).length;
    
    const predictionAccuracyRate = reviewedRecords.length > 0 
      ? accuratePredictions / reviewedRecords.length 
      : 0;
    
    return {
      predictionAccuracyRate,
      totalPredictions: userRecords.length,
      accuratePredictions,
      totalUsersTracked: 1, // Just this user
      predictionVolumePerDay: [], // Would need more complex calculation
      feedbackReceived: reviewedRecords.filter(r => r.feedback).length,
      userSatisfaction: reviewedRecords.filter(r => r.satisfactionRating !== undefined).length > 0
        ? reviewedRecords.reduce((sum, r) => sum + (r.satisfactionRating || 0), 0) / 
          reviewedRecords.filter(r => r.satisfactionRating !== undefined).length / 5
        : 0
    };
  }
  
  /**
   * Gets recent predictions for a user
   */
  getRecentPredictions(userId: string, limit: number = 10): PredictionTrackingRecord[] {
    return this.trackingRecords
      .filter(r => r.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
  
  /**
   * Resets tracking data (for testing purposes)
   */
  reset(): void {
    this.trackingRecords = [];
  }
}

// Export a singleton instance for default usage
export const predictionAccuracyTracker = new PredictionAccuracyTracker();