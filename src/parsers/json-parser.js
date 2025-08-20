import { BaseParser } from './base-parser.js';
import { JsonNodePool } from '../nodes/json-nodes.js';

export class JsonParser extends BaseParser {
  constructor(config) {
    super(config);
  }
  
  _parseValue(value, nodePool, parentId = null, key = null, index = null) {
    // Handle null
    if (value === null) {
      const nodeId = nodePool.createNode('value', {
        value: null,
        dataType: 'null',
        key,
        index
      });
      if (parentId) {
        nodePool.updateParentChild(nodeId, parentId);
      }
      return nodeId;
    }
    
    // Handle primitives
    const type = typeof value;
    if (type === 'string' || type === 'number' || type === 'boolean') {
      const nodeId = nodePool.createNode('value', {
        value,
        dataType: type,
        key,
        index
      });
      if (parentId) {
        nodePool.updateParentChild(nodeId, parentId);
      }
      return nodeId;
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      const arrayNodeId = nodePool.createNode('array', {
        key,
        index,
        isRoot: parentId === null
      });
      
      if (parentId) {
        nodePool.updateParentChild(arrayNodeId, parentId);
      }
      
      // Parse array elements
      value.forEach((item, idx) => {
        this._parseValue(item, nodePool, arrayNodeId, null, idx);
      });
      
      return arrayNodeId;
    }
    
    // Handle objects
    if (type === 'object') {
      const objectNodeId = nodePool.createNode('object', {
        key,
        index,
        isRoot: parentId === null
      });
      
      if (parentId) {
        nodePool.updateParentChild(objectNodeId, parentId);
      }
      
      // Parse object properties
      for (const [propKey, propValue] of Object.entries(value)) {
        const propertyNodeId = nodePool.createNode('property', {
          key: propKey
        });
        nodePool.updateParentChild(propertyNodeId, objectNodeId);
        
        // Parse the property value
        this._parseValue(propValue, nodePool, propertyNodeId, propKey);
      }
      
      return objectNodeId;
    }
    
    // Unknown type
    throw new Error(`Unsupported JSON value type: ${type}`);
  }
  
  parse(content) {
    const nodePool = new JsonNodePool();
    
    // Parse JSON string
    let jsonData;
    try {
      jsonData = JSON.parse(content);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
    
    // Build node tree
    this._parseValue(jsonData, nodePool);
    
    if (this.config.debug) {
      console.log(`JSON Nodes count: ${Object.keys(nodePool._nodes).length}`);
      nodePool.printTree();
    }
    
    return nodePool;
  }
}