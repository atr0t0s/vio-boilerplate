export function router(routes: any) {
	const url = location.hash.slice(1);
	const view = routes[url];
	// history.pushState("", "", url);	
	return view
}

export function directRoute(routes: any, route: string) {
	const view = routes[route]
	return view
}
