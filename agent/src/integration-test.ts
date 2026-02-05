import { ComprehensiveStateManager } from './state-management/ComprehensiveStateManager';
import { ComprehensiveConfigurationManager } from './configuration/ConfigurationManager';
import { TransparentErrorHandler } from './error-handling/ErrorHandler';
import { ClawdBotRepresentationConverter } from './ui-representation/ClawdBotRepresentationConverter';
import { NotentionUIMetaphorMapper } from './ui-representation/NotentionUIMetaphorMapper';
import { EnhancedAgentControl } from './ui-enhanced/EnhancedUIComponents';

// Integration test to verify all components work together
export class IntegrationTest {
  private stateManager: ComprehensiveStateManager;
  private configManager: ComprehensiveConfigurationManager;
  private errorHandler: TransparentErrorHandler;
  private representationConverter: ClawdBotRepresentationConverter;
  private metaphorMapper: NotentionUIMetaphorMapper;
  private uiComponent: EnhancedAgentControl;

  constructor() {
    // Create mock gateway for testing
    const mockGateway = {
      version: 'test-1.0.0',
      start: async () => Promise.resolve(),
      stop: async () => Promise.resolve()
    };

    this.stateManager = new ComprehensiveStateManager(mockGateway);
    this.configManager = new ComprehensiveConfigurationManager();
    this.errorHandler = new TransparentErrorHandler();
    this.representationConverter = new ClawdBotRepresentationConverter();
    this.metaphorMapper = new NotentionUIMetaphorMapper();
    this.uiComponent = new EnhancedAgentControl();
  }

  async runAllTests(): Promise<boolean> {
    console.log('Starting integration tests...\n');
    
    const tests = [
      { name: 'State Manager Initialization', test: () => this.testStateManager() },
      { name: 'Configuration Manager Initialization', test: () => this.testConfigManager() },
      { name: 'Error Handler Initialization', test: () => this.testErrorHandler() },
      { name: 'Representation Converter', test: () => this.testRepresentationConverter() },
      { name: 'Metaphor Mapper', test: () => this.testMetaphorMapper() },
      { name: 'UI Component Rendering', test: () => this.testUIComponent() },
      { name: 'Full Integration Flow', test: () => this.testFullIntegration() }
    ];

    let allPassed = true;
    
    for (const testCase of tests) {
      try {
        console.log(`Running: ${testCase.name}`);
        const result = await testCase.test();
        console.log(`  ✓ PASSED\n`);
      } catch (error) {
        console.log(`  ✗ FAILED: ${error}\n`);
        allPassed = false;
      }
    }

    console.log(`\nIntegration tests: ${allPassed ? 'ALL PASSED' : 'SOME FAILED'}`);
    return allPassed;
  }

  private async testStateManager(): Promise<boolean> {
    await this.stateManager.initialize();
    const state = await this.stateManager.getState();
    
    if (!state) throw new Error('State manager failed to return state');
    if (state.status !== 'initializing') throw new Error('Unexpected initial state');
    
    // Update state
    await this.stateManager.updateState({ status: 'running' });
    const updatedState = await this.stateManager.getState();
    
    if (updatedState.status !== 'running') throw new Error('State update failed');
    
    return true;
  }

  private async testConfigManager(): Promise<boolean> {
    await this.configManager.initialize();
    const config = await this.configManager.loadConfiguration();
    
    if (!config) throw new Error('Config manager failed to load configuration');
    if (!config.agents) throw new Error('Configuration missing agents array');
    
    // Test validation
    const validationResult = this.configManager.validateConfiguration(config);
    if (!validationResult.valid) {
      throw new Error(`Configuration validation failed: ${validationResult.errors.join(', ')}`);
    }
    
    return true;
  }

  private async testErrorHandler(): Promise<boolean> {
    await this.errorHandler.initialize();
    
    // Log an error
    const errorInfo = this.errorHandler.logError('Test error message', { test: true });
    
    if (!errorInfo.id) throw new Error('Error handler failed to create error info');
    if (errorInfo.message !== 'Test error message') throw new Error('Error message mismatch');
    
    // Get error history
    const history = this.errorHandler.getErrorHistory(10);
    if (history.length === 0) throw new Error('Error history is empty');
    
    return true;
  }

  private testRepresentationConverter(): boolean {
    // Test conversion
    const mockConfig = {
      id: 'test-agent-1',
      name: 'Test Agent',
      description: 'A test agent',
      type: 'conditional',
      status: 'active',
      triggers: [{ description: 'Time trigger' }],
      actions: [{ description: 'Notification action' }],
      conditions: [{ description: 'Temperature condition', satisfied: true }]
    };

    const representation = this.representationConverter.toAgentRepresentation(mockConfig);
    
    if (representation.id !== 'test-agent-1') throw new Error('ID conversion failed');
    if (representation.name !== 'Test Agent') throw new Error('Name conversion failed');
    if (representation.status !== 'active') throw new Error('Status conversion failed');
    
    // Test reverse conversion
    const configBack = this.representationConverter.fromAgentRepresentation(representation);
    if (configBack.id !== 'test-agent-1') throw new Error('Reverse conversion failed');
    
    return true;
  }

  private testMetaphorMapper(): boolean {
    const mockConcept = { type: 'conditional', name: 'Test Concept' };
    const metaphor = this.metaphorMapper.mapToMetaphor(mockConcept);
    
    if (!metaphor.id) throw new Error('Metaphor mapping failed');
    if (!metaphor.name) throw new Error('Metaphor name missing');
    
    // Test reverse mapping
    const conceptBack = this.metaphorMapper.mapFromMetaphor(metaphor);
    if (!conceptBack) throw new Error('Reverse metaphor mapping failed');
    
    return true;
  }

  private testUIComponent(): boolean {
    const mockState = {
      activeAgents: [
        {
          id: 'agent-1',
          name: 'Test Agent',
          description: 'A test agent',
          type: 'conditional',
          status: 'active',
          createdAt: new Date().toISOString(),
          executionCount: 10,
          successCount: 8,
          lastRun: new Date().toISOString()
        }
      ]
    };

    const html = this.uiComponent.render(mockState);
    
    if (!html || typeof html !== 'string') throw new Error('UI component failed to render');
    if (!html.includes('Test Agent')) throw new Error('UI component render missing agent name');
    
    return true;
  }

  private async testFullIntegration(): Promise<boolean> {
    // Test the full flow: config -> state -> representation -> UI
    await this.configManager.initialize();
    await this.stateManager.initialize();
    
    const config = await this.configManager.loadConfiguration();
    if (!config) throw new Error('Failed to load configuration for integration test');
    
    // Update state with config info
    await this.stateManager.updateState({
      configuration: config,
      status: 'running'
    });
    
    const state = await this.stateManager.getState();
    if (!state.configuration) throw new Error('State missing configuration after update');
    
    // Convert to UI representation
    const representation = this.representationConverter.toAgentRepresentation({
      id: 'integration-test',
      name: 'Integration Test Agent',
      description: 'Testing full integration',
      type: 'conditional',
      status: 'active'
    });
    
    if (representation.name !== 'Integration Test Agent') {
      throw new Error('Full integration failed at representation step');
    }
    
    // Render UI
    const uiHtml = this.uiComponent.render({ activeAgents: [representation] });
    if (!uiHtml.includes('Integration Test Agent')) {
      throw new Error('Full integration failed at UI rendering step');
    }
    
    return true;
  }
}

// Run the integration test if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  const test = new IntegrationTest();
  test.runAllTests()
    .then(success => {
      console.log(`\nOverall result: ${success ? 'SUCCESS' : 'FAILURE'}`);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Integration test error:', error);
      process.exit(1);
    });
}