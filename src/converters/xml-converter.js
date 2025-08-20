import { BaseConverter } from './base-converter.js';
import { SingleTokenNames } from '../utils/tokens.js';

export class XmlConverterMaps {
  constructor(namespaces, attributes) {
    this.namespaces = namespaces;
    this.attributes = attributes;
  }
}

export class XmlConverterResult {
  constructor(result, maps) {
    this.result = result;
    this.maps = maps;
  }
}

export class XmlConverter extends BaseConverter {
  constructor(config) {
    super(config);
    this.singleTokenNames = new SingleTokenNames();
    this.namespacesMap = {};
    this.attributesMap = {};
  }
  
  _escapeText(text) {
    const escaped = text
      .replace(/\\/g, '\\\\')
      .replace(/\*/g, '\\*')
      .replace(/\$/g, '\\$');
    return escaped.split(/\s+/).join(' ');
  }
  
  _simplifyNamespace(namespace) {
    if (this.config.xml && this.config.xml.simplifyNamespaces) {
      if (!this.namespacesMap[namespace]) {
        const token = this.singleTokenNames.getName();
        this.namespacesMap[namespace] = token;
        return token;
      }
      return this.namespacesMap[namespace];
    }
    return namespace;
  }
  
  _simplifyAttribute(attrName, attrValue) {
    if (this.config.xml && this.config.xml.simplifyLongAttributes) {
      const key = `${attrName}=${attrValue}`;
      if (attrValue.length > 20) {
        if (!this.attributesMap[key]) {
          const token = this.singleTokenNames.getName();
          this.attributesMap[key] = token;
          return { name: attrName, value: token };
        }
        return { name: attrName, value: this.attributesMap[key] };
      }
    }
    return { name: attrName, value: attrValue };
  }
  
  _nodeToEmmet(node) {
    if (node.isTextNode) {
      return `{${this._escapeText(node.textContent)}}`;
    }
    
    if (node.isCData) {
      return `cdata{${this._escapeText(node.textContent)}}`;
    }
    
    if (node.isComment) {
      if (this.config.xml && this.config.xml.skipComments) {
        return '';
      }
      return `comment{${this._escapeText(node.textContent)}}`;
    }
    
    // Build element notation
    const parts = [];
    
    // Add namespace:tag
    if (node.namespace) {
      const simplifiedNs = this._simplifyNamespace(node.namespace);
      parts.push(`${simplifiedNs}\\:${node.tag}`);
    } else {
      parts.push(node.tag);
    }
    
    // Process attributes
    const processedAttrs = {};
    for (const [attrName, attrValue] of Object.entries(node.attrs)) {
      const { name, value } = this._simplifyAttribute(attrName, attrValue);
      processedAttrs[name] = value;
    }
    
    // Add id if present
    if (processedAttrs.id) {
      parts.push(`#${processedAttrs.id}`);
      delete processedAttrs.id;
    }
    
    // Add class if present
    if (processedAttrs.class) {
      const classes = processedAttrs.class.split(' ').filter(c => c);
      parts.push(`.${classes.join('.')}`);
      delete processedAttrs.class;
    }
    
    // Add remaining attributes
    if (Object.keys(processedAttrs).length > 0) {
      const attrStrList = [];
      for (const [k, v] of Object.entries(processedAttrs)) {
        if (v.includes(' ')) {
          attrStrList.push(`${k}="${v}"`);
        } else if (v === '') {
          attrStrList.push(k);
        } else {
          attrStrList.push(`${k}=${v}`);
        }
      }
      const attrStr = attrStrList.join(' ');
      parts.push(`[${attrStr}]`);
    }
    
    return parts.join('');
  }
  
  _buildEmmet(nodePool, nodeId, level = 0) {
    const node = nodePool.getNode(nodeId);
    if (!node) return '';
    
    const indent = this.config.indent ? ' '.repeat(this.config.indentSize * level) : '';
    const nodeEmmet = this._nodeToEmmet(node);
    
    if (!nodeEmmet) return ''; // Skip empty nodes (like skipped comments)
    
    // Get children
    const childrenEmmet = [];
    let directTextNode = null;
    
    for (let i = 0; i < node.childrenIds.length; i++) {
      const childId = node.childrenIds[i];
      const childNode = nodePool.getNode(childId);
      
      if (childNode.isTextNode && i === 0 && !directTextNode) {
        directTextNode = childNode;
      } else {
        const childEmmet = this._buildEmmet(nodePool, childId, level + 1);
        if (childEmmet) {
          childrenEmmet.push(childEmmet);
        }
      }
    }
    
    // Add direct text content
    const textEmmet = directTextNode ? this._nodeToEmmet(directTextNode) : '';
    
    // Build final notation
    let result = `${indent}${nodeEmmet}${textEmmet}`;
    
    if (childrenEmmet.length > 0) {
      const childrenStr = this.config.indent 
        ? childrenEmmet.join('+\n')
        : childrenEmmet.join('+');
      
      if (this.config.indent) {
        result += `>\n${childrenStr}`;
      } else {
        result += `>${childrenStr}`;
      }
    }
    
    return result;
  }
  
  convert(nodePool) {
    const result = super.convert(nodePool);
    
    // Reverse the maps
    const reversedNamespacesMap = {};
    for (const [k, v] of Object.entries(this.namespacesMap)) {
      reversedNamespacesMap[v] = k;
    }
    
    const reversedAttributesMap = {};
    for (const [k, v] of Object.entries(this.attributesMap)) {
      reversedAttributesMap[v] = k;
    }
    
    return new XmlConverterResult(
      result,
      new XmlConverterMaps(reversedNamespacesMap, reversedAttributesMap)
    );
  }
}