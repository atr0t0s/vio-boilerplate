import { Vio } from './Vio'
import { VioWindow } from './VioWindow'

declare let window: VioWindow

export default function initialize(name: string, routes: any): Vio {
  window.vio = new Vio(name, routes)
  window.addEventListener('load', window.vio.Route)
  window.addEventListener('hashchange', window.vio.Route);

  return window.vio
}
