import { BaseConverter } from './base-converter.js';
import { SingleTokenNames } from '../utils/tokens.js';

export class HtmlPriorityAttributeFilter {
  constructor(priorityConfig) {
    this.config = priorityConfig;
  }
  
  _isDataAttribute(attr) {
    return attr.startsWith('data-');
  }
  
  _isEventHandler(attr) {
    return attr.startsWith('on');
  }
  
  filterAttributes(attrs) {
    if (!attrs || Object.keys(attrs).length === 0) {
      return {};
    }
    
    // Always remove ignored attributes
    const filteredAttrs = {};
    for (const [k, v] of Object.entries(attrs)) {
      if (!this.config.ignoreAttrs.has(k) && 
          !this._isDataAttribute(k) && 
          !this._isEventHandler(k)) {
        filteredAttrs[k] = v;
      }
    }
    
    // Check for primary attributes
    const primaryAttrsPresent = {};
    for (const [k, v] of Object.entries(filteredAttrs)) {
      if (this.config.primaryAttrs.has(k)) {
        primaryAttrsPresent[k] = v;
      }
    }
    
    // If we have primary attributes, return only those
    if (Object.keys(primaryAttrsPresent).length > 0) {
      return primaryAttrsPresent;
    }
    
    // Otherwise, keep secondary attributes
    const secondaryAttrs = {};
    for (const [k, v] of Object.entries(filteredAttrs)) {
      if (this.config.secondaryAttrs.has(k)) {
        secondaryAttrs[k] = v;
      }
    }
    return secondaryAttrs;
  }
}

export class HtmlConverterMaps {
  constructor(classes, links, images) {
    this.classes = classes;
    this.links = links;
    this.images = images;
  }
}

export class HtmlConverterResult {
  constructor(result, maps) {
    this.result = result;
    this.maps = maps;
  }
}

export class HtmlConverter extends BaseConverter {
  constructor(config) {
    super(config);
    
    this.priorityFilter = new HtmlPriorityAttributeFilter(config.html.attributesPriority);
    this.singleTokenNames = new SingleTokenNames();
    
    this.classesMap = {};
    this.linksMap = {};
    this.imagesMap = {};
  }
  
  _escapeText(text) {
    const escaped = text
      .replace(/\\/g, '\\\\')
      .replace(/\*/g, '\\*')
      .replace(/\$/g, '\\$');
    return escaped.split(/\s+/).join(' ');
  }
  
  _nodeToEmmet(node) {
    if (node.isTextNode) {
      return `{${this._escapeText(node.textContent)}}`;
    }
    
    const parts = [node.tag];
    
    // Filter attributes before processing
    let attributes = this.config.html.prioritizeAttributes
      ? this.priorityFilter.filterAttributes(node.attrs)
      : node.attrs;
    
    // Process id if present
    if (attributes.id) {
      parts.push(`#${attributes.id}`);
    }
    
    // Process classes if present
    if (attributes.class) {
      const classes = attributes.class.split(' ').filter(c => c);
      const emmetClassName = `.${classes.join('.')}`;
      const spaceSeparatedClassName = classes.join(' ');
      
      if (this.config.html.simplifyClasses) {
        let mappedClass = this.classesMap[spaceSeparatedClassName];
        if (!mappedClass) {
          const singleTokenClass = this.singleTokenNames.getName();
          this.classesMap[spaceSeparatedClassName] = singleTokenClass;
          parts.push(`.${singleTokenClass}`);
        } else {
          parts.push(`.${mappedClass}`);
        }
      } else {
        parts.push(emmetClassName);
      }
    }
    
    // Process href for absolute links
    if (node.tag === 'a' && attributes.href) {
      const href = attributes.href;
      
      // Simplify absolute links
      if (this.config.html.simplifyAbsoluteLinks && href.startsWith('http')) {
        let mappedUrl = this.linksMap[href];
        if (!mappedUrl) {
          const singleTokenUrl = this.singleTokenNames.getName();
          this.linksMap[href] = singleTokenUrl;
          attributes.href = singleTokenUrl;
        } else {
          attributes.href = mappedUrl;
        }
      }
      // Simplify relative links
      else if (this.config.html.simplifyRelativeLinks && !href.startsWith('http')) {
        let mappedUrl = this.linksMap[href];
        if (!mappedUrl) {
          const singleTokenUrl = this.singleTokenNames.getName();
          this.linksMap[href] = singleTokenUrl;
          attributes.href = singleTokenUrl;
        } else {
          attributes.href = mappedUrl;
        }
      }
    }
    
    // Process src for images
    if (this.config.html.simplifyImages && node.tag === 'img' && attributes.src) {
      let mappedSrc = this.imagesMap[attributes.src];
      if (!mappedSrc) {
        const singleTokenSrc = this.singleTokenNames.getName();
        this.imagesMap[attributes.src] = singleTokenSrc;
        attributes.src = singleTokenSrc;
      } else {
        attributes.src = mappedSrc;
      }
    }
    
    // Remove id and class from remaining attributes since we've handled them
    const remainingAttrs = {};
    for (const [k, v] of Object.entries(attributes)) {
      if (k !== 'id' && k !== 'class') {
        remainingAttrs[k] = v;
      }
    }
    
    let finalAttrs = remainingAttrs;
    if (this.config.html.skipEmptyAttributes) {
      finalAttrs = {};
      for (const [k, v] of Object.entries(remainingAttrs)) {
        if (v) {
          finalAttrs[k] = v;
        }
      }
    }
    
    // Add remaining filtered attributes
    if (Object.keys(finalAttrs).length > 0) {
      const attrStrList = [];
      for (const [k, v] of Object.entries(finalAttrs)) {
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
  
  _buildEmmet(nodePool, nodeData, level = 0) {
    const indent = this.config.indent ? ' '.repeat(this.config.indentSize * level) : '';
    
    const node = typeof nodeData === 'string' 
      ? nodePool.getNode(nodeData) 
      : nodeData;
    
    if (!node) {
      return '';
    }
    
    // Emmetify current node
    const nodeEmmet = this._nodeToEmmet(node);
    
    // Get children nodes
    const childrenNodes = [];
    let directTextChildNode = null;
    
    for (let childIndex = 0; childIndex < node.childrenIds.length; childIndex++) {
      const childId = node.childrenIds[childIndex];
      const childNode = nodePool.getNode(childId);
      const isFirstTextChild = childNode.isTextNode && childIndex === 0 && !directTextChildNode;
      
      if (isFirstTextChild) {
        directTextChildNode = childNode;
      } else {
        childrenNodes.push(childNode);
      }
    }
    
    // Emmetify children
    const childrenEmmet = [];
    for (const childNode of childrenNodes) {
      const childEmmet = this._buildEmmet(nodePool, childNode, level + 1);
      childrenEmmet.push(childEmmet);
    }
    
    // Emmetify direct text child node
    const textNodeEmmet = directTextChildNode 
      ? this._nodeToEmmet(directTextChildNode) 
      : '';
    
    const childrenEmmetStr = this.config.indent 
      ? childrenEmmet.join('+\n') 
      : childrenEmmet.join('+');
    
    let childrenGroup = '';
    if (childrenEmmetStr) {
      childrenGroup = this.config.indent 
        ? `>\n${childrenEmmetStr}` 
        : `>${childrenEmmetStr}`;
    }
    
    const siblingsCount = nodePool.getSiblingsCount(node.id);
    const isNodeWithSiblingsAndChildren = siblingsCount > 0 && childrenNodes.length > 0;
    
    let nodeEmmetStr = '';
    if (isNodeWithSiblingsAndChildren) {
      nodeEmmetStr = `(${nodeEmmet}${textNodeEmmet}${childrenGroup})`;
    } else {
      nodeEmmetStr = `${nodeEmmet}${textNodeEmmet}${childrenGroup}`;
    }
    
    return `${indent}${nodeEmmetStr}`;
  }
  
  convert(nodePool) {
    const result = super.convert(nodePool);
    
    // Reverse the maps for the result
    const reversedClassesMap = {};
    for (const [k, v] of Object.entries(this.classesMap)) {
      reversedClassesMap[v] = k;
    }
    
    const reversedLinksMap = {};
    for (const [k, v] of Object.entries(this.linksMap)) {
      reversedLinksMap[v] = k;
    }
    
    const reversedImagesMap = {};
    for (const [k, v] of Object.entries(this.imagesMap)) {
      reversedImagesMap[v] = k;
    }
    
    return new HtmlConverterResult(
      result,
      new HtmlConverterMaps(
        reversedClassesMap,
        reversedLinksMap,
        reversedImagesMap
      )
    );
  }
}