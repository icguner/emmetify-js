import { HtmlConfig } from './html-config.js';
import { JsonConfig } from './json-config.js';
import { XmlConfig } from './xml-config.js';

export class EmmetifierConfig {
  constructor(config = {}) {
    // Debug options
    this.debug = config.debug || false;
    
    // Emmet Formatting options (run on debug=true only)
    this.indent = config.indent || false;
    this.indentSize = Math.max(1, Math.min(8, config.indentSize || 2));
    
    // Format-specific configurations
    this.html = new HtmlConfig(config.html || {});
    this.json = new JsonConfig(config.json || {});
    this.xml = new XmlConfig(config.xml || {});
  }
  
  static validate(config) {
    if (config instanceof EmmetifierConfig) {
      return config;
    }
    return new EmmetifierConfig(config);
  }
}