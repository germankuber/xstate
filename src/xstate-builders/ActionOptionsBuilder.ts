// 🎛️ Builder para opciones de acciones (delay, id, etc.)
export class GenericActionOptionsBuilder {
  private options: Record<string, any> = {};

  static create() {
    return new GenericActionOptionsBuilder();
  }

  withDelay(delay: number) {
    this.options.delay = delay;
    return this;
  }

  withId(id: string) {
    this.options.id = id;
    return this;
  }

  withProperty(key: string, value: any) {
    this.options[key] = value;
    return this;
  }

  build() {
    return { ...this.options };
  }
}

// Export common alias
export const ActionOptionsBuilder = GenericActionOptionsBuilder;
