// 🎯 Builder genérico para el patrón .provide() de XState
export class GenericProvideBuilder<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TState extends string | number | symbol,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TAction extends string | number | symbol,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TGuard extends string | number | symbol,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TDelay extends string | number | symbol,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TContext = any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TEvent = any
> {
  private implementations: any = {};

  static create<
    TState extends string | number | symbol,
    TAction extends string | number | symbol,
    TGuard extends string | number | symbol,
    TDelay extends string | number | symbol,
    TContext = any,
    TEvent = any
  >() {
    return new GenericProvideBuilder<TState, TAction, TGuard, TDelay, TContext, TEvent>();
  }

  // Proporcionar implementaciones de acciones
  withActions(actionsConfig: Record<string, any>) {
    this.implementations.actions = actionsConfig;
    return this;
  }

  // Proporcionar implementaciones de guardas
  withGuards(guardsConfig: Record<string, any>) {
    this.implementations.guards = guardsConfig;
    return this;
  }

  // Proporcionar implementaciones de delays
  withDelays(delaysConfig: Record<string, any>) {
    this.implementations.delays = delaysConfig;
    return this;
  }

  // Proporcionar implementaciones de actores
  withActors(actorsConfig: Record<string, any>) {
    this.implementations.actors = actorsConfig;
    return this;
  }

  build() {
    return this.implementations;
  }
}
