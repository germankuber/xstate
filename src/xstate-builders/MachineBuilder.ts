import { createMachine } from 'xstate';

// 🎯 Builder genérico para XState Machine
export class GenericMachineBuilder<
  TContext, 
  TEvent, 
  TState extends string | number | symbol, 
  TAction extends string | number | symbol, 
  TGuard extends string | number | symbol
> {
  private config: any = {};
  private implementations: any = {};

  constructor(id: string) {
    this.config.id = id;
  }

  static create<
    TContext, 
    TEvent, 
    TState extends string | number | symbol, 
    TAction extends string | number | symbol, 
    TGuard extends string | number | symbol
  >(id: string) {
    return new GenericMachineBuilder<TContext, TEvent, TState, TAction, TGuard>(id);
  }

  withInitialState(initialState: TState) {
    this.config.initial = initialState;
    return this;
  }

  withContext(context: TContext) {
    this.config.context = context;
    return this;
  }

  withTypes<TTypedContext = TContext, TTypedEvent = TEvent>() {
    this.config.types = {} as {
      context: TTypedContext;
      events: TTypedEvent;
    };
    return this;
  }

  withStates(states: Record<TState, any>) {
    this.config.states = states;
    return this;
  }

  withActions(actions: Record<TAction, any>) {
    this.implementations.actions = actions;
    return this;
  }

  withGuards(guards: Record<TGuard, any>) {
    this.implementations.guards = guards;
    return this;
  }

  build() {
    if (Object.keys(this.implementations).length > 0) {
      return createMachine(this.config, this.implementations);
    }
    return createMachine(this.config);
  }
}
