import { GenericStateBuilder } from '../StateBuilder';

describe('GenericStateBuilder', () => {
  beforeEach(() => {
    // Suppress console.log during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Construction', () => {
    it('should create a state builder', () => {
      const builder = GenericStateBuilder.create();
      expect(builder).toBeInstanceOf(GenericStateBuilder);
    });

    it('should build an empty state config by default', () => {
      const state = GenericStateBuilder.create().build();
      expect(state).toEqual({});
    });
  });

  describe('Entry Actions', () => {
    it('should set single entry action', () => {
      const state = GenericStateBuilder
        .create<'action1' | 'action2'>()
        .withEntry('action1')
        .build();
      
      expect(state.entry).toEqual(['action1']);
    });

    it('should set multiple entry actions', () => {
      const state = GenericStateBuilder
        .create<'action1' | 'action2'>()
        .withEntry('action1', 'action2')
        .build();
      
      expect(state.entry).toEqual(['action1', 'action2']);
    });

    it('should overwrite previous entry actions', () => {
      const state = GenericStateBuilder
        .create<'action1' | 'action2' | 'action3'>()
        .withEntry('action1')
        .withEntry('action2', 'action3')
        .build();
      
      expect(state.entry).toEqual(['action2', 'action3']);
    });
  });

  describe('Exit Actions', () => {
    it('should set single exit action', () => {
      const state = GenericStateBuilder
        .create<'cleanup' | 'save'>()
        .withExit('cleanup')
        .build();
      
      expect(state.exit).toEqual(['cleanup']);
    });

    it('should set multiple exit actions', () => {
      const state = GenericStateBuilder
        .create<'cleanup' | 'save'>()
        .withExit('cleanup', 'save')
        .build();
      
      expect(state.exit).toEqual(['cleanup', 'save']);
    });

    it('should overwrite previous exit actions', () => {
      const state = GenericStateBuilder
        .create<'action1' | 'action2' | 'action3'>()
        .withExit('action1')
        .withExit('action2', 'action3')
        .build();
      
      expect(state.exit).toEqual(['action2', 'action3']);
    });
  });

  describe('Transitions', () => {
    it('should set transitions configuration', () => {
      const transitions = {
        NEXT: 'nextState',
        PREV: 'prevState',
        CANCEL: { target: 'cancelled', actions: ['cleanup'] }
      };

      const state = GenericStateBuilder
        .create()
        .withTransitions(transitions)
        .build();
      
      expect(state.on).toEqual(transitions);
    });

    it('should overwrite previous transitions', () => {
      const firstTransitions = { START: 'running' };
      const secondTransitions = { STOP: 'idle' };

      const state = GenericStateBuilder
        .create()
        .withTransitions(firstTransitions)
        .withTransitions(secondTransitions)
        .build();
      
      expect(state.on).toEqual(secondTransitions);
    });
  });

  describe('Invoke Configuration', () => {
    it('should set invoke configuration', () => {
      const invokeConfig = {
        src: 'fetchData',
        id: 'dataFetcher',
        onDone: { target: 'success' },
        onError: { target: 'error' }
      };

      const state = GenericStateBuilder
        .create()
        .withInvoke(invokeConfig)
        .build();
      
      expect(state.invoke).toEqual(invokeConfig);
    });

    it('should overwrite previous invoke configuration', () => {
      const firstInvoke = { src: 'firstService' };
      const secondInvoke = { src: 'secondService', id: 'service2' };

      const state = GenericStateBuilder
        .create()
        .withInvoke(firstInvoke)
        .withInvoke(secondInvoke)
        .build();
      
      expect(state.invoke).toEqual(secondInvoke);
    });
  });

  describe('Fluent Interface', () => {
    it('should support method chaining', () => {
      const transitions = { NEXT: 'nextState' };
      const invokeConfig = { src: 'service', id: 'myService' };

      const state = GenericStateBuilder
        .create<'startAction' | 'endAction'>()
        .withEntry('startAction')
        .withExit('endAction')
        .withTransitions(transitions)
        .withInvoke(invokeConfig)
        .build();

      expect(state).toEqual({
        entry: ['startAction'],
        exit: ['endAction'],
        on: transitions,
        invoke: invokeConfig
      });
    });

    it('should handle complex state configuration', () => {
      const state = GenericStateBuilder
        .create<'init' | 'loading' | 'cleanup' | 'error'>()
        .withEntry('init', 'loading')
        .withExit('cleanup')
        .withTransitions({
          SUCCESS: { target: 'completed', actions: ['saveData'] },
          FAILURE: { target: 'error', actions: ['error'] },
          CANCEL: 'cancelled'
        })
        .withInvoke({
          src: 'complexService',
          id: 'complexServiceActor',
          onDone: {
            target: 'success',
            actions: ['processResult']
          },
          onError: {
            target: 'error',
            actions: ['error']
          }
        })
        .build();

      expect(state.entry).toEqual(['init', 'loading']);
      expect(state.exit).toEqual(['cleanup']);
      expect(state.on).toBeDefined();
      expect(state.invoke).toBeDefined();
      expect(state.invoke.src).toBe('complexService');
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for actions', () => {
      type TestActions = 'validateInput' | 'saveData' | 'sendNotification';
      
      const builder = GenericStateBuilder.create<TestActions>();
      
      // These should not cause TypeScript errors in a real TypeScript environment
      const state = builder
        .withEntry('validateInput', 'saveData')
        .withExit('sendNotification')
        .build();

      expect(state.entry).toEqual(['validateInput', 'saveData']);
      expect(state.exit).toEqual(['sendNotification']);
    });
  });

  describe('Empty Configuration', () => {
    it('should handle state with no configuration', () => {
      const state = GenericStateBuilder.create().build();
      
      expect(state).toEqual({});
      expect(state.entry).toBeUndefined();
      expect(state.exit).toBeUndefined();
      expect(state.on).toBeUndefined();
      expect(state.invoke).toBeUndefined();
    });
  });
});
