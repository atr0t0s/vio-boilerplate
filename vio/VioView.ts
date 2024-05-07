export function View({
  template,
  components,
  data,
  binds,
  methods,
  mount
}: {
  template: Function;
  components: Record<string, { template: string, data?: Record<string, any> }>;
  data: Record<string, any>;
  binds: any;
  methods: any;
  mount?: () => void;
}) {
  if (typeof mount === 'function') {
    mount();
  }

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
          const componentData = component.data || {};

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
          return match;
        }
      }
    ).replace(
      /\{\{(.+?)\}\}/g,
      (match, tag) => combinedData[tag.trim()] || ''
    ),
    data: combinedData,
    binds: binds,
    components: components,
    methods: methods
  };
}
