import Dashboard from '../templates/dashboard.html'

export default {
  template: Dashboard,
  data: {
    pageName: "Dashboard",
    clientName: "",
    age: 0
  },
  binds: {
    clientNameInput: {
      event: "keyup",
      update: "clientName"
    },
    submitButton: {
      event: "click",
      input: "ageInput",
      update: "age"
    },
  },
  methods: {
    test(param: string) {
      console.log(param)
    },
    test2() {
      console.log("testing 2")
    }
  },
  mount() {
    this.methods.test2()
  }
}
