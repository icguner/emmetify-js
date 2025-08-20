import { Emmetifier } from './emmetifier.js';
import { EmmetifierConfig, HtmlConfig, HtmlAttributesPriority, JsonConfig, XmlConfig } from './config/index.js';

export { Emmetifier } from './emmetifier.js';
export { EmmetifierConfig, HtmlConfig, HtmlAttributesPriority, JsonConfig, XmlConfig } from './config/index.js';
export { 
  HtmlConverterResult, HtmlConverterMaps,
  JsonConverterResult, JsonConverterMaps,
  XmlConverterResult, XmlConverterMaps
} from './converters/index.js';

export function emmetifyHtml(content, format = 'html', options = {}) {
  const emmetifier = new Emmetifier(format, options);
  return emmetifier.emmetify(content);
}

export function emmetifyCompactHtml(content) {
  const emmetifier = new Emmetifier('html', {
    html: {
      skipTags: true,
      prioritizeAttributes: true,
      simplifyClasses: true,
      simplifyImages: true,
      simplifyRelativeLinks: false,
      simplifyAbsoluteLinks: true
    }
  });
  return emmetifier.emmetify(content);
}

export function emmetifyJson(content, options = {}) {
  const emmetifier = new Emmetifier('json', options);
  return emmetifier.emmetify(content);
}

export function emmetifyCompactJson(content) {
  const emmetifier = new Emmetifier('json', {
    json: {
      simplifyKeys: true,
      simplifyLongStrings: true,
      compactArrays: true,
      compactObjects: true
    }
  });
  return emmetifier.emmetify(content);
}

export function emmetifyXml(content, options = {}) {
  const emmetifier = new Emmetifier('xml', options);
  return emmetifier.emmetify(content);
}

export function emmetifyCompactXml(content) {
  const emmetifier = new Emmetifier('xml', {
    xml: {
      simplifyNamespaces: true,
      simplifyLongAttributes: true,
      skipComments: true
    }
  });
  return emmetifier.emmetify(content);
}

export default {
  Emmetifier,
  EmmetifierConfig,
  HtmlConfig,
  HtmlAttributesPriority,
  JsonConfig,
  XmlConfig,
  emmetifyHtml,
  emmetifyCompactHtml,
  emmetifyJson,
  emmetifyCompactJson,
  emmetifyXml,
  emmetifyCompactXml
};