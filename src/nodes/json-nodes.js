import { BaseNode, BaseNodePool } from './base-nodes.js';

export class JsonNode extends BaseNode {
  constructor({
    id,
    type, // 'object', 'array', 'property', 'value'
    key = null,
    value = null,
    dataType = null, // 'string', 'number', 'boolean', 'null'
    parentId = null,
    childrenIds = [],
    index = null
  }) {
    super();
    this.id = id;
    this.type = type;
    this.key = key;
    this.value = value;
    this.dataType = dataType;
    this.parentId = parentId;
    this.childrenIds = childrenIds;
    this.index = index;
  }
  
  toString() {
    if (this.type === 'object') {
      return '{}';
    } else if (this.type === 'array') {
      return '[]';
    } else if (this.type === 'property') {
      return `"${this.key}": ...`;
    } else if (this.type === 'value') {
      if (this.dataType === 'string') {
        return `"${this.value}"`;
      }
      return String(this.value);
    }
    return '';
  }
}

export class JsonNodePool extends BaseNodePool {
  constructor() {
    super();
    this._nextId = 0;
    this._nodes = {};
    this._rootIds = new Set();
  }
  
  getNextId() {
    this._nextId++;
    return `j${this._nextId}`;
  }
  
  createNode(type, options = {}) {
    const newId = this.getNextId();
    const node = new JsonNode({
      id: newId,
      type,
      ...options
    });
    
    this._nodes[newId] = node;
    
    if (options.isRoot) {
      this._rootIds.add(newId);
    }
    
    return newId;
  }
  
  getNode(nodeId) {
    return this._nodes[nodeId] || null;
  }
  
  getRootIds() {
    return new Set(this._rootIds);
  }
  
  updateParentChild(childId, parentId) {
    const childNode = this._nodes[childId];
    const parentNode = this._nodes[parentId];
    
    childNode.parentId = parentId;
    if (!parentNode.childrenIds.includes(childId)) {
      parentNode.childrenIds.push(childId);
    }
  }
  
  printTree(nodeId = null, level = 0) {
    if (nodeId === null) {
      console.log('\nJSON Tree Structure:');
      console.log('='.repeat(50));
      const sortedRootIds = Array.from(this._rootIds).sort();
      for (const rootId of sortedRootIds) {
        this.printTree(rootId, 0);
      }
      console.log('='.repeat(50));
      return;
    }
    
    const node = this._nodes[nodeId];
    const indent = '  '.repeat(level);
    
    console.log(`${indent}[${node.id}] ${node.toString()}`);
    
    for (const childId of node.childrenIds) {
      this.printTree(childId, level + 1);
    }
  }
}