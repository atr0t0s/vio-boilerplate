import { View } from './VioView'

export function Router(routes: any) {
  const url = location.hash.slice(1);
  const view = routes[url];
  // history.pushState("", "", url);	
  return View(view)
}

export function directRoute(routes: any, route: string) {
  const view = routes[route]
  return view
}
