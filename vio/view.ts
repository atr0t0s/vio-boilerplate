function View({
  template, data, binds, methods, mount
}) {
  const viewFromTemplate = template.toString().replace(
    /\{\{(.+?)\}\}/g,
    (match, tag) => data[tag.trim()]
  );

  return {
    template: viewFromTemplate,
    data: data,
    binds:
      binds
  }
}

export { View }
