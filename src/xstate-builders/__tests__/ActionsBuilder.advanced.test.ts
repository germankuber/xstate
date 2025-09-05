// 🧪 Tests para nuevas funcionalidades de ActionsBuilder
import { GenericActionsBuilder } from '../ActionsBuilder';

describe('ActionsBuilder - Advanced Action Features', () => {
  let builder: GenericActionsBuilder<string, any, any>;

  beforeEach(() => {
    builder = GenericActionsBuilder.create<string, any, any>();
  });

  describe('🏃‍♂️ spawnChild Action Support', () => {
    it('should create spawnChild action with actor string', () => {
      builder.withSpawnChildAction('spawnWorker', 'workerMachine');
      const actions = builder.build();
      
      const context = { count: 0 };
      const event = { type: 'SPAWN' };
      const result = actions.spawnWorker(context, event);
      
      expect(result).toEqual({
        type: 'xstate.spawnChild',
        params: {
          src: 'workerMachine'
        }
      });
    });

    it('should create spawnChild action with options', () => {
      const options = { 
        id: 'worker-1', 
        input: { data: 'test' }, 
        systemId: 'system-worker' 
      };
      
      builder.withSpawnChildAction('spawnWorkerWithOptions', 'workerMachine', options);
      const actions = builder.build();
      
      const result = actions.spawnWorkerWithOptions({}, {});
      
      expect(result).toEqual({
        type: 'xstate.spawnChild',
        params: {
          src: 'workerMachine',
          id: 'worker-1',
          input: { data: 'test' },
          systemId: 'system-worker'
        }
      });
    });

    it('should create spawnChild action with actor object', () => {
      const actorLogic = { type: 'promise', src: async () => 'result' };
      
      builder.withSpawnChildAction('spawnPromise', actorLogic, { id: 'promise-1' });
      const actions = builder.build();
      
      const result = actions.spawnPromise({}, {});
      
      expect(result).toEqual({
        type: 'xstate.spawnChild',
        params: {
          src: actorLogic,
          id: 'promise-1'
        }
      });
    });
  });

  describe('⬆️ sendParent Action Support', () => {
    it('should create sendParent action', () => {
      const event = { type: 'NOTIFY_PARENT', data: 'important' };
      
      builder.withSendParentAction('notifyParent', event);
      const actions = builder.build();
      
      const result = actions.notifyParent({}, {});
      
      expect(result).toEqual({
        type: 'xstate.sendParent',
        event: event
      });
    });

    it('should create sendParent action with simple event', () => {
      builder.withSendParentAction('simpleNotify', { type: 'DONE' });
      const actions = builder.build();
      
      const result = actions.simpleNotify({}, {});
      
      expect(result).toEqual({
        type: 'xstate.sendParent',
        event: { type: 'DONE' }
      });
    });
  });

  describe('🚦 Cancel Action Support', () => {
    it('should create cancel action', () => {
      builder.withCancelAction('cancelTimeout', 'timeout-id');
      const actions = builder.build();
      
      const result = actions.cancelTimeout({}, {});
      
      expect(result).toEqual({
        type: 'xstate.cancel',
        id: 'timeout-id'
      });
    });

    it('should create multiple cancel actions', () => {
      builder
        .withCancelAction('cancelFirst', 'first-id')
        .withCancelAction('cancelSecond', 'second-id');
      
      const actions = builder.build();
      
      expect(actions.cancelFirst({}, {})).toEqual({
        type: 'xstate.cancel',
        id: 'first-id'
      });
      
      expect(actions.cancelSecond({}, {})).toEqual({
        type: 'xstate.cancel',
        id: 'second-id'
      });
    });
  });

  describe('🔧 enqueueActions Support', () => {
    it('should create enqueueActions action', () => {
      const enqueueCallback = jest.fn();
      
      builder.withEnqueueActionsAction('complexAction', enqueueCallback);
      const actions = builder.build();
      
      const context = { value: 42 };
      const event = { type: 'COMPLEX' };
      const result = actions.complexAction(context, event);
      
      expect(result).toEqual({
        type: 'xstate.enqueueActions',
        callback: enqueueCallback
      });
    });

    it('should create enqueueActions with specific callback', () => {
      const mockEnqueue = jest.fn();
      const mockCheck = jest.fn();
      
      const enqueueCallback = ({ enqueue, check }: any) => {
        if (check({ type: 'isValid' })) {
          enqueue({ type: 'processData' });
        }
      };
      
      builder.withEnqueueActionsAction('conditionalAction', enqueueCallback);
      const actions = builder.build();
      
      const result = actions.conditionalAction({}, {});
      
      expect(result.type).toBe('xstate.enqueueActions');
      expect(typeof result.callback).toBe('function');
    });
  });

  describe('📤 raise Action Support', () => {
    it('should create raise action', () => {
      const eventToRaise = { type: 'INTERNAL_EVENT', data: 'test' };
      
      builder.withRaiseAction('raiseInternal', eventToRaise);
      const actions = builder.build();
      
      const result = actions.raiseInternal({}, {});
      
      expect(result).toEqual({
        type: 'xstate.raise',
        event: eventToRaise
      });
    });

    it('should create raise action with delay and id', () => {
      const eventToRaise = { type: 'DELAYED_EVENT' };
      const options = { delay: 1000, id: 'delayed-raise' };
      
      builder.withRaiseAction('raiseDelayed', eventToRaise, options);
      const actions = builder.build();
      
      const result = actions.raiseDelayed({}, {});
      
      expect(result).toEqual({
        type: 'xstate.raise',
        event: eventToRaise,
        delay: 1000,
        id: 'delayed-raise'
      });
    });
  });

  describe('📨 sendTo Action Support', () => {
    it('should create sendTo action', () => {
      const target = 'child-actor';
      const event = { type: 'CHILD_EVENT', payload: 'data' };
      
      builder.withSendToAction('sendToChild', target, event);
      const actions = builder.build();
      
      const result = actions.sendToChild({}, {});
      
      expect(result).toEqual({
        type: 'xstate.sendTo',
        target: target,
        event: event
      });
    });

    it('should create sendTo action with options', () => {
      const target = 'remote-service';
      const event = { type: 'API_CALL' };
      const options = { delay: 500, id: 'api-call' };
      
      builder.withSendToAction('sendToService', target, event, options);
      const actions = builder.build();
      
      const result = actions.sendToService({}, {});
      
      expect(result).toEqual({
        type: 'xstate.sendTo',
        target: target,
        event: event,
        delay: 500,
        id: 'api-call'
      });
    });

    it('should create sendTo action with actor reference target', () => {
      const actorRef = { send: jest.fn(), id: 'actor-ref' };
      const event = { type: 'REF_EVENT' };
      
      builder.withSendToAction('sendToRef', actorRef, event);
      const actions = builder.build();
      
      const result = actions.sendToRef({}, {});
      
      expect(result).toEqual({
        type: 'xstate.sendTo',
        target: actorRef,
        event: event
      });
    });
  });

  describe('🔄 Combined Advanced Actions', () => {
    it('should support multiple advanced action types', () => {
      builder
        .withSpawnChildAction('spawn', 'worker', { id: 'w1' })
        .withSendParentAction('notify', { type: 'STATUS' })
        .withCancelAction('cancel', 'timer-1')
        .withRaiseAction('raise', { type: 'INTERNAL' })
        .withSendToAction('send', 'target', { type: 'MSG' });
      
      const actions = builder.build();
      
      expect(Object.keys(actions)).toEqual([
        'spawn', 'notify', 'cancel', 'raise', 'send'
      ]);
      
      // Test each action returns correct structure
      expect(actions.spawn({}, {}).type).toBe('xstate.spawnChild');
      expect(actions.notify({}, {}).type).toBe('xstate.sendParent');
      expect(actions.cancel({}, {}).type).toBe('xstate.cancel');
      expect(actions.raise({}, {}).type).toBe('xstate.raise');
      expect(actions.send({}, {}).type).toBe('xstate.sendTo');
    });

    it('should work with existing action methods', () => {
      const mockAssignFunction = jest.fn();
      const mockSideEffectAction = jest.fn();
      
      builder
        .withAction('sideEffect', mockSideEffectAction)
        .withAssignAction('assign', mockAssignFunction)
        .withSpawnChildAction('spawn', 'child')
        .withEnqueueActionsAction('enqueue', () => {});
      
      const actions = builder.build();
      
      expect(Object.keys(actions)).toEqual([
        'sideEffect', 'assign', 'spawn', 'enqueue'
      ]);
      
      expect(typeof actions.sideEffect).toBe('function');
      expect(actions.assign).toBe(mockAssignFunction);
      expect(actions.spawn({}, {}).type).toBe('xstate.spawnChild');
      expect(actions.enqueue({}, {}).type).toBe('xstate.enqueueActions');
    });
  });

  describe('🛠️ Edge Cases', () => {
    it('should handle undefined options in spawnChild', () => {
      builder.withSpawnChildAction('spawn', 'actor', undefined);
      const actions = builder.build();
      
      const result = actions.spawn({}, {});
      
      expect(result).toEqual({
        type: 'xstate.spawnChild',
        params: {
          src: 'actor'
        }
      });
    });

    it('should handle empty options object in spawnChild', () => {
      builder.withSpawnChildAction('spawn', 'actor', {});
      const actions = builder.build();
      
      const result = actions.spawn({}, {});
      
      expect(result).toEqual({
        type: 'xstate.spawnChild',
        params: {
          src: 'actor'
        }
      });
    });

    it('should handle undefined options in raise and sendTo', () => {
      builder
        .withRaiseAction('raise', { type: 'EVENT' }, undefined)
        .withSendToAction('send', 'target', { type: 'MSG' }, undefined);
      
      const actions = builder.build();
      
      expect(actions.raise({}, {})).toEqual({
        type: 'xstate.raise',
        event: { type: 'EVENT' }
      });
      
      expect(actions.send({}, {})).toEqual({
        type: 'xstate.sendTo',
        target: 'target',
        event: { type: 'MSG' }
      });
    });
  });
});
