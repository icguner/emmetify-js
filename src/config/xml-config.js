export class XmlConfig {
  constructor(config = {}) {
    // Optimization options
    this.simplifyNamespaces = config.simplifyNamespaces || false;
    this.simplifyLongAttributes = config.simplifyLongAttributes || false;
    this.skipComments = config.skipComments || false;
    this.skipTags = config.skipTags || false;
    this.preserveCData = config.preserveCData || true;
    
    // Tags to skip during conversion
    this.tagsToSkip = new Set(config.tagsToSkip || [
      'xsl:stylesheet',
      'xsl:template',
      'xs:schema'
    ]);
  }
}