import { GenericActorsBuilder } from '../ActorsBuilder';

describe('GenericActorsBuilder', () => {
  let builder: GenericActorsBuilder;

  beforeEach(() => {
    builder = GenericActorsBuilder.create();
  });

  describe('Basic Construction', () => {
    it('should create an actors builder', () => {
      expect(builder).toBeInstanceOf(GenericActorsBuilder);
    });

    it('should build an empty actors object by default', () => {
      const result = builder.build();
      expect(result).toEqual({});
    });
  });

  describe('Actor Configuration', () => {
    it('should add a single actor', () => {
      const mockActor = async () => ({ data: 'test' });
      
      const result = builder
        .withActor('testActor', mockActor)
        .build();

      expect(result).toEqual({
        testActor: mockActor
      });
    });

    it('should add multiple actors', () => {
      const mockActor1 = async () => ({ data: 'test1' });
      const mockActor2 = async () => ({ data: 'test2' });
      
      const result = builder
        .withActor('actor1', mockActor1)
        .withActor('actor2', mockActor2)
        .build();

      expect(result).toEqual({
        actor1: mockActor1,
        actor2: mockActor2
      });
    });

    it('should overwrite existing actor', () => {
      const mockActor1 = async () => ({ data: 'test1' });
      const mockActor2 = async () => ({ data: 'test2' });
      
      const result = builder
        .withActor('testActor', mockActor1)
        .withActor('testActor', mockActor2)  // Should overwrite
        .build();

      expect(result).toEqual({
        testActor: mockActor2
      });
    });
  });

  describe('Convenience Methods', () => {
    it('should add fetchUserData actor using convenience method', () => {
      const mockFetchUserData = async () => ({ user: 'data' });
      
      const result = builder
        .withFetchUserData(mockFetchUserData)
        .build();

      expect(result).toEqual({
        fetchUserData: mockFetchUserData
      });
    });

    it('should add fetchData actor using convenience method', () => {
      const mockFetchData = async () => ({ data: 'fetched' });
      
      const result = builder
        .withFetchData(mockFetchData)
        .build();

      expect(result).toEqual({
        fetchData: mockFetchData
      });
    });

    it('should add promise actor using convenience method', () => {
      const mockPromiseActor = Promise.resolve({ result: 'success' });
      
      const result = builder
        .withPromiseActor('promiseActor', mockPromiseActor)
        .build();

      expect(result).toEqual({
        promiseActor: mockPromiseActor
      });
    });

    it('should add service actor using convenience method', () => {
      const mockServiceActor = { type: 'service', src: 'serviceFunction' };
      
      const result = builder
        .withServiceActor('serviceActor', mockServiceActor)
        .build();

      expect(result).toEqual({
        serviceActor: mockServiceActor
      });
    });
  });

  describe('Bulk Actor Configuration', () => {
    it('should add multiple actors at once using withActors', () => {
      const actors = {
        actor1: async () => ({ data: 'test1' }),
        actor2: async () => ({ data: 'test2' }),
        actor3: async () => ({ data: 'test3' })
      };
      
      const result = builder
        .withActors(actors)
        .build();

      expect(result).toEqual(actors);
    });

    it('should merge with existing actors when using withActors', () => {
      const existingActor = async () => ({ data: 'existing' });
      const newActors = {
        actor1: async () => ({ data: 'new1' }),
        actor2: async () => ({ data: 'new2' })
      };
      
      const result = builder
        .withActor('existingActor', existingActor)
        .withActors(newActors)
        .build();

      expect(result).toEqual({
        existingActor: existingActor,
        ...newActors
      });
    });

    it('should overwrite existing actors when using withActors', () => {
      const originalActor = async () => ({ data: 'original' });
      const newActor = async () => ({ data: 'new' });
      
      const result = builder
        .withActor('testActor', originalActor)
        .withActors({ testActor: newActor })
        .build();

      expect(result).toEqual({
        testActor: newActor
      });
    });
  });

  describe('Fluent Interface', () => {
    it('should support method chaining', () => {
      const actor1 = async () => ({ data: 'test1' });
      const actor2 = async () => ({ data: 'test2' });
      const actor3 = async () => ({ data: 'test3' });
      
      const result = builder
        .withActor('actor1', actor1)
        .withFetchUserData(actor2)
        .withPromiseActor('actor3', actor3)
        .build();

      expect(result).toEqual({
        actor1: actor1,
        fetchUserData: actor2,
        actor3: actor3
      });
    });

    it('should handle complex actor configuration', () => {
      const fetchUser = async (id: string) => ({ id, name: `User ${id}` });
      const saveUser = async (user: any) => ({ saved: true, user });
      const deleteUser = async (id: string) => ({ deleted: true, id });
      
      const result = builder
        .withActor('fetchUser', fetchUser)
        .withActor('saveUser', saveUser)
        .withActor('deleteUser', deleteUser)
        .withFetchData(async () => ({ data: 'general' }))
        .build();

      expect(result).toEqual({
        fetchUser: fetchUser,
        saveUser: saveUser,
        deleteUser: deleteUser,
        fetchData: expect.any(Function)
      });
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for actor names and implementations', () => {
      const stringActor = async () => 'string result';
      const objectActor = async () => ({ result: 'object' });
      const numberActor = async () => 42;
      
      const result = builder
        .withActor('stringActor', stringActor)
        .withActor('objectActor', objectActor)
        .withActor('numberActor', numberActor)
        .build();

      expect(typeof result.stringActor).toBe('function');
      expect(typeof result.objectActor).toBe('function');
      expect(typeof result.numberActor).toBe('function');
    });
  });

  describe('Real World Usage Patterns', () => {
    it('should handle typical XState v5 actor patterns', () => {
      const fetchUserData = async (context: any) => {
        const response = await fetch(`/api/users/${context.userId}`);
        return response.json();
      };

      const saveUserPreferences = async (context: any, event: any) => {
        const response = await fetch('/api/preferences', {
          method: 'POST',
          body: JSON.stringify({ ...context.preferences, ...event.data })
        });
        return response.json();
      };

      const validateUserSession = async (context: any) => {
        const response = await fetch('/api/validate-session', {
          headers: { Authorization: `Bearer ${context.token}` }
        });
        return response.ok;
      };

      const result = builder
        .withFetchUserData(fetchUserData)
        .withActor('savePreferences', saveUserPreferences)
        .withActor('validateSession', validateUserSession)
        .build();

      expect(result).toEqual({
        fetchUserData: fetchUserData,
        savePreferences: saveUserPreferences,
        validateSession: validateUserSession
      });
    });

    it('should handle service actors and promise actors together', () => {
      const serviceActor = { type: 'service', src: 'userService' };
      const promiseActor = Promise.resolve({ data: 'promise data' });
      const functionActor = async () => ({ data: 'function data' });

      const result = builder
        .withServiceActor('userService', serviceActor)
        .withPromiseActor('dataPromise', promiseActor)
        .withActorFunction('dataFunction', functionActor)
        .build();

      expect(result).toEqual({
        userService: serviceActor,
        dataPromise: promiseActor,
        dataFunction: functionActor
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined actors', () => {
      const result = builder
        .withActor('nullActor', null)
        .withActor('undefinedActor', undefined)
        .build();

      expect(result).toEqual({
        nullActor: null,
        undefinedActor: undefined
      });
    });

    it('should handle empty actor configurations', () => {
      const result = builder
        .withActors({})
        .build();

      expect(result).toEqual({});
    });

    it('should handle complex nested actor data', () => {
      const complexActor = {
        type: 'complex',
        config: {
          retries: 3,
          timeout: 5000,
          transform: (data: any) => ({ processed: data })
        },
        handlers: {
          onSuccess: () => console.log('Success'),
          onError: () => console.log('Error')
        }
      };

      const result = builder
        .withActor('complexActor', complexActor)
        .build();

      expect(result).toEqual({
        complexActor: complexActor
      });
    });
  });
});
