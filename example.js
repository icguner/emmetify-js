import { emmetifyHtml, emmetifyCompactHtml } from './src/index.js';

// Basic HTML conversion
const html1 = `
<div class="container">
  <h1 id="title">Welcome</h1>
  <p class="description">This is a test paragraph.</p>
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
  </ul>
  <a href="https://example.com" class="link">Visit Example</a>
  <img src="/images/test.jpg" alt="Test Image">
</div>
`;

console.log('=== Basic HTML to Emmet =======================');
const result1 = emmetifyHtml(html1);
console.log('Input HTML:');
console.log(html1);
console.log('\nEmmet Output:');
console.log(result1.result);

console.log('\n=== Compact HTML to Emmet ====================');
const result2 = emmetifyCompactHtml(html1);
console.log('Compact Emmet Output:');
console.log(result2.result);
console.log('\nMappings:');
console.log('Classes:', result2.maps.classes);
console.log('Links:', result2.maps.links);
console.log('Images:', result2.maps.images);

// Test with more complex HTML
const html2 = `
<article class="blog-post featured">
  <header>
    <h2 class="post-title">Article Title</h2>
    <div class="meta">
      <span class="author">John Doe</span>
      <time class="date">2024-01-15</time>
    </div>
  </header>
  <div class="content">
    <p>First paragraph of content.</p>
    <p>Second paragraph with <a href="/page1">internal link</a> and <a href="https://external.com">external link</a>.</p>
  </div>
</article>
`;

console.log('\n=== Complex HTML Example ======================');
const result3 = emmetifyHtml(html2, 'html', { indent: true, indentSize: 2 });
console.log('Input HTML:');
console.log(html2);
console.log('\nEmmet Output (with indentation):');
console.log(result3.result);