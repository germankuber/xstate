// 🎯 Builder genérico para definir un estado individual
export class GenericStateBuilder<TAction extends string | number | symbol> {
  private stateConfig: any = {};

  static create<TAction extends string | number | symbol>() {
    return new GenericStateBuilder<TAction>();
  }

  withEntry(...actions: TAction[]) {
    this.stateConfig.entry = actions;
    return this;
  }

  withExit(...actions: TAction[]) {
    this.stateConfig.exit = actions;
    return this;
  }

  withTransitions(transitions: any) {
    this.stateConfig.on = transitions;
    return this;
  }

  build() {
    return this.stateConfig;
  }
}
