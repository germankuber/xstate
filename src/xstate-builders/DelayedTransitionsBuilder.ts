// ⏰ Builder para transiciones con delay (after)
export class GenericDelayedTransitionsBuilder<TAction extends string | number | symbol> {
  private afterConfig: Record<string | number, any> = {};

  static create<TAction extends string | number | symbol>() {
    return new GenericDelayedTransitionsBuilder<TAction>();
  }

  // ⏰ Basic delayed transition
  after(delay: number | string, target: string) {
    this.afterConfig[delay] = { target };
    return this;
  }

  // ⏰ Delayed transition with actions
  afterWithActions(delay: number | string, actions: TAction[], target?: string) {
    const config: any = { actions };
    if (target) {
      config.target = target;
    }
    this.afterConfig[delay] = config;
    return this;
  }

  // ⏰ Delayed transition with guard
  afterWithGuard(delay: number | string, guard: string, target: string) {
    this.afterConfig[delay] = { 
      target,
      guard 
    };
    return this;
  }

  // ⏰ Delayed transition with actions and guard
  afterWithActionsAndGuard(
    delay: number | string, 
    actions: TAction[], 
    guard: string, 
    target?: string
  ) {
    const config: any = { actions, guard };
    if (target) {
      config.target = target;
    }
    this.afterConfig[delay] = config;
    return this;
  }

  build() {
    return this.afterConfig;
  }
}

// Export alias for convenience
export const DelayedTransitionsBuilder = GenericDelayedTransitionsBuilder;
