import { GenericTransitionBuilder } from '../TransitionBuilder';

describe('GenericTransitionBuilder', () => {
  describe('Basic Construction', () => {
    it('should create a transition builder', () => {
      const builder = GenericTransitionBuilder.create();
      expect(builder).toBeInstanceOf(GenericTransitionBuilder);
    });

    it('should build an empty transition config by default', () => {
      const transition = GenericTransitionBuilder.create().build();
      expect(transition).toEqual({});
    });
  });

  describe('Target Configuration', () => {
    it('should set target state', () => {
      const transition = GenericTransitionBuilder
        .create<'idle' | 'loading' | 'success', any, any>()
        .to('loading')
        .build();
      
      expect(transition.target).toBe('loading');
    });

    it('should overwrite previous target', () => {
      const transition = GenericTransitionBuilder
        .create<'idle' | 'loading' | 'success', any, any>()
        .to('loading')
        .to('success')
        .build();
      
      expect(transition.target).toBe('success');
    });
  });

  describe('Actions Configuration', () => {
    it('should set single action', () => {
      const transition = GenericTransitionBuilder
        .create<any, 'startLoading' | 'saveData', any>()
        .withActions('startLoading')
        .build();
      
      expect(transition.actions).toEqual(['startLoading']);
    });

    it('should set multiple actions', () => {
      const transition = GenericTransitionBuilder
        .create<any, 'startLoading' | 'saveData', any>()
        .withActions('startLoading', 'saveData')
        .build();
      
      expect(transition.actions).toEqual(['startLoading', 'saveData']);
    });

    it('should overwrite previous actions', () => {
      const transition = GenericTransitionBuilder
        .create<any, 'action1' | 'action2' | 'action3', any>()
        .withActions('action1')
        .withActions('action2', 'action3')
        .build();
      
      expect(transition.actions).toEqual(['action2', 'action3']);
    });
  });

  describe('Guard Configuration', () => {
    it('should set guard', () => {
      const transition = GenericTransitionBuilder
        .create<any, any, 'isValid' | 'hasPermission'>()
        .guardedBy('isValid')
        .build();
      
      expect(transition.guard).toBe('isValid');
    });

    it('should overwrite previous guard', () => {
      const transition = GenericTransitionBuilder
        .create<any, any, 'isValid' | 'hasPermission'>()
        .guardedBy('isValid')
        .guardedBy('hasPermission')
        .build();
      
      expect(transition.guard).toBe('hasPermission');
    });
  });

  describe('Delay Configuration', () => {
    it('should set numeric delay', () => {
      const transition = GenericTransitionBuilder
        .create()
        .withDelay(1000)
        .build();
      
      expect(transition.delay).toBe(1000);
    });

    it('should set string delay', () => {
      const transition = GenericTransitionBuilder
        .create()
        .withDelay('shortDelay')
        .build();
      
      expect(transition.delay).toBe('shortDelay');
    });

    it('should overwrite previous delay', () => {
      const transition = GenericTransitionBuilder
        .create()
        .withDelay(1000)
        .withDelay('customDelay')
        .build();
      
      expect(transition.delay).toBe('customDelay');
    });
  });

  describe('Description Configuration', () => {
    it('should set description', () => {
      const description = 'Transition to loading state when user clicks submit';
      const transition = GenericTransitionBuilder
        .create()
        .describedAs(description)
        .build();
      
      expect(transition.description).toBe(description);
    });

    it('should overwrite previous description', () => {
      const firstDescription = 'First description';
      const secondDescription = 'Second description';
      
      const transition = GenericTransitionBuilder
        .create()
        .describedAs(firstDescription)
        .describedAs(secondDescription)
        .build();
      
      expect(transition.description).toBe(secondDescription);
    });
  });

  describe('Fluent Interface', () => {
    it('should support method chaining', () => {
      const transition = GenericTransitionBuilder
        .create<'idle' | 'loading' | 'success', 'startLoading' | 'showSpinner', 'canSubmit'>()
        .to('loading')
        .withActions('startLoading', 'showSpinner')
        .guardedBy('canSubmit')
        .withDelay(500)
        .describedAs('Start loading process')
        .build();

      expect(transition).toEqual({
        target: 'loading',
        actions: ['startLoading', 'showSpinner'],
        guard: 'canSubmit',
        delay: 500,
        description: 'Start loading process'
      });
    });

    it('should handle complex transition configuration', () => {
      const transition = GenericTransitionBuilder
        .create<'form' | 'validation' | 'submit' | 'success', 'validate' | 'submit' | 'cleanup', 'isFormValid' | 'hasNetwork'>()
        .to('submit')
        .withActions('validate', 'submit', 'cleanup')
        .guardedBy('isFormValid')
        .withDelay('submitDelay')
        .describedAs('Validate and submit form data')
        .build();

      expect(transition.target).toBe('submit');
      expect(transition.actions).toEqual(['validate', 'submit', 'cleanup']);
      expect(transition.guard).toBe('isFormValid');
      expect(transition.delay).toBe('submitDelay');
      expect(transition.description).toBe('Validate and submit form data');
    });
  });

  describe('Partial Configuration', () => {
    it('should work with target only', () => {
      const transition = GenericTransitionBuilder
        .create<'idle' | 'active', any, any>()
        .to('active')
        .build();
      
      expect(transition).toEqual({
        target: 'active'
      });
    });

    it('should work with actions only', () => {
      const transition = GenericTransitionBuilder
        .create<any, 'log' | 'notify', any>()
        .withActions('log', 'notify')
        .build();
      
      expect(transition).toEqual({
        actions: ['log', 'notify']
      });
    });

    it('should work with guard only', () => {
      const transition = GenericTransitionBuilder
        .create<any, any, 'isAuthorized'>()
        .guardedBy('isAuthorized')
        .build();
      
      expect(transition).toEqual({
        guard: 'isAuthorized'
      });
    });

    it('should work with delay only', () => {
      const transition = GenericTransitionBuilder
        .create()
        .withDelay(2000)
        .build();
      
      expect(transition).toEqual({
        delay: 2000
      });
    });

    it('should work with description only', () => {
      const transition = GenericTransitionBuilder
        .create()
        .describedAs('Test transition')
        .build();
      
      expect(transition).toEqual({
        description: 'Test transition'
      });
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for states, actions, and guards', () => {
      type TestStates = 'loading' | 'success' | 'error';
      type TestActions = 'startLoading' | 'saveData' | 'handleError';
      type TestGuards = 'isValid' | 'hasPermission' | 'isOnline';
      
      const builder = GenericTransitionBuilder.create<TestStates, TestActions, TestGuards>();
      
      // These should not cause TypeScript errors in a real TypeScript environment
      const transition = builder
        .to('success')
        .withActions('startLoading', 'saveData')
        .guardedBy('isValid')
        .build();

      expect(transition.target).toBe('success');
      expect(transition.actions).toEqual(['startLoading', 'saveData']);
      expect(transition.guard).toBe('isValid');
    });
  });

  describe('Empty Actions Array', () => {
    it('should handle empty actions array', () => {
      const transition = GenericTransitionBuilder
        .create<any, string, any>()
        .withActions()
        .build();
      
      expect(transition.actions).toEqual([]);
    });
  });
});
