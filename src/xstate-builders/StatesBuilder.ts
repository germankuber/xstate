// 🎯 Builder genérico para definir la colección de estados
export class GenericStatesBuilder<TState extends string | number | symbol> {
  private states: Record<TState, any> = {} as Record<TState, any>;

  static create<TState extends string | number | symbol>() {
    return new GenericStatesBuilder<TState>();
  }

  withState(stateName: TState, stateConfig: any) {
    this.states[stateName] = stateConfig;
    return this;
  }

  build() {
    return this.states;
  }
}
