export function View({
  template,
  components,
  data,
  binds,
  methods,
  mount
}) {
  return {
    template: template.toString().replace(
      /\{\{(.+?)\}\}/g,
      (match, tag) => data[tag.trim()]
    ).replace(
      /<([A-Z][^\s<]*)\b([^>]*)>(.*?)<\/\1>|<([A-Z][^\s<]*)\b([^>]*)\s*\/>/g,
      (match, openTag, attributes, content, selfClosingTag, selfClosingAttributes) => {
        const tag = openTag || selfClosingTag;
        const attrs = attributes || selfClosingAttributes || '';
        const component = components[tag.trim()];

        // Pass content and attributes to the component
        return component.replace(
          '{{ content }}', content
        ).replace(
          '{{ attributes }}', attrs
        ).replace(
          '{{content}}', content
        ).replace(
          '{{attributes}}', attrs
        ).replace(
          '{{ attributes}}', attrs
        ).replace(
          '{{attributes }}', attrs
        ).replace(
          '{{ content}}', content
        ).replace(
          '{{content }}', content
        );
      }
    ).replace(
      /\{\{(.+?)\}\}/g,
      (match, tag) => data[tag.trim()]
    ),
    data: data,
    binds: binds
  }
}

