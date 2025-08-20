export class JsonConfig {
  constructor(config = {}) {
    // Optimization options
    this.simplifyKeys = config.simplifyKeys || false;
    this.simplifyLongStrings = config.simplifyLongStrings || false;
    this.stringLengthThreshold = config.stringLengthThreshold || 20;
    this.compactArrays = config.compactArrays || false;
    this.compactObjects = config.compactObjects || false;
  }
}