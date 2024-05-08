import { VioNode, Child, Props } from './VioNode'

export class VioDOM {
  container: HTMLElement;
  virtualDOM: VioNode | null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.virtualDOM = null;
  }

  render(newVirtualDOM: VioNode): void {
    if (!this.virtualDOM) {
      this.virtualDOM = newVirtualDOM;
    } else {
      const patches = this.diff(this.virtualDOM, newVirtualDOM);
      console.log(patches)
      this.applyPatches(this.container, patches);
      this.virtualDOM = newVirtualDOM;
    }

    const renderedContent = this.virtualDOM.render();
    if (renderedContent instanceof HTMLElement) {
      this.container.innerHTML = '';
      this.container.appendChild(renderedContent);
    } else if (renderedContent instanceof Text) {
      this.container.innerText = renderedContent.textContent || '';
    } else {
      console.error('Unsupported rendered content:', renderedContent);
    }
  }

  parseHTMLStringToVioNode(htmlString: string): VioNode {
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = htmlString.trim();

    const firstChild = tempContainer.firstChild;

    if (firstChild instanceof HTMLElement) {
      return this.convertHTMLElementToVioNode(firstChild);
    } else {
      throw new Error('Invalid HTML string: Unable to parse as HTMLElement');
    }
  }

  updateElementById(id: string, newValue: string): void {
    if (!this.virtualDOM) {
      console.error('Virtual DOM is null. Make sure to call render method before updating.');
      return;
    }

    const updatedVirtualDOM = this.updateElementInVirtualDOM(this.virtualDOM, id, newValue);
    this.render(updatedVirtualDOM);
  }

  private updateElementInVirtualDOM(vNode: VioNode | null, id: string, newValue: string): VioNode | null {

    if (!vNode) {
      return null;
    }

    const updatedNode = { ...vNode };

    if (updatedNode.props.id === id) {
      updatedNode.props.textContent = newValue;
    }

    updatedNode.children = updatedNode.children.map(child => {
      if (child instanceof VioNode) {
        return this.updateElementInVirtualDOM(child, id, newValue);
      }
      return child;
    });

    return updatedNode as VioNode;
  }

  convertHTMLElementToVioNode(element: HTMLElement): VioNode {
    if (element.tagName.toLowerCase() === 'template') {
      const templateContent = (element as HTMLTemplateElement).content;
      const children: Child[] = [];

      templateContent.childNodes.forEach(childNode => {
        if (childNode.nodeType === Node.ELEMENT_NODE) {
          children.push(this.convertHTMLElementToVioNode(childNode as HTMLElement));
        } else if (childNode.nodeType === Node.TEXT_NODE) {
          children.push(childNode.textContent || '');
        }
      });

      return new VioNode('div', {}, children);
    }

    const tag = element.tagName.toLowerCase();

    const props: Props = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      props[attr.nodeName] = attr.nodeValue;
    }

    const children: Child[] = [];
    element.childNodes.forEach(childNode => {
      if (childNode.nodeType === Node.ELEMENT_NODE) {
        children.push(this.convertHTMLElementToVioNode(childNode as HTMLElement));
      } else if (childNode.nodeType === Node.TEXT_NODE) {
        children.push(childNode.textContent || '');
      }
    });

    return new VioNode(tag, props, children);
  }

  diff(oldVioNode: VioNode, newVioNode: VioNode): Patch[] {
    const patches: Patch[] = [];

    this.diffNode(oldVioNode, newVioNode, patches);

    return patches;
  }

  diffNode(oldNode: VioNode, newNode: VioNode, patches: Patch[], index = 0, textNodeIndex = 0): number {
    if (oldNode.tag !== newNode.tag || typeof oldNode.tag !== typeof newNode.tag) {
      patches.push({ type: 'REPLACE', node: oldNode, newNode });
    } else if (typeof newNode.tag === 'string') {
      const propsPatches = this.diffProps(oldNode.props, newNode.props);

      if (Object.keys(propsPatches).length > 0) {
        patches.push({ type: 'PROPS', node: oldNode, props: propsPatches });
      }

      index++;

      if (typeof oldNode.children === 'string' && typeof newNode.children === 'string') {
        if (oldNode.children !== newNode.children) {
          patches.push({ type: 'TEXT', node: oldNode, textContent: newNode.children, textNodeIndex });
        }
        textNodeIndex++;
      } else if (Array.isArray(oldNode.children) && Array.isArray(newNode.children)) {
        textNodeIndex++;

        for (let i = 0; i < Math.min(oldNode.children.length, newNode.children.length); i++) {
          const oldChild = oldNode.children[i];
          const newChild = newNode.children[i];

          if (typeof oldChild === 'object' && typeof newChild === 'object') {
            textNodeIndex = this.diffNode(oldChild, newChild, patches, index, textNodeIndex);
          } else {
            if (typeof oldChild === 'string' && typeof newChild === 'string' && oldChild !== newChild) {

              patches.push({ type: 'TEXT', node: oldNode, textContent: newChild, textNodeIndex });
              textNodeIndex++;
            }
          }
        }
      }
    }

    return textNodeIndex;
  }

  diffProps(oldProps: Props, newProps: Props): PropsPatch {
    const patches: PropsPatch = {};

    for (let key in oldProps) {
      if (!(key in newProps)) {
        patches[key] = null;
      } else if (oldProps[key] !== newProps[key]) {
        patches[key] = newProps[key];
      }
    }

    for (let key in newProps) {
      if (!(key in oldProps)) {
        patches[key] = newProps[key];
      }
    }

    return patches;
  }

  diffChildren(oldChildren: Child[], newChildren: Child[], patches: Patch[], parentIndex: number, textNodeIndex = 0): number {
    const keyMap: { [key: string]: number } = {};

    oldChildren.forEach((child, index) => {
      if (child instanceof VioNode) {
        const key = child.props.key || String(index);
        keyMap[key] = index;
        if (newChildren[index] instanceof VioNode) {
          textNodeIndex = this.diffNode(child, newChildren[index] as VioNode, patches, parentIndex, textNodeIndex);
        }
      }
    });

    Object.keys(keyMap).forEach(key => {
      if (!(key in newChildren)) {
        patches.push({ type: 'REMOVE', index: keyMap[key] });
      }
    });

    let currentIndex = parentIndex;
    newChildren.forEach((child, newIndex) => {
      const key = child instanceof VioNode ? child.props.key || String(newIndex) : String(newIndex);
      const oldIndex = keyMap[key];
      if (oldIndex != null) {
        if (oldIndex !== currentIndex) {
          patches.push({ type: 'MOVE', from: oldIndex, to: currentIndex });
        }
        currentIndex++;
      } else {
        patches.push({ type: 'INSERT', node: child, index: currentIndex });
        currentIndex++;
      }

      if (typeof child === 'string') {
        textNodeIndex++;
      }
    });

    return textNodeIndex;
  }

  updateInnerHTMLById(id: string, content: string | VioNode): void {
    if (!this.virtualDOM) {
      console.error('Virtual DOM is null. Make sure to call render method before updating.');
      return;
    }

    const foundNode = this.getElementById(this.virtualDOM, id);

    if (foundNode) {
      foundNode.children = [content];
      this.render(this.virtualDOM);
    } else {
      console.error(`Element with ID '${id}' not found in the virtual DOM.`);
    }
  }

  updateInnerHTMLByIdOld(id: string, vioNode: VioNode): void {
    if (!this.virtualDOM) {
      console.error('Virtual DOM is null. Make sure to call render method before updating.');
      return;
    }

    const foundNode = this.getElementById(this.virtualDOM, id);

    if (foundNode) {
      foundNode.children = [vioNode];
      this.render(this.virtualDOM);
    } else {
      console.error(`Element with ID '${id}' not found in the virtual DOM.`);
    }
  }

  diffComponent(oldNode: VioNode, newNode: VioNode, patches: Patch[]) {
    if (oldNode.tag !== newNode.tag) {
      patches.push({ type: 'REPLACE', node: oldNode, newNode });
    } else {
      const componentInstance = new (newNode.tag as { new(): any })();
      const componentVioNode = componentInstance.render();
      this.diffNode(oldNode.children[0] as VioNode, componentVioNode, patches);
    }
  }

  applyPatches(parent: HTMLElement, patches: Patch[]) {
    patches.forEach(patch => {
      switch (patch.type) {
        case 'PROPS':
          this.applyPropsPatch(patch.node, patch.props);
          break;
        case 'REMOVE':
          if (parent.childNodes[patch.index]) {
            parent.removeChild(parent.childNodes[patch.index]);
          }
          break;
        case 'INSERT':
          if (patch.node instanceof VioNode) {
            parent.appendChild(patch.node.render() as HTMLElement);
          } else {
            parent.appendChild(document.createTextNode(String(patch.node)));
          }
          break;
        case 'MOVE':
          const node = parent.childNodes[patch.from];
          if (node) {
            parent.removeChild(node);
            parent.insertBefore(node, parent.childNodes[patch.to]);
          }
          break;
        case 'REPLACE':
          const newNode = patch.newNode.render();
          if (newNode instanceof HTMLElement) {
            parent.replaceChild(newNode, patch.node.render());
          }
          break;
        case 'TEXT':
          if (patch.node instanceof VioNode) {
            const textNodeIndex = patch.textNodeIndex;
            const textNode = this.findTextNode(parent, textNodeIndex);
            if (textNode) {
              textNode.textContent = patch.textContent;
            } else {
              console.error('Text node not found for TEXT patch.');
            }
          }
          break;
        default:
          console.error('Unknown patch type:', patch);
      }
    });
  }

  findTextNode(parent: Node, index: number): Text | null {
    let count = 0;
    const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, null);
    let currentNode = walker.nextNode();
    while (currentNode) {
      if (count === index) {
        return currentNode as Text;
      }
      count++;
      currentNode = walker.nextNode();
    }
    return null;
  }

  applyPropsPatch(node: VioNode, propsPatch: PropsPatch) {
    const element = node.render() as HTMLElement;
    for (let key in propsPatch) {
      if (propsPatch[key] === null) {
        element.removeAttribute(key);
      } else {
        element.setAttribute(key, propsPatch[key]);
      }
    }
  }

  getElementById(node: any, id: string): any | null {
    if (!node || typeof node !== 'object') {
      return null;
    }

    if (node.props && node.props.id === id) {
      return node;
    }

    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        const foundNode = this.getElementById(child, id);
        if (foundNode) {
          return foundNode;
        }
      }
    }

    return null;
  }

  getElementsByTagName(vNode: VioNode, tagName: string): VioNode[] {
    const result: VioNode[] = [];

    function search(node: VioNode) {
      if (typeof node.tag === 'string' && node.tag.toLowerCase() === tagName.toLowerCase()) {
        result.push(node);
      }
      for (const child of node.children) {
        if (child instanceof VioNode) {
          search(child);
        }
      }
    }

    search(vNode);
    return result;
  }
}

type Patch =
  | { type: 'PROPS', node: VioNode, props: PropsPatch }
  | { type: 'REMOVE', index: number }
  | { type: 'INSERT', node: Child, index: number }
  | { type: 'MOVE', from: number, to: number }
  | { type: 'REPLACE', node: VioNode, newNode: VioNode }
  | { type: 'TEXT', node: VioNode, textContent: string, textNodeIndex: number };

type PropsPatch = { [key: string]: any };
