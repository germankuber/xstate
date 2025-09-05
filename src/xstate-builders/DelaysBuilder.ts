// 🎯 Builder genérico para definir delays (temporizadores)
export class GenericDelaysBuilder<
  TDelay extends string | number | symbol,
  TContext = any,
  TEvent = any
> {
  private delaysConfig: Record<string, any> = {};

  static create<
    TDelay extends string | number | symbol,
    TContext = any,
    TEvent = any
  >() {
    return new GenericDelaysBuilder<TDelay, TContext, TEvent>();
  }

  // Agregar un delay con valor fijo (en milisegundos)
  withDelay(delayName: TDelay, milliseconds: number) {
    this.delaysConfig[delayName as string] = milliseconds;
    return this;
  }

  // Agregar un delay con función dinámica
  withDynamicDelay(
    delayName: TDelay, 
    delayFunction: (context: TContext, event: TEvent, state?: any) => number
  ) {
    this.delaysConfig[delayName as string] = delayFunction;
    return this;
  }

  // Agregar un delay con string (referencia a otro delay)
  withDelayReference(delayName: TDelay, reference: string) {
    this.delaysConfig[delayName as string] = reference;
    return this;
  }

  build() {
    return this.delaysConfig;
  }
}
