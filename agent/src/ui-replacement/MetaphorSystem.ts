import {
  FunctionalityMetaphor,
  NotentionConcept,
  NotentionAction
} from './UIReplacementInterfaces';

export class ConditionalAutomationMetaphor implements FunctionalityMetaphor {
  id = 'conditional-automation';
  name = 'Conditional Automation';
  description = 'Automate actions based on conditions';
  icon = '⚡';
  color = '#3b82f6';
  category = 'automation';

  toNotentionConcept(agentFunction: any): NotentionConcept {
    return {
      type: 'automation-rule',
      representation: `When ${agentFunction.condition || 'condition'} then ${agentFunction.action || 'action'}`,
      actions: [
        {
          id: 'activate',
          name: 'Activate',
          description: 'Start monitoring and executing this rule',
          icon: '▶️',
          handler: (context: any) => {
            // Handler implementation
          }
        },
        {
          id: 'deactivate',
          name: 'Deactivate',
          description: 'Stop monitoring and executing this rule',
          icon: '⏹️',
          handler: (context: any) => {
            // Handler implementation
          }
        },
        {
          id: 'edit',
          name: 'Edit',
          description: 'Modify the rule conditions and actions',
          icon: '✏️',
          handler: (context: any) => {
            // Handler implementation
          }
        }
      ],
      properties: {
        condition: agentFunction.condition,
        action: agentFunction.action,
        enabled: agentFunction.enabled ?? true,
        lastRun: agentFunction.lastRun
      }
    };
  }

  toAgentCommand(notentionAction: NotentionAction): any {
    switch (notentionAction.id) {
      case 'activate':
        return {
          type: 'agent_command',
          command: 'activate_rule',
          parameters: {
            ruleId: notentionAction.id
          }
        };
      case 'deactivate':
        return {
          type: 'agent_command',
          command: 'deactivate_rule',
          parameters: {
            ruleId: notentionAction.id
          }
        };
      case 'edit':
        return {
          type: 'agent_command',
          command: 'edit_rule',
          parameters: {
            ruleId: notentionAction.id
          }
        };
      default:
        return {
          type: 'agent_command',
          command: 'unknown_action',
          parameters: {
            action: notentionAction.id
          }
        };
    }
  }
}

export class ScheduledTaskMetaphor implements FunctionalityMetaphor {
  id = 'scheduled-task';
  name = 'Scheduled Task';
  description = 'Execute actions at specific times';
  icon = '⏰';
  color = '#10b981';
  category = 'scheduling';

  toNotentionConcept(agentFunction: any): NotentionConcept {
    return {
      type: 'scheduled-task',
      representation: `Do ${agentFunction.action || 'action'} at ${agentFunction.time || 'time'}`,
      actions: [
        {
          id: 'schedule',
          name: 'Schedule',
          description: 'Schedule this task',
          icon: '📅',
          handler: (context: any) => {
            // Handler implementation
          }
        },
        {
          id: 'reschedule',
          name: 'Reschedule',
          description: 'Change when this task runs',
          icon: '🔄',
          handler: (context: any) => {
            // Handler implementation
          }
        },
        {
          id: 'cancel',
          name: 'Cancel',
          description: 'Cancel this scheduled task',
          icon: '❌',
          handler: (context: any) => {
            // Handler implementation
          }
        }
      ],
      properties: {
        time: agentFunction.time,
        action: agentFunction.action,
        recurring: agentFunction.recurring ?? false,
        scheduled: agentFunction.scheduled ?? false
      }
    };
  }

  toAgentCommand(notentionAction: NotentionAction): any {
    switch (notentionAction.id) {
      case 'schedule':
        return {
          type: 'agent_command',
          command: 'schedule_task',
          parameters: {
            taskId: notentionAction.id,
            time: (notentionAction as any).time
          }
        };
      case 'reschedule':
        return {
          type: 'agent_command',
          command: 'reschedule_task',
          parameters: {
            taskId: notentionAction.id
          }
        };
      case 'cancel':
        return {
          type: 'agent_command',
          command: 'cancel_task',
          parameters: {
            taskId: notentionAction.id
          }
        };
      default:
        return {
          type: 'agent_command',
          command: 'unknown_action',
          parameters: {
            action: notentionAction.id
          }
        };
    }
  }
}

export class MonitoringAgentMetaphor implements FunctionalityMetaphor {
  id = 'monitoring-agent';
  name = 'Monitoring Agent';
  description = 'Watch for changes and respond';
  icon = '👁️';
  color = '#8b5cf6';
  category = 'monitoring';

  toNotentionConcept(agentFunction: any): NotentionConcept {
    return {
      type: 'monitoring-agent',
      representation: `Monitor ${agentFunction.target || 'target'} for ${agentFunction.trigger || 'changes'}`,
      actions: [
        {
          id: 'start-monitoring',
          name: 'Start',
          description: 'Begin monitoring',
          icon: '▶️',
          handler: (context: any) => {
            // Handler implementation
          }
        },
        {
          id: 'stop-monitoring',
          name: 'Stop',
          description: 'Stop monitoring',
          icon: '⏹️',
          handler: (context: any) => {
            // Handler implementation
          }
        },
        {
          id: 'view-data',
          name: 'View Data',
          description: 'See monitoring data and history',
          icon: '📊',
          handler: (context: any) => {
            // Handler implementation
          }
        }
      ],
      properties: {
        target: agentFunction.target,
        trigger: agentFunction.trigger,
        response: agentFunction.response,
        active: agentFunction.active ?? false,
        lastEvent: agentFunction.lastEvent
      }
    };
  }

  toAgentCommand(notentionAction: NotentionAction): any {
    switch (notentionAction.id) {
      case 'start-monitoring':
        return {
          type: 'agent_command',
          command: 'start_monitoring',
          parameters: {
            agentId: notentionAction.id
          }
        };
      case 'stop-monitoring':
        return {
          type: 'agent_command',
          command: 'stop_monitoring',
          parameters: {
            agentId: notentionAction.id
          }
        };
      case 'view-data':
        return {
          type: 'agent_command',
          command: 'get_monitoring_data',
          parameters: {
            agentId: notentionAction.id
          }
        };
      default:
        return {
          type: 'agent_command',
          command: 'unknown_action',
          parameters: {
            action: notentionAction.id
          }
        };
    }
  }
}
