// 🧪 Tests para funcionalidades After y Always en StateBuilder
import { GenericDelayedTransitionsBuilder } from '../DelayedTransitionsBuilder';
import { GenericStateBuilder } from '../StateBuilder';

describe('StateBuilder - After & Always Transitions', () => {
  let builder: GenericStateBuilder<string>;

  beforeEach(() => {
    builder = GenericStateBuilder.create<string>();
  });

  describe('⏰ After Transitions Integration', () => {
    it('should add after configuration to state using DelayedTransitionsBuilder', () => {
      const delayedTransitions = GenericDelayedTransitionsBuilder.create<string>()
        .after(1000, 'timeout')
        .afterWithActions(5000, ['logTimeout'], 'longTimeout')
        .build();
      
      const result = builder.withAfter(delayedTransitions).build();
      
      expect(result.after).toEqual({
        1000: { target: 'timeout' },
        5000: { target: 'longTimeout', actions: ['logTimeout'] }
      });
    });

    it('should combine after with other state properties', () => {
      const delayedTransitions = GenericDelayedTransitionsBuilder.create<string>()
        .after(2000, 'timeout')
        .build();
      
      const result = builder
        .withEntry('enterAction')
        .withAfter(delayedTransitions)
        .withTag('timed')
        .build();
      
      expect(result).toEqual({
        entry: ['enterAction'],
        after: { 2000: { target: 'timeout' } },
        tags: ['timed']
      });
    });

    it('should override after configuration', () => {
      const firstDelayed = GenericDelayedTransitionsBuilder.create<string>()
        .after(1000, 'first')
        .build();
        
      const secondDelayed = GenericDelayedTransitionsBuilder.create<string>()
        .after(2000, 'second')
        .build();
      
      const result = builder
        .withAfter(firstDelayed)
        .withAfter(secondDelayed)
        .build();
      
      expect(result.after).toEqual({ 2000: { target: 'second' } });
    });

    it('should handle complex after configurations', () => {
      const delayedTransitions = GenericDelayedTransitionsBuilder.create<string>()
        .afterWithActionsAndGuard('SHORT_DELAY', ['showWarning'], 'isStillActive', 'warning')
        .afterWithActions('LONG_DELAY', ['logError', 'notifyUser'], 'error')
        .afterWithActions(3000, ['cleanup'])
        .build();
      
      const result = builder.withAfter(delayedTransitions).build();
      
      expect(result.after).toEqual({
        'SHORT_DELAY': { 
          target: 'warning',
          actions: ['showWarning'],
          guard: 'isStillActive'
        },
        'LONG_DELAY': {
          target: 'error',
          actions: ['logError', 'notifyUser']
        },
        3000: {
          actions: ['cleanup']
        }
      });
    });
  });

  describe('⚡ Always Transitions', () => {
    it('should add single always transition', () => {
      const result = builder.withAlways('nextState').build();
      
      expect(result.always).toEqual([
        { target: 'nextState' }
      ]);
    });

    it('should add always transition with guard', () => {
      const result = builder.withAlways('conditionalState', 'isReady').build();
      
      expect(result.always).toEqual([
        { target: 'conditionalState', guard: 'isReady' }
      ]);
    });

    it('should add multiple always transitions', () => {
      const result = builder
        .withAlways('firstState', 'firstCondition')
        .withAlways('secondState', 'secondCondition')
        .withAlways('defaultState')
        .build();
      
      expect(result.always).toEqual([
        { target: 'firstState', guard: 'firstCondition' },
        { target: 'secondState', guard: 'secondCondition' },
        { target: 'defaultState' }
      ]);
    });

    it('should combine always with other state properties', () => {
      const result = builder
        .withEntry('enterAction')
        .withAlways('autoTarget', 'canTransition')
        .withTag('automatic')
        .withMeta({ type: 'conditional' })
        .build();
      
      expect(result).toEqual({
        entry: ['enterAction'],
        always: [{ target: 'autoTarget', guard: 'canTransition' }],
        tags: ['automatic'],
        meta: { type: 'conditional' }
      });
    });

    it('should handle always transitions without guards', () => {
      const result = builder
        .withAlways('immediateTarget')
        .build();
      
      expect(result.always).toEqual([
        { target: 'immediateTarget' }
      ]);
    });
  });

  describe('🔄 Combined After and Always', () => {
    it('should support both after and always in same state', () => {
      const afterConfig = { 1000: { target: 'timeout' } };
      
      const result = builder
        .withAfter(afterConfig)
        .withAlways('immediateCheck', 'isReady')
        .build();
      
      expect(result).toEqual({
        after: afterConfig,
        always: [{ target: 'immediateCheck', guard: 'isReady' }]
      });
    });

    it('should work with all state features together', () => {
      const afterConfig = { 
        2000: { target: 'delayed', actions: ['onDelay'] }
      };
      const transitions = { EVENT: { target: 'manual' } };
      const invoke = { src: 'asyncService' };
      
      const result = builder
        .withEntry('enter')
        .withExit('exit')
        .withTransitions(transitions)
        .withInvoke(invoke)
        .withAfter(afterConfig)
        .withAlways('autoCheck', 'shouldAuto')
        .withTag('complex')
        .withMeta({ complexity: 'high' })
        .withDescription('A complex state with multiple features')
        .build();
      
      expect(result).toEqual({
        entry: ['enter'],
        exit: ['exit'],
        on: transitions,
        invoke: invoke,
        after: afterConfig,
        always: [{ target: 'autoCheck', guard: 'shouldAuto' }],
        tags: ['complex'],
        meta: { complexity: 'high' },
        description: 'A complex state with multiple features'
      });
    });
  });

  describe('🛠️ Edge Cases', () => {
    it('should handle empty after configuration', () => {
      const result = builder.withAfter({}).build();
      
      expect(result.after).toEqual({});
    });

    it('should initialize always array correctly', () => {
      const result = builder
        .withAlways('first')
        .withAlways('second')
        .build();
      
      expect(result.always).toHaveLength(2);
      expect(result.always[0]).toEqual({ target: 'first' });
      expect(result.always[1]).toEqual({ target: 'second' });
    });

    it('should handle undefined guard in always', () => {
      const result = builder.withAlways('target', undefined).build();
      
      expect(result.always).toEqual([
        { target: 'target' }
      ]);
    });

    it('should handle empty string guard in always', () => {
      const result = builder.withAlways('target', '').build();
      
      expect(result.always).toEqual([
        { target: 'target', guard: '' }
      ]);
    });
  });

  describe('📋 Real-world Scenarios', () => {
    it('should model a loading state with timeout', () => {
      const result = builder
        .withTag('loading')
        .withEntry('startLoader')
        .withExit('stopLoader')
        .withAfter({
          10000: { 
            target: 'error',
            actions: ['logTimeout', 'showError']
          }
        })
        .withTransitions({
          SUCCESS: { target: 'success' },
          CANCEL: { target: 'idle' }
        })
        .withMeta({ component: 'LoadingSpinner' })
        .build();
      
      expect(result).toEqual({
        tags: ['loading'],
        entry: ['startLoader'],
        exit: ['stopLoader'],
        after: {
          10000: { 
            target: 'error',
            actions: ['logTimeout', 'showError']
          }
        },
        on: {
          SUCCESS: { target: 'success' },
          CANCEL: { target: 'idle' }
        },
        meta: { component: 'LoadingSpinner' }
      });
    });

    it('should model a validation state with automatic progression', () => {
      const result = builder
        .withTag('validation')
        .withEntry('startValidation')
        .withAlways('success', 'isValid')
        .withAlways('error', 'hasErrors')
        .withAfter({
          5000: { target: 'timeout' }
        })
        .withDescription('Validates input and auto-progresses based on result')
        .build();
      
      expect(result).toEqual({
        tags: ['validation'],
        entry: ['startValidation'],
        always: [
          { target: 'success', guard: 'isValid' },
          { target: 'error', guard: 'hasErrors' }
        ],
        after: {
          5000: { target: 'timeout' }
        },
        description: 'Validates input and auto-progresses based on result'
      });
    });
  });
});
