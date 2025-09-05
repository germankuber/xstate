// 📤 Builder para configurar outputs de estados finales
export class GenericOutputBuilder {
  private outputConfig: Record<string, any> = {};

  static create() {
    return new GenericOutputBuilder();
  }

  withStatus(status: string) {
    this.outputConfig.status = status;
    return this;
  }

  withResult(result: any) {
    this.outputConfig.result = result;
    return this;
  }

  withMessage(message: string) {
    this.outputConfig.message = message;
    return this;
  }

  withCode(code: string) {
    this.outputConfig.code = code;
    return this;
  }

  withTimestamp(timestamp?: number) {
    this.outputConfig.timestamp = timestamp || Date.now();
    return this;
  }

  withProcessedItems(count: number) {
    this.outputConfig.processedItems = count;
    return this;
  }

  withDuration(duration: number) {
    this.outputConfig.duration = duration;
    return this;
  }

  withError(error: string) {
    this.outputConfig.error = error;
    return this;
  }

  withRetryable(retryable: boolean) {
    this.outputConfig.retryable = retryable;
    return this;
  }

  withProperty(key: string, value: any) {
    this.outputConfig[key] = value;
    return this;
  }

  build() {
    return { ...this.outputConfig };
  }
}
