import { BaseNode, BaseNodePool } from './base-nodes.js';

export class HtmlNode extends BaseNode {
  constructor({
    id,
    tag,
    attrs = {},
    parentId = null,
    childrenIds = [],
    sequenceIndex = 0,
    textContent = null,
    isTextNode = false,
    nextSiblingId = null,
    prevSiblingId = null,
    nonTextChildrenCount = 0
  }) {
    super();
    this.id = id;
    this.tag = tag;
    this.attrs = attrs;
    this.parentId = parentId;
    this.childrenIds = childrenIds;
    this.sequenceIndex = sequenceIndex;
    this.textContent = textContent;
    this.isTextNode = isTextNode;
    this.nextSiblingId = nextSiblingId;
    this.prevSiblingId = prevSiblingId;
    this.nonTextChildrenCount = nonTextChildrenCount;
  }
  
  toString() {
    const parts = [];
    if (this.isTextNode) {
      parts.push(`"${this.textContent}"`);
    } else {
      parts.push(this.tag);
      if (Object.keys(this.attrs).length > 0) {
        const attrsStr = Object.entries(this.attrs)
          .map(([k, v]) => `${k}="${v}"`)
          .join(' ');
        parts.push(`[${attrsStr}]`);
      }
      if (this.textContent) {
        parts.push(`"${this.textContent}"`);
      }
    }
    return parts.join('');
  }
  
  hasSiblings() {
    return this.prevSiblingId !== null || this.nextSiblingId !== null;
  }
}

export class HtmlNodePool extends BaseNodePool {
  constructor() {
    super();
    this._nextId = 0;
    this._nodes = {};
    this._rootIds = new Set();
    this._sequenceCounter = 0;
  }
  
  getNodesCount() {
    return Object.keys(this._nodes).length;
  }
  
  getNextId() {
    this._nextId++;
    return `n${this._nextId}`;
  }
  
  createTextNode(text, sequenceIndex = null) {
    const newId = this.getNextId();
    if (sequenceIndex === null) {
      this._sequenceCounter++;
      sequenceIndex = this._sequenceCounter;
    }
    
    const node = new HtmlNode({
      id: newId,
      tag: '#text',
      attrs: {},
      sequenceIndex: sequenceIndex,
      textContent: text.trim(),
      isTextNode: true
    });
    
    this._nodes[newId] = node;
    return newId;
  }
  
  getOrCreateNode(element, isRoot = false) {
    this._sequenceCounter++;
    const newId = this.getNextId();
    
    const attrs = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attrs[attr.name] = attr.value;
    }
    
    const node = new HtmlNode({
      id: newId,
      tag: element.tagName.toLowerCase(),
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
    
    // Update sibling relationships
    if (parentNode.childrenIds.length > 0) {
      for (let index = 0; index < parentNode.childrenIds.length; index++) {
        const currentChildId = parentNode.childrenIds[index];
        const currNode = this._nodes[currentChildId];
        
        if (index > 0) {
          const prevId = parentNode.childrenIds[index - 1];
          currNode.prevSiblingId = prevId;
        }
        
        if (index < parentNode.childrenIds.length - 1) {
          const nextId = parentNode.childrenIds[index + 1];
          currNode.nextSiblingId = nextId;
        }
      }
    }
    
    // Update non-text siblings count
    if (!childNode.isTextNode) {
      parentNode.nonTextChildrenCount++;
    }
  }
  
  getSiblingsCount(nodeId) {
    const node = this._nodes[nodeId];
    const parent = this._nodes[node.parentId];
    if (parent) {
      return parent.nonTextChildrenCount - 1; // exclude current node
    }
    return 0;
  }
  
  printTree(nodeId = null, level = 0) {
    if (nodeId === null) {
      console.log('\nTree Structure:');
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
    
    // Print current node
    console.log(`${indent}[${node.id}] ${node.toString()}`);
    
    // Print relationship info
    const relations = [];
    if (node.parentId) {
      const parent = this._nodes[node.parentId];
      relations.push(`parent: ${parent.id}(${parent.tag})`);
    }
    if (node.prevSiblingId) {
      const prev = this._nodes[node.prevSiblingId];
      relations.push(`prev: ${prev.id}(${prev.tag})`);
    }
    if (node.nextSiblingId) {
      const next = this._nodes[node.nextSiblingId];
      relations.push(`next: ${next.id}(${next.tag})`);
    }
    if (relations.length > 0) {
      console.log(`${indent}     → ${relations.join(', ')}`);
    }
    
    // Print children
    for (const childId of node.childrenIds) {
      this.printTree(childId, level + 1);
    }
  }
}