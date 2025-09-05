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

  withInvoke(invokeConfig: any) {
    console.log('🔥 STATE_BUILDER: withInvoke called with:', invokeConfig);
    this.stateConfig.invoke = invokeConfig;
    console.log('🔥 STATE_BUILDER: stateConfig after invoke:', this.stateConfig);
    return this;
  }

  build() {
    console.log('🔥 STATE_BUILDER: Building final state config:', this.stateConfig);
    return this.stateConfig;
  }
}
