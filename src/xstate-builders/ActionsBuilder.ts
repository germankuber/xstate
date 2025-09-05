// 🎯 Builder genérico para definir la colección de acciones
export class GenericActionsBuilder<
  TAction extends string | number | symbol,
  TContext = any,
  TEvent = any
> {
  private actions: Record<TAction, any> = {} as Record<TAction, any>;

  static create<
    TAction extends string | number | symbol,
    TContext = any,
    TEvent = any
  >() {
    return new GenericActionsBuilder<TAction, TContext, TEvent>();
  }

  // Para acciones que NO modifican el context (efectos secundarios)
  withAction(
    actionName: TAction, 
    actionImplementation: (params: { context: TContext }, event: TEvent) => void
  ) {
    this.actions[actionName] = actionImplementation;
    return this;
  }

  // Para acciones que SÍ modifican el context (usando assign)
  withAssignAction(
    actionName: TAction,
    assignFunction: any // assign() ya maneja el tipado interno
  ) {
    this.actions[actionName] = assignFunction;
    return this;
  }

  build() {
    return this.actions;
  }
}
