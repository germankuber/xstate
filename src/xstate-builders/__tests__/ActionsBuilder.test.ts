import { GenericActionsBuilder } from '../ActionsBuilder';

describe('GenericActionsBuilder', () => {
  describe('Basic Construction', () => {
    it('should create an actions builder', () => {
      const builder = GenericActionsBuilder.create();
      expect(builder).toBeInstanceOf(GenericActionsBuilder);
    });

    it('should build an empty actions object by default', () => {
      const actions = GenericActionsBuilder.create().build();
      expect(actions).toEqual({});
    });
  });

  describe('Regular Actions (Side Effects)', () => {
    it('should add a single action', () => {
      const logAction = ({ context }: { context: any }, event: any) => {
        console.log(`Action called with context: ${context}, event: ${event}`);
      };

      const actions = GenericActionsBuilder
        .create<'logAction', { count: number }, { type: 'TEST' }>()
        .withAction('logAction', logAction)
        .build();
      
      expect(actions.logAction).toBe(logAction);
      expect(typeof actions.logAction).toBe('function');
    });

    it('should add multiple actions', () => {
      const sendNotification = ({ context }: { context: any }, event: any) => {
        console.log(`Notification: ${event.message}`);
      };

      const logTransition = ({ context }: { context: any }, event: any) => {
        console.log(`Transitioning from ${context.currentState} with ${event.type}`);
      };

      const trackEvent = ({ context }: { context: any }, event: any) => {
        console.log(`Tracking: ${event.type}`);
      };

      const actions = GenericActionsBuilder
        .create<'sendNotification' | 'logTransition' | 'trackEvent'>()
        .withAction('sendNotification', sendNotification)
        .withAction('logTransition', logTransition)
        .withAction('trackEvent', trackEvent)
        .build();
      
      expect(actions.sendNotification).toBe(sendNotification);
      expect(actions.logTransition).toBe(logTransition);
      expect(actions.trackEvent).toBe(trackEvent);
      expect(Object.keys(actions)).toHaveLength(3);
    });

    it('should overwrite existing action', () => {
      const firstImplementation = ({ context }: { context: any }, event: any) => {
        console.log('First implementation');
      };

      const secondImplementation = ({ context }: { context: any }, event: any) => {
        console.log('Second implementation');
      };

      const actions = GenericActionsBuilder
        .create<'testAction'>()
        .withAction('testAction', firstImplementation)
        .withAction('testAction', secondImplementation)
        .build();
      
      expect(actions.testAction).toBe(secondImplementation);
    });
  });

  describe('Assign Actions (Context Updates)', () => {
    it('should add a single assign action', () => {
      const mockAssignFunction = { type: 'assign', assignment: { count: 0 } };

      const actions = GenericActionsBuilder
        .create<'resetCounter'>()
        .withAssignAction('resetCounter', mockAssignFunction)
        .build();
      
      expect(actions.resetCounter).toBe(mockAssignFunction);
    });

    it('should add multiple assign actions', () => {
      const incrementAssign = { type: 'assign', assignment: (context: any) => ({ count: context.count + 1 }) };
      const decrementAssign = { type: 'assign', assignment: (context: any) => ({ count: context.count - 1 }) };
      const resetAssign = { type: 'assign', assignment: { count: 0 } };

      const actions = GenericActionsBuilder
        .create<'increment' | 'decrement' | 'reset'>()
        .withAssignAction('increment', incrementAssign)
        .withAssignAction('decrement', decrementAssign)
        .withAssignAction('reset', resetAssign)
        .build();
      
      expect(actions.increment).toBe(incrementAssign);
      expect(actions.decrement).toBe(decrementAssign);
      expect(actions.reset).toBe(resetAssign);
      expect(Object.keys(actions)).toHaveLength(3);
    });

    it('should overwrite existing assign action', () => {
      const firstAssign = { type: 'assign', assignment: { value: 1 } };
      const secondAssign = { type: 'assign', assignment: { value: 2 } };

      const actions = GenericActionsBuilder
        .create<'setValue'>()
        .withAssignAction('setValue', firstAssign)
        .withAssignAction('setValue', secondAssign)
        .build();
      
      expect(actions.setValue).toBe(secondAssign);
    });
  });

  describe('Mixed Actions', () => {
    it('should handle both regular and assign actions', () => {
      const logAction = ({ context }: { context: any }, event: any) => {
        console.log(`Logging: ${event.type}`);
      };

      const saveDataAssign = { 
        type: 'assign', 
        assignment: ({ event }: { event: any }) => ({ data: event.data }) 
      };

      const notifyAction = ({ context }: { context: any }, event: any) => {
        console.log(`Notifying: ${context.data}`);
      };

      const setLoadingAssign = { 
        type: 'assign', 
        assignment: { isLoading: true } 
      };

      const actions = GenericActionsBuilder
        .create<'log' | 'saveData' | 'notify' | 'setLoading'>()
        .withAction('log', logAction)
        .withAssignAction('saveData', saveDataAssign)
        .withAction('notify', notifyAction)
        .withAssignAction('setLoading', setLoadingAssign)
        .build();
      
      expect(typeof actions.log).toBe('function');
      expect(actions.saveData.type).toBe('assign');
      expect(typeof actions.notify).toBe('function');
      expect(actions.setLoading.type).toBe('assign');
      expect(Object.keys(actions)).toHaveLength(4);
    });
  });

  describe('Fluent Interface', () => {
    it('should support method chaining', () => {
      const actions = GenericActionsBuilder
        .create<'start' | 'process' | 'finish' | 'saveResult' | 'setStatus'>()
        .withAction('start', ({ context }: { context: any }) => console.log('Starting'))
        .withAction('process', ({ context }: { context: any }, event: any) => console.log('Processing'))
        .withAssignAction('saveResult', { type: 'assign', assignment: ({ event }: { event: any }) => ({ result: event.data }) })
        .withAction('finish', ({ context }: { context: any }) => console.log('Finished'))
        .withAssignAction('setStatus', { type: 'assign', assignment: { status: 'complete' } })
        .build();

      expect(Object.keys(actions)).toEqual(['start', 'process', 'saveResult', 'finish', 'setStatus']);
      expect(typeof actions.start).toBe('function');
      expect(typeof actions.process).toBe('function');
      expect(actions.saveResult.type).toBe('assign');
      expect(typeof actions.finish).toBe('function');
      expect(actions.setStatus.type).toBe('assign');
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for action names and implementations', () => {
      type TestActions = 'startProcess' | 'saveData' | 'sendNotification' | 'updateStatus';
      type TestContext = { step: number; data: any; status: string };
      type TestEvent = { type: 'PROCESS' | 'SAVE' | 'NOTIFY'; data?: any };
      
      const builder = GenericActionsBuilder.create<TestActions, TestContext, TestEvent>();
      
      // These should not cause TypeScript errors in a real TypeScript environment
      const actions = builder
        .withAction('startProcess', ({ context }: { context: TestContext }, event: TestEvent) => {
          console.log(`Starting process at step ${context.step}`);
        })
        .withAssignAction('saveData', { 
          type: 'assign', 
          assignment: ({ event }: { event: TestEvent }) => ({ data: event.data }) 
        })
        .build();

      expect(typeof actions.startProcess).toBe('function');
      expect(actions.saveData.type).toBe('assign');
    });
  });

  describe('Real World Usage Patterns', () => {
    it('should handle typical XState v5 action patterns', () => {
      interface FormContext {
        step: number;
        formData: Record<string, any>;
        errors: string[];
        isLoading: boolean;
        submitAttempts: number;
      }

      type FormEvent = 
        | { type: 'NEXT'; data: Record<string, any> }
        | { type: 'PREVIOUS' }
        | { type: 'SUBMIT' }
        | { type: 'xstate.done.actor.submitForm'; output: { success: boolean } }
        | { type: 'ERROR'; error: string };

      type FormActions = 
        | 'validateStep'
        | 'saveStepData'
        | 'clearErrors'
        | 'setLoading'
        | 'clearLoading'
        | 'incrementAttempts'
        | 'resetForm'
        | 'trackProgress';

      const actions = GenericActionsBuilder
        .create<FormActions, FormContext, FormEvent>()
        // Side effect actions (no context updates)
        .withAction('validateStep', ({ context }: { context: FormContext }, event: FormEvent) => {
          console.log(`Validating step ${context.step}`);
          // Perform validation logic
        })
        .withAction('trackProgress', ({ context }: { context: FormContext }, event: FormEvent) => {
          console.log(`Form progress: step ${context.step} of 3`);
          // Send analytics event
        })
        
        // Context update actions (using assign)
        .withAssignAction('saveStepData', {
          type: 'assign',
          assignment: ({ event }: { event: FormEvent }) => {
            if (event.type === 'NEXT') {
              return { formData: { ...event.data } };
            }
            return {};
          }
        })
        .withAssignAction('clearErrors', {
          type: 'assign',
          assignment: { errors: [] }
        })
        .withAssignAction('setLoading', {
          type: 'assign',
          assignment: { isLoading: true }
        })
        .withAssignAction('clearLoading', {
          type: 'assign',
          assignment: { isLoading: false }
        })
        .withAssignAction('incrementAttempts', {
          type: 'assign',
          assignment: (context: FormContext) => ({ 
            submitAttempts: context.submitAttempts + 1 
          })
        })
        .withAssignAction('resetForm', {
          type: 'assign',
          assignment: {
            step: 1,
            formData: {},
            errors: [],
            isLoading: false,
            submitAttempts: 0
          }
        })
        .build();

      // Verify all actions are present
      expect(Object.keys(actions)).toHaveLength(8);
      
      // Verify side effect actions
      expect(typeof actions.validateStep).toBe('function');
      expect(typeof actions.trackProgress).toBe('function');
      
      // Verify assign actions
      expect(actions.saveStepData.type).toBe('assign');
      expect(actions.clearErrors.type).toBe('assign');
      expect(actions.setLoading.type).toBe('assign');
      expect(actions.clearLoading.type).toBe('assign');
      expect(actions.incrementAttempts.type).toBe('assign');
      expect(actions.resetForm.type).toBe('assign');
    });

    it('should handle async side effects and API calls', () => {
      const actions = GenericActionsBuilder
        .create<'sendAnalytics' | 'saveToLocalStorage' | 'showNotification' | 'updateApiData'>()
        .withAction('sendAnalytics', async ({ context }: { context: any }, event: any) => {
          // Simulate async analytics call
          await fetch('/analytics', {
            method: 'POST',
            body: JSON.stringify({ event: event.type, context })
          });
        })
        .withAction('saveToLocalStorage', ({ context }: { context: any }) => {
          localStorage.setItem('appState', JSON.stringify(context));
        })
        .withAction('showNotification', ({ context }: { context: any }, event: any) => {
          // Show toast notification
          console.log(`Notification: ${event.message || 'Action completed'}`);
        })
        .withAssignAction('updateApiData', {
          type: 'assign',
          assignment: ({ event }: { event: any }) => ({ 
            lastUpdated: new Date().toISOString(),
            apiData: event.output 
          })
        })
        .build();

      expect(typeof actions.sendAnalytics).toBe('function');
      expect(typeof actions.saveToLocalStorage).toBe('function');
      expect(typeof actions.showNotification).toBe('function');
      expect(actions.updateApiData.type).toBe('assign');
    });
  });

  describe('Edge Cases', () => {
    it('should handle actions with no parameters', () => {
      const simpleAction = () => {
        console.log('Simple action with no parameters');
      };

      const actions = GenericActionsBuilder
        .create<'simple'>()
        .withAction('simple', simpleAction as any)
        .build();
      
      expect(actions.simple).toBe(simpleAction);
    });

    it('should handle complex assign patterns', () => {
      const complexAssign = {
        type: 'assign',
        assignment: ({ context, event }: { context: any; event: any }) => {
          switch (event.type) {
            case 'UPDATE_USER':
              return { 
                user: { ...context.user, ...event.data },
                lastModified: Date.now()
              };
            case 'RESET_USER':
              return { user: null, lastModified: null };
            default:
              return {};
          }
        }
      };

      const actions = GenericActionsBuilder
        .create<'updateUser'>()
        .withAssignAction('updateUser', complexAssign)
        .build();
      
      expect(actions.updateUser).toBe(complexAssign);
      expect(actions.updateUser.type).toBe('assign');
    });
  });
});
