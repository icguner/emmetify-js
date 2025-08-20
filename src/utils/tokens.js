import { loadSingleTokenNames } from '../data/index.js';

export class SingleTokenNames {
  constructor() {
    this._names = new Set(loadSingleTokenNames());
  }

  getName() {
    const name = this._names.values().next().value;
    this._names.delete(name);
    return name;
  }
}