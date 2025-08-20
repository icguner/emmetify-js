import { BaseConverter } from './base-converter.js';
import { SingleTokenNames } from '../utils/tokens.js';

export class JsonConverterResult {
  constructor(result, maps) {
    this.result = result;
    this.maps = maps;
  }
}

export class JsonConverterMaps {
  constructor(keys, values) {
    this.keys = keys;
    this.values = values;
  }
}

export class JsonConverter extends BaseConverter {
  constructor(config) {
    super(config);
    this.singleTokenNames = new SingleTokenNames();
    this.keysMap = {};
    this.valuesMap = {};
  }
  
  _escapeValue(value) {
    if (typeof value === 'string') {
      // Escape special characters
      return value
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
    }
    return String(value);
  }
  
  _simplifyKey(key) {
    if (this.config.json && this.config.json.simplifyKeys) {
      if (!this.keysMap[key]) {
        const token = this.singleTokenNames.getName();
        this.keysMap[key] = token;
        return token;
      }
      return this.keysMap[key];
    }
    return key;
  }
  
  _simplifyValue(value, dataType) {
    if (this.config.json && this.config.json.simplifyLongStrings && 
        dataType === 'string' && value.length > 20) {
      if (!this.valuesMap[value]) {
        const token = this.singleTokenNames.getName();
        this.valuesMap[value] = token;
        return token;
      }
      return this.valuesMap[value];
    }
    return value;
  }
  
  _nodeToEmmet(node, nodePool) {
    if (node.type === 'object') {
      // Object notation: obj
      return 'obj';
    } else if (node.type === 'array') {
      // Array notation: arr
      return 'arr';
    } else if (node.type === 'property') {
      // Property notation: prop[key]
      const simplifiedKey = this._simplifyKey(node.key);
      return `prop[${simplifiedKey}]`;
    } else if (node.type === 'value') {
      // Value notation based on type
      const simplifiedValue = this._simplifyValue(node.value, node.dataType);
      
      if (node.dataType === 'string') {
        return `str{${this._escapeValue(simplifiedValue)}}`;
      } else if (node.dataType === 'number') {
        return `num{${node.value}}`;
      } else if (node.dataType === 'boolean') {
        return `bool{${node.value}}`;
      } else if (node.dataType === 'null') {
        return 'null';
      }
    }
    return '';
  }
  
  _buildEmmet(nodePool, nodeId, level = 0) {
    const node = nodePool.getNode(nodeId);
    if (!node) return '';
    
    const indent = this.config.indent ? ' '.repeat(this.config.indentSize * level) : '';
    const nodeEmmet = this._nodeToEmmet(node, nodePool);
    
    if (node.childrenIds.length === 0) {
      return `${indent}${nodeEmmet}`;
    }
    
    // Build children
    const childrenEmmet = [];
    for (const childId of node.childrenIds) {
      const childEmmet = this._buildEmmet(nodePool, childId, level + 1);
      if (childEmmet) {
        childrenEmmet.push(childEmmet);
      }
    }
    
    let childrenStr = '';
    if (childrenEmmet.length > 0) {
      if (this.config.indent) {
        childrenStr = childrenEmmet.join('+\n');
        return `${indent}${nodeEmmet}>\n${childrenStr}`;
      } else {
        childrenStr = childrenEmmet.join('+');
        return `${indent}${nodeEmmet}>${childrenStr}`;
      }
    }
    
    return `${indent}${nodeEmmet}`;
  }
  
  convert(nodePool) {
    const result = super.convert(nodePool);
    
    // Reverse the maps
    const reversedKeysMap = {};
    for (const [k, v] of Object.entries(this.keysMap)) {
      reversedKeysMap[v] = k;
    }
    
    const reversedValuesMap = {};
    for (const [k, v] of Object.entries(this.valuesMap)) {
      reversedValuesMap[v] = k;
    }
    
    return new JsonConverterResult(
      result,
      new JsonConverterMaps(reversedKeysMap, reversedValuesMap)
    );
  }
}