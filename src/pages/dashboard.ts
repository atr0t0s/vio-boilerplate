import Dashboard from '../templates/dashboard.html'
import { View } from '../../vio/view'

export default function view() {
  const props = {
    pageName: "Dashboard",
    clientName: "",
    age: 0
  }

  const binds = {
    clientNameInput: {
      bind: "keyup",
      update: "clientName"
    },
    ageInput: {
      bind: "keyup",
      update: "age"
    }
  }

  return View(Dashboard, props, binds)
}
