// 🎯 Builder genérico para definir la colección de guardas
export class GenericGuardsBuilder<
  TGuard extends string | number | symbol,
  TContext = any,
  TEvent = any
> {
  private guards: Record<TGuard, any> = {} as Record<TGuard, any>;

  static create<
    TGuard extends string | number | symbol,
    TContext = any,
    TEvent = any
  >() {
    return new GenericGuardsBuilder<TGuard, TContext, TEvent>();
  }

  // Para guardas que evalúan condiciones
  withGuard(
    guardName: TGuard, 
    guardImplementation: (params: { context: TContext }, event: TEvent) => boolean
  ) {
    this.guards[guardName] = guardImplementation;
    return this;
  }

  build() {
    return this.guards;
  }
}
