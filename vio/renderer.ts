export function prepare(base: HTMLElement | null, html: string) {
  base!.innerHTML = html
}

export function render(base: HTMLElement | null) {
  const template = base!.getElementsByTagName("template")[0]
  const clone = template.content.cloneNode(true)
  base!.appendChild(clone)
}
