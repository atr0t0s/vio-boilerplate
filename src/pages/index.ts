import Index from '../templates/index.html'

export default {
  template: Index,
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
    }
  },
  mount: {
  }
}
