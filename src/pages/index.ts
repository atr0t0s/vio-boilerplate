import Index from '../templates/index.html'
import Nav from '../components/Navigation.html'

export default {
  template: Index,
  components: {
    Navigation: Nav
  },
  data: {
    pageName: "Homepage",
  },
  binds: {
    clientName: "clientName"
  },
  test() {
    console.log("testng 1")
  },
  test2() {
    console.log("testing 2")
  },
  mount() {
    this.test()
  }
}
