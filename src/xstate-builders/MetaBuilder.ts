// 📝 Builder para configurar metadata de estados
export class GenericMetaBuilder {
  private metaConfig: Record<string, any> = {};

  static create() {
    return new GenericMetaBuilder();
  }

  withComponent(component: string) {
    this.metaConfig.component = component;
    return this;
  }

  withTimeout(timeout: number) {
    this.metaConfig.timeout = timeout;
    return this;
  }

  withLevel(level: string) {
    this.metaConfig.level = level;
    return this;
  }

  withProperty(key: string, value: any) {
    this.metaConfig[key] = value;
    return this;
  }

  withComplexity(complexity: string) {
    this.metaConfig.complexity = complexity;
    return this;
  }

  withView(view: string) {
    this.metaConfig.view = view;
    return this;
  }

  withPriority(priority: string) {
    this.metaConfig.priority = priority;
    return this;
  }

  withType(type: string) {
    this.metaConfig.type = type;
    return this;
  }

  build() {
    return { ...this.metaConfig };
  }
}
