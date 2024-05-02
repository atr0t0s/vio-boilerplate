import Index from '../templates/pages/index.html'
import Navigation from '../components/Navigation'

export default {
  template: Index,
  components: {
    Navigation: Navigation
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
