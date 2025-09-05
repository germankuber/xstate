// 🎯 Builder genérico para definir la colección de acciones
export class GenericActionsBuilder<
  TAction extends string | number | symbol,
  TContext = any,
  TEvent = any
> {
  private actions: Record<TAction, any> = {} as Record<TAction, any>;

  static create<
    TAction extends string | number | symbol,
    TContext = any,
    TEvent = any
  >() {
    return new GenericActionsBuilder<TAction, TContext, TEvent>();
  }

  // Para acciones que NO modifican el context (efectos secundarios)
  withAction(
    actionName: TAction, 
    actionImplementation: (params: { context: TContext }, event: TEvent, state?: any) => void
  ) {
    this.actions[actionName] = actionImplementation;
    return this;
  }

  // Para acciones que SÍ modifican el context (usando assign)
  withAssignAction(
    actionName: TAction,
    assignFunction: any // assign() ya maneja el tipado interno
  ) {
    this.actions[actionName] = assignFunction;
    return this;
  }

  // 🏃‍♂️ spawnChild Action Support
  withSpawnChildAction(
    actionName: TAction,
    actor: string | any,
    options?: { id?: string; input?: any; systemId?: string }
  ) {
    this.actions[actionName] = (context: TContext, event: TEvent) => {
      // Return spawnChild action object that XState will interpret
      return {
        type: 'xstate.spawnChild',
        actor,
        ...options
      };
    };
    return this;
  }

  // ⬆️ sendParent Action Support
  withSendParentAction(
    actionName: TAction,
    event: any
  ) {
    this.actions[actionName] = () => {
      return {
        type: 'xstate.sendParent',
        event
      };
    };
    return this;
  }

  // 🚦 Cancel Action Support
  withCancelAction(
    actionName: TAction,
    id: string
  ) {
    this.actions[actionName] = () => {
      return {
        type: 'xstate.cancel',
        id
      };
    };
    return this;
  }

  // 🔧 enqueueActions Support
  withEnqueueActionsAction(
    actionName: TAction,
    enqueueCallback: (helpers: any) => void
  ) {
    this.actions[actionName] = (context: TContext, event: TEvent) => {
      return {
        type: 'xstate.enqueueActions',
        callback: enqueueCallback
      };
    };
    return this;
  }

  // 📤 raise Action Support
  withRaiseAction(
    actionName: TAction,
    eventToRaise: any,
    options?: { delay?: number; id?: string }
  ) {
    this.actions[actionName] = () => {
      return {
        type: 'xstate.raise',
        event: eventToRaise,
        ...options
      };
    };
    return this;
  }

  // 📨 sendTo Action Support
  withSendToAction(
    actionName: TAction,
    target: string | any,
    event: any,
    options?: { delay?: number; id?: string }
  ) {
    this.actions[actionName] = () => {
      return {
        type: 'xstate.sendTo',
        target,
        event,
        ...options
      };
    };
    return this;
  }

  build() {
    return this.actions;
  }
}
