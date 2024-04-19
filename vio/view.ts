function View(template: string, opts: any, binds: any) {
	const viewFromTemplate = template.replace(
    	/\{\{(.+?)\}\}/g,
    	(match, tag) => opts[tag.trim()]
	);

	return [viewFromTemplate, opts, binds]
}

export { View }
