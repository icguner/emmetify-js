import { JSDOM } from 'jsdom';
import { BaseParser } from './base-parser.js';
import { XmlNodePool } from '../nodes/xml-nodes.js';

export class XmlParser extends BaseParser {
  constructor(config) {
    super(config);
    this.skipTags = this._getSkipTags();
  }
  
  _getSkipTags() {
    if (this.config.xml && this.config.xml.skipTags) {
      return new Set(this.config.xml.tagsToSkip || []);
    }
    return new Set();
  }
  
  _processNodeContents(node, nodePool) {
    const contentIds = [];
    
    for (const content of node.childNodes) {
      // Handle comments
      if (content.nodeType === 8) { // COMMENT_NODE
        if (!(this.config.xml && this.config.xml.skipComments)) {
          const commentId = nodePool.createCommentNode(content.textContent);
          contentIds.push(commentId);
        }
        continue;
      }
      
      // Handle CDATA sections
      if (content.nodeType === 4) { // CDATA_SECTION_NODE
        const cdataId = nodePool.createTextNode(content.textContent, true);
        contentIds.push(cdataId);
        continue;
      }
      
      // Handle text nodes
      if (content.nodeType === 3) { // TEXT_NODE
        const text = content.textContent.trim();
        if (text) {
          const textId = nodePool.createTextNode(text);
          contentIds.push(textId);
        }
        continue;
      }
      
      // Handle element nodes
      if (content.nodeType === 1) { // ELEMENT_NODE
        const tagName = content.tagName;
        const localName = content.localName || tagName;
        
        if (!this.skipTags.has(localName.toLowerCase())) {
          const elementId = nodePool.createElementNode(content);
          contentIds.push(elementId);
          
          const childIds = this._processNodeContents(content, nodePool);
          for (const childId of childIds) {
            nodePool.updateParentChild(childId, elementId);
          }
        }
      }
    }
    
    return contentIds;
  }
  
  _buildTree(document) {
    const nodePool = new XmlNodePool();
    const documentElement = document.documentElement;
    
    if (!documentElement) {
      return nodePool;
    }
    
    // Process root element
    const rootId = nodePool.createElementNode(documentElement, true);
    const contentIds = this._processNodeContents(documentElement, nodePool);
    
    for (const contentId of contentIds) {
      nodePool.updateParentChild(contentId, rootId);
    }
    
    if (this.config.debug) {
      console.log(`XML Nodes count: ${Object.keys(nodePool._nodes).length}`);
    }
    
    return nodePool;
  }
  
  parse(content) {
    // Remove XML declaration if present (JSDOM doesn't handle it well)
    const cleanContent = content.replace(/<\?xml[^?]*\?>/gi, '').trim();
    
    // Parse XML using JSDOM with XML mode
    const dom = new JSDOM(cleanContent, {
      contentType: 'text/xml'
    });
    const document = dom.window.document;
    
    // Check for XML parse errors
    const parseError = document.querySelector('parsererror');
    if (parseError) {
      throw new Error(`XML Parse Error: ${parseError.textContent}`);
    }
    
    const nodePool = this._buildTree(document);
    
    if (this.config.debug) {
      nodePool.printTree();
    }
    
    return nodePool;
  }
}