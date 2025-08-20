import { BaseNode, BaseNodePool } from './base-nodes.js';

export class XmlNode extends BaseNode {
  constructor({
    id,
    tag,
    namespace = null,
    attrs = {},
    parentId = null,
    childrenIds = [],
    textContent = null,
    isTextNode = false,
    isCData = false,
    isComment = false,
    sequenceIndex = 0
  }) {
    super();
    this.id = id;
    this.tag = tag;
    this.namespace = namespace;
    this.attrs = attrs;
    this.parentId = parentId;
    this.childrenIds = childrenIds;
    this.textContent = textContent;
    this.isTextNode = isTextNode;
    this.isCData = isCData;
    this.isComment = isComment;
    this.sequenceIndex = sequenceIndex;
  }
  
  toString() {
    if (this.isTextNode) {
      return `"${this.textContent}"`;
    } else if (this.isCData) {
      return `<![CDATA[${this.textContent}]]>`;
    } else if (this.isComment) {
      return `<!-- ${this.textContent} -->`;
    } else {
      const parts = [];
      if (this.namespace) {
        parts.push(`${this.namespace}:${this.tag}`);
      } else {
        parts.push(this.tag);
      }
      
      if (Object.keys(this.attrs).length > 0) {
        const attrsStr = Object.entries(this.attrs)
          .map(([k, v]) => `${k}="${v}"`)
          .join(' ');
        parts.push(`[${attrsStr}]`);
      }
      
      if (this.textContent) {
        parts.push(`"${this.textContent}"`);
      }
      
      return parts.join('');
    }
  }
}

export class XmlNodePool extends BaseNodePool {
  constructor() {
    super();
    this._nextId = 0;
    this._nodes = {};
    this._rootIds = new Set();
    this._sequenceCounter = 0;
  }
  
  getNextId() {
    this._nextId++;
    return `x${this._nextId}`;
  }
  
  createTextNode(text, isCData = false) {
    this._sequenceCounter++;
    const newId = this.getNextId();
    
    const node = new XmlNode({
      id: newId,
      tag: '#text',
      textContent: text.trim(),
      isTextNode: !isCData,
      isCData: isCData,
      sequenceIndex: this._sequenceCounter
    });
    
    this._nodes[newId] = node;
    return newId;
  }
  
  createCommentNode(text) {
    this._sequenceCounter++;
    const newId = this.getNextId();
    
    const node = new XmlNode({
      id: newId,
      tag: '#comment',
      textContent: text.trim(),
      isComment: true,
      sequenceIndex: this._sequenceCounter
    });
    
    this._nodes[newId] = node;
    return newId;
  }
  
  createElementNode(element, isRoot = false) {
    this._sequenceCounter++;
    const newId = this.getNextId();
    
    // Extract namespace if present
    const tagName = element.tagName;
    let namespace = null;
    let localName = tagName;
    
    if (tagName.includes(':')) {
      const parts = tagName.split(':');
      namespace = parts[0];
      localName = parts[1];
    }
    
    // Extract attributes
    const attrs = {};
    if (element.attributes) {
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        attrs[attr.name] = attr.value;
      }
    }
    
    const node = new XmlNode({
      id: newId,
      tag: localName.toLowerCase(),
      namespace: namespace ? namespace.toLowerCase() : null,
      attrs: attrs,
      sequenceIndex: this._sequenceCounter
    });
    
    this._nodes[newId] = node;
    
    if (isRoot) {
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
      console.log('\nXML Tree Structure:');
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