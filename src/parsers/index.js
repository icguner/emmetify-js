import { DefaultFormat } from '../types.js';
import { HtmlParser } from './html-parser.js';
import { JsonParser } from './json-parser.js';
import { XmlParser } from './xml-parser.js';

export { BaseParser } from './base-parser.js';
export { HtmlParser } from './html-parser.js';
export { JsonParser } from './json-parser.js';
export { XmlParser } from './xml-parser.js';

export function getParser(format, config) {
  const parsers = {
    'html': new HtmlParser(config),
    'json': new JsonParser(config),
    'xml': new XmlParser(config)
  };
  
  return parsers[format] || parsers[DefaultFormat];
}