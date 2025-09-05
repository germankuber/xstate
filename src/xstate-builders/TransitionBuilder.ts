import { GenericTransition } from './types';

// 🎯 Builder Pattern genérico para transiciones individuales
export class GenericTransitionBuilder<TState, TAction, TGuard> {
  private transition: Partial<GenericTransition<TState, TAction, TGuard>> = {};

  static create<TState, TAction, TGuard>() {
    return new GenericTransitionBuilder<TState, TAction, TGuard>();
  }

  to(target: TState) {
    this.transition.target = target;
    return this;
  }

  withActions(...actions: TAction[]) {
    this.transition.actions = actions;
    return this;
  }

  guardedBy(guard: TGuard) {
    this.transition.guard = guard;
    return this;
  }

  withDelay(delay: string | number) {
    this.transition.delay = delay;
    return this;
  }

  describedAs(description: string) {
    this.transition.description = description;
    return this;
  }

  build(): GenericTransition<TState, TAction, TGuard> {
    return this.transition as GenericTransition<TState, TAction, TGuard>;
  }
}
