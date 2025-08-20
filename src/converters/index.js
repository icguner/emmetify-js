import { DefaultFormat } from '../types.js';
import { HtmlConverter } from './html-converter.js';
import { JsonConverter } from './json-converter.js';
import { XmlConverter } from './xml-converter.js';

export { BaseConverter } from './base-converter.js';
export { HtmlConverter, HtmlConverterResult, HtmlConverterMaps } from './html-converter.js';
export { JsonConverter, JsonConverterResult, JsonConverterMaps } from './json-converter.js';
export { XmlConverter, XmlConverterResult, XmlConverterMaps } from './xml-converter.js';

export function getConverter(format, config) {
  const converters = {
    'html': new HtmlConverter(config),
    'json': new JsonConverter(config),
    'xml': new XmlConverter(config)
  };
  
  return converters[format] || converters[DefaultFormat];
}