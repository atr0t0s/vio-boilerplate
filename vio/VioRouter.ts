import { View } from './VioView'

export function Router(routes: any) {
  const url = location.hash.slice(1);
  const view = routes[url];

  const instance = {
    ...view.data,
    ...view.methods
  }

  view.mount = view.mount.bind(instance);

  for (const key in view.methods) {
    view.methods[key] = view.methods[key].bind(instance)
  }

  return {
    view: View(view),
    instance: instance
  }
}
