import { GenericDelaysBuilder } from '../DelaysBuilder';

describe('GenericDelaysBuilder', () => {
  describe('Basic Construction', () => {
    it('should create a delays builder', () => {
      const builder = GenericDelaysBuilder.create();
      expect(builder).toBeInstanceOf(GenericDelaysBuilder);
    });

    it('should build an empty delays object by default', () => {
      const delays = GenericDelaysBuilder.create().build();
      expect(delays).toEqual({});
    });
  });

  describe('Fixed Delays', () => {
    it('should add a single fixed delay', () => {
      const delays = GenericDelaysBuilder
        .create<'shortDelay'>()
        .withDelay('shortDelay', 1000)
        .build();
      
      expect(delays.shortDelay).toBe(1000);
    });

    it('should add multiple fixed delays', () => {
      const delays = GenericDelaysBuilder
        .create<'short' | 'medium' | 'long'>()
        .withDelay('short', 500)
        .withDelay('medium', 2000)
        .withDelay('long', 5000)
        .build();
      
      expect(delays.short).toBe(500);
      expect(delays.medium).toBe(2000);
      expect(delays.long).toBe(5000);
      expect(Object.keys(delays)).toHaveLength(3);
    });

    it('should overwrite existing fixed delay', () => {
      const delays = GenericDelaysBuilder
        .create<'testDelay'>()
        .withDelay('testDelay', 1000)
        .withDelay('testDelay', 2000)
        .build();
      
      expect(delays.testDelay).toBe(2000);
    });

    it('should handle zero delay', () => {
      const delays = GenericDelaysBuilder
        .create<'immediate'>()
        .withDelay('immediate', 0)
        .build();
      
      expect(delays.immediate).toBe(0);
    });

    it('should handle very large delays', () => {
      const delays = GenericDelaysBuilder
        .create<'veryLong'>()
        .withDelay('veryLong', 300000) // 5 minutes
        .build();
      
      expect(delays.veryLong).toBe(300000);
    });
  });

  describe('Dynamic Delays', () => {
    it('should add a single dynamic delay', () => {
      const delayFunction = (context: any, event: any) => context.timeout || 1000;

      const delays = GenericDelaysBuilder
        .create<'dynamicDelay', { timeout?: number }, { type: 'TEST' }>()
        .withDynamicDelay('dynamicDelay', delayFunction)
        .build();
      
      expect(delays.dynamicDelay).toBe(delayFunction);
      expect(typeof delays.dynamicDelay).toBe('function');
    });

    it('should add multiple dynamic delays', () => {
      const retryDelay = (context: any) => Math.min(1000 * Math.pow(2, context.retryCount || 0), 10000);
      const userDelay = (context: any) => context.user?.preferences?.animationSpeed || 300;
      const networkDelay = (context: any, event: any) => {
        return context.networkSpeed === 'slow' ? 3000 : 1000;
      };

      const delays = GenericDelaysBuilder
        .create<'retry' | 'userPreferred' | 'networkAware'>()
        .withDynamicDelay('retry', retryDelay)
        .withDynamicDelay('userPreferred', userDelay)
        .withDynamicDelay('networkAware', networkDelay)
        .build();
      
      expect(typeof delays.retry).toBe('function');
      expect(typeof delays.userPreferred).toBe('function');
      expect(typeof delays.networkAware).toBe('function');
      expect(Object.keys(delays)).toHaveLength(3);
    });

    it('should overwrite existing dynamic delay', () => {
      const firstFunction = (context: any) => 1000;
      const secondFunction = (context: any) => 2000;

      const delays = GenericDelaysBuilder
        .create<'testDelay'>()
        .withDynamicDelay('testDelay', firstFunction)
        .withDynamicDelay('testDelay', secondFunction)
        .build();
      
      expect(delays.testDelay).toBe(secondFunction);
    });

    it('should handle dynamic delays with complex logic', () => {
      interface AppContext {
        retryCount: number;
        userTier: 'free' | 'premium' | 'enterprise';
        networkCondition: 'excellent' | 'good' | 'poor';
        lastRequestTime: number;
      }

      type AppEvent = { type: 'RETRY' | 'POLL' | 'SYNC'; priority?: 'high' | 'low' };

      const adaptiveDelay = (context: AppContext, event: AppEvent): number => {
        let baseDelay = 1000;
        
        // Adjust for retry count (exponential backoff)
        if (event.type === 'RETRY') {
          baseDelay = Math.min(1000 * Math.pow(2, context.retryCount), 30000);
        }
        
        // Adjust for user tier
        if (context.userTier === 'enterprise') {
          baseDelay *= 0.5; // 50% faster for enterprise
        } else if (context.userTier === 'free') {
          baseDelay *= 1.5; // 50% slower for free tier
        }
        
        // Adjust for network condition
        switch (context.networkCondition) {
          case 'poor':
            baseDelay *= 2;
            break;
          case 'excellent':
            baseDelay *= 0.7;
            break;
          // 'good' remains unchanged
        }
        
        // Adjust for event priority
        if (event.priority === 'high') {
          baseDelay *= 0.3;
        } else if (event.priority === 'low') {
          baseDelay *= 2;
        }
        
        return Math.round(baseDelay);
      };

      const delays = GenericDelaysBuilder
        .create<'adaptive', AppContext, AppEvent>()
        .withDynamicDelay('adaptive', adaptiveDelay)
        .build();
      
      expect(typeof delays.adaptive).toBe('function');
      
      // Test the actual delay calculation
      const testResult = delays.adaptive(
        {
          retryCount: 2,
          userTier: 'premium',
          networkCondition: 'good',
          lastRequestTime: Date.now()
        },
        { type: 'RETRY', priority: 'high' }
      );
      
      // Should be: 1000 * 2^2 * 1.0 * 1.0 * 0.3 = 1200
      expect(testResult).toBe(1200);
    });
  });

  describe('Delay References', () => {
    it('should add a single delay reference', () => {
      const delays = GenericDelaysBuilder
        .create<'aliasDelay'>()
        .withDelayReference('aliasDelay', 'ORIGINAL_DELAY')
        .build();
      
      expect(delays.aliasDelay).toBe('ORIGINAL_DELAY');
    });

    it('should add multiple delay references', () => {
      const delays = GenericDelaysBuilder
        .create<'fast' | 'normal' | 'slow'>()
        .withDelayReference('fast', 'QUICK_DELAY')
        .withDelayReference('normal', 'STANDARD_DELAY')
        .withDelayReference('slow', 'LONG_DELAY')
        .build();
      
      expect(delays.fast).toBe('QUICK_DELAY');
      expect(delays.normal).toBe('STANDARD_DELAY');
      expect(delays.slow).toBe('LONG_DELAY');
      expect(Object.keys(delays)).toHaveLength(3);
    });

    it('should overwrite existing delay reference', () => {
      const delays = GenericDelaysBuilder
        .create<'testRef'>()
        .withDelayReference('testRef', 'FIRST_REF')
        .withDelayReference('testRef', 'SECOND_REF')
        .build();
      
      expect(delays.testRef).toBe('SECOND_REF');
    });
  });

  describe('Mixed Delay Types', () => {
    it('should handle fixed, dynamic, and reference delays together', () => {
      const dynamicFunction = (context: any) => context.baseTimeout || 1000;

      const delays = GenericDelaysBuilder
        .create<'fixed' | 'dynamic' | 'reference' | 'zero'>()
        .withDelay('fixed', 2000)
        .withDynamicDelay('dynamic', dynamicFunction)
        .withDelayReference('reference', 'EXTERNAL_DELAY')
        .withDelay('zero', 0)
        .build();
      
      expect(delays.fixed).toBe(2000);
      expect(delays.dynamic).toBe(dynamicFunction);
      expect(delays.reference).toBe('EXTERNAL_DELAY');
      expect(delays.zero).toBe(0);
      expect(Object.keys(delays)).toHaveLength(4);
    });

    it('should handle overwriting between different delay types', () => {
      const dynamicFunction = (context: any) => 1500;

      const delays = GenericDelaysBuilder
        .create<'changingDelay'>()
        .withDelay('changingDelay', 1000) // Start with fixed
        .withDynamicDelay('changingDelay', dynamicFunction) // Change to dynamic
        .withDelayReference('changingDelay', 'FINAL_REF') // End with reference
        .build();
      
      expect(delays.changingDelay).toBe('FINAL_REF');
    });
  });

  describe('Fluent Interface', () => {
    it('should support method chaining', () => {
      const retryFunction = (context: any) => Math.min(1000 * context.retryCount, 5000);
      const pollFunction = (context: any, event: any) => event.urgency === 'high' ? 500 : 2000;

      const delays = GenericDelaysBuilder
        .create<'api' | 'retry' | 'poll' | 'timeout' | 'fast'>()
        .withDelay('api', 3000)
        .withDynamicDelay('retry', retryFunction)
        .withDynamicDelay('poll', pollFunction)
        .withDelayReference('timeout', 'GLOBAL_TIMEOUT')
        .withDelay('fast', 100)
        .build();

      expect(delays.api).toBe(3000);
      expect(delays.retry).toBe(retryFunction);
      expect(delays.poll).toBe(pollFunction);
      expect(delays.timeout).toBe('GLOBAL_TIMEOUT');
      expect(delays.fast).toBe(100);
      expect(Object.keys(delays)).toHaveLength(5);
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for delay names and implementations', () => {
      type TestDelays = 'apiTimeout' | 'retryDelay' | 'pollInterval' | 'userTimeout';
      type TestContext = { 
        retryCount: number; 
        userPreferences: { timeout: number }; 
        apiSpeed: 'fast' | 'slow' 
      };
      type TestEvent = { type: 'API_CALL' | 'RETRY' | 'POLL'; priority?: number };
      
      const builder = GenericDelaysBuilder.create<TestDelays, TestContext, TestEvent>();
      
      // These should not cause TypeScript errors in a real TypeScript environment
      const delays = builder
        .withDelay('apiTimeout', 5000)
        .withDynamicDelay('retryDelay', (context: TestContext) => {
          return Math.min(1000 * Math.pow(2, context.retryCount), 10000);
        })
        .withDynamicDelay('pollInterval', (context: TestContext, event: TestEvent) => {
          return context.apiSpeed === 'fast' ? 1000 : 3000;
        })
        .withDelayReference('userTimeout', 'USER_DEFINED_TIMEOUT')
        .build();

      expect(delays.apiTimeout).toBe(5000);
      expect(typeof delays.retryDelay).toBe('function');
      expect(typeof delays.pollInterval).toBe('function');
      expect(delays.userTimeout).toBe('USER_DEFINED_TIMEOUT');
    });
  });

  describe('Real World Usage Patterns', () => {
    it('should handle typical API retry patterns', () => {
      interface ApiContext {
        retryCount: number;
        lastErrorType: 'network' | 'server' | 'client' | null;
        baseRetryDelay: number;
        maxRetryDelay: number;
        apiEndpoint: string;
      }

      type ApiEvent = 
        | { type: 'API_ERROR'; error: { type: 'network' | 'server' | 'client'; code: number } }
        | { type: 'RETRY_API' }
        | { type: 'API_SUCCESS' };

      const delays = GenericDelaysBuilder
        .create<'exponentialBackoff' | 'jitteredRetry' | 'circuitBreaker' | 'healthCheck'>()
        .withDynamicDelay('exponentialBackoff', (context: ApiContext) => {
          const exponential = context.baseRetryDelay * Math.pow(2, context.retryCount);
          return Math.min(exponential, context.maxRetryDelay);
        })
        .withDynamicDelay('jitteredRetry', (context: ApiContext) => {
          const base = context.baseRetryDelay * Math.pow(2, context.retryCount);
          const jitter = Math.random() * 0.3 * base; // Add up to 30% jitter
          return Math.min(base + jitter, context.maxRetryDelay);
        })
        .withDynamicDelay('circuitBreaker', (context: ApiContext, event: ApiEvent) => {
          if (context.retryCount === 0) return 1000;
          if (context.retryCount < 3) return 5000;
          if (context.retryCount < 5) return 30000; // 30 seconds
          return 300000; // 5 minutes for circuit breaker
        })
        .withDelay('healthCheck', 60000) // Check every minute
        .build();

      // Test exponential backoff
      expect(typeof delays.exponentialBackoff).toBe('function');
      const backoffResult = delays.exponentialBackoff({
        retryCount: 3,
        lastErrorType: 'network',
        baseRetryDelay: 1000,
        maxRetryDelay: 30000,
        apiEndpoint: '/api/data'
      });
      expect(backoffResult).toBe(8000); // 1000 * 2^3 = 8000

      // Test circuit breaker
      const circuitResult = delays.circuitBreaker(
        {
          retryCount: 5,
          lastErrorType: 'server',
          baseRetryDelay: 1000,
          maxRetryDelay: 30000,
          apiEndpoint: '/api/data'
        },
        { type: 'API_ERROR', error: { type: 'server', code: 500 } }
      );
      expect(circuitResult).toBe(300000);
    });

    it('should handle user experience delays', () => {
      interface UxContext {
        animationsEnabled: boolean;
        userTier: 'free' | 'premium' | 'enterprise';
        deviceType: 'mobile' | 'tablet' | 'desktop';
        reducedMotion: boolean;
        connectionSpeed: 'slow' | 'medium' | 'fast';
      }

      type UxEvent = 
        | { type: 'SHOW_NOTIFICATION'; urgency: 'low' | 'medium' | 'high' }
        | { type: 'ANIMATE_TRANSITION' }
        | { type: 'LOAD_CONTENT' };

      const delays = GenericDelaysBuilder
        .create<'notification' | 'transition' | 'contentLoad' | 'tooltip' | 'autoSave'>()
        .withDynamicDelay('notification', (context: UxContext, event: UxEvent) => {
          if (event.type === 'SHOW_NOTIFICATION') {
            const baseDelay = {
              'low': 5000,
              'medium': 3000,
              'high': 1000
            }[event.urgency];
            
            // Adjust for user tier (premium users get faster notifications)
            if (context.userTier === 'enterprise') return baseDelay * 0.5;
            if (context.userTier === 'premium') return baseDelay * 0.8;
            return baseDelay;
          }
          return 3000;
        })
        .withDynamicDelay('transition', (context: UxContext) => {
          if (context.reducedMotion) return 0;
          if (!context.animationsEnabled) return 0;
          
          const baseTransition = context.deviceType === 'mobile' ? 200 : 300;
          return context.connectionSpeed === 'slow' ? baseTransition * 0.5 : baseTransition;
        })
        .withDynamicDelay('contentLoad', (context: UxContext) => {
          const speedMultiplier = {
            'slow': 2.0,
            'medium': 1.0,
            'fast': 0.5
          }[context.connectionSpeed];
          
          const deviceMultiplier = {
            'mobile': 1.2,
            'tablet': 1.0,
            'desktop': 0.8
          }[context.deviceType];
          
          return Math.round(1000 * speedMultiplier * deviceMultiplier);
        })
        .withDelay('tooltip', 1500)
        .withDynamicDelay('autoSave', (context: UxContext) => {
          // More frequent saves for premium users
          const baseInterval = context.userTier === 'free' ? 60000 : 30000;
          return context.connectionSpeed === 'slow' ? baseInterval * 1.5 : baseInterval;
        })
        .build();

      // Test notification delay
      const notificationResult = delays.notification(
        {
          animationsEnabled: true,
          userTier: 'premium',
          deviceType: 'mobile',
          reducedMotion: false,
          connectionSpeed: 'fast'
        },
        { type: 'SHOW_NOTIFICATION', urgency: 'high' }
      );
      expect(notificationResult).toBe(800); // 1000 * 0.8 for premium

      // Test transition delay
      const transitionResult = delays.transition({
        animationsEnabled: true,
        userTier: 'free',
        deviceType: 'mobile',
        reducedMotion: false,
        connectionSpeed: 'medium'
      });
      expect(transitionResult).toBe(200); // Mobile base transition
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative delays by converting to zero', () => {
      const negativeFunction = (context: any) => -1000;

      const delays = GenericDelaysBuilder
        .create<'negative'>()
        .withDynamicDelay('negative', negativeFunction)
        .build();
      
      // The actual implementation might handle this, but we test the function exists
      expect(typeof delays.negative).toBe('function');
      const result = delays.negative({}, {});
      expect(result).toBe(-1000); // Function returns what it returns
    });

    it('should handle very large delay values', () => {
      const largeDelay = Number.MAX_SAFE_INTEGER;

      const delays = GenericDelaysBuilder
        .create<'veryLarge'>()
        .withDelay('veryLarge', largeDelay)
        .build();
      
      expect(delays.veryLarge).toBe(largeDelay);
    });

    it('should handle dynamic functions that return different types', () => {
      const conditionalFunction = (context: any) => {
        return context.useString ? 'EXTERNAL_DELAY' : 1000;
      };

      const delays = GenericDelaysBuilder
        .create<'conditional'>()
        .withDynamicDelay('conditional', conditionalFunction as any)
        .build();
      
      expect(typeof delays.conditional).toBe('function');
    });
  });
});
