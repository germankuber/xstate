// 🧪 Tests para DelayedTransitionsBuilder (After Transitions)
import { GenericDelayedTransitionsBuilder } from '../DelayedTransitionsBuilder';

describe('DelayedTransitionsBuilder - After Transitions', () => {
  let builder: GenericDelayedTransitionsBuilder<string>;

  beforeEach(() => {
    builder = GenericDelayedTransitionsBuilder.create<string>();
  });

  describe('⏰ Basic Delayed Transitions', () => {
    it('should create delayed transition with numeric delay', () => {
      const result = builder.after(1000, 'timeout').build();
      
      expect(result).toEqual({
        1000: { target: 'timeout' }
      });
    });

    it('should create delayed transition with string delay', () => {
      const result = builder.after('SHORT_DELAY', 'nextState').build();
      
      expect(result).toEqual({
        SHORT_DELAY: { target: 'nextState' }
      });
    });

    it('should handle multiple delayed transitions', () => {
      const result = builder
        .after(1000, 'timeout')
        .after(5000, 'longTimeout')
        .build();
      
      expect(result).toEqual({
        1000: { target: 'timeout' },
        5000: { target: 'longTimeout' }
      });
    });
  });

  describe('⏰ Delayed Transitions with Actions', () => {
    it('should create delayed transition with actions only', () => {
      const result = builder
        .afterWithActions(2000, ['logTimeout', 'clearData'])
        .build();
      
      expect(result).toEqual({
        2000: { actions: ['logTimeout', 'clearData'] }
      });
    });

    it('should create delayed transition with actions and target', () => {
      const result = builder
        .afterWithActions(1500, ['saveState'], 'timeout')
        .build();
      
      expect(result).toEqual({
        1500: { 
          actions: ['saveState'],
          target: 'timeout'
        }
      });
    });

    it('should handle empty actions array', () => {
      const result = builder
        .afterWithActions(1000, [], 'nextState')
        .build();
      
      expect(result).toEqual({
        1000: { 
          actions: [],
          target: 'nextState'
        }
      });
    });
  });

  describe('⏰ Delayed Transitions with Guards', () => {
    it('should create delayed transition with guard', () => {
      const result = builder
        .afterWithGuard(3000, 'isValid', 'success')
        .build();
      
      expect(result).toEqual({
        3000: { 
          target: 'success',
          guard: 'isValid'
        }
      });
    });

    it('should create delayed transition with actions and guard', () => {
      const result = builder
        .afterWithActionsAndGuard(2000, ['validate'], 'isReady', 'proceed')
        .build();
      
      expect(result).toEqual({
        2000: {
          actions: ['validate'],
          guard: 'isReady',
          target: 'proceed'
        }
      });
    });

    it('should create delayed transition with actions and guard but no target', () => {
      const result = builder
        .afterWithActionsAndGuard(1000, ['logEvent'], 'canLog')
        .build();
      
      expect(result).toEqual({
        1000: {
          actions: ['logEvent'],
          guard: 'canLog'
        }
      });
    });
  });

  describe('⏰ Multiple Delayed Transitions API', () => {
    it('should create multiple transitions at once', () => {
      const result = builder
        .after(1000, 'timeout1')
        .afterWithActions(2000, ['log'], 'timeout2')
        .afterWithGuard(3000, 'isValid', 'success')
        .build();
      
      expect(result).toEqual({
        1000: { target: 'timeout1' },
        2000: { target: 'timeout2', actions: ['log'] },
        3000: { guard: 'isValid', target: 'success' }
      });
    });

    it('should handle complex multiple transitions', () => {
      const result = builder
        .afterWithActions('SHORT_DELAY', ['showWarning'], 'warning')
        .afterWithActionsAndGuard('LONG_DELAY', ['logError', 'notifyUser'], 'stillWaiting', 'error')
        .build();
      
      expect(result).toEqual({
        SHORT_DELAY: { 
          target: 'warning',
          actions: ['showWarning']
        },
        LONG_DELAY: { 
          target: 'error',
          actions: ['logError', 'notifyUser'],
          guard: 'stillWaiting'
        }
      });
    });

    it('should handle empty transitions array', () => {
      const result = builder.build();
      
      expect(result).toEqual({});
    });
  });

  describe('🔄 Combined Operations', () => {
    it('should combine different after methods', () => {
      const result = builder
        .after(1000, 'quick')
        .afterWithActions(2000, ['log'], 'medium')
        .afterWithGuard(3000, 'isReady', 'slow')
        .after(4000, 'veryLong')
        .build();
      
      expect(result).toEqual({
        1000: { target: 'quick' },
        2000: { actions: ['log'], target: 'medium' },
        3000: { guard: 'isReady', target: 'slow' },
        4000: { target: 'veryLong' }
      });
    });

    it('should override transitions with same delay', () => {
      const result = builder
        .after(1000, 'first')
        .after(1000, 'second')  // Should override
        .build();
      
      expect(result).toEqual({
        1000: { target: 'second' }
      });
    });

    it('should handle string and numeric delays together', () => {
      const result = builder
        .after(1000, 'numeric')
        .after('DELAY_CONSTANT', 'string')
        .afterWithActions('ANOTHER_DELAY', ['action'])
        .build();
      
      expect(result).toEqual({
        1000: { target: 'numeric' },
        DELAY_CONSTANT: { target: 'string' },
        ANOTHER_DELAY: { actions: ['action'] }
      });
    });
  });

  describe('🛠️ Edge Cases', () => {
    it('should handle zero delay', () => {
      const result = builder.after(0, 'immediate').build();
      
      expect(result).toEqual({
        0: { target: 'immediate' }
      });
    });

    it('should handle very large delays', () => {
      const result = builder.after(999999999, 'veryLate').build();
      
      expect(result).toEqual({
        999999999: { target: 'veryLate' }
      });
    });

    it('should return empty object when no transitions added', () => {
      const result = builder.build();
      
      expect(result).toEqual({});
    });
  });
});
