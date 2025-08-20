export class BaseNode {
  // Base class for all nodes
}

export class BaseNodePool {
  constructor() {
    this._nodes = {};
  }
  
  getRootIds() {
    throw new Error('getRootIds must be implemented by subclass');
  }
}