// 🎯 Builder genérico para definir invocaciones (actores)
export class GenericInvokeBuilder<
  TState extends string | number | symbol,
  TAction extends string | number | symbol,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TContext = any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TEvent = any
> {
  private invokeConfig: any = {};

  static create<
    TState extends string | number | symbol,
    TAction extends string | number | symbol,
    TContext = any,
    TEvent = any
  >() {
    return new GenericInvokeBuilder<TState, TAction, TContext, TEvent>();
  }

  // Define la fuente del actor (función, promesa, otra máquina, etc.)
  withSource(src: string | (() => Promise<any>)) {
    console.log('🎭 [INVOKE_BUILDER] withSource called with:', {
      src: src,
      type: typeof src,
      isFunction: typeof src === 'function'
    });
    this.invokeConfig.src = src;
    return this;
  }

  // Define el ID del invoke para XState v5
  withId(id: string) {
    console.log('🆔 [INVOKE_BUILDER] withId called with:', id);
    this.invokeConfig.id = id;
    return this;
  }

  // Define qué hacer cuando el actor termina exitosamente
  onDone(target?: TState, actions?: TAction | TAction[]) {
    this.invokeConfig.onDone = {};
    if (target) {
      this.invokeConfig.onDone.target = target;
    }
    if (actions) {
      this.invokeConfig.onDone.actions = Array.isArray(actions) ? actions : [actions];
    }
    return this;
  }

  // Define qué hacer cuando el actor falla
  onError(target?: TState, actions?: TAction | TAction[]) {
    this.invokeConfig.onError = {};
    if (target) {
      this.invokeConfig.onError.target = target;
    }
    if (actions) {
      this.invokeConfig.onError.actions = Array.isArray(actions) ? actions : [actions];
    }
    return this;
  }

  // Para casos más avanzados, permite definir el onDone/onError completo
  withOnDone(onDoneConfig: any) {
    this.invokeConfig.onDone = onDoneConfig;
    return this;
  }

  withOnError(onErrorConfig: any) {
    this.invokeConfig.onError = onErrorConfig;
    return this;
  }

  build() {
    console.log('🔥 INVOKE_BUILDER: Building invoke config:', this.invokeConfig);
    return this.invokeConfig;
  }
}
