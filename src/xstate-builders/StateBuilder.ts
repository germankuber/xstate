// 🎯 Builder genérico para definir un estado individual
export class GenericStateBuilder<TAction extends string | number | symbol> {
  private stateConfig: any = {};

  static create<TAction extends string | number | symbol>() {
    return new GenericStateBuilder<TAction>();
  }

  withEntry(...actions: TAction[]) {
    this.stateConfig.entry = actions;
    return this;
  }

  withExit(...actions: TAction[]) {
    this.stateConfig.exit = actions;
    return this;
  }

  // 🏷️ Tags Support
  withTag(tag: string) {
    if (!this.stateConfig.tags) {
      this.stateConfig.tags = [];
    }
    this.stateConfig.tags.push(tag);
    return this;
  }

  withTags(tags: string[]) {
    this.stateConfig.tags = [...(this.stateConfig.tags || []), ...tags];
    return this;
  }

  // 📝 Meta & Description Support
  withMeta(meta: Record<string, any>) {
    this.stateConfig.meta = { ...this.stateConfig.meta, ...meta };
    return this;
  }

  withDescription(description: string) {
    this.stateConfig.description = description;
    return this;
  }

  // 📤 Output Support for Final States
  withOutput(output: any) {
    this.stateConfig.output = output;
    return this;
  }

  asFinalStateWithOutput(output: any) {
    this.stateConfig.type = 'final';
    this.stateConfig.output = output;
    return this;
  }

  withTransitions(transitions: any) {
    this.stateConfig.on = transitions;
    return this;
  }

  withInvoke(invokeConfig: any) {
    console.log('🔥 STATE_BUILDER: withInvoke called with:', invokeConfig);
    this.stateConfig.invoke = invokeConfig;
    console.log('🔥 STATE_BUILDER: stateConfig after invoke:', this.stateConfig);
    return this;
  }

  // ⏰ After/Delayed transitions support
  withAfter(afterConfig: any) {
    this.stateConfig.after = afterConfig;
    return this;
  }

  // ⚡ Always transitions support
  withAlways(target: string, guard?: string) {
    if (!this.stateConfig.always) {
      this.stateConfig.always = [];
    }
    const alwaysConfig: any = { target };
    if (guard !== undefined) {
      alwaysConfig.guard = guard;
    }
    this.stateConfig.always.push(alwaysConfig);
    return this;
  }

  build() {
    console.log('🔥 STATE_BUILDER: Building final state config:', this.stateConfig);
    return this.stateConfig;
  }
}
