import { EmmetifierConfig } from './config/index.js';
import { getConverter } from './converters/index.js';
import { getParser } from './parsers/index.js';
import { DefaultFormat } from './types.js';

export class Emmetifier {
  constructor(format = DefaultFormat, config = null) {
    this.config = config ? EmmetifierConfig.validate(config) : new EmmetifierConfig();
    this._parser = getParser(format, this.config);
    this._converter = getConverter(format, this.config);
  }
  
  emmetify(content) {
    const contentNodes = this._parser.parse(content);
    return this._converter.convert(contentNodes);
  }
  
  static create(format = DefaultFormat, configOptions = {}) {
    return new Emmetifier(format, configOptions);
  }
}