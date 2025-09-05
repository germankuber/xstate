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
    console.log('🏗️ [MACHINE_BUILDER] Building machine with config:', this.config);
    console.log('🏗️ [MACHINE_BUILDER] Implementations:', this.implementations);
    
    if (Object.keys(this.implementations).length > 0) {
      const machine = createMachine(this.config, this.implementations);
      console.log('🏗️ [MACHINE_BUILDER] Created machine with implementations:', machine);
      return machine;
    }
    const machine = createMachine(this.config);
    console.log('🏗️ [MACHINE_BUILDER] Created machine without implementations:', machine);
    return machine;
  }
}
