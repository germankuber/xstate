// 🎭 Builder para configurar actors de forma estructurada
export class GenericActorsBuilder {
  private actors: Record<string, any> = {};

  static create() {
    return new GenericActorsBuilder();
  }

  withActor(name: string, actor: any) {
    this.actors[name] = actor;
    return this;
  }

  withFetchUserData(actor: any) {
    this.actors.fetchUserData = actor;
    return this;
  }

  withFetchData(actor: any) {
    this.actors.fetchData = actor;
    return this;
  }

  withActorFunction(name: string, actorFunction: any) {
    this.actors[name] = actorFunction;
    return this;
  }

  withPromiseActor(name: string, promiseActor: any) {
    this.actors[name] = promiseActor;
    return this;
  }

  withServiceActor(name: string, serviceActor: any) {
    this.actors[name] = serviceActor;
    return this;
  }

  // Method for adding multiple actors at once while maintaining builder pattern
  withActors(actorsConfig: Record<string, any>) {
    Object.assign(this.actors, actorsConfig);
    return this;
  }

  build() {
    return { ...this.actors };
  }
}

// Export common alias
export const ActorsBuilder = GenericActorsBuilder;
