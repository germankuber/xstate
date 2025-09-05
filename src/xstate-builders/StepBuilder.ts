import { GenericStateTransitionDefinition, GenericTransition, createStateTransitions } from './types';

// 🎯 Builder Pattern genérico para Estados Completos
export class GenericStepBuilder<TState, TEvent extends string | number | symbol, TAction, TGuard> {
  private stateName: TState;
  private transitionDefinitions: GenericStateTransitionDefinition<TEvent, TState, TAction, TGuard>[] = [];

  constructor(stateName: TState) {
    this.stateName = stateName;
  }

  static create<TState, TEvent extends string | number | symbol, TAction, TGuard>(stateName: TState) {
    return new GenericStepBuilder<TState, TEvent, TAction, TGuard>(stateName);
  }

  withTransitionDefinition(event: TEvent, ...transitions: GenericTransition<TState, TAction, TGuard>[]) {
    this.transitionDefinitions.push({
      event,
      transitions
    });
    return this;
  }

  build() {
    return createStateTransitions(this.stateName, this.transitionDefinitions);
  }
}
