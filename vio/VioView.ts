export function View({
  template,
  components,
  data,
  binds,
  mount
}: {
  template: Function;
  components: Record<string, { template: string, data?: Record<string, any> }>; // Adjust the type definition
  data: Record<string, any>;
  binds: any;
  methods: any;
  mount?: () => void;
}) {
  if (typeof mount === 'function') {
    mount();
  }

  // Create a new object to pass to child components, combining parent data and child-specific data
  const combinedData = { ...data };

  return {
    template: template.toString().replace(
      /\{\{(.+?)\}\}/g,
      (match, tag) => combinedData[tag.trim()] || ''
    ).replace(
      /<([A-Z][^\s<]*)\b([^>]*)>(.*?)<\/\1>|<([A-Z][^\s<]*)\b([^>]*)\s*\/>/g,
      (match, openTag, attributes, content, selfClosingTag, selfClosingAttributes) => {
        const tag = openTag || selfClosingTag;
        const attrs = attributes || selfClosingAttributes || '';
        const component = components[tag.trim()];

        if (component) {
          // Get the component data or use an empty object as fallback
          const componentData = component.data || {};

          // Pass parent and child data to the component template
          return component.template.replace(
            /\{\{content\}\}/g,
            content || ''
          ).replace(
            /\{\{attributes\}\}/g,
            attrs || ''
          ).replace(
            /\{\{(.+?)\}\}/g,
            (match, tag) => (componentData[tag.trim()] || combinedData[tag.trim()]) || ''
          );
        } else {
          // Otherwise, return the original HTML tag
          return match;
        }
      }
    ).replace(
      /\{\{(.+?)\}\}/g,
      (match, tag) => combinedData[tag.trim()] || ''
    ),
    data: combinedData, // Pass the combined data to the returned object
    binds: binds
  };
}

