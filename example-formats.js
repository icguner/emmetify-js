import { emmetifyJson, emmetifyCompactJson, emmetifyXml, emmetifyCompactXml } from './src/index.js';

// JSON Examples
console.log('=== JSON to Emmet Conversion ====================');

const jsonData = {
  "user": {
    "id": 12345,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "active": true,
    "metadata": null,
    "preferences": {
      "theme": "dark",
      "notifications": true,
      "language": "en"
    },
    "tags": ["developer", "javascript", "nodejs"]
  },
  "timestamp": "2024-01-15T10:30:00Z"
};

const jsonString = JSON.stringify(jsonData, null, 2);
console.log('Original JSON:');
console.log(jsonString);

const jsonResult = emmetifyJson(jsonString);
console.log('\nEmmet Notation:');
console.log(jsonResult.result);

const compactJsonResult = emmetifyCompactJson(jsonString);
console.log('\nCompact Emmet Notation:');
console.log(compactJsonResult.result);
console.log('\nMappings:');
console.log('Keys:', compactJsonResult.maps.keys);
console.log('Values:', compactJsonResult.maps.values);

// XML Examples
console.log('\n=== XML to Emmet Conversion ====================');

const xmlData = `
<?xml version="1.0" encoding="UTF-8"?>
<bookstore xmlns:fiction="http://example.com/fiction">
  <!-- Book collection -->
  <fiction:book id="b1" isbn="978-0-123456-78-9">
    <fiction:title lang="en">The Great Adventure</fiction:title>
    <fiction:author>
      <name>Jane Smith</name>
      <email>jane@example.com</email>
    </fiction:author>
    <price currency="USD">29.99</price>
    <description><![CDATA[A thrilling story about <adventure> and discovery]]></description>
  </fiction:book>
  <fiction:book id="b2" isbn="978-0-987654-32-1">
    <fiction:title lang="en">Mystery of the Code</fiction:title>
    <fiction:author>
      <name>Bob Johnson</name>
      <email>bob@example.com</email>
    </fiction:author>
    <price currency="EUR">24.99</price>
  </fiction:book>
</bookstore>
`;

console.log('Original XML:');
console.log(xmlData);

const xmlResult = emmetifyXml(xmlData);
console.log('\nEmmet Notation:');
console.log(xmlResult.result);

const compactXmlResult = emmetifyCompactXml(xmlData);
console.log('\nCompact Emmet Notation (no comments):');
console.log(compactXmlResult.result);
console.log('\nMappings:');
console.log('Namespaces:', compactXmlResult.maps.namespaces);
console.log('Attributes:', compactXmlResult.maps.attributes);

// Mixed content example
console.log('\n=== Complex JSON Array ====================');

const complexJson = [
  {
    "id": 1,
    "product": "Laptop",
    "specs": {
      "cpu": "Intel i7",
      "ram": "16GB",
      "storage": "512GB SSD"
    },
    "price": 1299.99,
    "inStock": true
  },
  {
    "id": 2,
    "product": "Mouse",
    "specs": {
      "type": "Wireless",
      "dpi": 3200
    },
    "price": 49.99,
    "inStock": false
  }
];

const complexJsonString = JSON.stringify(complexJson, null, 2);
const complexResult = emmetifyCompactJson(complexJsonString);
console.log('\nComplex Array Emmet:');
console.log(complexResult.result);