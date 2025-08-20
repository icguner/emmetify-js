export class HtmlAttributesPriority {
  constructor(config = {}) {
    this.primaryAttrs = new Set(config.primaryAttrs || [
      'id',           // unique identifier, excellent for xpath
      'class',        // common for styling and semantic meaning
      'href',         // essential for links
      'role',         // semantic meaning for accessibility
      'aria-label',   // accessible label, often contains meaningful text
      'title',        // tooltip text, often descriptive
    ]);
    
    this.secondaryAttrs = new Set(config.secondaryAttrs || [
      'name',         // form elements and anchors
      'type',         // input/button types
      'value',        // form element values
      'placeholder',  // input placeholder text
      'alt',          // image alternative text
      'for',          // label associations
    ]);
    
    this.ignoreAttrs = new Set(config.ignoreAttrs || [
      'style',
      'target',
      'rel',
      'loading',
      'srcset',
      'sizes',
      'width',
      'height',
    ]);
  }
}

export class HtmlConfig {
  constructor(config = {}) {
    // Optimization options
    this.simplifyClasses = config.simplifyClasses || false;
    this.simplifyImages = config.simplifyImages || false;
    this.simplifyAbsoluteLinks = config.simplifyAbsoluteLinks || false;
    this.simplifyRelativeLinks = config.simplifyRelativeLinks || false;
    this.skipTags = config.skipTags || false;
    this.skipEmptyAttributes = config.skipEmptyAttributes || false;
    this.prioritizeAttributes = config.prioritizeAttributes || false;
    
    // Tags to skip during conversion
    this.tagsToSkip = new Set(config.tagsToSkip || [
      'script',
      'style',
      'noscript',
      'head',
      'meta',
      'link',
      'title',
      'base',
      'svg',
    ]);
    
    this.attributesPriority = new HtmlAttributesPriority(config.attributesPriority || {});
  }
}