import { Router } from './VioRouter'
import { VioDOM } from './VioDOM'

class Vio {
  virtualDOM: VioDOM | null
  appNode: HTMLElement
  routes: string
  view: string
  wrapper: HTMLElement

  constructor(name: string, routes: any) {
    this.wrapper = document.getElementById(name)!;
    this.virtualDOM = new VioDOM(this.wrapper);
    this.routes = JSON.stringify(routes)
  }

  loadRoute = () => {
    const view = Router(JSON.parse(this.routes))
    this.view = view.template
    this.render(this.wrapper, this.view)
    this.eventHandler(view.binds)
  }

  render = (element: HTMLElement, value: string) => {
    if (element && element.attributes.getNamedItem("id").value) {
      const vNode = this.virtualDOM.parseHTMLStringToVioNode(value);

      if (!this.virtualDOM) {
        this.virtualDOM = new VioDOM(element);
      }

      this.virtualDOM.render(vNode);
    } else {
      console.error('Wrapper element or its ID attribute is missing.');
    }
  }

  update = (element: HTMLElement, value: string) => {
    if (element && element.attributes.getNamedItem("id").value) {
      if (!this.virtualDOM) {
        this.virtualDOM = new VioDOM(element);
      }

      element.innerHTML = '';

      const textNode = document.createTextNode(value);

      element.appendChild(textNode);
    } else {
      console.error('Wrapper element or its ID attribute is missing.');
    }
  }

  eventHandler = (binds: any) => {
    for (let bind in binds) {
      let el = <HTMLInputElement>document.getElementById(bind)
      el?.addEventListener(binds[bind].event, (event) => {
        if (event.isComposing || event.keyCode === 229) {
          return;
        }

        if ("inputs" in binds[bind]) {
          for (let item in binds[bind].inputs) {
            el = <HTMLInputElement>document.getElementById(binds[bind].inputs[item].input)
            const element = document.getElementById(binds[bind].inputs[item].updates)
            this.update(element, el.value)
          }
          return;
        }

        if ("update" in binds[bind]) {
          const element = document.getElementById(binds[bind].update)
          this.update(element, el.value)
        }
      });
    }
  }
}

export { Vio }
