export type Props = { [key: string]: any };
export type Child = VioNode | string | number | null;

export class VioNode {
  tag: string | Function;
  props: Props;
  children: Child[];

  constructor(tag: string | Function, props: Props, children: Child[]) {
    this.tag = tag;
    this.props = props || {};
    this.children = children || [];
  }

  render(): HTMLElement | Text {
    if (typeof this.tag === 'string') {
      const element = document.createElement(this.tag as string);
      // Set attributes
      for (let key in this.props) {
        if (key.startsWith('on') && typeof this.props[key] === 'function') {
          const eventType = key.substring(2).toLowerCase();
          element.addEventListener(eventType, this.props[key]);
        } else {
          element.setAttribute(key, this.props[key]);
        }
      }
      // Render children
      this.children.forEach(child => {
        if (child instanceof VioNode) {
          element.appendChild(child.render());
        } else {
          element.appendChild(document.createTextNode(String(child)));
        }
      });
      return element;
    } else if (typeof this.tag === 'function') {
      // Render functional component
      const componentInstance = new (this.tag as { new(): any })();
      return componentInstance.render();
    } else {
      return document.createTextNode('');
    }
  }
}


