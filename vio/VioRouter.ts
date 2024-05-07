import { View } from './VioView'

export function Router(routes: any, view = null) {
  const url = location.hash.slice(1);
  const route = routes[url];

  if (view) {
    route.data = view.data
    route.mount = null
  }

  const instance = {
    ...route.components,
    ...route.binds,
    ...route.data,
    ...route.methods
  }

  if (route.mount) {
    route.mount = route.mount.bind(instance);
  }

  for (const key in route.methods) {
    instance[key] = route.methods[key].bind(instance);
  }

  for (const key in route.methods) {
    route.methods[key] = route.methods[key].bind(instance)
  }

  instance.components = route.components
  instance.id = route.id

  return {
    view: View(route),
    instance: instance
  }
}
