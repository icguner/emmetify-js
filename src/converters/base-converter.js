export class BaseConverter {
  constructor(config) {
    this.config = config;
  }
  
  _buildEmmet(nodePool, rootId) {
    throw new Error('_buildEmmet method must be implemented by subclass');
  }
  
  convert(nodePool) {
    const rootIds = nodePool.getRootIds();
    
    if (!rootIds || rootIds.size === 0) {
      return '';
    }
    
    const emmetParts = [];
    const sortedRootIds = Array.from(rootIds).sort();
    
    for (let i = 0; i < sortedRootIds.length; i++) {
      const rootId = sortedRootIds[i];
      let emmet = this._buildEmmet(nodePool, rootId);
      
      if (emmet) {
        if (i < sortedRootIds.length - 1) {
          if (this.config.indent) {
            emmet = `${emmet}+\n`;
          } else {
            emmet = `${emmet}+`;
          }
        }
        emmetParts.push(emmet);
      }
    }
    
    return emmetParts.join('');
  }
}