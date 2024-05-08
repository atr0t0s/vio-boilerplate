import { Router } from './VioRouter'
import { VioDOM } from './VioDOM'

interface ComponentProperties {
  [key: string]: any
}

interface Route {
  view: ComponentProperties;
  instance: ComponentProperties;
}

class Vio {
  private virtualDOM: VioDOM | null
  private routes: string
  private route: Route
  private view: ComponentProperties
  private template: string
  private wrapper: HTMLElement
  private instance: ComponentProperties[]

  constructor(name: string, routes: any) {
    this.wrapper = document.getElementById(name)!;
    this.virtualDOM = new VioDOM(this.wrapper);
    this.routes = { ...routes }
    this.instance = []
  }

  Render = () => {
    for (let key in this.view.data) {
      this.view.data[key] = this.instance[this.route.instance.id][key]
    }

    this.route = Router(this.routes, this.view)
    this.template = this.route.view.template

    this.Load(this.wrapper, this.template)
    this.EventHandler(this.route.view.binds)
  }

  Route = () => {
    this.route = Router(this.routes)

    if (!this.instance[this.route.instance.id]) {
      this.instance[this.route.instance.id] = this.route.instance
    }

    this.view = this.route.view
    this.template = this.route.view.template

    this.Load(this.wrapper, this.template)
    this.EventHandler(this.route.view.binds)
  }

  Load = (element: HTMLElement, value: string) => {
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

  Update = (element: HTMLElement, value: string) => {
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

  EventHandler = (binds: any) => {
    for (let bind in binds) {
      let el = <HTMLInputElement>document.getElementById(bind)
      el?.addEventListener(binds[bind].event, (event) => {
        if (event.isComposing || event.keyCode === 229) {
          return;
        }

        if ("call" in binds[bind]) {
          const methodName = binds[bind].call;
          this.instance[this.route.instance.id][methodName].call(this.instance[this.route.instance.id]);

          this.Render()
        }

        if ("inputs" in binds[bind]) {
          for (let item in binds[bind].inputs) {
            el = <HTMLInputElement>document.getElementById(binds[bind].inputs[item].input)
            const element = document.getElementById(binds[bind].inputs[item].updates)
            this.instance[this.route.instance.id][binds[bind].inputs[item].updates] = el.value
            this.Update(element, el.value)
          }

          return;
        }

        if ("update" in binds[bind]) {
          const element = document.getElementById(binds[bind].update)
          this.instance[this.route.instance.id][binds[bind].update] = el.value
          this.Update(element, el.value)
        }
      });
    }
  }
}

export { Vio }
