import { JSDOM } from 'jsdom';
import { BaseParser } from './base-parser.js';
import { HtmlNodePool } from '../nodes/html-nodes.js';

export class HtmlParser extends BaseParser {
  constructor(config) {
    super(config);
    this.skipTags = this._getSkipTags();
  }
  
  _getSkipTags() {
    if (this.config.html.skipTags) {
      return new Set(this.config.html.tagsToSkip);
    }
    return new Set();
  }
  
  _processNodeContents(node, nodePool) {
    const contentIds = [];
    
    for (const content of node.childNodes) {
      // Skip comments
      if (content.nodeType === 8) { // COMMENT_NODE
        continue;
      }
      
      // Skip empty text nodes
      if (content.nodeType === 3) { // TEXT_NODE
        const text = content.textContent.trim();
        if (text) {
          const textId = nodePool.createTextNode(text);
          contentIds.push(textId);
        }
      }
      
      // Process element nodes
      else if (content.nodeType === 1) { // ELEMENT_NODE
        const tagName = content.tagName.toLowerCase();
        if (!this.skipTags.has(tagName)) {
          const tagId = nodePool.getOrCreateNode(content);
          contentIds.push(tagId);
          
          const childIds = this._processNodeContents(content, nodePool);
          for (const childId of childIds) {
            nodePool.updateParentChild(childId, tagId);
          }
        }
      }
    }
    
    return contentIds;
  }
  
  _buildTree(document) {
    const nodePool = new HtmlNodePool();
    const body = document.body || document.documentElement;
    
    if (!body) {
      return nodePool;
    }
    
    const rootTags = [];
    for (const child of body.children) {
      const tagName = child.tagName.toLowerCase();
      if (!this.skipTags.has(tagName)) {
        rootTags.push(child);
      }
    }
    
    for (const rootTag of rootTags) {
      const rootId = nodePool.getOrCreateNode(rootTag, true);
      const contentIds = this._processNodeContents(rootTag, nodePool);
      
      for (const contentId of contentIds) {
        nodePool.updateParentChild(contentId, rootId);
      }
    }
    
    if (this.config.debug) {
      console.log(`Nodes count: ${nodePool.getNodesCount()}`);
    }
    
    return nodePool;
  }
  
  parse(content) {
    const dom = new JSDOM(content);
    const document = dom.window.document;
    const nodePool = this._buildTree(document);
    
    if (this.config.debug) {
      nodePool.printTree();
    }
    
    return nodePool;
  }
}