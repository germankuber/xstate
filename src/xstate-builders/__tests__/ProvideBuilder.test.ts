import { GenericActorsBuilder } from '../ActorsBuilder';
import { GenericProvideBuilder } from '../ProvideBuilder';

describe('GenericProvideBuilder', () => {
  beforeEach(() => {
    // Suppress console.log during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Construction', () => {
    it('should create a provide builder', () => {
      const builder = GenericProvideBuilder.create();
      expect(builder).toBeInstanceOf(GenericProvideBuilder);
    });

    it('should build an empty implementations object by default', () => {
      const implementations = GenericProvideBuilder.create().build();
      expect(implementations).toEqual({});
    });
  });

  describe('Actions Configuration', () => {
    it('should set actions configuration', () => {
      const actions = {
        startLoading: () => console.log('loading'),
        saveData: (context: any, event: any) => ({ data: event.data }),
        showError: () => console.log('error')
      };

      const implementations = GenericProvideBuilder
        .create()
        .withActions(actions)
        .build();
      
      expect(implementations.actions).toEqual(actions);
    });

    it('should overwrite previous actions configuration', () => {
      const firstActions = { action1: () => {} };
      const secondActions = { action2: () => {}, action3: () => {} };

      const implementations = GenericProvideBuilder
        .create()
        .withActions(firstActions)
        .withActions(secondActions)
        .build();
      
      expect(implementations.actions).toEqual(secondActions);
    });
  });

  describe('Guards Configuration', () => {
    it('should set guards configuration', () => {
      const guards = {
        isValid: (context: any) => context.isValid,
        hasPermission: (context: any) => context.user?.permissions?.includes('admin'),
        isOnline: () => navigator.onLine
      };

      const implementations = GenericProvideBuilder
        .create()
        .withGuards(guards)
        .build();
      
      expect(implementations.guards).toEqual(guards);
    });

    it('should overwrite previous guards configuration', () => {
      const firstGuards = { guard1: () => true };
      const secondGuards = { guard2: () => false, guard3: () => true };

      const implementations = GenericProvideBuilder
        .create()
        .withGuards(firstGuards)
        .withGuards(secondGuards)
        .build();
      
      expect(implementations.guards).toEqual(secondGuards);
    });
  });

  describe('Delays Configuration', () => {
    it('should set delays configuration', () => {
      const delays = {
        shortDelay: 500,
        mediumDelay: 2000,
        longDelay: (context: any) => context.timeout || 5000
      };

      const implementations = GenericProvideBuilder
        .create()
        .withDelays(delays)
        .build();
      
      expect(implementations.delays).toEqual(delays);
    });

    it('should overwrite previous delays configuration', () => {
      const firstDelays = { delay1: 100 };
      const secondDelays = { delay2: 200, delay3: 300 };

      const implementations = GenericProvideBuilder
        .create()
        .withDelays(firstDelays)
        .withDelays(secondDelays)
        .build();
      
      expect(implementations.delays).toEqual(secondDelays);
    });
  });

  describe('Actors Configuration', () => {
    it('should set actors configuration', () => {
      const actors = {
        fetchUserData: async () => ({ name: 'John', email: 'john@example.com' }),
        saveData: async (data: any) => ({ success: true, id: data.id }),
        notification: async (message: string) => ({ sent: true, message })
      };

      const implementations = GenericProvideBuilder
        .create()
        .withActors(actors)
        .build();
      
      expect(implementations.actors).toEqual(actors);
      expect(implementations.services).toEqual(actors); // Should also set services for compatibility
    });

    it('should overwrite previous actors configuration', () => {
      const firstActors = { actor1: async () => ({}) };
      const secondActors = { actor2: async () => ({}), actor3: async () => ({}) };

      const implementations = GenericProvideBuilder
        .create()
        .withActors(firstActors)
        .withActors(secondActors)
        .build();
      
      expect(implementations.actors).toEqual(secondActors);
      expect(implementations.services).toEqual(secondActors);
    });
  });

  describe('Fluent Interface', () => {
    it('should support method chaining', () => {
      const actions = {
        startProcess: () => console.log('starting'),
        finishProcess: () => console.log('finished')
      };

      const guards = {
        canStart: () => true,
        canFinish: (context: any) => context.readyToFinish
      };

      const delays = {
        processDelay: 1000,
        finishDelay: 500
      };

      const actors = {
        processor: async () => ({ processed: true }),
        validator: async (data: any) => ({ valid: true, data })
      };

      const implementations = GenericProvideBuilder
        .create()
        .withActions(actions)
        .withGuards(guards)
        .withDelays(delays)
        .withActors(actors)
        .build();

      expect(implementations).toEqual({
        actions,
        guards,
        delays,
        actors,
        services: actors // Should be same as actors for compatibility
      });
    });

    it('should handle complex implementation configuration', () => {
      const implementations = GenericProvideBuilder
        .create<
          'idle' | 'loading' | 'success' | 'error',
          'startLoading' | 'saveData' | 'handleError',
          'isValid' | 'hasData',
          'shortDelay' | 'longDelay'
        >()
        .withActions({
          startLoading: () => ({ loading: true }),
          saveData: (context: any, event: any) => ({ data: event.data }),
          handleError: (context: any, event: any) => ({ error: event.error })
        })
        .withGuards({
          isValid: (context: any) => !!context.data,
          hasData: (context: any) => context.data && context.data.length > 0
        })
        .withDelays({
          shortDelay: 500,
          longDelay: (context: any) => context.timeout || 5000
        })
        .withActors(
          GenericActorsBuilder.create()
            .withActor('dataFetcher', async () => ({ data: [1, 2, 3] }))
            .withActor('dataSaver', async (data: any) => ({ saved: true, data }))
            .build()
        )
        .build();

      expect(implementations.actions).toBeDefined();
      expect(implementations.guards).toBeDefined();
      expect(implementations.delays).toBeDefined();
      expect(implementations.actors).toBeDefined();
      expect(implementations.services).toBeDefined();
      expect(implementations.services).toEqual(implementations.actors);
    });
  });

  describe('Partial Configuration', () => {
    it('should work with actions only', () => {
      const actions = { testAction: () => {} };
      
      const implementations = GenericProvideBuilder
        .create()
        .withActions(actions)
        .build();
      
      expect(implementations).toEqual({
        actions
      });
    });

    it('should work with guards only', () => {
      const guards = { testGuard: () => true };
      
      const implementations = GenericProvideBuilder
        .create()
        .withGuards(guards)
        .build();
      
      expect(implementations).toEqual({
        guards
      });
    });

    it('should work with delays only', () => {
      const delays = { testDelay: 1000 };
      
      const implementations = GenericProvideBuilder
        .create()
        .withDelays(delays)
        .build();
      
      expect(implementations).toEqual({
        delays
      });
    });

    it('should work with actors only', () => {
      const actors = { testActor: async () => ({}) };
      
      const implementations = GenericProvideBuilder
        .create()
        .withActors(actors)
        .build();
      
      expect(implementations).toEqual({
        actors,
        services: actors
      });
    });
  });

  describe('Services Compatibility', () => {
    it('should always set services when actors are provided', () => {
      const actors = {
        service1: async () => ({ result: 'test1' }),
        service2: async () => ({ result: 'test2' })
      };

      const implementations = GenericProvideBuilder
        .create()
        .withActors(actors)
        .build();
      
      expect(implementations.actors).toEqual(actors);
      expect(implementations.services).toEqual(actors);
      expect(implementations.services).toBe(implementations.actors);
    });

    it('should update services when actors are updated', () => {
      const firstActors = { actor1: async () => ({}) };
      const secondActors = { actor2: async () => ({}) };

      const implementations = GenericProvideBuilder
        .create()
        .withActors(firstActors)
        .withActors(secondActors)
        .build();
      
      expect(implementations.actors).toEqual(secondActors);
      expect(implementations.services).toEqual(secondActors);
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for all implementation types', () => {
      type TestStates = 'idle' | 'loading' | 'success';
      type TestActions = 'start' | 'finish' | 'reset';
      type TestGuards = 'canStart' | 'canFinish';
      type TestDelays = 'shortWait' | 'longWait';
      
      const builder = GenericProvideBuilder.create<
        TestStates,
        TestActions,
        TestGuards,
        TestDelays,
        { count: number },
        { type: 'INCREMENT' | 'DECREMENT' }
      >();
      
      // These should not cause TypeScript errors in a real TypeScript environment
      const implementations = builder
        .withActions({
          start: () => {},
          finish: () => {},
          reset: () => {}
        })
        .withGuards({
          canStart: () => true,
          canFinish: () => false
        })
        .build();

      expect(implementations.actions).toBeDefined();
      expect(implementations.guards).toBeDefined();
    });
  });

  describe('Real World Usage', () => {
    it('should handle typical XState v5 implementation pattern', () => {
      const implementations = GenericProvideBuilder
        .create()
        .withActions({
          // Assign actions
          saveApiData: ({ event }: { event: any }) => ({ apiData: event.output }),
          setLoading: () => ({ isLoading: true }),
          clearLoading: () => ({ isLoading: false }),
          
          // Side effect actions
          logTransition: (context: any, event: any) => {
            console.log(`Transitioning from ${context.currentState} with ${event.type}`);
          }
        })
        .withGuards({
          isDataValid: (context: any) => context.apiData && context.apiData.id,
          hasPermission: (context: any) => context.user?.role === 'admin',
          isOnline: () => navigator.onLine
        })
        .withDelays({
          apiTimeout: 5000,
          retryDelay: (context: any, event: any) => {
            return Math.min(1000 * Math.pow(2, context.retryCount || 0), 10000);
          }
        })
        .withActors(
          GenericActorsBuilder.create()
            .withActor('fetchUserData', async () => {
              await new Promise(resolve => setTimeout(resolve, 500));
              return { id: 1, name: 'John Doe', email: 'john@example.com' };
            })
            .withActor('saveUserData', async (data: any) => {
              await new Promise(resolve => setTimeout(resolve, 300));
              return { success: true, savedAt: new Date().toISOString() };
            })
            .build()
        )
        .build();

      // Verify all implementation types are present
      expect(implementations.actions).toBeDefined();
      expect(implementations.guards).toBeDefined();
      expect(implementations.delays).toBeDefined();
      expect(implementations.actors).toBeDefined();
      expect(implementations.services).toBeDefined();

      // Verify specific implementations
      expect(typeof implementations.actions.saveApiData).toBe('function');
      expect(typeof implementations.guards.isDataValid).toBe('function');
      expect(implementations.delays.apiTimeout).toBe(5000);
      expect(typeof implementations.actors.fetchUserData).toBe('function');
    });
  });
});
