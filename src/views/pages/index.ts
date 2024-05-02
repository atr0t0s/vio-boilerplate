import Index from '../templates/pages/index.html'
import Nav from '../templates/components/Navigation.html'

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
  methods: {
    test() {
      console.log("testng 1")
    },
    test2() {
      console.log("testing 2")
    },
  },
  mount() {
    this.test()
  }
}
