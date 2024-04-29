type Props = { [key: string]: any };
type Child = VioNode | string | number | null;

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

export class VirtualDOM {
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
      this.applyPatches(this.container, patches);
      this.virtualDOM = newVirtualDOM;
    }

    // Render the new virtual DOM
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
    // Create a temporary container element to parse the HTML string
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = htmlString.trim();

    // Extract the first child node of the container
    const firstChild = tempContainer.firstChild;

    // Check if the first child node exists and is an HTMLElement
    if (firstChild instanceof HTMLElement) {
      // Convert the HTMLElement to a VioNode object
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

    const updatedNode = { ...vNode }; // Shallow copy the current node

    // If the current node matches the ID, update its properties
    if (updatedNode.props.id === id) {
      updatedNode.props.textContent = newValue;
    }

    // Recursively update children
    updatedNode.children = updatedNode.children.map(child => {
      if (child instanceof VioNode) {
        return this.updateElementInVirtualDOM(child, id, newValue);
      }
      return child;
    });

    return updatedNode as VioNode;
  }

  convertHTMLElementToVioNode(element: HTMLElement): VioNode {
    // If the element is a <template> tag, extract its content
    if (element.tagName.toLowerCase() === 'template') {
      const templateContent = (element as HTMLTemplateElement).content;
      const children: Child[] = [];

      // Convert child nodes inside the template content
      templateContent.childNodes.forEach(childNode => {
        if (childNode.nodeType === Node.ELEMENT_NODE) {
          children.push(this.convertHTMLElementToVioNode(childNode as HTMLElement));
        } else if (childNode.nodeType === Node.TEXT_NODE) {
          children.push(childNode.textContent || '');
        }
      });

      // Return a new VioNode representing the children of the template
      return new VioNode('div', {}, children);
    }

    // For regular elements, parse attributes and child nodes as before
    const tag = element.tagName.toLowerCase();

    // Extract props from attributes
    const props: Props = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      props[attr.nodeName] = attr.nodeValue;
    }

    // Convert child nodes
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

  diffNode(oldNode: VioNode, newNode: VioNode, patches: Patch[], index = 0) {
    if (oldNode.tag !== newNode.tag || typeof oldNode.tag !== typeof newNode.tag) {
      patches.push({ type: 'REPLACE', node: oldNode, newNode });
    } else if (typeof newNode.tag === 'string') {
      // Diff props
      const propsPatches = this.diffProps(oldNode.props, newNode.props);
      if (Object.keys(propsPatches).length > 0) {
        patches.push({ type: 'PROPS', node: oldNode, props: propsPatches });
      }

      // Diff children
      this.diffChildren(oldNode.children, newNode.children, patches, index);
    } else if (typeof newNode.tag === 'function') {
      // Diff components
      this.diffComponent(oldNode, newNode, patches);
    }
  }

  diffProps(oldProps: Props, newProps: Props): PropsPatch {
    const patches: PropsPatch = {};

    // Find changed, added, and removed props
    for (let key in oldProps) {
      if (!(key in newProps)) {
        patches[key] = null; // Property removed
      } else if (oldProps[key] !== newProps[key]) {
        patches[key] = newProps[key]; // Property changed
      }
    }

    for (let key in newProps) {
      if (!(key in oldProps)) {
        patches[key] = newProps[key]; // Property added
      }
    }

    return patches;
  }

  diffChildren(oldChildren: Child[], newChildren: Child[], patches: Patch[], parentIndex: number) {
    // Calculate key map for efficient reconciliation
    const keyMap: { [key: string]: number } = {};
    oldChildren.forEach((child, index) => {
      if (child instanceof VioNode) {
        const key = child.props.key || String(index);
        keyMap[key] = index;
      }
    });

    // Reconciliation using keys
    const newChildrenWithIndex: { child: Child, index: number }[] = [];
    newChildren.forEach((child, newIndex) => {
      const key = child instanceof VioNode && child.props.key || String(newIndex);
      const oldIndex = keyMap[key];
      if (oldIndex != null) {
        const oldChild = oldChildren[oldIndex];
        newChildrenWithIndex.push({ child, index: oldIndex });
        delete keyMap[key];
        this.diffNode(oldChild instanceof VioNode ? oldChild : new VioNode('', {}, []), child instanceof VioNode ? child : new VioNode('', {}, []), patches, oldIndex);
      } else {
        newChildrenWithIndex.push({ child, index: -1 });
      }
    });

    // Remove old nodes
    Object.keys(keyMap).forEach(key => {
      patches.push({ type: 'REMOVE', index: keyMap[key] });
    });

    // Move and insert new nodes
    let currentIndex = parentIndex;
    newChildrenWithIndex.forEach(({ child, index }) => {
      if (index === -1) {
        patches.push({ type: 'INSERT', node: child, index: currentIndex });
      } else if (index !== currentIndex) {
        patches.push({ type: 'MOVE', from: index, to: currentIndex });
      }
      currentIndex++;
    });
  }


  updateInnerHTMLById(id: string, content: string | VioNode): void {
    if (!this.virtualDOM) {
      console.error('Virtual DOM is null. Make sure to call render method before updating.');
      return;
    }

    const foundNode = this.getElementById(this.virtualDOM, id);

    if (foundNode) {
      // Assign the content directly to the children array
      foundNode.children = [content];
      this.render(this.virtualDOM); // Re-render with updated changes
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
      foundNode.children = [vioNode]; // Assign the VioNode object directly
      this.render(this.virtualDOM); // Re-render with updated changes
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
          parent.removeChild(parent.childNodes[patch.index]);
          break;
        case 'INSERT':
          parent.appendChild(patch.node instanceof VioNode ? patch.node.render() as HTMLElement : document.createTextNode(String(patch.node)));
          break;
        case 'MOVE':
          const node = parent.childNodes[patch.from];
          parent.removeChild(node);
          parent.insertBefore(node, parent.childNodes[patch.to]);
          break;
        case 'REPLACE':
          const newNode = patch.newNode.render();
          parent.replaceChild(newNode, parent.childNodes[parent.childNodes.length - 1]);
          break;
      }
    });
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

    // Depth-first search to find nodes with the specified tag name
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
  | { type: 'REPLACE', node: VioNode, newNode: VioNode };

type PropsPatch = { [key: string]: any };
