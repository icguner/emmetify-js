export class BaseParser {
  constructor(config) {
    this.config = config;
  }
  
  parse(content) {
    throw new Error('parse method must be implemented by subclass');
  }
}