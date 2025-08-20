import { emmetifyJson, emmetifyCompactJson } from '../src/index.js';

describe('JSON to Emmet conversion', () => {
  test('Simple object', () => {
    const json = JSON.stringify({ name: 'John', age: 30 });
    const result = emmetifyJson(json);
    expect(result.result).toContain('obj>');
    expect(result.result).toContain('prop[name]');
    expect(result.result).toContain('str{John}');
  });
  
  test('Array of values', () => {
    const json = JSON.stringify([1, 2, 3, 'test']);
    const result = emmetifyJson(json);
    expect(result.result).toContain('arr>');
    expect(result.result).toContain('num{1}');
    expect(result.result).toContain('num{2}');
    expect(result.result).toContain('str{test}');
  });
  
  test('Nested object', () => {
    const json = JSON.stringify({
      user: {
        name: 'Alice',
        email: 'alice@example.com'
      }
    });
    const result = emmetifyJson(json);
    expect(result.result).toContain('obj>');
    expect(result.result).toContain('prop[user]>');
    expect(result.result).toContain('obj>');
  });
  
  test('Boolean and null values', () => {
    const json = JSON.stringify({
      active: true,
      deleted: false,
      metadata: null
    });
    const result = emmetifyJson(json);
    expect(result.result).toContain('bool{true}');
    expect(result.result).toContain('bool{false}');
    expect(result.result).toContain('null');
  });
});

describe('Compact JSON conversion', () => {
  test('Simplify long strings', () => {
    const json = JSON.stringify({
      description: 'This is a very long description that should be simplified'
    });
    const result = emmetifyCompactJson(json);
    expect(result.maps.values).toBeDefined();
    expect(Object.keys(result.maps.values).length).toBeGreaterThan(0);
  });
  
  test('Simplify keys', () => {
    const json = JSON.stringify({
      'very_long_property_name': 'value',
      'another_long_key': 123
    });
    const result = emmetifyCompactJson(json);
    expect(result.maps.keys).toBeDefined();
    expect(Object.keys(result.maps.keys).length).toBeGreaterThan(0);
  });
});