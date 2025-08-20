export class XPathAttributeRestorer {
  getAttributePatterns(attr) {
    return [
      // Basic attribute
      new RegExp(`@${attr}=(?<quote>['"])(?<value>.*?)(?<quote2>['"])`, 'gi'),
      new RegExp(`@${attr.toLowerCase()}=(?<quote>['"])(?<value>.*?)(?<quote2>['"])`, 'gi'),
      // Contains function
      new RegExp(`contains\\(@${attr}\\s*,\\s*(?<quote>['"])(?<value>.*?)(?<quote2>['"])\\)`, 'gi'),
      // Normalize-space function
      new RegExp(`normalize-space\\(@${attr}\\)=(?<quote>['"])(?<value>.*?)(?<quote2>['"])`, 'gi'),
      // Functions with normalize-space
      new RegExp(`contains\\(normalize-space\\(@${attr}\\)\\s*,\\s*(?<quote>['"])(?<value>.*?)(?<quote2>['"])\\)`, 'gi'),
      // Nested functions with normalize-space
      new RegExp(`ends-with\\(normalize-space\\(@${attr}\\)\\s*,\\s*(?<quote>['"])(?<value>.*?)(?<quote2>['"])\\)`, 'gi'),
      new RegExp(`starts-with\\(normalize-space\\(@${attr}\\)\\s*,\\s*(?<quote>['"])(?<value>.*?)(?<quote2>['"])\\)`, 'gi'),
      // Other functions
      new RegExp(`starts-with\\(@${attr}\\s*,\\s*(?<quote>['"])(?<value>.*?)(?<quote2>['"])\\)`, 'gi'),
      new RegExp(`ends-with\\(@${attr}\\s*,\\s*(?<quote>['"])(?<value>.*?)(?<quote2>['"])\\)`, 'gi'),
      new RegExp(`matches\\(@${attr}\\s*,\\s*(?<quote>['"])(?<value>.*?)(?<quote2>['"])\\)`, 'gi'),
    ];
  }

  restoreAttribute(xpath, tag, attr, replaceMap) {
    const patterns = this.getAttributePatterns(attr);
    const stepsWithSeparators = this._splitXpathWithSeparators(xpath);
    const newSteps = [];

    for (const [separator, step] of stepsWithSeparators) {
      const [nodeName, predicateIndex] = this._parseNodeTest(step);
      let predicatesString = step.slice(predicateIndex);

      if (tag === null || nodeName === tag) {
        for (const pattern of patterns) {
          predicatesString = predicatesString.replace(pattern, (match, ...groups) => {
            const value = groups[groups.length - 3];
            const newValue = replaceMap[value] || value;
            return match.replace(value, newValue);
          });
        }
      }
      const newStep = step.slice(0, predicateIndex) + predicatesString;
      newSteps.push(separator + newStep);
    }

    return newSteps.join('');
  }

  _splitXpathWithSeparators(xpath) {
    const steps = [];
    let currentStep = '';
    let separator = '';
    let insidePredicate = 0;
    let insideQuotes = null;
    let i = 0;

    while (i < xpath.length) {
      const char = xpath[i];

      if (char === '/' && insideQuotes === null && insidePredicate === 0) {
        if (currentStep) {
          steps.push([separator, currentStep]);
          currentStep = '';
        }
        const sepStart = i;
        while (i < xpath.length && xpath[i] === '/') {
          i++;
        }
        separator = xpath.slice(sepStart, i);
        continue;
      }

      currentStep += char;
      if (insideQuotes) {
        if (char === insideQuotes) {
          insideQuotes = null;
        }
      } else {
        if (char === '"' || char === "'") {
          insideQuotes = char;
        } else if (char === '[') {
          insidePredicate++;
        } else if (char === ']') {
          insidePredicate--;
        }
      }
      i++;
    }

    if (currentStep) {
      steps.push([separator, currentStep]);
    }
    return steps;
  }

  _parseNodeTest(step) {
    step = step.trim();
    let predicateIndex = step.length;
    let insideQuotes = null;

    for (let idx = 0; idx < step.length; idx++) {
      const char = step[idx];
      if (char === '"' || char === "'") {
        if (!insideQuotes) {
          insideQuotes = char;
        } else if (char === insideQuotes) {
          insideQuotes = null;
        }
      } else if (char === '[' && insideQuotes === null) {
        predicateIndex = idx;
        break;
      }
    }

    let nodeTest = step.slice(0, predicateIndex);
    if (nodeTest.includes('::')) {
      const nodeTestSplit = nodeTest.split('::');
      nodeTest = nodeTestSplit[1];
    }
    return [nodeTest.trim(), predicateIndex];
  }
}

export function restoreClassesInXpath(xpath, classesMap) {
  const restorer = new XPathAttributeRestorer();
  return restorer.restoreAttribute(xpath, null, 'class', classesMap);
}

export function restoreLinksInXpath(xpath, linksMap) {
  const restorer = new XPathAttributeRestorer();
  return restorer.restoreAttribute(xpath, 'a', 'href', linksMap);
}

export function restoreImagesInXpath(xpath, imagesMap) {
  const restorer = new XPathAttributeRestorer();
  return restorer.restoreAttribute(xpath, 'img', 'src', imagesMap);
}

export function restoreXpathFromConverterMaps(xpath, converterMaps) {
  const restorer = new XPathAttributeRestorer();
  xpath = restorer.restoreAttribute(xpath, null, 'class', converterMaps.classes);
  xpath = restorer.restoreAttribute(xpath, 'a', 'href', converterMaps.links);
  xpath = restorer.restoreAttribute(xpath, 'img', 'src', converterMaps.images);
  return xpath;
}