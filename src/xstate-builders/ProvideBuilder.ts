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
    // También agregar como services para compatibilidad con XState v5
    this.implementations.services = actorsConfig;
    return this;
  }

  build() {
    console.log('🔧 [PROVIDE_BUILDER] Configuración final:', this.implementations);
    console.log('🔧 [PROVIDE_BUILDER] Actions específicas:', this.implementations.actions);
    console.log('🔧 [PROVIDE_BUILDER] Action keys:', Object.keys(this.implementations.actions || {}));
    console.log('🔧 [PROVIDE_BUILDER] ¿saveApiData existe?:', 'saveApiData' in (this.implementations.actions || {}));
    return this.implementations;
  }
}
