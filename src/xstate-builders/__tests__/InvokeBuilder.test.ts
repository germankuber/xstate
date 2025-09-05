import { GenericInvokeBuilder } from '../InvokeBuilder';

describe('GenericInvokeBuilder', () => {
  beforeEach(() => {
    // Suppress console.log during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Construction', () => {
    it('should create an invoke builder', () => {
      const builder = GenericInvokeBuilder.create();
      expect(builder).toBeInstanceOf(GenericInvokeBuilder);
    });

    it('should build an empty invoke config by default', () => {
      const config = GenericInvokeBuilder.create().build();
      expect(config).toEqual({});
    });
  });

  describe('Source Configuration', () => {
    it('should set string source', () => {
      const config = GenericInvokeBuilder
        .create()
        .withSource('myService')
        .build();
      
      expect(config.src).toBe('myService');
    });

    it('should set function source', () => {
      const serviceFunction = async () => ({ data: 'test' });
      
      const config = GenericInvokeBuilder
        .create()
        .withSource(serviceFunction)
        .build();
      
      expect(config.src).toBe(serviceFunction);
    });

    it('should overwrite previous source', () => {
      const firstService = 'firstService';
      const secondService = 'secondService';
      
      const config = GenericInvokeBuilder
        .create()
        .withSource(firstService)
        .withSource(secondService)
        .build();
      
      expect(config.src).toBe(secondService);
    });
  });

  describe('ID Configuration', () => {
    it('should set invoke ID', () => {
      const config = GenericInvokeBuilder
        .create()
        .withId('myActor')
        .build();
      
      expect(config.id).toBe('myActor');
    });

    it('should overwrite previous ID', () => {
      const config = GenericInvokeBuilder
        .create()
        .withId('firstId')
        .withId('secondId')
        .build();
      
      expect(config.id).toBe('secondId');
    });
  });

  describe('onDone Configuration', () => {
    it('should set onDone with target only', () => {
      const config = GenericInvokeBuilder
        .create<'success' | 'error', 'saveData'>()
        .onDone('success')
        .build();
      
      expect(config.onDone).toEqual({
        target: 'success'
      });
    });

    it('should set onDone with target and single action', () => {
      const config = GenericInvokeBuilder
        .create<'success' | 'error', 'saveData'>()
        .onDone('success', 'saveData')
        .build();
      
      expect(config.onDone).toEqual({
        target: 'success',
        actions: ['saveData']
      });
    });

    it('should set onDone with target and multiple actions', () => {
      const config = GenericInvokeBuilder
        .create<'success' | 'error', 'saveData' | 'notify'>()
        .onDone('success', ['saveData', 'notify'])
        .build();
      
      expect(config.onDone).toEqual({
        target: 'success',
        actions: ['saveData', 'notify']
      });
    });

    it('should set onDone with actions only', () => {
      const config = GenericInvokeBuilder
        .create<'success' | 'error', 'saveData'>()
        .onDone(undefined, 'saveData')
        .build();
      
      expect(config.onDone).toEqual({
        actions: ['saveData']
      });
    });

    it('should set onDone with empty configuration', () => {
      const config = GenericInvokeBuilder
        .create()
        .onDone()
        .build();
      
      expect(config.onDone).toEqual({});
    });

    it('should set custom onDone configuration', () => {
      const customOnDone = {
        target: 'customState',
        actions: ['customAction'],
        guard: 'customGuard'
      };

      const config = GenericInvokeBuilder
        .create()
        .withOnDone(customOnDone)
        .build();
      
      expect(config.onDone).toEqual(customOnDone);
    });
  });

  describe('onError Configuration', () => {
    it('should set onError with target only', () => {
      const config = GenericInvokeBuilder
        .create<'success' | 'error', 'logError'>()
        .onError('error')
        .build();
      
      expect(config.onError).toEqual({
        target: 'error'
      });
    });

    it('should set onError with target and single action', () => {
      const config = GenericInvokeBuilder
        .create<'success' | 'error', 'logError'>()
        .onError('error', 'logError')
        .build();
      
      expect(config.onError).toEqual({
        target: 'error',
        actions: ['logError']
      });
    });

    it('should set onError with target and multiple actions', () => {
      const config = GenericInvokeBuilder
        .create<'success' | 'error', 'logError' | 'showNotification'>()
        .onError('error', ['logError', 'showNotification'])
        .build();
      
      expect(config.onError).toEqual({
        target: 'error',
        actions: ['logError', 'showNotification']
      });
    });

    it('should set onError with actions only', () => {
      const config = GenericInvokeBuilder
        .create<'success' | 'error', 'logError'>()
        .onError(undefined, 'logError')
        .build();
      
      expect(config.onError).toEqual({
        actions: ['logError']
      });
    });

    it('should set custom onError configuration', () => {
      const customOnError = {
        target: 'errorState',
        actions: ['handleError', 'cleanup'],
        guard: 'shouldRetry'
      };

      const config = GenericInvokeBuilder
        .create()
        .withOnError(customOnError)
        .build();
      
      expect(config.onError).toEqual(customOnError);
    });
  });

  describe('Fluent Interface', () => {
    it('should support method chaining', () => {
      const serviceFunction = async () => ({ result: 'success' });
      
      const config = GenericInvokeBuilder
        .create<'loading' | 'success' | 'error', 'saveData' | 'logError'>()
        .withSource(serviceFunction)
        .withId('dataService')
        .onDone('success', 'saveData')
        .onError('error', 'logError')
        .build();

      expect(config).toEqual({
        src: serviceFunction,
        id: 'dataService',
        onDone: {
          target: 'success',
          actions: ['saveData']
        },
        onError: {
          target: 'error',
          actions: ['logError']
        }
      });
    });

    it('should handle complex invoke configuration', () => {
      const config = GenericInvokeBuilder
        .create<'idle' | 'loading' | 'success' | 'retry' | 'failed', 'process' | 'save' | 'retry' | 'cleanup'>()
        .withSource('complexApiService')
        .withId('complexApiActor')
        .onDone('success', ['process', 'save'])
        .onError('retry', ['retry', 'cleanup'])
        .build();

      expect(config.src).toBe('complexApiService');
      expect(config.id).toBe('complexApiActor');
      expect(config.onDone.target).toBe('success');
      expect(config.onDone.actions).toEqual(['process', 'save']);
      expect(config.onError.target).toBe('retry');
      expect(config.onError.actions).toEqual(['retry', 'cleanup']);
    });
  });

  describe('Configuration Overwriting', () => {
    it('should overwrite onDone when set multiple times', () => {
      const config = GenericInvokeBuilder
        .create<'success' | 'error', 'action1' | 'action2'>()
        .onDone('success', 'action1')
        .onDone('error', 'action2')
        .build();
      
      expect(config.onDone).toEqual({
        target: 'error',
        actions: ['action2']
      });
    });

    it('should overwrite onError when set multiple times', () => {
      const config = GenericInvokeBuilder
        .create<'success' | 'error', 'action1' | 'action2'>()
        .onError('success', 'action1')
        .onError('error', 'action2')
        .build();
      
      expect(config.onError).toEqual({
        target: 'error',
        actions: ['action2']
      });
    });

    it('should overwrite custom configuration', () => {
      const firstConfig = { target: 'first' };
      const secondConfig = { target: 'second', actions: ['action'] };

      const config = GenericInvokeBuilder
        .create()
        .withOnDone(firstConfig)
        .withOnDone(secondConfig)
        .build();
      
      expect(config.onDone).toEqual(secondConfig);
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for states and actions', () => {
      type TestStates = 'loading' | 'success' | 'error' | 'retry';
      type TestActions = 'startLoading' | 'saveResult' | 'handleError' | 'scheduleRetry';
      
      const builder = GenericInvokeBuilder.create<TestStates, TestActions>();
      
      // These should not cause TypeScript errors in a real TypeScript environment
      const config = builder
        .withSource('testService')
        .withId('testActor')
        .onDone('success', 'saveResult')
        .onError('error', ['handleError', 'scheduleRetry'])
        .build();

      expect(config.onDone.target).toBe('success');
      expect(config.onError.actions).toEqual(['handleError', 'scheduleRetry']);
    });
  });

  describe('Minimal Configuration', () => {
    it('should work with just source', () => {
      const config = GenericInvokeBuilder
        .create()
        .withSource('minimalService')
        .build();
      
      expect(config).toEqual({
        src: 'minimalService'
      });
    });

    it('should work with just ID', () => {
      const config = GenericInvokeBuilder
        .create()
        .withId('minimalActor')
        .build();
      
      expect(config).toEqual({
        id: 'minimalActor'
      });
    });
  });
});
