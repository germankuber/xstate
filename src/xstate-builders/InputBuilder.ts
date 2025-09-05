// 📥 Builder para objetos de input/configuración genéricos
export class GenericInputBuilder {
  private input: Record<string, any> = {};

  static create() {
    return new GenericInputBuilder();
  }

  withTask(task: string) {
    this.input.task = task;
    return this;
  }

  withProperty(key: string, value: any) {
    this.input[key] = value;
    return this;
  }

  withProperties(properties: Record<string, any>) {
    Object.assign(this.input, properties);
    return this;
  }

  build() {
    return { ...this.input };
  }
}

// Export common alias
export const InputBuilder = GenericInputBuilder;
