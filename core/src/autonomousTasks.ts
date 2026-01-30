import type { Note, Property } from './types';
import { patternRecognitionService } from './patternRecognition';
import { predictionAccuracyTracker } from './predictionTracking';

export enum TaskStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface TaskAuthorization {
  userId: string;
  authorizedActions: string[]; // List of actions the agent is authorized to perform
  autoApproveThreshold: number; // Confidence threshold for auto-approval
  requiresConfirmation: boolean; // Whether user confirmation is required
  maxExecutionTime: number; // Maximum time in milliseconds for task execution
  budgetLimit?: number; // Maximum cost allowed for this task
}

export interface AutonomousTask {
  id: string;
  userId: string;
  title: string;
  description: string;
  noteContext: Note; // The note that triggered this task
  predictedAction: string; // The action predicted by the pattern recognition system
  confidence: number; // Confidence level in the prediction (0.0 to 1.0)
  status: TaskStatus;
  priority: TaskPriority;
  authorization: TaskAuthorization;
  assignedAgent?: string; // Which agent is assigned to execute this task
  startTime?: number;
  endTime?: number;
  result?: any; // Result of task execution
  error?: string; // Error message if task failed
  requiresUserConfirmation?: boolean; // Whether user confirmation is needed before execution
  confirmationReceived?: boolean; // Whether user confirmed the task
  retryCount: number;
  maxRetries: number;
}

export interface TaskExecutionResult {
  taskId: string;
  success: boolean;
  result?: any;
  error?: string;
  executionTime: number;
}

export interface TaskSchedulerConfig {
  maxConcurrentTasks: number;
  taskRetryLimit: number;
  defaultPriority: TaskPriority;
  autoApprovalEnabled: boolean;
  confirmationRequiredThreshold: number; // Confidence threshold above which confirmation is required
}

export class AutonomousTaskExecutor {
  private tasks: Map<string, AutonomousTask> = new Map();
  private config: TaskSchedulerConfig;
  private activeExecutions: Set<string> = new Set();
  
  constructor(config?: Partial<TaskSchedulerConfig>) {
    this.config = {
      maxConcurrentTasks: 3,
      taskRetryLimit: 3,
      defaultPriority: TaskPriority.MEDIUM,
      autoApprovalEnabled: false, // Start conservative, enable as trust builds
      confirmationRequiredThreshold: 0.8, // Require confirmation for high-confidence tasks
      ...config
    };
  }
  
  /**
   * Creates an autonomous task based on a prediction
   */
  createAutonomousTask(
    userId: string,
    note: Note,
    predictedAction: string,
    confidence: number,
    authorization: TaskAuthorization
  ): AutonomousTask {
    const task: AutonomousTask = {
      id: `autotask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      title: `Autonomous: ${predictedAction}`,
      description: `Automatically created task based on pattern recognition`,
      noteContext: note,
      predictedAction,
      confidence,
      status: TaskStatus.PENDING,
      priority: this.determinePriority(confidence),
      authorization,
      retryCount: 0,
      maxRetries: this.config.taskRetryLimit,
      requiresUserConfirmation: confidence >= this.config.confirmationRequiredThreshold
    };
    
    this.tasks.set(task.id, task);
    
    // If auto-approval is enabled and confidence is high enough, approve automatically
    if (this.config.autoApprovalEnabled && 
        confidence >= authorization.autoApproveThreshold && 
        !task.requiresUserConfirmation) {
      this.approveTask(task.id);
    }
    
    return task;
  }
  
  /**
   * Determines task priority based on confidence and other factors
   */
  private determinePriority(confidence: number): TaskPriority {
    if (confidence >= 0.9) return TaskPriority.CRITICAL;
    if (confidence >= 0.7) return TaskPriority.HIGH;
    if (confidence >= 0.5) return TaskPriority.MEDIUM;
    return TaskPriority.LOW;
  }
  
  /**
   * Approves a task for execution
   */
  approveTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== TaskStatus.PENDING) {
      return false;
    }
    
    // Check if user is authorized to perform this action
    if (!this.isUserAuthorized(task)) {
      task.status = TaskStatus.REJECTED;
      return false;
    }
    
    task.status = TaskStatus.APPROVED;
    task.confirmationReceived = true;
    
    // Auto-start execution if conditions are met
    if (this.canExecuteTask(task)) {
      this.executeTask(taskId);
    }
    
    return true;
  }
  
  /**
   * Rejects a task
   */
  rejectTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || ![TaskStatus.PENDING, TaskStatus.APPROVED].includes(task.status)) {
      return false;
    }
    
    task.status = TaskStatus.REJECTED;
    return true;
  }
  
  /**
   * Confirms a task (for tasks that require user confirmation)
   */
  confirmTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== TaskStatus.PENDING || !task.requiresUserConfirmation) {
      return false;
    }
    
    task.confirmationReceived = true;

    // If now approved, proceed to execution if possible
    if (this.isUserAuthorized(task)) {
      task.status = TaskStatus.APPROVED;
      if (this.canExecuteTask(task)) {
        this.executeTask(taskId);
      }
    }

    return true;
  }
  
  /**
   * Checks if user is authorized to perform the task
   */
  private isUserAuthorized(task: AutonomousTask): boolean {
    // Check if the predicted action is in the authorized actions list
    return task.authorization.authorizedActions.some(action => 
      task.predictedAction.toLowerCase().includes(action.toLowerCase())
    );
  }
  
  /**
   * Checks if a task can be executed
   */
  private canExecuteTask(task: AutonomousTask): boolean {
    return task.status === TaskStatus.APPROVED &&
           (!task.requiresUserConfirmation || !!task.confirmationReceived) &&
           task.retryCount < task.maxRetries;
  }
  
  /**
   * Executes a task
   */
  async executeTask(taskId: string): Promise<TaskExecutionResult> {
    const task = this.tasks.get(taskId);
    if (!task || !this.canExecuteTask(task)) {
      throw new Error(`Task ${taskId} cannot be executed`);
    }
    
    if (this.activeExecutions.size >= this.config.maxConcurrentTasks) {
      // Queue the task for later execution
      setTimeout(() => this.executeTask(taskId), 1000);
      return {
        taskId,
        success: false,
        error: 'Task queued due to concurrency limits',
        executionTime: 0
      };
    }
    
    task.status = TaskStatus.EXECUTING;
    task.startTime = Date.now();
    
    this.activeExecutions.add(taskId);
    
    try {
      // In a real implementation, this would call the appropriate agent/skill
      // to execute the predicted action based on the note context
      const result = await this.performPredictedAction(task);
      
      task.status = TaskStatus.COMPLETED;
      task.result = result;
      task.endTime = Date.now();
      
      const executionTime = task.endTime - task.startTime!;
      
      return {
        taskId,
        success: true,
        result,
        executionTime
      };
    } catch (error: any) {
      task.status = TaskStatus.FAILED;
      task.error = error.message;
      task.endTime = Date.now();
      
      // Increment retry count if below limit
      if (task.retryCount < task.maxRetries) {
        task.retryCount++;
        task.status = TaskStatus.PENDING; // Reset to pending for retry
        
        // Schedule retry after a delay
        setTimeout(() => {
          if (this.canExecuteTask(task)) {
            this.executeTask(taskId);
          }
        }, Math.pow(2, task.retryCount) * 1000); // Exponential backoff
      }
      
      const executionTime = task.endTime - task.startTime!;
      
      return {
        taskId,
        success: false,
        error: error.message,
        executionTime
      };
    } finally {
      this.activeExecutions.delete(taskId);
    }
  }
  
  /**
   * Performs the predicted action based on the task
   */
  private async performPredictedAction(task: AutonomousTask): Promise<any> {
    // This is a simplified implementation
    // In a real system, this would dispatch to appropriate skills/agents
    // based on the predicted action and note context
    
    console.log(`Executing predicted action: ${task.predictedAction} for user ${task.userId}`);
    
    // Simulate different types of actions based on the predicted action
    if (task.predictedAction.toLowerCase().includes('create note')) {
      // Simulate creating a note
      return {
        action: 'create_note',
        noteId: `note_${Date.now()}`,
        content: `Created based on pattern: ${task.noteContext.title}`
      };
    } else if (task.predictedAction.toLowerCase().includes('update note')) {
      // Simulate updating a note
      return {
        action: 'update_note',
        noteId: task.noteContext.id,
        updatedFields: ['properties', 'content']
      };
    } else if (task.predictedAction.toLowerCase().includes('schedule') || 
               task.predictedAction.toLowerCase().includes('reminder')) {
      // Simulate scheduling a reminder
      return {
        action: 'schedule_reminder',
        scheduledTime: Date.now() + 24 * 60 * 60 * 1000, // Tomorrow
        reminderContent: task.noteContext.title
      };
    } else {
      // For other actions, return a generic result
      return {
        action: 'generic_execution',
        taskId: task.id,
        context: task.noteContext.id,
        predictedAction: task.predictedAction
      };
    }
  }
  
  /**
   * Gets a task by ID
   */
  getTask(taskId: string): AutonomousTask | undefined {
    return this.tasks.get(taskId);
  }
  
  /**
   * Gets all tasks for a user
   */
  getUserTasks(userId: string): AutonomousTask[] {
    return Array.from(this.tasks.values()).filter(task => task.userId === userId);
  }
  
  /**
   * Gets tasks by status
   */
  getTasksByStatus(status: TaskStatus): AutonomousTask[] {
    return Array.from(this.tasks.values()).filter(task => task.status === status);
  }
  
  /**
   * Cancels a task
   */
  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || ![TaskStatus.PENDING, TaskStatus.APPROVED].includes(task.status)) {
      return false;
    }
    
    task.status = TaskStatus.CANCELLED;
    return true;
  }
  
  /**
   * Gets execution statistics
   */
  getExecutionStats(): {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    pendingTasks: number;
    successRate: number;
  } {
    const allTasks = Array.from(this.tasks.values());
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const failedTasks = allTasks.filter(t => t.status === TaskStatus.FAILED).length;
    const pendingTasks = allTasks.filter(t => t.status === TaskStatus.PENDING).length;
    
    const successRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
    
    return {
      totalTasks,
      completedTasks,
      failedTasks,
      pendingTasks,
      successRate
    };
  }
  
  /**
   * Updates the scheduler configuration
   */
  updateConfig(newConfig: Partial<TaskSchedulerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  /**
   * Gets current configuration
   */
  getConfig(): TaskSchedulerConfig {
    return { ...this.config };
  }
}

// Export a singleton instance for default usage
export const autonomousTaskExecutor = new AutonomousTaskExecutor();