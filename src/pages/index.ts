import Index from '../templates/index.html'
import { View } from '../../vio/view'

export default function view() {
	const props = {
		pageName: "Frontpage"
	}
	const binds = {
		clientName: "clientName"
	}

	return View(Index, props, binds)
}
