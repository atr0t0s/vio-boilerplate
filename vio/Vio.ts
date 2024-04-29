import { router } from './router'
import { VirtualDOM } from './VioNode'

class Vio {
  virtualDOM: VirtualDOM | null
  appNode: HTMLElement
  routes: string
  view: string
  wrapper: HTMLElement

  constructor(name: string, routes: any) {
    this.wrapper = document.getElementById(name)!;
    this.virtualDOM = new VirtualDOM(this.wrapper);
    this.routes = JSON.stringify(routes)
  }

  loadRoute = () => {
    const view = router(JSON.parse(this.routes))
    this.view = view.template
    this.render(this.wrapper, this.view)
    this.formEventHandler(view.binds)
  }

  render = (element: HTMLElement, value: string) => {
    if (element && element.attributes.getNamedItem("id").value) {
      const vNode = this.virtualDOM.parseHTMLStringToVioNode(value);

      if (!this.virtualDOM) {
        this.virtualDOM = new VirtualDOM(element);
      }

      this.virtualDOM.render(vNode);
    } else {
      console.error('Wrapper element or its ID attribute is missing.');
    }
  }

  update = (element: HTMLElement, value: string) => {
    // Ensure wrapper is defined and has an ID attribute
    if (element && element.attributes.getNamedItem("id").value) {
      // Check if this.virtualDOM is initialized
      if (!this.virtualDOM) {
        // Initialize VirtualDOM instance with the wrapper element
        this.virtualDOM = new VirtualDOM(element);
      }

      // Clear the existing content of the wrapper element
      element.innerHTML = '';

      // Create a text node with the provided value
      const textNode = document.createTextNode(value);

      // Append the text node to the wrapper element
      element.appendChild(textNode);
    } else {
      console.error('Wrapper element or its ID attribute is missing.');
    }
  }

  formEventHandler = (binds: any) => {
    for (let bind in binds) {
      let el = <HTMLInputElement>document.getElementById(bind)
      el?.addEventListener(binds[bind].event, (event) => {
        if (event.isComposing || event.keyCode === 229) {
          return;
        }

        if ("input" in binds[bind]) {
          el = <HTMLInputElement>document.getElementById(binds[bind].input)
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
