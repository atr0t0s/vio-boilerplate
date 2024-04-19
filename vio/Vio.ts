import { prepare, render } from './renderer'
import { router, directRoute } from './router'

class Vio {
	base: HTMLElement | null
	prepare: typeof prepare
	render: typeof render
	routes: string

	constructor(name: string, routes: any) {
		this.base = document.getElementById(name)
		this.prepare = prepare
		this.render = render
		this.routes = JSON.stringify(routes)
	}

	prepareView = (view: string) => {
		this.prepare(this.base, view)
	}

	show = () => {
		this.render(this.base)
	}

	loadRoute = () => {
		const view = router(JSON.parse(this.routes))
		this.prepareView(view[0])
		this.show()
		this.controller(view[2])
	}

	route = (routes: any, route: string) => {
		const view = directRoute(routes, route)
		this.prepareView(view)
	}

	controller = (binds: any) => {
		for (let bind in binds) {
			let el = <HTMLInputElement>document.getElementById(bind)
			console.log(el)
			el?.addEventListener(binds[bind].bind, (event) => {
				if (event.isComposing || event.keyCode === 229) {
					return;
				}

				if ("update" in binds[bind]) {
					document.getElementById(binds[bind].update)!.innerHTML = el!.value
				}
			});
		}
	}
}

export { Vio }