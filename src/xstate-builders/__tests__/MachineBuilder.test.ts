// Mock createMachine from xstate ANTES del import
jest.mock('xstate', () => ({
  createMachine: jest.fn()
}));

import { createMachine } from 'xstate';
import { GenericMachineBuilder } from '../MachineBuilder';

// Get the mocked function for assertions
const mockCreateMachine = createMachine as jest.MockedFunction<typeof createMachine>;

describe('GenericMachineBuilder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Configurar el comportamiento del mock
    mockCreateMachine.mockImplementation((config, implementations) => ({
      config,
      implementations,
      _isMockMachine: true
    }) as any);
    // Suppress console.log during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Construction', () => {
    it('should create a builder with an ID', () => {
      const builder = GenericMachineBuilder.create('testMachine');
      expect(builder).toBeInstanceOf(GenericMachineBuilder);
    });

    it('should create a builder using static method', () => {
      const builder = GenericMachineBuilder.create('testMachine');
      const machine = builder.build();
      
      expect(mockCreateMachine).toHaveBeenCalledWith({ id: 'testMachine' });
      expect(machine).toBeDefined();
      expect(machine.config).toBeDefined();
      expect(machine.config.id).toBe('testMachine');
    });

    it('should create a builder using constructor', () => {
      const builder = new GenericMachineBuilder('testMachine2');
      const machine = builder.build();
      
      expect(machine.config.id).toBe('testMachine2');
    });
  });

  describe('Configuration Methods', () => {
    let builder: GenericMachineBuilder<any, any, any, any, any>;

    beforeEach(() => {
      builder = GenericMachineBuilder.create('testMachine');
    });

    it('should set initial state', () => {
      const machine = builder
        .withInitialState('idle')
        .build();
      
      expect(machine.config.initial).toBe('idle');
    });

    it('should set context', () => {
      const context = { count: 0, name: 'test' };
      const machine = builder
        .withContext(context)
        .build();
      
      expect(machine.config.context).toEqual(context);
    });

    it('should set types configuration', () => {
      const machine = builder
        .withTypes<{ count: number }, { type: 'INCREMENT' }>()
        .build();
      
      expect(machine.config).toBeDefined();
      // Types configuration is set but may not be directly accessible in the mock
    });

    it('should set states', () => {
      const states = {
        idle: { on: { START: 'running' } },
        running: { on: { STOP: 'idle' } }
      };
      
      const machine = builder
        .withStates(states)
        .build();
      
      expect(machine.config.states).toEqual(states);
    });

    it('should set actions', () => {
      const actions = {
        increment: () => {},
        decrement: () => {}
      };
      
      const machine = builder
        .withActions(actions)
        .build();
      
      expect(machine.implementations.actions).toEqual(actions);
    });

    it('should set guards', () => {
      const guards = {
        isPositive: () => true,
        isNegative: () => false
      };
      
      const machine = builder
        .withGuards(guards)
        .build();
      
      expect(machine.implementations.guards).toEqual(guards);
    });
  });

  describe('Fluent Interface', () => {
    it('should support method chaining', () => {
      const context = { count: 0 };
      const states = { idle: {}, running: {} };
      const actions = { increment: () => {} };
      const guards = { isValid: () => true };

      const machine = GenericMachineBuilder
        .create('chainTest')
        .withInitialState('idle')
        .withContext(context)
        .withTypes()
        .withStates(states)
        .withActions(actions)
        .withGuards(guards)
        .build();

      expect(machine.config.id).toBe('chainTest');
      expect(machine.config.initial).toBe('idle');
      expect(machine.config.context).toEqual(context);
      expect(machine.config.states).toEqual(states);
      expect(machine.implementations.actions).toEqual(actions);
      expect(machine.implementations.guards).toEqual(guards);
    });
  });

  describe('Build Process', () => {
    it('should build machine without implementations', () => {
      const { createMachine } = require('xstate');
      
      const machine = GenericMachineBuilder
        .create('simpleTest')
        .withInitialState('idle')
        .build();

      expect(createMachine).toHaveBeenCalledWith({
        id: 'simpleTest',
        initial: 'idle'
      });
      expect(createMachine).toHaveBeenCalledTimes(1);
    });

    it('should build machine with implementations', () => {
      const { createMachine } = require('xstate');
      const actions = { test: () => {} };
      
      const machine = GenericMachineBuilder
        .create('withImplementations')
        .withInitialState('idle')
        .withActions(actions)
        .build();

      expect(createMachine).toHaveBeenCalledWith(
        { id: 'withImplementations', initial: 'idle' },
        { actions }
      );
    });

    it('should handle complex configuration', () => {
      const { createMachine } = require('xstate');
      
      const context = { step: 1, data: null };
      const states = {
        step1: { on: { NEXT: 'step2' } },
        step2: { on: { PREV: 'step1', FINISH: 'done' } },
        done: { type: 'final' }
      };
      const actions = {
        saveData: () => {},
        resetStep: () => {}
      };
      const guards = {
        canProceed: () => true,
        hasData: () => false
      };

      const machine = GenericMachineBuilder
        .create('complexMachine')
        .withInitialState('step1')
        .withContext(context)
        .withStates(states)
        .withActions(actions)
        .withGuards(guards)
        .build();

      expect(createMachine).toHaveBeenCalledWith(
        {
          id: 'complexMachine',
          initial: 'step1',
          context,
          states
        },
        {
          actions,
          guards
        }
      );
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for states', () => {
      type TestStates = 'idle' | 'loading' | 'success' | 'error';
      type TestActions = 'startLoading' | 'saveData' | 'clearError';
      type TestGuards = 'isValid' | 'hasPermission';
      
      const builder = GenericMachineBuilder.create<
        { count: number },
        { type: 'TEST' },
        TestStates,
        TestActions,
        TestGuards
      >('typedMachine');

      // These should not cause TypeScript errors
      const machine = builder
        .withInitialState('idle')
        .withContext({ count: 0 })
        .build();

      expect(machine.config.id).toBe('typedMachine');
    });
  });
});
