// 🏃‍♂️ Builder para configurar opciones de spawnChild
export class GenericSpawnOptionsBuilder {
  private spawnConfig: Record<string, any> = {};

  static create() {
    return new GenericSpawnOptionsBuilder();
  }

  withId(id: string) {
    this.spawnConfig.id = id;
    return this;
  }

  withInput(input: any) {
    this.spawnConfig.input = input;
    return this;
  }

  withSystemId(systemId: string) {
    this.spawnConfig.systemId = systemId;
    return this;
  }

  withSyncSnapshot(syncSnapshot: boolean) {
    this.spawnConfig.syncSnapshot = syncSnapshot;
    return this;
  }

  withProperty(key: string, value: any) {
    this.spawnConfig[key] = value;
    return this;
  }

  build() {
    return { ...this.spawnConfig };
  }
}
