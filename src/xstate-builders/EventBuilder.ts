// 📨 Builder para configurar eventos
export class GenericEventBuilder {
  private eventConfig: Record<string, any> = {};

  static create() {
    return new GenericEventBuilder();
  }

  withType(type: string) {
    this.eventConfig.type = type;
    return this;
  }

  withProperty(key: string, value: any) {
    this.eventConfig[key] = value;
    return this;
  }

  // Métodos específicos para eventos comunes
  childReady() {
    this.eventConfig.type = 'CHILD_READY';
    return this;
  }

  internalUpdate() {
    this.eventConfig.type = 'INTERNAL_UPDATE';
    return this;
  }

  stopWork() {
    this.eventConfig.type = 'STOP_WORK';
    return this;
  }

  hasData() {
    this.eventConfig.type = 'hasData';
    return this;
  }

  validateData() {
    this.eventConfig.type = 'validateData';
    return this;
  }

  processData() {
    this.eventConfig.type = 'processData';
    return this;
  }

  build() {
    return { ...this.eventConfig };
  }
}
