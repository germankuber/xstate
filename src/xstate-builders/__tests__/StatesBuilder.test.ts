import { GenericStatesBuilder } from '../StatesBuilder';

describe('GenericStatesBuilder', () => {
  describe('Basic Construction', () => {
    it('should create a states builder', () => {
      const builder = GenericStatesBuilder.create();
      expect(builder).toBeInstanceOf(GenericStatesBuilder);
    });

    it('should build an empty states object by default', () => {
      const states = GenericStatesBuilder.create().build();
      expect(states).toEqual({});
    });
  });

  describe('State Configuration', () => {
    it('should add a single state', () => {
      const stateConfig = {
        entry: ['startLoading'],
        on: {
          SUCCESS: 'success',
          ERROR: 'error'
        }
      };

      const states = GenericStatesBuilder
        .create<'idle' | 'loading' | 'success' | 'error'>()
        .withState('loading', stateConfig)
        .build();
      
      expect(states.loading).toEqual(stateConfig);
    });

    it('should add multiple states', () => {
      const idleConfig = {
        on: { START: 'loading' }
      };

      const loadingConfig = {
        entry: ['setLoading'],
        exit: ['clearLoading'],
        on: {
          SUCCESS: 'success',
          ERROR: 'error'
        }
      };

      const successConfig = {
        entry: ['showSuccess'],
        on: { RESET: 'idle' }
      };

      const states = GenericStatesBuilder
        .create<'idle' | 'loading' | 'success' | 'error'>()
        .withState('idle', idleConfig)
        .withState('loading', loadingConfig)
        .withState('success', successConfig)
        .build();
      
      expect(states).toEqual({
        idle: idleConfig,
        loading: loadingConfig,
        success: successConfig
      });
    });

    it('should overwrite existing state configuration', () => {
      const firstConfig = { entry: ['action1'] };
      const secondConfig = { entry: ['action2'], exit: ['cleanup'] };

      const states = GenericStatesBuilder
        .create<'testState'>()
        .withState('testState', firstConfig)
        .withState('testState', secondConfig)
        .build();
      
      expect(states.testState).toEqual(secondConfig);
    });
  });

  describe('Fluent Interface', () => {
    it('should support method chaining', () => {
      const states = GenericStatesBuilder
        .create<'step1' | 'step2' | 'step3' | 'final'>()
        .withState('step1', {
          on: { NEXT: 'step2' }
        })
        .withState('step2', {
          entry: ['processStep2'],
          on: { 
            NEXT: 'step3',
            PREV: 'step1'
          }
        })
        .withState('step3', {
          entry: ['processStep3'],
          on: { 
            COMPLETE: 'final',
            PREV: 'step2'
          }
        })
        .withState('final', {
          type: 'final',
          entry: ['onComplete']
        })
        .build();

      expect(Object.keys(states)).toEqual(['step1', 'step2', 'step3', 'final']);
      expect(states.step1.on.NEXT).toBe('step2');
      expect(states.step2.entry).toEqual(['processStep2']);
      expect(states.final.type).toBe('final');
    });
  });

  describe('Complex State Configurations', () => {
    it('should handle states with invoke configurations', () => {
      const states = GenericStatesBuilder
        .create<'idle' | 'fetchingData' | 'success' | 'error'>()
        .withState('idle', {
          on: { FETCH: 'fetchingData' }
        })
        .withState('fetchingData', {
          entry: ['setLoading'],
          invoke: {
            src: 'fetchData',
            id: 'dataFetcher',
            onDone: {
              target: 'success',
              actions: ['saveData']
            },
            onError: {
              target: 'error',
              actions: ['handleError']
            }
          }
        })
        .withState('success', {
          entry: ['clearLoading', 'showSuccess'],
          on: { RESET: 'idle' }
        })
        .withState('error', {
          entry: ['clearLoading', 'showError'],
          on: { RETRY: 'fetchingData', RESET: 'idle' }
        })
        .build();

      expect(states.fetchingData.invoke).toBeDefined();
      expect(states.fetchingData.invoke.src).toBe('fetchData');
      expect(states.fetchingData.invoke.onDone.target).toBe('success');
      expect(states.success.entry).toEqual(['clearLoading', 'showSuccess']);
    });

    it('should handle states with guards and delays', () => {
      const states = GenericStatesBuilder
        .create<'waiting' | 'checking' | 'approved' | 'rejected'>()
        .withState('waiting', {
          after: {
            TIMEOUT: 'checking'
          }
        })
        .withState('checking', {
          entry: ['startValidation'],
          on: {
            VALID: {
              target: 'approved',
              guard: 'isValidUser',
              actions: ['logApproval']
            },
            INVALID: {
              target: 'rejected',
              actions: ['logRejection']
            }
          }
        })
        .withState('approved', {
          type: 'final',
          entry: ['notifyApproval']
        })
        .withState('rejected', {
          type: 'final',
          entry: ['notifyRejection']
        })
        .build();

      expect(states.waiting.after.TIMEOUT).toBe('checking');
      expect(states.checking.on.VALID.guard).toBe('isValidUser');
      expect(states.approved.type).toBe('final');
    });

    it('should handle hierarchical state configurations', () => {
      const states = GenericStatesBuilder
        .create<'form' | 'summary' | 'complete'>()
        .withState('form', {
          initial: 'editing',
          states: {
            editing: {
              on: {
                VALIDATE: 'validating',
                SUBMIT: 'submitting'
              }
            },
            validating: {
              entry: ['validateForm'],
              on: {
                VALID: 'editing',
                INVALID: 'editing'
              }
            },
            submitting: {
              entry: ['submitForm'],
              on: {
                SUCCESS: '#summary',
                ERROR: 'editing'
              }
            }
          }
        })
        .withState('summary', {
          id: 'summary',
          entry: ['showSummary'],
          on: {
            CONFIRM: 'complete',
            EDIT: 'form'
          }
        })
        .withState('complete', {
          type: 'final',
          entry: ['onComplete']
        })
        .build();

      expect(states.form.initial).toBe('editing');
      expect(states.form.states).toBeDefined();
      expect(states.form.states.editing).toBeDefined();
      expect(states.summary.id).toBe('summary');
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for state names', () => {
      type TestStates = 'loading' | 'success' | 'error' | 'retry';
      
      const builder = GenericStatesBuilder.create<TestStates>();
      
      // These should not cause TypeScript errors in a real TypeScript environment
      const states = builder
        .withState('loading', { entry: ['startLoading'] })
        .withState('success', { entry: ['showSuccess'] })
        .withState('error', { entry: ['showError'] })
        .withState('retry', { entry: ['prepareRetry'] })
        .build();

      expect(states.loading).toBeDefined();
      expect(states.success).toBeDefined();
      expect(states.error).toBeDefined();
      expect(states.retry).toBeDefined();
    });
  });

  describe('Empty and Minimal Configurations', () => {
    it('should handle states with empty configurations', () => {
      const states = GenericStatesBuilder
        .create<'empty' | 'minimal'>()
        .withState('empty', {})
        .withState('minimal', { type: 'final' })
        .build();

      expect(states.empty).toEqual({});
      expect(states.minimal).toEqual({ type: 'final' });
    });

    it('should handle single state configuration', () => {
      const singleStateConfig = {
        entry: ['initialize'],
        exit: ['cleanup'],
        on: {
          COMPLETE: 'done'
        }
      };

      const states = GenericStatesBuilder
        .create<'active'>()
        .withState('active', singleStateConfig)
        .build();

      expect(states).toEqual({
        active: singleStateConfig
      });
    });
  });

  describe('Real World Usage Patterns', () => {
    it('should handle typical form wizard states', () => {
      const states = GenericStatesBuilder
        .create<'step1' | 'step2' | 'step3' | 'review' | 'submitting' | 'success' | 'error'>()
        .withState('step1', {
          entry: ['resetForm', 'focusFirstField'],
          on: {
            NEXT: {
              target: 'step2',
              guard: 'isStep1Valid',
              actions: ['saveStep1Data']
            }
          }
        })
        .withState('step2', {
          entry: ['focusStep2'],
          on: {
            NEXT: {
              target: 'step3',
              guard: 'isStep2Valid',
              actions: ['saveStep2Data']
            },
            PREV: 'step1'
          }
        })
        .withState('step3', {
          entry: ['focusStep3'],
          on: {
            NEXT: {
              target: 'review',
              guard: 'isStep3Valid',
              actions: ['saveStep3Data']
            },
            PREV: 'step2'
          }
        })
        .withState('review', {
          entry: ['prepareReview'],
          on: {
            SUBMIT: 'submitting',
            EDIT_STEP1: 'step1',
            EDIT_STEP2: 'step2',
            EDIT_STEP3: 'step3'
          }
        })
        .withState('submitting', {
          entry: ['showSpinner'],
          invoke: {
            src: 'submitForm',
            onDone: 'success',
            onError: 'error'
          }
        })
        .withState('success', {
          type: 'final',
          entry: ['hideSpinner', 'showSuccessMessage']
        })
        .withState('error', {
          entry: ['hideSpinner', 'showErrorMessage'],
          on: {
            RETRY: 'submitting',
            BACK_TO_REVIEW: 'review'
          }
        })
        .build();

      // Verify the complete wizard flow
      expect(Object.keys(states)).toHaveLength(7);
      expect(states.step1.on.NEXT.guard).toBe('isStep1Valid');
      expect(states.submitting.invoke.src).toBe('submitForm');
      expect(states.success.type).toBe('final');
    });
  });
});
