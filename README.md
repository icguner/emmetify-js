# Emmetify JS

JavaScript implementation of the Emmetify library - reduces token usage and optimizes LLM interactions by converting HTML, JSON, and XML to compact Emmet-like syntax.

## Installation

```bash
npm install
```

## Usage

### HTML Conversion

```javascript
import { emmetifyHtml, emmetifyCompactHtml } from './src/index.js';

// Basic usage
const html = '<div class="container"><p>Hello World</p></div>';
const result = emmetifyHtml(html);
console.log(result.result); // div.container>p{Hello World}

// Compact version with optimizations
const compactResult = emmetifyCompactHtml(html);
console.log(compactResult.result);
```

### JSON Conversion

```javascript
import { emmetifyJson, emmetifyCompactJson } from './src/index.js';

const json = JSON.stringify({ user: { name: 'John', age: 30 } });
const result = emmetifyJson(json);
console.log(result.result); // obj>prop[user]>obj>prop[name]>str{John}+prop[age]>num{30}

// Compact version with token optimization
const compactResult = emmetifyCompactJson(json);
console.log(compactResult.maps.keys); // Simplified keys mapping
```

### XML Conversion

```javascript
import { emmetifyXml, emmetifyCompactXml } from './src/index.js';

const xml = '<book id="1"><title>Sample</title></book>';
const result = emmetifyXml(xml);
console.log(result.result); // book#1>title{Sample}

// Compact version with namespace simplification
const compactResult = emmetifyCompactXml(xml);
```

## API

### HTML Functions

- `emmetifyHtml(content, format, options)` - Convert HTML to Emmet notation
- `emmetifyCompactHtml(content)` - Convert HTML with compact optimizations

### JSON Functions

- `emmetifyJson(content, options)` - Convert JSON to Emmet-like notation
- `emmetifyCompactJson(content)` - Convert JSON with key/value optimization

### XML Functions

- `emmetifyXml(content, options)` - Convert XML to Emmet notation
- `emmetifyCompactXml(content)` - Convert XML with namespace optimization

### Configuration Options

```javascript
{
  debug: false,
  indent: false,
  indentSize: 2,
  html: {
    skipTags: false,
    prioritizeAttributes: false,
    simplifyClasses: false,
    simplifyImages: false,
    simplifyAbsoluteLinks: false,
    simplifyRelativeLinks: false,
    skipEmptyAttributes: false,
    tagsToSkip: ['script', 'style', 'noscript', 'head', 'meta', 'link', 'title', 'base', 'svg'],
    attributesPriority: {
      primaryAttrs: ['id', 'class', 'href', 'role', 'aria-label', 'title'],
      secondaryAttrs: ['name', 'type', 'value', 'placeholder', 'alt', 'for'],
      ignoreAttrs: ['style', 'target', 'rel', 'loading', 'srcset', 'sizes', 'width', 'height']
    }
  },
  json: {
    simplifyKeys: false,
    simplifyLongStrings: false,
    stringLengthThreshold: 20,
    compactArrays: false,
    compactObjects: false
  },
  xml: {
    simplifyNamespaces: false,
    simplifyLongAttributes: false,
    skipComments: false,
    skipTags: false,
    preserveCData: true,
    tagsToSkip: ['xsl:stylesheet', 'xsl:template', 'xs:schema']
  }
}
```

## License

MIT
