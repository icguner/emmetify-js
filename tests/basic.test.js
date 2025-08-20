import { emmetifyHtml, emmetifyCompactHtml } from '../src/index.js';

describe('Basic HTML to Emmet conversion', () => {
  test('Simple div with class', () => {
    const html = '<div class="container">Hello</div>';
    const result = emmetifyHtml(html);
    expect(result.result).toBe('div.container{Hello}');
  });
  
  test('Nested elements', () => {
    const html = '<div><p>Test</p></div>';
    const result = emmetifyHtml(html);
    expect(result.result).toBe('div>p{Test}');
  });
  
  test('Multiple classes', () => {
    const html = '<div class="foo bar baz">Content</div>';
    const result = emmetifyHtml(html);
    expect(result.result).toBe('div.foo.bar.baz{Content}');
  });
  
  test('Element with id and class', () => {
    const html = '<div id="main" class="container">Content</div>';
    const result = emmetifyHtml(html);
    expect(result.result).toBe('div#main.container{Content}');
  });
  
  test('Link with href', () => {
    const html = '<a href="https://example.com">Link</a>';
    const result = emmetifyHtml(html);
    expect(result.result).toBe('a[href=https://example.com]{Link}');
  });
  
  test('Image with src and alt', () => {
    const html = '<img src="image.jpg" alt="Description">';
    const result = emmetifyHtml(html);
    expect(result.result).toBe('img[src=image.jpg alt=Description]');
  });
  
  test('Multiple siblings', () => {
    const html = '<div><p>First</p><p>Second</p></div>';
    const result = emmetifyHtml(html);
    expect(result.result).toBe('div>p{First}+p{Second}');
  });
});

describe('Compact HTML conversion', () => {
  test('Simplify classes', () => {
    const html = '<div class="very-long-class-name-here">Content</div>';
    const result = emmetifyCompactHtml(html);
    expect(result.result).toMatch(/^div\.[A-Za-z]+\{Content\}$/);
    expect(Object.keys(result.maps.classes).length).toBe(1);
  });
  
  test('Simplify absolute links', () => {
    const html = '<a href="https://example.com/very/long/path">Link</a>';
    const result = emmetifyCompactHtml(html);
    expect(result.result).toMatch(/^a\[href=[A-Za-z]+\]\{Link\}$/);
    expect(Object.keys(result.maps.links).length).toBe(1);
  });
  
  test('Simplify images', () => {
    const html = '<img src="/path/to/image.jpg" alt="Test">';
    const result = emmetifyCompactHtml(html);
    expect(result.result).toMatch(/^img\[src=[A-Za-z]+ alt=Test\]$/);
    expect(Object.keys(result.maps.images).length).toBe(1);
  });
});