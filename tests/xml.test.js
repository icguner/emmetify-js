import { emmetifyXml, emmetifyCompactXml } from '../src/index.js';

describe('XML to Emmet conversion', () => {
  test('Simple XML element', () => {
    const xml = '<root><item>Test</item></root>';
    const result = emmetifyXml(xml);
    expect(result.result).toContain('root>');
    expect(result.result).toContain('item{Test}');
  });
  
  test('XML with attributes', () => {
    const xml = '<book id="123" isbn="978-3-16-148410-0"><title>Sample Book</title></book>';
    const result = emmetifyXml(xml);
    expect(result.result).toContain('book#123');
    expect(result.result).toContain('[isbn=978-3-16-148410-0]');
    expect(result.result).toContain('title{Sample Book}');
  });
  
  test('XML with namespaces', () => {
    const xml = '<ns:root xmlns:ns="http://example.com"><ns:child>Content</ns:child></ns:root>';
    const result = emmetifyXml(xml);
    expect(result.result).toContain('ns\\:root');
    expect(result.result).toContain('ns\\:child');
  });
  
  test('XML with CDATA', () => {
    const xml = '<root><script><![CDATA[function test() { return 1 < 2; }]]></script></root>';
    const result = emmetifyXml(xml);
    expect(result.result).toContain('cdata{');
  });
  
  test('XML with comments', () => {
    const xml = '<root><!-- This is a comment --><item>Test</item></root>';
    const result = emmetifyXml(xml);
    expect(result.result).toContain('comment{This is a comment}');
  });
});

describe('Compact XML conversion', () => {
  test('Skip comments', () => {
    const xml = '<root><!-- Comment --><item>Test</item></root>';
    const result = emmetifyCompactXml(xml);
    expect(result.result).not.toContain('comment');
  });
  
  test('Simplify namespaces', () => {
    const xml = '<namespace:root><namespace:child>Content</namespace:child></namespace:root>';
    const result = emmetifyCompactXml(xml);
    expect(result.maps.namespaces).toBeDefined();
    expect(Object.keys(result.maps.namespaces).length).toBeGreaterThan(0);
  });
  
  test('Simplify long attributes', () => {
    const xml = '<element data="This is a very long attribute value that should be simplified">Test</element>';
    const result = emmetifyCompactXml(xml);
    expect(result.maps.attributes).toBeDefined();
  });
});