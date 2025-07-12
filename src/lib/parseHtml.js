import parse from 'html-react-parser';

export function parseHtml(html) {
  if (!html) return null;
  
  return parse(html, {
    attributeConverter: (attributeName, attributeValue) => {
      // Convert class attributes to className for React
      if (attributeName === 'class') {
        return { name: 'className', value: attributeValue };
      }
      
      // Handle other attribute conversions if needed
      return { name: attributeName, value: attributeValue };
    },
    trim: true,
  });
}